# Define Time Window

Time window is an important attribute of your continuous aggregation query. It defines how the data is aggregated in the flow.
These time windows are left-closed and right-open intervals.

A time window corresponds to a range of time. Data from source table will be mapped to the corresponding window based on the time index column. Time window is also the scope of one calculation of an aggregation expression, so each time window will result in one row in the result table.

To define a time window, you can use the `date_bin()` function, which calculates time intervals and returns the start of the interval nearest to the specified timestamp. Use `date_bin` to downsample time series data by grouping rows into time-based “bins” or “windows” and applying an aggregate or selector function to each window.

For example, if you “bin” or “window” data into 15 minute intervals, an input timestamp of `2023-01-01T18:18:18Z` will be updated to the start time of the 15 minute bin it is in: `2023-01-01T18:15:00Z`.

```
date_bin(interval, expression, origin-timestamp)
```

Arguments being:

- interval: Bin interval.

- expression: Time expression to operate on. Can be a constant, column, or function.

- origin-timestamp: Optional. Starting point used to determine bin boundaries. If not specified defaults 1970-01-01T00:00:00Z (the UNIX epoch in UTC).
