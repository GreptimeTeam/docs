---
keywords: [语义层, 语义元数据, 可观测性元数据, 表选项, MCP, AI agent, OpenTelemetry, 信号类型]
description: 介绍 GreptimeDB 实验性的表语义层——通过 greptime.semantic.* 元数据告诉机器消费者一张表代表什么可观测性概念。
---

# 表语义层（实验性）

:::warning
语义层目前处于实验阶段，未来版本可能发生变化。没有语义元数据的表照常工作；语义层是可选的、增量式的。
:::

语义层给每张表附加一层薄薄的元数据，让机器消费者——LLM agent、告警与仪表盘生成器、[MCP server](/user-guide/integrations/mcp.md)、ETL 流水线——能够把一张表对应到它所代表的可观测性概念，而不必从列名去猜。

## 为什么需要它

GreptimeDB 接收 OTLP 的 metrics、traces、logs，以及 Prometheus remote write、InfluxDB、OpenTSDB、Loki、Elasticsearch 的数据。每种协议在传输时都带着丰富的元数据——instrument 类型、temporality、单位、语义约定版本——而这些信息在数据落表后大多被丢掉了：

- 一张 OTLP traces 表看起来和任何宽表没区别；signal type 和 source 只能从命名去猜。
- metric 的单位（`s`、`By`）被行编码器丢弃，从数据里无法还原。
- OTLP 的聚合 temporality（`cumulative` vs `delta`）在 metric 名字里看不出来。
- Prometheus 中由 `_total` 后缀推断出的 `counter` 类型只是*猜*出来的，不是声明的——但表里从不标记这一点。

消除这些猜测所需的元数据，在写入时本来就存在。语义层把它保留下来，而不是丢弃。这样告警生成器就能在 `rate()` 和绝对阈值之间做选择；仪表盘生成器能按 signal type 选可视化方式；agent 能读到一份结构化的目录，而不是从列名去推断。

## 工作原理

语义层复用已有的 SQL 表面——没有新协议，也没有新的 DDL 关键字。它有三种机制：

1. **`greptime.semantic.*` 表选项**——表级别的身份与血缘信息，存放在已有的 `table_options` 槽位里（也就是存 `ttl`、`table_data_model` 等选项的同一个槽位）。
2. **列 `COMMENT`**——标准 SQL，用于列级别的补充说明。
3. **[`information_schema.table_semantics`](/reference/sql/information-schema/table-semantics.md)**——一个可查询的视图，是发现入口。它为每张至少带一个 `greptime.semantic.*` 选项的表返回一行。

## 词汇表

所有 key 都是 `greptime.semantic.` 前缀下的扁平字符串，所有 value 都是字符串。词汇表刻意保持精简——只有当一个 key 记录的信息无法从 schema、列、或消费者已经理解的 metric 命名约定里廉价地还原时，它才有资格进入。那些值已经在 metric 名字里（Prometheus 的 `_total` 后缀）、是常量、或只是重复某一列的 key，被故意省略。

白名单是封闭的：前缀下未被识别的 key（比如 `greptime.semantic.future.key`）或超出取值范围的 value 都会被拒绝。

### 通用 key（所有信号）

| Key | 说明 | 示例取值 |
| --- | --- | --- |
| `greptime.semantic.signal_type` | 表所代表的遥测信号类型。 | `metric` / `trace` / `log` / `event` / `unknown` |
| `greptime.semantic.source` | 写入数据的接入生态。 | `opentelemetry` / `prometheus` / `influxdb` / `opentsdb` / `loki` / `elasticsearch` / `custom` / `mixed` / `unknown` |
| `greptime.semantic.pipeline` | 内部接入数据模型。是 `table_data_model` 的信号无关版后继。 | `greptime_trace_v1` |

### Trace key

| Key | 说明 | 示例取值 |
| --- | --- | --- |
| `greptime.semantic.trace.conventions` | 数据所遵循的语义约定版本，通常是一个 OTel schema URL。 | `https://opentelemetry.io/schemas/1.27.0` / `mixed` / `unknown` |

### Metric key

| Key | 说明 | 示例取值 |
| --- | --- | --- |
| `greptime.semantic.metric.type` | instrument 类型。 | `counter` / `gauge` / `histogram` / `summary` / `updown_counter` / `gauge_histogram` / `info` / `stateset` / `mixed` / `unknown` |
| `greptime.semantic.metric.unit` | [UCUM](https://ucum.org/) 记法的单位。被行编码器丢弃，写入后无法还原。 | `s` / `By` / `{request}` |
| `greptime.semantic.metric.temporality` | 聚合 temporality（仅 OTLP）。在 metric 名字里看不出来。 | `cumulative` / `delta` / `mixed` / `unknown` |
| `greptime.semantic.metric.metadata_quality` | metric 类型是怎么得到的——即 `metric.type` 有多可信。 | `declared`（协议明确声明）/ `inferred`（从名字后缀猜测）/ `unknown` |
| `greptime.semantic.metric.original_name` | 翻译前的 OpenTelemetry 名字，在表名被 Prometheus 化时记录。 | `http.server.duration` |

`metadata_quality` 是面向"置信度感知"工具的关键字段：一个 `inferred` 的 counter，在依赖 `rate()` 这类语义之前应当复核。

`unknown` 和 `mixed` 是共享的哨兵值。`unknown` 表示打标时无法确定取值；`mixed` 表示一个单值 key 在表的生命周期里看到了相互冲突的值——比如一张长期存在的表接收了来自多个 source 的数据。任何单值语义 key 都应被视为尽力而为的提示，而非强证据。

## 接入时的自动打标

auto-create 路径会在每种受支持的协议上打上身份标记（`signal_type` + `source`）。OTLP metrics 额外携带完整的 metric 词汇，因为 OTLP 线格式声明了 type/unit/temporality 之后又把它们丢弃了；OTLP traces 携带 pipeline 和 conventions。

| 接入路径 | `signal_type` | `source` | 额外 key |
| --- | --- | --- | --- |
| OTLP metrics | `metric` | `opentelemetry` | `metric.type`、`metric.unit`、`metric.temporality`、`metric.metadata_quality` = `declared`、`metric.original_name` |
| OTLP traces | `trace` | `opentelemetry` | `pipeline` = `greptime_trace_v1`、`trace.conventions` |
| OTLP logs | `log` | `opentelemetry` | — |
| Prometheus remote write | `metric` | `prometheus` | 仅身份（type/unit 在 metric 名字里） |
| InfluxDB line protocol | `metric` | `influxdb` | 仅身份 |
| OpenTSDB | `metric` | `opentsdb` | 仅身份 |
| Loki | `log` | `loki` | 仅身份 |
| Elasticsearch | `log` | `elasticsearch` | 仅身份 |

语义选项在建表时打标。目前还没有更新路径：把 `metadata_quality` 从 `inferred` 提升到 `declared`、或在后续写入时修订 `trace.conventions`，都暂未实现。

## 用 DDL 手动打标

你也可以在 `CREATE TABLE ... WITH (...)` 里自己设置这些选项。只接受白名单内、且取值合法的 key：

```sql
CREATE TABLE my_metrics (
  ts TIMESTAMP TIME INDEX,
  val DOUBLE
) WITH (
  'greptime.semantic.signal_type' = 'metric',
  'greptime.semantic.source' = 'custom',
  'greptime.semantic.metric.type' = 'counter',
  'greptime.semantic.metric.unit' = 'By'
);
```

这些选项会出现在 `SHOW CREATE TABLE` 的输出和 `table_semantics` 视图里。

## 发现语义元数据

消费者连接后的第一条查询，就能列出所有带语义标记的表：

```sql
SELECT table_schema, table_name, signal_type, source, pipeline, metadata_quality, semantic_options
FROM information_schema.table_semantics
ORDER BY table_name;
```

`signal_type`、`source`、`pipeline`、`metadata_quality` 被提升为独立的列；其余信号特定的 key 被折叠进 `semantic_options` JSON 字符串（去掉 `greptime.semantic.` 前缀）。完整 schema 和更多示例见 [`TABLE_SEMANTICS`](/reference/sql/information-schema/table-semantics.md) 参考文档。

[GreptimeDB MCP Server](/user-guide/integrations/mcp.md) 会读取这个视图，这样 AI 助手无需你逐一解释每张表的含义，就能理解你的表。
