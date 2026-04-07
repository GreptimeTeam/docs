---
keywords: [慢查询, greptime private]
description: greptime_private 数据库中的慢查询表。
---

# slow_queries

`slow_queries` 表包含 GreptimeDB 的慢查询信息：

```sql
USE greptime_private;

SELECT * FROM slow_queries;
```

输出如下：

```sql
+------+-----------+---------------------------------------------+-----------+----------------------------+--------------+-------------+---------------------+---------------------+
| cost | threshold | query                                       | is_promql | timestamp                  | promql_range | promql_step | promql_start        | promql_end          |
+------+-----------+---------------------------------------------+-----------+----------------------------+--------------+-------------+---------------------+---------------------+
|    2 |         0 | irate(process_cpu_seconds_total[1h])        |         1 | 2025-05-14 13:59:36.368575 |     86400000 |     3600000 | 2024-11-24 00:00:00 | 2024-11-25 00:00:00 |
|   22 |         0 | SELECT * FROM greptime_private.slow_queries |         0 | 2025-05-14 13:59:44.844201 |            0 |           0 | 1970-01-01 00:00:00 | 1970-01-01 00:00:00 |
+------+-----------+---------------------------------------------+-----------+----------------------------+--------------+-------------+---------------------+---------------------+
```

- `cost`：查询的耗时（毫秒）。
- `threshold`：查询的阈值（毫秒）。
- `query`：查询语句，可以是 SQL 或 PromQL。
- `is_promql`：是否为 PromQL 查询。
- `timestamp`：查询的时间戳。
- `promql_range`：查询的范围，仅在 is_promql 为 true 时使用。
- `promql_step`：查询的步长，仅在 is_promql 为 true 时使用。
- `promql_start`：查询的起始时间，仅在 is_promql 为 true 时使用。
- `promql_end`：查询的结束时间，仅在 is_promql 为 true 时使用。

更多详情可参考 [慢查询](/user-guide/deployments-administration/monitoring/slow-query.md) 文档。 
