# Write a Query

This chapter describes how to write a continuous aggregation query in GreptimeDB. Query here should be a `SELECT` statement with either aggregating functions or non-aggregating functions (i.e., scalar function).

Only two kinds of expression are allowed after `SELECT` keyword:
- Aggregate functions: see the reference in [Expression](./expression.md) for detail.
- Scalar functions: like `col`, `to_lowercase(col)`, `col + 1`, etc. This part is the same as the normal `SELECT` clause in GreptimeDB.

The query should have a `FROM` clause to identify the source table. As the join clause is currently not supported, the query can only aggregate columns from a single table.

`GROUP BY` clause works as in a normal query. It groups the data by the specified columns. One special thing is the time window functions `hop()` and `tumble()` described in [Define Time Window](./define-time-window.md) part. They are used in the `GROUP BY` clause to define the time window for the aggregation. Other expressions in `GROUP BY` can be either literal, column or scalar expressions.

Notice the two time window functions will add several columns to the output schema. The columns are:
- `window_start`: the start time of the window.
- `window_end`: the end time of the window.
- `updated_at`: the time when the window is updated.

Others things like `ORDER BY`, `LIMIT`, `OFFSET` are not supported in the continuous aggregation query.
