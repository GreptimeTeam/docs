---
keywords: [Approximate functions, approximate count distinct, approximate quantile, SQL functions]
description: Lists and describes approximate functions available in GreptimeDB, including their usage and examples.
---

# Approximate Functions

This page lists two approximate functions in GreptimeDB, `hll` and `uddsketch`, which are used for approximate data analysis.

:::warning
The following approximate functions is currently experimental and may change in future releases.
:::

## Approximate Count Distinct (HLL)

The `hll` function is used to calculate the approximate count distinct of a set of values. It uses [HyperLogLog](https://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf) (HLL) algorithm for efficient memory usage and speed. Three functions are provided for this purpose, described in following chapters:

### `hll`

`hll(value)` creates a HyperLogLog state in binary from a given column. The `value` can be any column that you want to calculate the approximate count distinct for. It returns a binary representation of the HLL state, which can be stored in a table or used in further calculations.

### `hll_merge`

`hll_merge(hll_state)` merges multiple HyperLogLog states into one. This is useful when you want to combine the results of multiple HLL calculations, such as when aggregating data from different time windows or sources. The `hll_state` parameter is the binary representation of the HLL state created by `hll`. The merged state can then be used to calculate the approximate count distinct across all the merged states.

### `hll_count`

`hll_count(hll_state)` retrieves the approximate count distinct from a HyperLogLog state. This function takes the HLL state created by `hll` or merged by `hll_merge` and returns the approximate count of distinct values.

### Caveats

Notice that due to the approximate nature of the algorithm, the results may not be exact but are usually very close to the actual count distinct, and the larger the dataset, the more accurate the results will be. The relative error of the HyperLogLog algorithm is about 1.04/sqrt(m), where m is the number of registers used in the algorithm. GreptimeDB uses 16384 registers by default, which gives a relative error of about 0.008125(or 0.8125%).

### Usage Example
This example demonstrates how to use the `hll` functions to calculate the approximate count distinct of user visits.

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

-- Insert some sample data into access_log
INSERT INTO access_log VALUES
        ("/dashboard", 1, "2025-03-04 00:00:00"),
        ("/dashboard", 1, "2025-03-04 00:00:01"),
        ("/dashboard", 2, "2025-03-04 00:00:05"),
        ("/not_found", 3, "2025-03-04 00:00:11"),
        ("/dashboard", 4, "2025-03-04 00:00:15");

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

-- use hll_count to query approximate data in access_log_10s
SELECT `url`, `time_window`, hll_count(state) FROM access_log_10s;

-- results as follows:
-- +------------+---------------------+
-- | url        | time_window         |
-- +------------+---------------------+
-- | /dashboard | 2025-03-04 00:00:00 |
-- | /dashboard | 2025-03-04 00:00:10 |
-- | /not_found | 2025-03-04 00:00:10 |
-- +------------+---------------------+

-- in addition, we can aggregate the 10-second data to a 1-minute level by merging the HyperLogLog states using `hll_merge`.
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
-- | /not_found | 2025-03-04 00:00:00 |          1 |
-- +------------+---------------------+------------+
```

## Approximate Quantile (UDDSketch)

Three functions are provided for approximate quantile calculation using the [UDDSketch](https://arxiv.org/abs/2004.08604) algorithm.

### `uddsketch_state`

The `uddsketch_state` function is used to create a UDDSketch state in binary from a given column. It takes three parameters: 
- `bucket_num`, which is the number of buckets to use for the sketch, 
- `error_rate`, which is the desired error rate for the quantile calculation. 
- `value` parameter is the column from which the sketch will be created.

### `uddsketch_merge`

The `uddsketch_merge` function is used to merge multiple UDDSketch states into one. It takes three parameters:
- `bucket_num`, which is the number of buckets to use for the sketch, 
- `error_rate`, which is the desired error rate for the quantile calculation. 
- `udd_state`, which is the binary representation of the UDDSketch state created by `uddsketch_state`.

This is useful when you want to combine results from different time windows or sources. Notice that the `bucket_num` and `error_rate` must match the original sketch where the state was created, or else the merge will fail.


### `uddsketch_calc`

The `uddsketch_calc` function is used to calculate the approximate quantile from a UDDSketch state. It takes two parameters:
- `quantile`, which is a value between 0 and 1 representing the desired quantile to calculate, i.e., 0.99 for the 99th percentile.
- `udd_state`, which is the binary representation of the UDDSketch state created by `uddsketch_state` or merged by `uddsketch_merge`.

### Caveats

Notice that the UDDSketch algorithm is designed to provide approximate quantiles with a tunable error rate, which allows for efficient memory usage and fast calculations. The error rate is the maximum relative error allowed in the quantile calculation, and it can be adjusted based on the requirements of the application. The `bucket_num` parameter determines the number of buckets used in the sketch, which also affects the accuracy and memory usage of the algorithm. The larger the `bucket_num`, the more accurate the results will be, but it will also consume more memory.

### Usage Example
This example demonstrates how to use the `uddsketch` functions to calculate the approximate quantile of a set of values.

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

-- Insert some sample data into percentile_base
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

-- Use a 5-second windowed query to calculate the UDDSketch states
INSERT INTO
    percentile_5s
SELECT
    uddsketch_state(128, 0.01, `value`) AS percentile_state,
    date_bin('5 seconds' :: INTERVAL, `ts`) AS time_window
FROM
    percentile_base
GROUP BY
    time_window;

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