# Query Data with SQL
## Introduction

GreptimeDB supports full SQL for you to query data from a database. Here are some query examples for the `system_metrics` so you can get familiar with using SQL alongside GreptimeDB functions.
To select all the data from the `system_metrics` table, use the `SELECT` statement:

``` sql
SELECT * FROM system_metrics;
```
The query result  looks like the following:

```
+-------+-------+----------+-------------+-----------+---------------------+
| host  | idc   | cpu_util | memory_util | disk_util | ts                  |
+-------+-------+----------+-------------+-----------+---------------------+
| host1 | idc_a |     11.8 |        10.3 |      10.3 | 2022-11-03 03:39:57 |
| host1 | idc_b |       50 |        66.7 |      40.6 | 2022-11-03 03:39:57 |
| host2 | idc_a |     80.1 |        70.3 |        90 | 2022-11-03 03:39:57 |
+-------+-------+----------+-------------+-----------+---------------------+
```

You can use the `count()` function to get the number of all rows in the table:

``` sql
SELECT count(*) FROM system_metrics;
```
```
+-----------------+
| COUNT(UInt8(1)) |
+-----------------+
|               3 |
+-----------------+
```
The `avg()` function returns the average value of a certain field:

``` sql
SELECT avg(cpu_util) FROM system_metrics;
```

```
+------------------------------+
| AVG(system_metrics.cpu_util) |
+------------------------------+
|            47.29999999999999 |
+------------------------------+
```
You can use the `GROUP BY` clause to group rows that have the same values into summary rows.
The average memory usage grouped by idc:

```sql
SELECT idc, avg(memory_util) FROM system_metrics GROUP BY idc;
```
```
+-------+---------------------------------+
| idc   | AVG(system_metrics.memory_util) |
+-------+---------------------------------+
| idc_a |                            40.3 |
| idc_b |                            66.7 |
+-------+---------------------------------+
```

For more information about the `SELECT` statement, please refer to the SQL reference document.
