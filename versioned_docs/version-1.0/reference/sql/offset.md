---
keywords: [SQL OFFSET clause, data retrieval, skipping rows]
description: Describes the OFFSET clause in SQL, which specifies how many rows to skip before starting to return rows from a query.
---

# OFFSET

The `OFFSET` clause specifies how many rows to skip before returning rows from a query. It is commonly used with `LIMIT` for pagination.

For example:
```sql
SELECT *
FROM system_metrics
ORDER BY cpu_util DESC
LIMIT 10
OFFSET 10;
```

It selects all columns from rows ranked 11th to 20th (by descending `cpu_util`)  from the `system_metrics` table.

The cost of `OFFSET` grows as later pages skip more rows. For large result sets, use keyset pagination with an ordering that uniquely identifies each row. A timestamp alone is not sufficient when multiple rows can have the same timestamp.

## Efficient Pagination Using Timestamps
Suppose `(ts, host, idc)` uniquely orders the rows in `system_metrics`. Sort all three columns and record their values from the last row of each page.

First Page (Latest 10 Records):
```sql
SELECT *
FROM system_metrics
ORDER BY ts DESC, host DESC, idc DESC
LIMIT 10;
```

If the last row of the first page is `('2024-07-01 16:03:00', 'host2', 'idc_b')`, fetch the next page with a composite cursor:

```sql
SELECT *
FROM system_metrics
WHERE ts < '2024-07-01 16:03:00'
   OR (ts = '2024-07-01 16:03:00' AND host < 'host2')
   OR (ts = '2024-07-01 16:03:00' AND host = 'host2' AND idc < 'idc_b')
ORDER BY ts DESC, host DESC, idc DESC
LIMIT 10;
```

Use cursor columns that are stable and unique for the query. If `(ts, host, idc)` is not unique, add another tie-breaker column to both the `ORDER BY` clause and cursor predicate. This method avoids repeatedly scanning and skipping earlier pages, making pagination more efficient on large result sets.
