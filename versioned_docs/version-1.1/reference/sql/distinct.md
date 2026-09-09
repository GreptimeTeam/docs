---
keywords: [SQL DISTINCT, SQL unique values, SQL syntax, SQL examples, SQL data filtering]
description: Explains the SQL SELECT DISTINCT statement used to retrieve unique values from a dataset, with examples of using DISTINCT with and without filters.
---

# DISTINCT

`SELECT DISTINCT` removes duplicate rows from a query result. When the select list contains multiple expressions, rows are considered duplicates only when the complete set of selected values is equal.

The following query returns each distinct `idc` value:

```sql
SELECT DISTINCT idc
FROM system_metrics;
```

`DISTINCT` is applied to the rows that satisfy the `WHERE` clause:

```sql
SELECT DISTINCT idc, host
FROM system_metrics
WHERE host != 'host2';
```
