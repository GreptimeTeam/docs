---
keywords: [慢查询, greptime private]
description: greptime_private 数据库中的慢查询表。
---

# slow_queries

`slow_queries` 表记录被慢查询记录器选中的 SQL 和 PromQL 查询。
慢查询记录器写入 `greptime_private.slow_queries` 时，如果表不存在会创建表；如果现有表缺少列，则会补齐这些列。即使自动建表已禁用，仍会执行这两项操作。

:::tip 注意
`slow_queries` 表需要开启慢查询日志功能。详见[慢查询](/user-guide/deployments-administration/monitoring/slow-query.md)配置说明。
:::

```sql
USE greptime_private;

SELECT *
FROM slow_queries
ORDER BY timestamp DESC;
```

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `type` | `String` | 事件类型。慢查询记录的值为 `slow_query`。 |
| `payload` | `Json` | 事件携带的结构化诊断上下文，可以是 JSON `null`。 |
| `timestamp` | `TimestampNanosecond` | 记录查询事件的时间。 |
| `cost` | `UInt64` | 查询耗时，单位为毫秒。 |
| `threshold` | `UInt64` | 慢查询阈值，单位为毫秒。 |
| `query` | `String` | SQL 语句、PromQL 表达式或查询计划文本。 |
| `is_promql` | `Boolean` | 是否为 PromQL 查询。 |
| `promql_range` | `UInt64` | PromQL 查询范围，单位为毫秒；非 PromQL 查询为 `0`。 |
| `promql_step` | `UInt64` | PromQL step，单位为毫秒；非 PromQL 查询为 `0`。 |
| `promql_start` | `TimestampMillisecond` | PromQL 查询范围的开始时间；非 PromQL 查询为 Unix epoch。 |
| `promql_end` | `TimestampMillisecond` | PromQL 查询范围的结束时间；非 PromQL 查询为 Unix epoch。 |
| `schema_name` | `String` | 查询执行时使用的数据库 schema。 |

配置和保留策略参见[慢查询](/user-guide/deployments-administration/monitoring/slow-query.md)。
