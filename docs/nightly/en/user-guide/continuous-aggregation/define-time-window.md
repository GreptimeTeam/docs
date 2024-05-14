# Define Time Window

Time window is an important attribute of your continuous aggregation query. It defines how the data is aggregated in the flow. GreptimeDB provides two types of time windows: `hop` and `tumble`, or "sliding window" and "fixed window" in other words. You can specify the time window in the `GROUP BY` clause using `hop()` function or `tumble()` function respectively.

# Tumble

`tumble()` defines fixed windows that do not overlap. It signature is like the following:

```
tumble(col, interval, <start_time>)
```

Where `col` specifies use which column to compute the time window. The provided column must have a timestamp type. `interval` specifies the size of the window. The `tumble` function divides the time column into fixed-size windows and aggregates the data in each window.

`start_time` is an optional parameter to specify the start time of the first window. If not provided, the start time will be aligned to calender.

# Hop

`hop` defines sliding window that moves forward by a fixed interval. It signature is like the following:

```
hop(col, size_interval, hop_interval, <start_time>)
```

Where `col` specifies use which column to compute the time window. The provided column must have a timestamp type.

`size_interval` specifies the size of each window, while `hop_interval` specifies the delta interval between windows' start timestamp. You can think the `tumble()` function as a special case of `hop()` function where the `size_interval` and `hop_interval` are the same.

`start_time` is an optional parameter to specify the start time of the first window. If not provided, the start time will be aligned to calender.
