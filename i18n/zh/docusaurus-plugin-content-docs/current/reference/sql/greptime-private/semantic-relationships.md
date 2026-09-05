---
keywords: [语义关系, 语义图, 服务拓扑, RED 指标, greptime private]
description: greptime_private 数据库中读时计算的 semantic_relationships 表，以及 semantic_relationships_declared 表。
---

# semantic_relationships

`semantic_relationships` 是[语义图](/user-guide/semantic-layer/semantic-graph.md)的边集合：实体之间带类型、有时间范围的关系。

这张表是计算出来的，不是存储的。扫描它时，会配对 trace span、对声明表应用同行共同声明规则，并把结果与 `semantic_relationships_declared` 的行 union 起来。它是只读的：`INSERT`、`CREATE`、`ALTER`、`TRUNCATE`、`DROP` 都会被拒绝。

```sql
SELECT src_id, dst_id, rel_type, provenance, request_count, error_count
FROM greptime_private.semantic_relationships
WHERE observed_at >= now() - INTERVAL '15' MINUTE
ORDER BY dst_id;
```

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `observed_at` | `TimestampMillisecond` | 时间索引。观测到该边的 60 秒时间桶。 |
| `window_start` | `TimestampMillisecond` | 观测窗口的起点。 |
| `window_end` | `TimestampMillisecond` | 观测窗口的终点（`window_start` + 60 秒）。 |
| `fresh_until` | `TimestampMillisecond` | 该边被视为有效的截止时间。 |
| `src_type` | `String` | 源端类型。 |
| `src_id` | `String` | 源端的规范化 id。 |
| `dst_type` | `String` | 目标端类型。 |
| `dst_id` | `String` | 目标端的规范化 id。 |
| `rel_type` | `String` | 关系类型：`calls`、`runs_on`、`contains`、`part_of`、`uses`、`invokes`、`depends_on`、`owns`，或声明边上的自定义值。方向为 `src` → `dst`。 |
| `provenance` | `String` | 边的来源方式：`trace`（配对的 span）、`attribute`（同一行上的两个身份）、`declared`（人工断言）、`agent`（agent 推断）。 |
| `confidence` | `Float64` | 派生的确定程度，取值在 `[0, 1]`。配对成功和人工声明的边为 `1.0`，虚拟节点边为 `0.5`。它不修正 trace 采样带来的偏差。 |
| `request_count` | `Int64` | 窗口内的请求数，仅 `calls` 边。 |
| `unmatched_count` | `Int64` | 该边上没有匹配到 server span 的 client span 数量。 |
| `error_count` | `Int64` | 窗口内的错误请求数。 |
| `duration_sum` | `Float64` | 请求耗时之和，单位为秒。 |
| `duration_count` | `Int64` | 参与求和的耗时个数。 |
| `duration_max` | `Float64` | 与 `duration_sum` 同一批样本中最长的单次请求耗时，单位为秒。 |
| `attributes` | `Json` | 边的属性，例如 `{"connection_type":"database"}`。 |

`provenance` 是边身份的一部分，因此同一对端点上人工声明的边和派生出的边作为两行共存。

`observed_at` 谓词决定派生范围。没有谓词时使用最近一小时；没有下界的谓词会报错。见[查询窗口](/user-guide/semantic-layer/semantic-graph.md#查询窗口)。

派生以发起查询的用户身份执行。调用者读不到的源表会被排除，由 join 派生的边要求对参与 join 的每张表都有读权限。

## semantic_relationships_declared

`semantic_relationships_declared` 是一张物理表，存放你自己断言的边，它的行会 union 进 `semantic_relationships`。GreptimeDB 在首次 `INSERT` 时按规范 schema 创建它，并拒绝用户的 `CREATE` 和 `ALTER`；`INSERT`、`DELETE`、`DROP` 允许。TTL 为 90 天。

它的列与 `semantic_relationships` 相同，去掉 `unmatched_count` 和 `duration_max`，并增加：

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `valid_from` | `TimestampMillisecond` | 业务有效期起点。`NULL` 表示自声明起有效。 |
| `valid_until` | `TimestampMillisecond` | 业务有效期终点。`NULL` 表示只要行存在就有效。 |
| `scope` | `String` | 边所属的命名空间或环境。属于主键，计算表不暴露该列。 |
| `generation_id` | `String` | 自由格式的代次标记。属于主键，计算表不暴露该列。 |

主键为 `(src_type, src_id, rel_type, dst_type, dst_id, provenance, scope, generation_id)`，时间索引为 `observed_at`。用相同主键再次插入会存入新版本，读取时保留查询窗口内的最新版本。

用法见[人工声明边](/user-guide/semantic-layer/declaring-entities.md#人工声明边)。
