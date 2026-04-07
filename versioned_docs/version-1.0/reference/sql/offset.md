---
keywords: [SQL OFFSET clause, data retrieval, skipping rows]
description: Describes the OFFSET clause in SQL, which specifies how many rows to skip before starting to return rows from a query.
---

# OFFSET

The `OFFSET` clause specifies how many rows to skip before starting to return rows from a query. It's commonly used with LIMIT for paginating through large result sets.

For example:
```sql
SELECT *
FROM system_metrics
ORDER BY cpu_util DESC
LIMIT 10
OFFSET 10;
```

It selects all columns from rows ranked 11th to 20th (by descending `cpu_util`)  from the `system_metrics` table.

Although combining `OFFSET` and `LIMIT` with an `ORDER BY` clause can achieve pagination, this approach is not very efficient. We recommend recording the time index (timestamp) of the last record returned on each page and using this value to filter and limit the data for subsequent pages. This method provides much better pagination performance.

## Efficient Pagination Using Timestamps
Suppose your `system_metrics` table has a `ts` column that acts as a time index (timestamp). You can use the last record’s timestamp from the previous page to efficiently fetch the next page.

First Page (Latest 10 Records):
```sql
SELECT *
FROM system_metrics
ORDER BY ts DESC
LIMIT 10;
```

Second Page (Using Last Timestamp from Previous Page): If the last record from the first page has a `ts` value of `'2024-07-01 16:03:00'`, you can get the next page like this:

```sql
SELECT *
FROM system_metrics
WHERE ts < '2024-07-01 16:03:00'
ORDER BY ts DESC
LIMIT 10;
```

After each query, record the `ts` value of the last row and use it for the next query’s filter.
This method eliminates the need to scan and skip rows (as with OFFSET), making pagination much more efficient, especially for large tables.
