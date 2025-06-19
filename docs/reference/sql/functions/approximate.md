---
keywords: [Approximate functions, approximate count distinct, approximate quantile, SQL functions]
description: Lists and describes approximate functions available in GreptimeDB, including their usage and examples.
---

# Approximate Functions

This page lists approximate functions in GreptimeDB, which are used for approximate data analysis.

:::warning
The following approximate functions is currently experimental and may change in future releases.
:::

## Approximate Count Distinct (HLL)

The [HyperLogLog](https://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf) (HLL) algorithm is used to calculate the approximate count distinct of a set of values. It provides efficient memory usage and speed for this purpose. Three functions are provided to work with the HLL algorithm, described in following chapters:

:::warning
Notice that due to the approximate nature of the algorithm, the results may not be exact but are usually very close to the actual count distinct. The relative standard error of the HyperLogLog algorithm is about 1.04/sqrt(m), where m is the number of registers used in the algorithm. GreptimeDB uses 16384 registers by default, which gives a relative standard error of about 0.008125(or 0.8125%).
:::

### `hll`

`hll(value)` creates a HyperLogLog state in binary from a given column. The `value` can be any column that you want to calculate the approximate count distinct for. It returns a binary representation of the HLL state, which can be stored in a table or used in further calculations. See [Full Usage Example](#full-usage-example) for a full example of how to use this function in combination with other functions to calculate approximate count distinct.

### `hll_merge`

`hll_merge(hll_state)` merges multiple HyperLogLog states into one. This is useful when you want to combine the results of multiple HLL calculations, such as when aggregating data from different time windows or sources. The `hll_state` parameter is the binary representation of the HLL state created by [`hll`](#hll). The merged state can then be used to calculate the approximate count distinct across all the merged states. See [Full Usage Example](#full-usage-example) for a full example of how to use this function in combination with other functions to calculate approximate count distinct.


### `hll_count`

`hll_count(hll_state)` retrieves the approximate count distinct from a HyperLogLog state. This function takes the HLL state created by `hll` or merged by `hll_merge` and returns the approximate count of distinct values. See [Full Usage Example](#full-usage-example) for a full example of how to use this function in combination with other functions to calculate approximate count distinct.

### Full Usage Example
This example demonstrates how to use these functions in combination to calculate the approximate count distinct user id.

First create the base table `access_log` for storing user access logs, and the `access_log_10s` table for storing the HyperLogLog states within a 10-second time window. Notice the `state` column is of type `BINARY`, which will store the HyperLogLog state in binary format.
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

Insert some sample data into access_log:
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

Now we can use the `hll` function to create a HyperLogLog state for the `user_id` column with a 10-second time window. The output will be a binary representation of the HLL state, which contains the necessary information to calculate approximate count distinct later. The `date_bin` function is used to group the data into 10-second time windows. Hence this `INSERT INTO` statement will create a HyperLogLog state for each 10-second time window in the `access_log` table, and insert it into the `access_log_10s` table:
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

Then we can use the `hll_count` function to retrieve the approximate count distinct from the HyperLogLog state(which is the `state` column). For example, to get the approximate count distinct of user visits for each 10-second time window, we can run the following query:
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

In addition, we can aggregate the 10-second data to a 1-minute level by merging the HyperLogLog states using `hll_merge`. This allows us to calculate the approximate count distinct for a larger time window, which can be useful for analyzing trends over time. The following query demonstrates how to do this:
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

Note how the `hll_merge` function is used to merge the HyperLogLog states from the `access_log_10s` table, and then the `hll_count` function is used to calculate the approximate count distinct for each 1-minute time window. If only use `hll_merge` without `hll_count`, the result will just be a unreadable binary representation of the merged HyperLogLog state, which is not very useful for analysis. Hence we use `hll_count` to retrieve the approximate count distinct from the merged state.

This following flowchart illustrates above usage of the HyperLogLog functions. First raw event data is first group by time window and url, then the `hll` function is used to create a HyperLogLog state for each time window and url, then the `hll_count` function is used to retrieve the approximate count distinct for each time window and url. Finally, the `hll_merge` function is used to merge the HyperLogLog states for each url, and then the `hll_count` function is used again to retrieve the approximate count distinct for the 1-minute time window.
![HLL Usage Flowchart](/hll.svg)

## Approximate Quantile (UDDSketch)

Three functions are provided for approximate quantile calculation using the [UDDSketch](https://arxiv.org/abs/2004.08604) algorithm.

:::warning
Notice that the UDDSketch algorithm is designed to provide approximate quantiles with a tunable error rate, which allows for efficient memory usage and fast calculations. The results may not be exact but are usually very close to the actual quantiles.
:::

### `uddsketch_state`

The `uddsketch_state` function is used to create a UDDSketch state in binary from a given column. It takes three parameters: 
- `bucket_num`, which is the number of buckets to use for the sketch, see [How to determine bucket number and error rate](#how-to-determine-bucket_num-and-error_rate) for how to decide the value.
- `error_rate`, which is the desired error rate for the quantile calculation. 
- `value` parameter is the column from which the sketch will be created.

for example, for a simple table `percentile_base` shown below, we can create a `uddsketch_state` for the `value` column with a bucket number of 128 and an error rate of 0.01 (1%). The output will be a binary representation of the UDDSketch state, which contains the necessary information to calculate approximate quantiles later. 

This output binary state can be think of as a histogram of the values in the `value` column, which can then be merged using `uddsketch_merge` or used to calculate quantiles using `uddsketch_calc` as shown later. See [UDDSketch Full Usage Example](#uddsketch-full-usage-example) for a full example of how to use these functions in combination to calculate approximate quantiles.

### `uddsketch_merge`

The `uddsketch_merge` function is used to merge multiple UDDSketch states into one. It takes three parameters:
- `bucket_num`, which is the number of buckets to use for the sketch, see [How to determine bucket number and error rate](#how-to-determine-bucket_num-and-error_rate) for how to decide the value.
- `error_rate`, which is the desired error rate for the quantile calculation. 
- `udd_state`, which is the binary representation of the UDDSketch state created by `uddsketch_state`.

This is useful when you want to combine results from different time windows or sources. Notice that the `bucket_num` and `error_rate` must match the original sketch where the state was created, or else the merge will fail.

For example, if you have multiple UDDSketch states from different time windows, you can merge them into a single state to calculate the overall quantile across all the data.This output binary state can then be used to calculate quantiles using `uddsketch_calc`. See [UDDSketch Full Usage Example](#uddsketch-full-usage-example) for a full example of how to use these functions in combination to calculate approximate quantiles.


### `uddsketch_calc`

The `uddsketch_calc` function is used to calculate the approximate quantile from a UDDSketch state. It takes two parameters:
- `quantile`, which is a value between 0 and 1 representing the desired quantile to calculate, i.e., 0.99 for the 99th percentile.
- `udd_state`, which is the binary representation of the UDDSketch state created by `uddsketch_state` or merged by `uddsketch_merge`.

see [UDDSketch Full Usage Example](#uddsketch-full-usage-example) for a full example of how to use these functions in combination to calculate approximate quantiles.

### How to determine `bucket_num` and `error_rate`

The `bucket_num` parameter sets the maximum number of internal containers the sketch can use, directly controlling its memory footprint. Think of it as the physical storage capacity for tracking different value ranges. A larger `bucket_num` allows the sketch to accurately represent a wider dynamic range of data (i.e. a larger ratio between the maximum and minimum values). If this limit is too small for your data, the sketch will be forced to merge very high or low values, which degrades its accuracy. A recommended value for `bucket_num` is 128, which provides a good balance between accuracy and memory usage for most use cases. 

The `error_rate` defines the desired precision for your quantile calculations. It guarantees that any computed quantile (e.g., p99) is within a certain *relative* percentage of the true value. For example, an `error_rate` of `0.01` ensures the result is within 1% of the actual value. A smaller `error_rate` provides higher accuracy, as it forces the sketch to use more granular buckets to distinguish between closer numbers.

These two parameters create a direct trade-off. To achieve the high precision promised by a small `error_rate`, the sketch needs a sufficient `bucket_num`, especially for data that spans a wide range. `bucket_num` acts as the physical limit on accuracy. If your `bucket_num` is restricted by memory constraints, setting the `error_rate` to an extremely small value will not improve precision because the limit imposed by the available buckets.

### UDDSketch Full Usage Example
This example demonstrates how to use three `uddsketch` functions describe above to calculate the approximate quantile of a set of values.

First create the base table `percentile_base` for store the raw data, and the `percentile_5s` table for storing the UDDSketch states within a 5-second time window. notice the `percentile_state` column is of type `BINARY`, which will store the UDDSketch state in binary format.
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

Now we can use the `uddsketch_state` function to create a UDDSketch state for the `value` column with a bucket number of 128 and an error rate of 0.01 (1%). The output will be a binary representation of the UDDSketch state, which contains the necessary information to calculate approximate quantiles later, the `date_bin` function is used to group the data into 5-second time windows. Hence this `INSERT INTO` statement will create a UDDSketch state for each 5-second time window in the `percentile_base` table, and insert it into the `percentile_5s` table:

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

Now we can use the `uddsketch_calc` function to calculate the approximate quantile from the UDDSketch state. For example, to get the approximate 99th percentile (p99) for each 5-second time window, we can run the following query:
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
Notice in above query the `percentile_state` column is the UDDSketch state created by `uddsketch_state`.

In addition, we can aggregate the 5-second data to a 1-minute level by merging the UDDSketch states using `uddsketch_merge`. This allows us to calculate the approximate quantile for a larger time window, which can be useful for analyzing trends over time. The following query demonstrates how to do this:
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
Notice how the `uddsketch_merge` function is used to merge the UDDSketch states from the `percentile_5s` table, and then the `uddsketch_calc` function is used to calculate the approximate 99th percentile (p99) for each 1-minute time window.

This following flowchart illustrates above usage of the UDDSketch functions. First raw event data is first group by time window, then the `uddsketch_state` function is used to create a UDDSketch state for each time window, then the `uddsketch_calc` function is used to retrieve the approximate 99th quantile for each time window. Finally, the `uddsketch_merge` function is used to merge the UDDSketch states for each time window, and then the `uddsketch_calc` function is used again to retrieve the approximate 99th quantile for the 1-minute time window.
![UDDSketch Usage Flowchart](/udd.svg)
