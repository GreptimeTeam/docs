# Define Time Window

Time window is an important attribute of your continuous aggregation query. It defines how the data is aggregated in the flow.
These time windows are left-closed and right-open intervals.

A time window corresponds to a range of time. Data from source table will be mapped to the corresponding window based on the time index column. Time window is also the scope of one calculation of an aggregation expression, so each time window will result in one row in the result table.

To define a time window, you can use the `date_bin()` function, which takes two necessary param and one optional param: `interval`, `exoression` and `origin-timestamp`. It returns the start time of the time window that the source timestamp belongs to.

For example, on this timestamp line:
```
          x
...|---|---|---|...
   7   8   9   10
```

If `x` is the source timestamp, `date_bin(2, x, 7)` will return `7`, `date_bin(1, x, 8)` will return `8`, and so on.

<!-- 
TODO(discord9): add back image after also impl equal of hop
GreptimeDB provides two types of time windows: `hop` and `tumble`, or "sliding window" and "fixed window" in other words. You can specify the time window in the `GROUP BY` clause using `hop()` function or `tumble()` function respectively. These two functions are only supported in continuous aggregate queries's `GROUP BY` position.

Here illustrates how the `hop()` and `tumble()` functions work:

![Time Window](/time-window.svg)

## Tumble

`tumble()` defines fixed windows that do not overlap.

```
tumble(col, interval, start_time)
```

- `col` specifies use which column to compute the time window. The provided column must have a timestamp type.
- `interval` specifies the size of the window. The `tumble` function divides the time column into fixed-size windows and aggregates the data in each window.
- `start_time` specify the start time of the first window.
<!-- - `start_time` is an optional parameter to specify the start time of the first window. If not provided, the start time will be aligned to calender. -->
<!--
## Hop (not supported yet)

`hop` defines sliding window that moves forward by a fixed interval. This feeaure is not supported yet and is expected to be available in the near future.

<!-- `hop` defines sliding window that moves forward by a fixed interval. It signature is like the following:

```
hop(col, size_interval, hop_interval, <start_time>)
```

Where `col` specifies use which column to compute the time window. The provided column must have a timestamp type.

`size_interval` specifies the size of each window, while `hop_interval` specifies the delta between two windows' start timestamp. You can think the `tumble()` function as a special case of `hop()` function where the `size_interval` and `hop_interval` are the same.

`start_time` is an optional parameter to specify the start time of the first window. If not provided, the start time will be aligned to calender. -->
