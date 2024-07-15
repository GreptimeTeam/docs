# Define Time Window

The time window is a crucial attribute of your continuous aggregation query. It determines how the data is aggregated in the flow.
These time windows are intervals that are left-closed and right-open.

A time window represents a specific range of time. Data from the source table is mapped to the corresponding window based on the time index column. Each time window corresponds to one calculation of an aggregation expression, resulting in one row in the result table.

To define a time window, you can utilize the `date_bin(interval, expression, origin-timestamp)` function. This function calculates time intervals and returns the start of the interval closest to the specified timestamp. By using `date_bin`, you can downsample time series data by grouping rows into time-based bins or windows and applying an aggregate or selector function to each window.

For instance, if you bin or window the data into 15-minute intervals, an input timestamp of `2023-01-01T18:18:18Z` will be adjusted to the start time of the 15-minute bin it belongs to: `2023-01-01T18:15:00Z`.

```sql
date_bin(interval, expression, origin-timestamp)
```

The arguments are as follows:

- `interval`: The interval for the bin.
- `expression`: The time expression to operate on. It can be a constant, column, or function.
- `origin-timestamp`: Optional. The starting point used to determine the bin boundaries. If not specified, it defaults to 1970-01-01T00:00:00Z (the UNIX epoch in UTC).
