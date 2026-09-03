---
keywords: [语义层, 语义元数据, 可观测性元数据, 表选项, MCP, AI agent, OpenTelemetry, 信号类型]
description: 介绍 GreptimeDB 实验性的 greptime.semantic.* 表元数据，供机器消费者识别一张表代表的可观测性概念。
---

# 表语义层（实验性）

:::warning
语义层目前处于实验阶段，未来版本可能发生变化。没有语义元数据的表照常工作；语义层是可选的、增量式的。
:::

语义层把元数据保存在表上，让 LLM agent、告警与仪表盘生成器、[MCP server](/user-guide/integrations/mcp.md)和 ETL 流水线等机器消费者可以识别表的含义，不必根据列名推断。

## 为什么需要它

GreptimeDB 接收 OTLP metrics、traces、logs，以及 Prometheus remote write、InfluxDB Line Protocol、OpenTSDB、Loki Push API 和 Elasticsearch Bulk API 数据。部分协议，尤其是 OpenTelemetry，会携带普通表列没有表达的语义元数据。不同协议能提供的元数据数量和质量并不相同：

- 一张 OTLP traces 表看起来和任何宽表没区别；signal type 和 source 只能从命名去猜。
- OTLP metric 的单位（`s`、`By`）被行编码器丢弃，从数据里无法还原。
- OTLP 的聚合 temporality（`cumulative` vs `delta`）在 metric 名字里看不出来。
- Prometheus 中根据 `_total` 后缀推断出的 `counter` 不是协议声明。没有语义元数据时，表中不会记录这个区别。

这些元数据在写入时存在，但普通数据行不会保存。语义层保留它们后，告警生成器可以区分速率和绝对值，仪表盘生成器可以按 signal type 选择展示方式，agent 也可以直接查询结构化目录。

## 工作原理

语义层使用现有的 SQL 接口，不增加协议或 DDL 关键字。它由三部分组成：

1. **`greptime.semantic.*` 表选项**与 `ttl`、`table_data_model` 等选项一起保存表身份和写入元数据。
2. **列 `COMMENT`**通过标准 SQL 保存列级补充信息。
3. **[`information_schema.table_semantics`](/reference/sql/information-schema/table-semantics.md)** 是查询入口，每张至少带一个 `greptime.semantic.*` 选项的表对应一行。

## 词汇表

所有 key 都是 `greptime.semantic.` 前缀下的扁平字符串，所有 value 都是字符串。词汇表只保留无法直接从 schema、列或 metric 命名约定中还原的信息。常量、已经编码在 metric 名字中的值（例如 Prometheus 的 `_total` 后缀），以及仅重复某一列的信息不会写入。

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
| `greptime.semantic.metric.metadata_quality` | metric 类型的来源，以及 `metric.type` 的可靠程度。 | `declared`（协议明确声明）/ `inferred`（根据名字后缀推断）/ `unknown` |
| `greptime.semantic.metric.original_name` | 原始 OpenTelemetry 名字，在表名转换为 Prometheus 命名时记录。 | `http.server.duration` |

对于 `inferred` 的 counter，消费者应在使用 `rate()` 语义前复核类型，因为该类型来自名称推断，而不是协议声明。

`unknown` 和 `mixed` 是两个通用取值。`unknown` 表示设置选项时无法确定取值；`mixed` 表示同一个 key 在表的生命周期内收到过冲突值，例如一张表接收了多个 source 的数据。单值语义 key 是描述性元数据，不是数据库强制执行的约束。

## 接入时的自动打标

支持的 auto-create 路径会写入身份标记（`signal_type` + `source`）。OTLP metrics 还会记录协议声明的 metric type、unit 和 temporality；OTLP traces 会记录 pipeline 和 conventions。其他协议通常只提供身份元数据，具体如下：

| 接入路径 | `signal_type` | `source` | 额外 key |
| --- | --- | --- | --- |
| OTLP metrics | `metric` | `opentelemetry` | `metric.type`、`metric.unit`、`metric.temporality`、`metric.metadata_quality` = `declared`、`metric.original_name` |
| OTLP traces | `trace` | `opentelemetry` | `pipeline` = `greptime_trace_v1`、`trace.conventions` |
| OTLP logs | `log` | `opentelemetry` | — |
| Prometheus remote write | `metric` | `prometheus` | 仅身份 |
| InfluxDB line protocol | `metric` | `influxdb` | 仅身份 |
| OpenTSDB | `metric` | `opentsdb` | 仅身份 |
| Loki | `log` | `loki` | 仅身份 |
| Elasticsearch Bulk API | `log` | `elasticsearch` | 仅身份 |

语义选项在建表时设置，后续写入不会更新。例如，后续写入不会把 `metadata_quality` 从 `inferred` 改为 `declared`，也不会修订 `trace.conventions`。

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

消费者可以查询所有带语义元数据的表：

```sql
SELECT table_schema, table_name, signal_type, source, pipeline, metadata_quality, semantic_options
FROM information_schema.table_semantics
ORDER BY table_name;
```

`signal_type`、`source`、`pipeline`、`metadata_quality` 被提升为独立的列；其余信号特定的 key 被折叠进 `semantic_options` JSON 字符串（去掉 `greptime.semantic.` 前缀）。完整 schema 和更多示例见 [`TABLE_SEMANTICS`](/reference/sql/information-schema/table-semantics.md) 参考文档。

[GreptimeDB MCP Server](/user-guide/integrations/mcp.md) 会读取这个视图，让 AI 助手根据元数据识别表，而不依赖人工说明。
