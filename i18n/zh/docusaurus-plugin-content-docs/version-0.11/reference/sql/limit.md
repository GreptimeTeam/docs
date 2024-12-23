---
keywords: [SQL LIMIT 子句, 查询行数限制, SQL 性能优化, 数据库查询优化, SQL 示例]
description: 介绍了 `LIMIT` 子句的用法，通过示例展示了如何限制查询返回的行数。
---

# LIMIT

`LIMIT` 用于限制查询返回的行数。当处理大数据集时该子句特别有用，因为它通过减少需要处理的数据量来提高查询性能。

## Syntax

`LIMIT` 的基本语法如下：

```sql
SELECT column1, column2, ...
FROM table_name
LIMIT number_of_rows;
```

`number_of_rows` 参数用于指定要返回的最大行数。如果该参数的值为负数，则不返回任何行。

## 示例

假如我们有一个名为 `system_metrics` 的表：

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

使用 `LIMIT` 获取 `memory_util` 列中的前 3 个值：

```sql
SELECT host, idc, memory_util
FROM system_metrics
ORDER BY memory_util DESC
LIMIT 3;
```

结果为：

```sql
+-------+-------+-------------+
| host  | idc   | memory_util |
+-------+-------+-------------+
| host2 | idc_a |        70.3 |
| host1 | idc_c |        66.8 |
| host1 | idc_b |        66.7 |
+-------+-------+-------------+
```

`LIMIT n, m` 允许在跳过前 n 行后从结果中选择 m 行，等价于`LIMIT m OFFSET n` 语法。

```sql
SELECT host, idc, memory_util
FROM system_metrics
ORDER BY memory_util DESC
LIMIT 2 OFFSET 1;
```

或

```sql
SELECT host, idc, memory_util
FROM system_metrics
ORDER BY memory_util DESC
LIMIT 1, 2;
```

结果如下：

```sql
+-------+-------+-------------+
| host  | idc   | memory_util |
+-------+-------+-------------+
| host1 | idc_c |        66.8 |
| host1 | idc_b |        66.7 |
+-------+-------+-------------+
```
