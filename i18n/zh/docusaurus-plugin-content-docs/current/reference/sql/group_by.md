---
keywords: [SQL GROUP BY 子句, 数据分组, 聚合函数, 数据汇总, SQL 示例]
description: GROUP BY 语句用于对具有相同值的行进行分组，通常与聚合函数一起使用。
---

# GROUP BY

SQL 中的 `GROUP BY` 语句用于对具有一个或多个列中的相同值的行进行分组。
该子句通常与聚合函数（如 `COUNT`、`SUM`、`AVG` 等）一起使用，以生成汇总报表。

## Syntax

`GROUP BY` 的基本语法如下：

```sql
SELECT column1, column2, ..., aggregate_function(column_name)
FROM table_name
GROUP BY column1, column2, ...;
```

`GROUP BY` 语句根据子句中指定的列对结果集进行分组。
聚合函数应用于具有相同值的组。

## 示例

假设有如下名为 `system_metrics` 的表：

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

### 根据 Tags 聚合

要获取每个 `idc` 中的 memory_util 平均值，可以使用以下 SQL：

```sql
SELECT idc, AVG(memory_util)
FROM system_metrics
GROUP BY idc;
```

结果如下：

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

### 根据 Time Interval 聚合

要获取 memory_util 的日均值，SQL 如下：

```sql
SELECT date_trunc('day', ts) as dt, avg(memory_util)
FROM system_metrics
GROUP BY dt
```

请参考 [date_trunc](./functions/overview.md#date_trunc) 获取更多信息。
