---
keywords: [Approximate functions, approximate count distinct, approximate quantile, SQL functions]
description: Lists and describes approximate functions available in GreptimeDB, including their usage and examples.
---

# Approximate Functions

GreptimeDB provides functions for approximate distinct counts and quantiles.

:::warning
These functions are experimental and may change in future releases.
:::

## Approximate Count Distinct (HLL)

GreptimeDB implements [HyperLogLog](https://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf) (HLL) for memory-efficient, fast approximate distinct counts. Three functions create a sketch, merge sketches, and read the approximate count.

:::warning
HLL returns an estimate rather than an exact count. Its relative standard error is approximately `1.04 / sqrt(m)`, where `m` is the number of registers. GreptimeDB uses 16,384 registers, corresponding to approximately 0.8125% relative standard error.
:::

### `hll`

`hll(value)` coerces each value to `STRING` and aggregates it into a binary HLL state. The state can be stored in a `BINARY` column, merged with other states, or passed to `hll_count`.

### `hll_merge`

`hll_merge(hll_state)` aggregates binary states produced by [`hll`](#hll) into one state. Use it to combine sketches from different groups or time windows.


### `hll_count`

`hll_count(hll_state)` returns the approximate distinct count from a state produced by `hll` or `hll_merge`.

### Full Usage Example
This example calculates approximate distinct user counts by time window.

Create `access_log` for source rows and `access_log_10s` for one binary HLL state per 10-second window.
```sql
CREATE TABLE access_log (
    `url` STRING,
    user_id BIGINT,
    ts TIMESTAMP TIME INDEX,
    PRIMARY KEY (`url`, `user_id`)
);

CREATE TABLE access_log_10s (
    `url` STRING,
    time_window timestamp time INDEX,
    state BINARY,
    PRIMARY KEY (`url`)
);
```

Insert sample data into `access_log`:
```sql
INSERT INTO access_log VALUES
        ("/dashboard", 1, "2025-03-04 00:00:00"),
        ("/dashboard", 1, "2025-03-04 00:00:01"),
        ("/dashboard", 2, "2025-03-04 00:00:05"),
        ("/dashboard", 2, "2025-03-04 00:00:10"),
        ("/dashboard", 2, "2025-03-04 00:00:13"),
        ("/dashboard", 4, "2025-03-04 00:00:15"),
        ("/not_found", 1, "2025-03-04 00:00:10"),
        ("/not_found", 3, "2025-03-04 00:00:11"),
        ("/not_found", 4, "2025-03-04 00:00:12");
```

Group rows into 10-second windows and store one HLL state for each URL and window:
```sql
-- Use a 10-second windowed query to calculate the HyperLogLog states
INSERT INTO
    access_log_10s
SELECT
    `url`,
    date_bin("10s" :: INTERVAL, ts) AS time_window,
    hll(`user_id`) AS state
FROM
    access_log
GROUP BY
    `url`,
    time_window;
-- results will be similar to this:
-- Query OK, 3 rows affected (0.05 sec)
```

Read the approximate distinct count from each stored state:
```sql
-- use hll_count to query approximate data in access_log_10s, notice for small datasets, the results may not be very accurate.
SELECT `url`, `time_window`, hll_count(state) FROM access_log_10s;

-- results as follows:
-- +------------+---------------------+---------------------------------+
-- | url        | time_window         | hll_count(access_log_10s.state) |
-- +------------+---------------------+---------------------------------+
-- | /dashboard | 2025-03-04 00:00:00 |                               2 |
-- | /dashboard | 2025-03-04 00:00:10 |                               2 |
-- | /not_found | 2025-03-04 00:00:10 |                               3 |
-- +------------+---------------------+---------------------------------+
```

Merge the 10-second states to calculate a distinct count for each one-minute window. Aggregating stored states into larger windows is useful for trend analysis:
```sql
-- aggregate the 10-second data to a 1-minute level by merging the HyperLogLog states using `hll_merge`.
SELECT
    `url`,
    date_bin('1 minute' :: INTERVAL, `time_window`) AS time_window_1m,
    hll_count(hll_merge(state)) as uv_per_min
FROM
    access_log_10s
GROUP BY
    `url`,
    date_bin('1 minute' :: INTERVAL, `time_window`);

-- results as follows:
-- +------------+---------------------+------------+
-- | url        | time_window_1m      | uv_per_min |
-- +------------+---------------------+------------+
-- | /dashboard | 2025-03-04 00:00:00 |          3 |
-- | /not_found | 2025-03-04 00:00:00 |          3 |
-- +------------+---------------------+------------+
```

`hll_merge` returns another binary state. Apply `hll_count` to that state to obtain the estimate.

The following diagram shows the state creation, count, and merge operations:
![HLL Usage Flowchart](/hll.svg)

## Approximate Quantile (UDDSketch)

GreptimeDB implements [UDDSketch](https://arxiv.org/abs/2004.08604) with functions to create, merge, and query sketch states.

:::warning
UDDSketch provides fast approximate quantiles with bounded memory use. Its memory use and error depend on `bucket_num`, `error_rate`, and the input value range, as described below.
:::

### `uddsketch_state`

`uddsketch_state(bucket_num, error_rate, value)` aggregates `DOUBLE` values into a binary state.

- `bucket_num`: Maximum number of buckets in the sketch.
- `error_rate`: Initial relative-error bound.
- `value`: `DOUBLE` expression to aggregate.

The state can be stored in a `BINARY` column, merged with `uddsketch_merge`, or queried with `uddsketch_calc`.

### `uddsketch_merge`

`uddsketch_merge(bucket_num, error_rate, udd_state)` aggregates binary UDDSketch states into one state. `bucket_num` and `error_rate` must match the parameters used to create the input states.


### `uddsketch_calc`

`uddsketch_calc(quantile, udd_state)` returns a quantile estimate from a state created by `uddsketch_state` or `uddsketch_merge`.

- `quantile`: Value from 0 through 1; for example, `0.99` requests the 99th percentile.
- `udd_state`: Binary UDDSketch state.

See [UDDSketch Full Usage Example](#uddsketch-full-usage-example) for an example that combines these functions.

### How to determine `bucket_num` and `error_rate`

The `bucket_num` parameter sets the maximum number of internal buckets and therefore bounds the sketch's memory use. A larger value can represent a wider ratio between the minimum and maximum values before compaction. When the sketch reaches this limit, it merges buckets at one end of the value range and loses accuracy. The recommended value is `128`, which balances accuracy and memory use for most workloads.

The `error_rate` sets the initial relative-error bound used to map values to buckets. A smaller value creates more granular buckets. If the value range requires more than `bucket_num` buckets, UDDSketch compacts buckets and the effective maximum error increases. Therefore, an `error_rate` of `0.01` is not an unconditional guarantee that every result remains within 1% of the exact value.

These parameters trade memory for accuracy. A small `error_rate` requires enough buckets for the data's dynamic range. If `bucket_num` is too small, decreasing `error_rate` does not prevent compaction or the resulting increase in maximum error.

### UDDSketch Full Usage Example
This example combines the three `uddsketch` functions to calculate approximate quantiles.

Create `percentile_base` for the raw data and `percentile_5s` for the UDDSketch states in each five-second window. The `percentile_state` column stores the binary sketch state.
```sql
CREATE TABLE percentile_base (
    `id` INT PRIMARY KEY,
    `value` DOUBLE,
    `ts` timestamp(0) time index
);

CREATE TABLE percentile_5s (
    `percentile_state` BINARY,
    `time_window` timestamp(0) time index
);
```

Insert some sample data into `percentile_base` :
```sql
INSERT INTO percentile_base (`id`, `value`, `ts`) VALUES
    (1, 10.0, 1),
    (2, 20.0, 2),
    (3, 30.0, 3),
    (4, 40.0, 4),
    (5, 50.0, 5),
    (6, 60.0, 6),
    (7, 70.0, 7),
    (8, 80.0, 8),
    (9, 90.0, 9),
    (10, 100.0, 10);
```

Group rows into five-second windows and store one UDDSketch state for each window:

```sql
INSERT INTO
    percentile_5s
SELECT
    uddsketch_state(128, 0.01, `value`) AS percentile_state,
    date_bin('5 seconds' :: INTERVAL, `ts`) AS time_window
FROM
    percentile_base
GROUP BY
    time_window;
-- results will be similar to this:
-- Query OK, 3 rows affected (0.05 sec)
```

Calculate p99 for each stored state:
```sql
-- query percentile_5s to get the approximate 99th percentile
SELECT
    time_window,
    uddsketch_calc(0.99, `percentile_state`) AS p99
FROM
    percentile_5s;

-- results as follows:
-- +---------------------+--------------------+
-- | time_window         | p99                |
-- +---------------------+--------------------+
-- | 1970-01-01 00:00:00 |  40.04777053326359 |
-- | 1970-01-01 00:00:05 |  89.13032933635911 |
-- | 1970-01-01 00:00:10 | 100.49456770856492 |
-- +---------------------+--------------------+
```
Merge the five-second states to calculate p99 for each one-minute window. Aggregating stored states into larger windows is useful for trend analysis:
```sql
-- in addition, we can aggregate the 5-second data to a 1-minute level by merging the UDDSketch states using `uddsketch_merge`.
SELECT
    date_bin('1 minute' :: INTERVAL, `time_window`) AS time_window_1m,
    uddsketch_calc(0.99, uddsketch_merge(128, 0.01, `percentile_state`)) AS p99
FROM
    percentile_5s
GROUP BY
    time_window_1m;

-- results as follows:
-- +---------------------+--------------------+
-- | time_window_1m      | p99                |
-- +---------------------+--------------------+
-- | 1970-01-01 00:00:00 | 100.49456770856492 |
-- +---------------------+--------------------+
```
The following diagram shows the state creation, quantile calculation, and merge operations:
![UDDSketch Usage Flowchart](/udd.svg)
