---
keywords: [GreptimeDB 慢查询, 慢查询日志, 慢查询监控, 慢查询配置]
description: 介绍如何在 GreptimeDB 中配置和使用慢查询日志进行监控。
---

# 慢查询（实验性功能）

GreptimeDB 提供了慢查询日志功能，帮助您发现和修复慢查询。默认情况下，慢查询会输出到系统表 `greptime_private.slow_queries` 中，阈值为 `30s`，采样率为 `1.0`，TTL 为 `30d`。

`greptime_private.slow_queries` 表的架构如下：

```sql
+--------------+----------------------+------+------+---------+---------------+
| Column       | Type                 | Key  | Null | Default | Semantic Type |
+--------------+----------------------+------+------+---------+---------------+
| cost         | UInt64               |      | NO   |         | FIELD         |
| threshold    | UInt64               |      | NO   |         | FIELD         |
| query        | String               |      | NO   |         | FIELD         |
| is_promql    | Boolean              |      | NO   |         | FIELD         |
| timestamp    | TimestampNanosecond  | PRI  | NO   |         | TIMESTAMP     |
| promql_range | UInt64               |      | NO   |         | FIELD         |
| promql_step  | UInt64               |      | NO   |         | FIELD         |
| promql_start | TimestampMillisecond |      | NO   |         | FIELD         |
| promql_end   | TimestampMillisecond |      | NO   |         | FIELD         |
+--------------+----------------------+------+------+---------+---------------+
```

- `cost`: 查询的执行时间，单位为毫秒。
- `threshold`: 慢查询的阈值，单位为毫秒。
- `query`: 查询语句。
- `is_promql`: 是否为 PromQL 查询。
- `timestamp`: 查询的时间戳。
- `promql_range`: 查询的时间范围。仅当 `is_promql` 为 `true` 时使用。
- `promql_step`: 查询的时间步长。仅当 `is_promql` 为 `true` 时使用。
- `promql_start`: 查询的开始时间。仅当 `is_promql` 为 `true` 时使用。
- `promql_end`: 查询的结束时间。仅当 `is_promql` 为 `true` 时使用。

在集群模式下，您可以在前端配置中配置慢查询（与单机模式相同），例如：

```toml
[slow_query]
## 是否启用慢查询日志。
enable = true

## 慢查询的记录类型。可以是 `system_table` 或 `log`。
## 如果选择 `system_table`，慢查询将记录在系统表 `greptime_private.slow_queries` 中。
## 如果选择 `log`，慢查询将记录在日志文件 `greptimedb-slow-queries.*` 中。
record_type = "system_table"

## 慢查询的阈值。可以是可读的时间字符串，例如：`10s`，`100ms`，`1s`。
threshold = "30s"

## 慢查询日志的采样率。值应在 (0, 1] 范围内。例如，`0.1` 表示 10% 的慢查询将被记录，`1.0` 表示所有慢查询将被记录。
sample_ratio = 1.0

## `slow_queries` 系统表的 TTL。当 `record_type` 为 `system_table` 时，默认值为 `30d`。
ttl = "30d"
```

如果您使用 Helm 部署 GreptimeDB，可以在 `values.yaml` 文件中配置慢查询，例如：

```yaml
slowQuery:
  enable: true
  recordType: "system_table"
  threshold: "30s"
  sampleRatio: "1.0"
  ttl: "30d"
```

如果使用 `log` 作为记录类型，慢查询将记录在日志文件 `greptimedb-slow-queries.*` 中。默认情况下，日志文件位于 `${data_home}/logs` 目录。
