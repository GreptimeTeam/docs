---
keywords: [table semantics, semantic layer, observability metadata, information schema, experimental]
description: Provides an experimental view over GreptimeDB table semantic metadata in INFORMATION_SCHEMA.TABLE_SEMANTICS.
---

# TABLE_SEMANTICS (Experimental)

:::warning
The `TABLE_SEMANTICS` view is currently experimental and may change in future releases.
:::

The `TABLE_SEMANTICS` table provides a queryable view over GreptimeDB's table semantic layer. It returns one row for each table that carries at least one `greptime.semantic.*` table option.

`signal_type`, `source`, `pipeline`, and `metadata_quality` are exposed as dedicated columns. The remaining semantic keys are folded into the `semantic_options` JSON string, with the `greptime.semantic.` prefix removed from each key.

Tables without semantic options do not appear in this view. Because the promoted fields are regular columns, you can filter on them directly.

```sql
USE INFORMATION_SCHEMA;
DESC TABLE TABLE_SEMANTICS;
```

The output is as follows:

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

Fields in the `TABLE_SEMANTICS` table are described as follows:

- `table_catalog`: The catalog name of the table.
- `table_schema`: The schema name of the table.
- `table_name`: The table name.
- `table_id`: The internal table ID.
- `signal_type`: The semantic signal type, such as `metric` or `trace`.
- `source`: The source that wrote the semantic metadata, such as `opentelemetry`.
- `pipeline`: The pipeline identifier associated with the table, if present.
- `metadata_quality`: The quality level of the semantic metadata, if present.
- `semantic_options`: A JSON string containing the remaining semantic options after promoted keys are removed.

Query semantic metadata as follows:

```sql
SELECT table_schema, table_name, signal_type, source, pipeline, metadata_quality, semantic_options
FROM information_schema.table_semantics
ORDER BY table_name;
```

Example output:

```sql
+--------------+----------------+-------------+---------------+--------------------+------------------+-----------------------------------------------------------------+
| table_schema | table_name     | signal_type | source        | pipeline           | metadata_quality | semantic_options                                                |
+--------------+----------------+-------------+---------------+--------------------+------------------+-----------------------------------------------------------------+
| public       | metrics_tagged | metric      | opentelemetry | greptime_metric_v1 | declared         | {"metric.type":"counter","metric.unit":"By"}                    |
| public       | traces_tagged  | trace       | opentelemetry |                    |                  | {"trace.conventions":"https://opentelemetry.io/schemas/1.27.0"} |
+--------------+----------------+-------------+---------------+--------------------+------------------+-----------------------------------------------------------------+
```

Filter on promoted columns directly:

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
