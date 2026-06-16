---
keywords: [表语义, 语义层, 可观测性元数据, INFORMATION_SCHEMA, 实验性功能]
description: TABLE_SEMANTICS 表在 INFORMATION_SCHEMA 中提供 GreptimeDB 表语义层元数据的实验性视图。
---

# TABLE_SEMANTICS（实验性）

:::warning
`TABLE_SEMANTICS` 视图目前处于实验阶段，未来版本可能会发生变化。
:::

`TABLE_SEMANTICS` 提供 GreptimeDB [表语义层](/user-guide/concepts/semantic-layer.md)的查询入口。每张设置了至少一个 `greptime.semantic.*` 选项的表对应一行；未设置任何语义选项的表不会出现在该视图中。

语义选项标识一张表所代表的可观测性概念，使下游工具（LLM agent、告警与仪表盘生成器、ETL）无需依赖列名推断即可识别表的用途。语义选项有两种设置方式：

- **摄入时自动设置。** OTLP、Prometheus remote write 等路径在自动建表时写入相应的 key。
- **建表时手动设置。** 在 `CREATE TABLE ... WITH (...)` 中指定。仅接受白名单内、取值合法的 key；未知 key 或超出取值范围的值会被拒绝。

```sql
CREATE TABLE my_metrics (
  ts TIMESTAMP TIME INDEX,
  val DOUBLE
) WITH (
  'greptime.semantic.signal_type' = 'metric',
  'greptime.semantic.source' = 'opentelemetry',
  'greptime.semantic.metric.type' = 'counter'
);
```

`signal_type`、`source`、`pipeline`、`metadata_quality` 被提升为独立列，其余 key 合并到 `semantic_options` JSON 字符串中，并去掉各自的 `greptime.semantic.` 前缀。被提升的字段是普通列，可直接用于过滤。

```sql
USE INFORMATION_SCHEMA;
DESC TABLE_SEMANTICS;
```

输出如下：

```sql
+------------------+--------+-----+------+---------+---------------+
| Column           | Type   | Key | Null | Default | Semantic Type |
+------------------+--------+-----+------+---------+---------------+
| table_catalog    | String |     | NO   |         | FIELD         |
| table_schema     | String |     | NO   |         | FIELD         |
| table_name       | String |     | NO   |         | FIELD         |
| table_id         | UInt32 |     | NO   |         | FIELD         |
| signal_type      | String |     | YES  |         | FIELD         |
| source           | String |     | YES  |         | FIELD         |
| pipeline         | String |     | YES  |         | FIELD         |
| metadata_quality | String |     | YES  |         | FIELD         |
| semantic_options | String |     | YES  |         | FIELD         |
+------------------+--------+-----+------+---------+---------------+
```

## 列说明

- `table_catalog`：表所在的 catalog 名称。
- `table_schema`：表所在的 schema 名称。
- `table_name`：表名。
- `table_id`：内部表 ID。
- `signal_type`：表所属的遥测信号类型，取值为以下之一：
  - `metric` —— 指标。
  - `trace` —— 链路（span）。
  - `log` —— 日志。
  - `event` —— 离散事件。预留值：取值合法、可手动设置，但当前没有摄入路径会自动设置该值；自动设置的取值仅为 `metric`、`log`、`trace`。
  - `unknown` —— 设置时无法确定。
- `source`：写入数据的来源生态，取值为 `opentelemetry`、`prometheus`、`influxdb`、`opentsdb`、`elasticsearch`、`loki`、`custom`、`mixed`、`unknown` 之一。`mixed` 表示同一张表接收了多个来源的数据，`unknown` 表示无法确定。
- `pipeline`：内部摄入数据模型的标识，自由格式字符串。当前仅 OTLP trace 路径会自动设置，取值为 `greptime_trace_v1`；其他取值需手动设置。它是 `table_data_model` 选项的后继，不再与具体存储引擎绑定。
- `metadata_quality`：`metric.type` 标注的来源，即其可信程度，取值为以下之一：
  - `declared` —— 摄入协议显式提供了 instrument 类型（如 OTLP 指标自带类型），可信。
  - `inferred` —— 类型由指标名推断得到（如 Prometheus 的 `_total` 后缀被识别为 counter），对命名不规范的指标可能不准确。
  - `unknown` —— 无法确定。
- `semantic_options`：JSON 字符串，包含未被提升为列的其余语义选项，各 key 去掉 `greptime.semantic.` 前缀。key 按字典序排列，因此多次查询的输出保持稳定。具体 key 见下文 [semantic_options 的 key](#semantic_options-的-key)。

## semantic_options 的 key

以下 key 可能出现在 `semantic_options` 中。它们仅对特定信号有意义，因此保留在 JSON 中，未提升为独立列。

- `metric.type`：instrument 类型，取值为 `counter`、`gauge`、`histogram`、`summary`、`updown_counter`、`gauge_histogram`、`info`、`stateset`、`mixed`、`unknown` 之一。`mixed` 表示同一张表中包含多种 instrument 类型。
- `metric.unit`：[UCUM](https://ucum.org/) 格式的单位，如 `s`、`By`、`{request}`。单位在行编码阶段被丢弃，数据写入后无法从中恢复。
- `metric.temporality`：聚合时间性（temporality，仅 OTLP），取值为 `cumulative`、`delta`、`mixed`、`unknown` 之一。该信息不体现在指标名中，仅凭表本身无法恢复。
- `metric.original_name`：翻译前的 OpenTelemetry 指标名，在表名被转换为 Prometheus 风格时记录。下游可据此在 OpenTelemetry 语义约定中反查该指标。
- `trace.conventions`：行数据所遵循的语义约定版本，通常为 OpenTelemetry schema URL，如 `https://opentelemetry.io/schemas/1.27.0`，也可能为 `unknown` / `mixed`。

`unknown` 与 `mixed` 是两个通用的哨兵值：`unknown` 表示设置时无法确定取值；`mixed` 表示一个本应单值的 key 在表的生命周期内出现了相互冲突的多个取值。

## 示例

查询语义元数据：

```sql
SELECT table_schema, table_name, signal_type, source, pipeline, metadata_quality, semantic_options
FROM information_schema.table_semantics
ORDER BY table_name;
```

输出示例：

```sql
+--------------+----------------+-------------+---------------+--------------------+------------------+-----------------------------------------------------------------+
| table_schema | table_name     | signal_type | source        | pipeline           | metadata_quality | semantic_options                                                |
+--------------+----------------+-------------+---------------+--------------------+------------------+-----------------------------------------------------------------+
| public       | metrics_tagged | metric      | opentelemetry |                    | declared         | {"metric.type":"counter","metric.unit":"By"}                    |
| public       | traces_tagged  | trace       | opentelemetry | greptime_trace_v1  |                  | {"trace.conventions":"https://opentelemetry.io/schemas/1.27.0"} |
+--------------+----------------+-------------+---------------+--------------------+------------------+-----------------------------------------------------------------+
```

直接对提升的列进行过滤：

```sql
SELECT table_name, signal_type
FROM information_schema.table_semantics
WHERE signal_type = 'metric'
ORDER BY table_name;
```

```sql
+----------------+-------------+
| table_name     | signal_type |
+----------------+-------------+
| metrics_tagged | metric      |
+----------------+-------------+
```
