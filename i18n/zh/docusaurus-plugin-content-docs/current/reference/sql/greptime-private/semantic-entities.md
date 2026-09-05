---
keywords: [语义实体, 语义图, 实体注册表, greptime private]
description: greptime_private 数据库中读时计算的 semantic_entities 表。
---

# semantic_entities

`semantic_entities` 是[语义图](/user-guide/semantic-layer/semantic-graph.md)的节点集合：所存遥测数据描述的实体。

这张表是计算出来的，不是存储的。扫描它时，会在查询时间窗口内，从声明了 `greptime.semantic.entity.*` 身份的表读时派生出行。它是只读的：`INSERT`、`CREATE`、`ALTER`、`TRUNCATE`、`DROP` 都会被拒绝。

```sql
SELECT entity_type, entity_id, scope, source_tables
FROM greptime_private.semantic_entities
WHERE observed_at >= now() - INTERVAL '15' MINUTE
ORDER BY entity_type, entity_id;
```

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `observed_at` | `TimestampMillisecond` | 时间索引。观测到该实体的 60 秒时间桶。 |
| `window_start` | `TimestampMillisecond` | 观测窗口的起点。 |
| `window_end` | `TimestampMillisecond` | 观测窗口的终点（`window_start` + 60 秒）。 |
| `fresh_until` | `TimestampMillisecond` | 实体被视为存在的截止时间。派生行等于 `window_end`。 |
| `entity_type` | `String` | 实体类型，例如 `service`、`service.instance`、`host`、`k8s.pod`、`gen_ai.agent`。 |
| `entity_id` | `String` | 规范化标识：标识列的值按声明顺序转义后用 `,` 连接。 |
| `entity_id_attrs` | `Json` | 标识属性对象，key 为它们来自的列。 |
| `scope` | `String` | id 所属的命名空间或环境；声明中没有 scope 列时为空。 |
| `descriptive` | `Json` | 已声明的非标识属性快照；未声明时为 `NULL`。 |
| `source_tables` | `Json` | 贡献这条观测的遥测表数组，格式为 `schema.table`。 |

每行是一张贡献表在一个窗口内的一条实体观测，因此由多张表声明的实体每个窗口有多行。用 `SELECT DISTINCT entity_type, entity_id` 去重。

`observed_at` 谓词决定派生范围。没有谓词时使用最近一小时；没有下界的谓词会报错。见[查询窗口](/user-guide/semantic-layer/semantic-graph.md#查询窗口)。

派生以发起查询的用户身份执行，调用者读不到的源表会被排除。
