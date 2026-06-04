---
keywords: [表语义, 语义层, 可观测性元数据, INFORMATION_SCHEMA, 实验性功能]
description: TABLE_SEMANTICS 表在 INFORMATION_SCHEMA 中提供 GreptimeDB 表语义层元数据的实验性视图。
---

# TABLE_SEMANTICS（实验性功能）

:::warning 实验性特性
`TABLE_SEMANTICS` 视图目前仍处于实验阶段，在未来版本中可能会发生变化。
:::

`TABLE_SEMANTICS` 表提供了 GreptimeDB 表语义层的可查询视图。对于每张至少带有一个 `greptime.semantic.*` 表选项的表，它都会返回一行记录。

`signal_type`、`source`、`pipeline` 和 `metadata_quality` 会作为独立列暴露出来。其余语义键会被折叠到 `semantic_options` JSON 字符串中，并移除每个键上的 `greptime.semantic.` 前缀。

不带语义选项的表不会出现在这个视图中。由于这些提升后的字段都是普通列，因此你可以直接按它们进行过滤。

```sql
USE INFORMATION_SCHEMA;
DESC TABLE TABLE_SEMANTICS;
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

`TABLE_SEMANTICS` 表中的字段描述如下：

- `table_catalog`：表所属的 catalog 名称。
- `table_schema`：表所属的 schema 名称。
- `table_name`：表名。
- `table_id`：内部表 ID。
- `signal_type`：语义信号类型，例如 `metric` 或 `trace`。
- `source`：写入语义元数据的来源，例如 `opentelemetry`。
- `pipeline`：关联的 pipeline 标识（如果存在）。
- `metadata_quality`：语义元数据的质量等级（如果存在）。
- `semantic_options`：移除提升后的键之后，其余语义选项组成的 JSON 字符串。

按如下方式查询语义元数据：

```sql
SELECT table_schema, table_name, signal_type, source, pipeline, metadata_quality, semantic_options
FROM information_schema.table_semantics
ORDER BY table_name;
```

示例输出：

```sql
+--------------+----------------+-------------+---------------+--------------------+------------------+-----------------------------------------------------------------+
| table_schema | table_name     | signal_type | source        | pipeline           | metadata_quality | semantic_options                                                |
+--------------+----------------+-------------+---------------+--------------------+------------------+-----------------------------------------------------------------+
| public       | metrics_tagged | metric      | opentelemetry | greptime_metric_v1 | declared         | {"metric.type":"counter","metric.unit":"By"}                    |
| public       | traces_tagged  | trace       | opentelemetry |                    |                  | {"trace.conventions":"https://opentelemetry.io/schemas/1.27.0"} |
+--------------+----------------+-------------+---------------+--------------------+------------------+-----------------------------------------------------------------+
```

你也可以直接基于提升后的列进行过滤：

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
