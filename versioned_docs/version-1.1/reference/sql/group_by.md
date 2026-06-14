---
keywords: [SQL GROUP BY, SQL aggregate functions, SQL syntax, SQL examples, SQL data grouping]
description: Details the SQL GROUP BY clause used to group rows with the same values in specified columns, typically used with aggregate functions like COUNT, SUM, and AVG, with examples.
---

# GROUP BY

The `GROUP BY` clause in SQL is used to group rows that have the same values in one or more columns.
This clause is typically used with aggregate functions such as `COUNT`, `SUM`, `AVG`, etc., to generate
summary reports.

## Syntax

The basic syntax of the `GROUP BY` clause is as follows:

```sql
SELECT column1, column2, ..., aggregate_function(column_name)
FROM table_name
GROUP BY column1, column2, ...;
```

The `GROUP BY` clause groups the result set based on the columns specified in the clause. The aggregate
function is applied to each group of rows that have the same values in the specified columns.

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

### Group by Tags

To get the avg memory_util for each idc, the following SQL query can be used:

```sql
SELECT idc, AVG(memory_util)
FROM system_metrics
GROUP BY idc;
```

The result of the above query would be:

```sql
+-------+---------------------------------+
| idc   | AVG(system_metrics.memory_util) |
+-------+---------------------------------+
| idc_b |                            66.7 |
| idc_c |                            66.8 |
| idc_e |                            66.7 |
| idc_a |                            40.3 |
+-------+---------------------------------+
```

### Group by Time Interval

To get the avg memory_util for each day, the following SQL query can be used:

```sql
SELECT date_trunc('day', ts) as dt, avg(memory_util)
FROM system_metrics
GROUP BY dt
```

Please refer to [date_trunc](./functions/overview.md#date_trunc) for more details.
