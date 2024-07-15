# Define Time Window

Time window is an important attribute of your continuous aggregation query. It defines how the data is aggregated in the flow.
These time windows are left-closed and right-open intervals.

A time window corresponds to a range of time. Data from source table will be mapped to the corresponding window based on the time index column. Time window is also the scope of one calculation of an aggregation expression, so each time window will result in one row in the result table.

To define a time window, you can use the `date_bin()` function, which takes two necessary param and one optional param: `interval`, `expression` and `origin-timestamp`. It returns the start time of the time window that the source timestamp belongs to.

For example, on this timestamp line:
```
          x
...|---|---|---|...
   7   8   9   10
```

If `x` is the source timestamp, `date_bin(2, x, 7)` will return `7`, `date_bin(1, x, 8)` will return `8`, and so on.

## Hop (not supported yet)

`hop` defines sliding window that moves forward by a fixed interval. This feeaure is not supported yet and is expected to be available in the near future.
