---
keywords: [SQL LIMIT, SQL query optimization, SQL syntax, SQL examples, SQL performance]
description: Describes the LIMIT clause in SQL for restricting the number of rows returned by a query, including syntax and examples.
---

# LIMIT

`LIMIT` clause is used to limit the number of rows returned by a query. This clause is particularly
useful when working with large data sets, as it allows for faster query performance by reducing the
amount of data that needs to be processed.

## Syntax

The basic syntax of the `LIMIT` clause is as follows:

```sql
SELECT column1, column2, ...
FROM table_name
LIMIT number_of_rows;
```

The number_of_rows parameter specifies the maximum number of rows to be returned. If the value of this parameter is negative, no rows will be returned.

## Examples

Consider the following table named "system_metrics":

```sql
+-------+-------+----------+-------------+-----------+---------------------+
| host  | idc   | cpu_util | memory_util | disk_util | ts                  |
+-------+-------+----------+-------------+-----------+---------------------+
| host1 | idc_a |     11.8 |        10.3 |      10.3 | 2022-11-03 03:39:57 |
| host1 | idc_b |       50 |        66.7 |      40.6 | 2022-11-03 03:39:57 |
| host1 | idc_c |     50.1 |        66.8 |      40.8 | 2022-11-03 03:39:57 |
| host1 | idc_e |     NULL |        66.7 |      40.6 | 2022-11-03 03:39:57 |
| host2 | idc_a |     80.1 |        70.3 |        90 | 2022-11-03 03:39:57 |
+-------+-------+----------+-------------+-----------+---------------------+
```

To retrieve the top 3 rows by `memory_util`, we can use the`LIMIT` clause:

```sql
SELECT host, idc, memory_util
FROM system_metrics
ORDER BY memory_util DESC
LIMIT 3;
```

The result of the above query would be:

```sql
+-------+-------+-------------+
| host  | idc   | memory_util |
+-------+-------+-------------+
| host2 | idc_a |        70.3 |
| host1 | idc_c |        66.8 |
| host1 | idc_b |        66.7 |
+-------+-------+-------------+
```

`LIMIT n, m` allows to select the m rows from the result after skipping the first n rows. The `LIMIT m OFFSET n` syntax
is equivalent.

```sql
SELECT host, idc, memory_util
FROM system_metrics
ORDER BY memory_util DESC
LIMIT 2 OFFSET 1;
```

OR

```sql
SELECT host, idc, memory_util
FROM system_metrics
ORDER BY memory_util DESC
LIMIT 1, 2;
```

The result of the above query would be:

```sql
+-------+-------+-------------+
| host  | idc   | memory_util |
+-------+-------+-------------+
| host1 | idc_c |        66.8 |
| host1 | idc_b |        66.7 |
+-------+-------+-------------+
```
