# Write a Query

This chapter describes how to write a continuous aggregation query in GreptimeDB. Query here should be a `SELECT` statement with either aggregating functions or non-aggregating functions (i.e., scalar function).

Generally speaking, the `SQL` part in the flow is just like a normal `SELECT` clause with a few difference.
The grammar of the query is like the following:

```sql
SELECT AGGR_FUNCTION(column1, column2,..) FROM <source_table> GROUP BY TIME_WINDOW_FUNCTION();
```

Only two kinds of expression are allowed after `SELECT` keyword:
- Aggregate functions: see the reference in [Expression](./expression.md) for detail.
- Scalar functions: like `col`, `to_lowercase(col)`, `col + 1`, etc. This part is the same as the normal `SELECT` clause in GreptimeDB.

The query should have a `FROM` clause to identify the source table. As the join clause is currently not supported, the query can only aggregate columns from a single table.

`WHERE` and `HAVING` clauses are supported in the continuous aggregation query. They work as in a normal query. The `WHERE` clause filters the data before aggregation, and the `HAVING` clause filters the data after aggregation.

`DISTINCT` currently only work with `SELECT DISTINCT column1 ..` syntax. It is used to remove duplicate rows from the result set. Support for `SELECT count(DISTINCT column1) ...` is not available yet, but it will be added in the future.

`GROUP BY` clause works as in a normal query. It groups the data by the specified columns. One special thing is the time window functions `hop()` and `tumble()` described in [Define Time Window](./define-time-window.md) part. They are used in the `GROUP BY` clause to define the time window for the aggregation. Other expressions in `GROUP BY` can be either literal, column or scalar expressions.

Others things like `ORDER BY`, `LIMIT`, `OFFSET` are not supported in the continuous aggregation query.

See [Usecase Examples](./usecase-example.md) for more examples of how to use continuous aggregation in real-time analytics, monitoring, and dashboard.