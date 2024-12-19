---
keywords: [SQL ORDER BY clause, sorting data, ascending order, descending order, SQL syntax]
description: Details the ORDER BY clause in SQL for sorting data in ascending or descending order based on one or more columns, with syntax and examples.
---

# ORDER BY

The `ORDER BY` clause is used to order the data in ascending or descending order based on one or more columns in the
`SELECT` statement.

## Syntax

The basic syntax of the `ORDER BY` clause is as follows:

```sql
SELECT column1, column2, ...
FROM table_name
ORDER BY column1 [ASC | DESC], column2 [ASC | DESC], ...;
```

The `ORDER BY` clause can be used with one or more columns. The ASC keyword is used to sort the data
in ascending order (default), and the DESC keyword is used to sort the data in descending order.

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

To sort the data in ascending order based on the "memory_util" column, the following SQL query can be used:

```sql
SELECT * FROM system_metrics
ORDER BY memory_util ASC;
```

The result of the above query would be:

```sql
+-------+-------+----------+-------------+-----------+---------------------+
| host  | idc   | cpu_util | memory_util | disk_util | ts                  |
+-------+-------+----------+-------------+-----------+---------------------+
| host1 | idc_a |     11.8 |        10.3 |      10.3 | 2022-11-03 03:39:57 |
| host1 | idc_b |       50 |        66.7 |      40.6 | 2022-11-03 03:39:57 |
| host1 | idc_e |     NULL |        66.7 |      40.6 | 2022-11-03 03:39:57 |
| host1 | idc_c |     50.1 |        66.8 |      40.8 | 2022-11-03 03:39:57 |
| host2 | idc_a |     80.1 |        70.3 |        90 | 2022-11-03 03:39:57 |
+-------+-------+----------+-------------+-----------+---------------------+
```

To sort the data in descending order based on the "disk_util" column, the following SQL query can be used:

```sql
SELECT * FROM system_metrics
ORDER BY disk_util DESC;
```

The result of the above query would be:

```sql
+-------+-------+----------+-------------+-----------+---------------------+
| host  | idc   | cpu_util | memory_util | disk_util | ts                  |
+-------+-------+----------+-------------+-----------+---------------------+
| host2 | idc_a |     80.1 |        70.3 |        90 | 2022-11-03 03:39:57 |
| host1 | idc_c |     50.1 |        66.8 |      40.8 | 2022-11-03 03:39:57 |
| host1 | idc_b |       50 |        66.7 |      40.6 | 2022-11-03 03:39:57 |
| host1 | idc_e |     NULL |        66.7 |      40.6 | 2022-11-03 03:39:57 |
| host1 | idc_a |     11.8 |        10.3 |      10.3 | 2022-11-03 03:39:57 |
+-------+-------+----------+-------------+-----------+---------------------+
```
