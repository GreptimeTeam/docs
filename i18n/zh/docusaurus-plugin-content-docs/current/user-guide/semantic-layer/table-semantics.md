---
keywords: [表语义, 语义元数据, 表选项, 信号类型, metric 类型, MCP, information_schema]
description: greptime.semantic.* 表选项、接入时如何自动写入、如何自己设置，以及如何查询。
---

# 表语义

:::warning
表语义目前处于实验阶段，未来版本可能发生变化。没有语义选项的表照常工作。
:::

表语义是一组 `greptime.semantic.*` 表选项，记录一张表代表什么：遥测信号类型、接入来源，以及 instrument 类型、单位等信号特定的元数据。它们与 `ttl`、`table_data_model` 等选项并列，出现在 `SHOW CREATE TABLE` 输出中，并由 [`information_schema.table_semantics`](/reference/sql/information-schema/table-semantics.md) 列出。

## 词汇表

所有 key 都是 `greptime.semantic.` 前缀下的扁平字符串，所有 value 都是字符串。词汇表只保留无法直接从 schema、列或 metric 命名约定中还原的信息。常量、已经编码在 metric 名字中的值（例如 Prometheus 的 `_total` 后缀），以及仅重复某一列的信息不会写入。

白名单是封闭的：前缀下未被识别的 key（比如 `greptime.semantic.future.key`）或超出取值范围的 value 都会被拒绝。唯一的例外是开放的 `greptime.semantic.entity.*` 子命名空间，见[声明实体与关系](./declaring-entities.md)。

### 通用 key（所有信号）

| Key | 说明 | 示例取值 |
| --- | --- | --- |
| `greptime.semantic.signal_type` | 表所代表的遥测信号类型。 | `metric` / `trace` / `log` / `event` / `unknown` |
| `greptime.semantic.source` | 写入数据的接入生态。 | `opentelemetry` / `prometheus` / `influxdb` / `opentsdb` / `loki` / `elasticsearch` / `custom` / `mixed` / `unknown` |
| `greptime.semantic.source_version` | 来源协议的版本，由 Prometheus remote write 路径写入。 | `1.0` / `2.0` |
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

对于 `inferred` 的 counter，使用 `rate()` 语义前应先复核类型：它来自名称推断，不是协议声明。

`unknown` 和 `mixed` 是两个通用取值。`unknown` 表示设置选项时无法确定取值；`mixed` 表示同一个 key 在表的生命周期内收到过冲突值，例如一张表接收了多个 source 的数据。单值语义 key 是描述性元数据，不是数据库强制执行的约束。

## 接入时的自动打标

支持的 auto-create 路径会写入身份标记（`signal_type` + `source`）。OTLP metrics 还会记录协议声明的 metric type、unit 和 temporality；OTLP traces 会记录 pipeline 和 conventions。其他协议通常只提供身份元数据。

| 接入路径 | `signal_type` | `source` | 额外 key |
| --- | --- | --- | --- |
| OTLP metrics | `metric` | `opentelemetry` | `metric.type`、`metric.unit`、`metric.temporality`、`metric.metadata_quality` = `declared`、`metric.original_name` |
| OTLP traces | `trace` | `opentelemetry` | `pipeline` = `greptime_trace_v1`、`trace.conventions` |
| OTLP logs | `log` | `opentelemetry` | — |
| Prometheus remote write | `metric` | `prometheus` | `source_version`、`metric.metadata_quality` = `inferred` |
| InfluxDB line protocol | `metric` | `influxdb` | 仅身份 |
| OpenTSDB | `metric` | `opentsdb` | 仅身份 |
| Loki | `log` | `loki` | 仅身份 |
| Elasticsearch Bulk API | `log` | `elasticsearch` | 仅身份 |

Remote write 2.0 在每条 series 上内联携带元数据。当 series 声明了类型时，表会得到 `metric.type` 且 `metric.metadata_quality` 为 `declared`，而不是根据名字推断。

语义选项在建表时设置，后续写入不会更新。例如，后续写入不会把 `metadata_quality` 从 `inferred` 改为 `declared`，也不会修订 `trace.conventions`。

## 自己设置选项

在 `CREATE TABLE ... WITH (...)` 里设置同样的选项，只接受白名单内、且取值合法的 key：

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

用 `ALTER TABLE` 增删已有表上的选项：

```sql
ALTER TABLE my_metrics SET 'greptime.semantic.metric.unit' = 's';

ALTER TABLE my_metrics UNSET 'greptime.semantic.metric.unit';
```

这些选项会出现在 `SHOW CREATE TABLE` 的输出和 `table_semantics` 视图里。

## 查询语义元数据

列出所有带语义元数据的表：

```sql
SELECT table_schema, table_name, signal_type, source, source_version, pipeline, metadata_quality, semantic_options
FROM information_schema.table_semantics
ORDER BY table_name;
```

```sql
+--------------+----------------+-------------+---------------+----------------+--------------------+------------------+-----------------------------------------------------------------+
| table_schema | table_name     | signal_type | source        | source_version | pipeline           | metadata_quality | semantic_options                                                |
+--------------+----------------+-------------+---------------+----------------+--------------------+------------------+-----------------------------------------------------------------+
| public       | metrics_tagged | metric      | opentelemetry | 2.0            | greptime_metric_v1 | declared         | {"metric.type":"counter","metric.unit":"By"}                    |
| public       | traces_tagged  | trace       | opentelemetry |                |                    |                  | {"trace.conventions":"https://opentelemetry.io/schemas/1.27.0"} |
+--------------+----------------+-------------+---------------+----------------+--------------------+------------------+-----------------------------------------------------------------+
```

`signal_type`、`source`、`source_version`、`pipeline`、`metadata_quality` 被提升为独立的列，可以直接过滤。其余选项（包括 `entity.*`）被折叠进 `semantic_options` JSON 字符串，并去掉 `greptime.semantic.` 前缀。另有 `entity_declarations` 列报告解析后的实体身份，包含内置约定，见[查看声明](./declaring-entities.md#查看声明)。

完整 schema 见 [`TABLE_SEMANTICS`](/reference/sql/information-schema/table-semantics.md) 参考文档。

[GreptimeDB MCP Server](/user-guide/integrations/mcp.md) 会读取这个视图，让 AI 助手根据元数据识别表，而不依赖人工说明。
