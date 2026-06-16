---
keywords: [table semantics, semantic layer, observability metadata, information schema, experimental]
description: Provides an experimental view over GreptimeDB table semantic metadata in INFORMATION_SCHEMA.TABLE_SEMANTICS.
---

# TABLE_SEMANTICS (Experimental)

:::warning
The `TABLE_SEMANTICS` view is currently experimental and may change in future releases.
:::

The `TABLE_SEMANTICS` view provides a queryable interface over GreptimeDB's [table semantic layer](/user-guide/concepts/semantic-layer.md). It returns one row for each table that carries at least one `greptime.semantic.*` table option. Tables without any semantic option do not appear in this view.

The semantic options describe what observability concept a table stands for, so a consumer (an LLM agent, an alert/dashboard builder, an ETL job) can align a table with its meaning without guessing from column names. They are set in two ways:

- **Automatically on ingestion.** The OTLP and Prometheus remote write paths stamp the relevant keys when they auto-create a table.
- **Manually on DDL.** You can set them yourself in `CREATE TABLE ... WITH (...)`. Only whitelisted keys with a valid value are accepted; an unknown key or an out-of-domain value is rejected.

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

`signal_type`, `source`, `pipeline`, and `metadata_quality` are promoted to dedicated columns. The remaining semantic keys are folded into the `semantic_options` JSON string, with the `greptime.semantic.` prefix removed from each key. Because the promoted fields are regular columns, you can filter on them directly.

```sql
USE INFORMATION_SCHEMA;
DESC TABLE_SEMANTICS;
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

## Columns

- `table_catalog`: The catalog name of the table.
- `table_schema`: The schema name of the table.
- `table_name`: The table name.
- `table_id`: The internal table ID.
- `signal_type`: The telemetry signal the table represents. One of:
  - `metric` — metrics.
  - `trace` — traces (spans).
  - `log` — logs.
  - `event` — discrete events. Reserved: it is a valid value you can set manually, but no ingestion path stamps it automatically yet. Today the ingestion paths only stamp `metric`, `log`, and `trace`.
  - `unknown` — could not be determined when the option was stamped.
- `source`: The ingestion ecosystem that wrote the data. One of `opentelemetry`, `prometheus`, `influxdb`, `opentsdb`, `elasticsearch`, `loki`, `custom`, `mixed`, or `unknown`. `mixed` means one table received data from more than one source; `unknown` means it could not be determined.
- `pipeline`: A free-form identifier of the internal ingestion data model. Today the OTLP trace path stamps `greptime_trace_v1`; other values can be set manually. It is the signal-agnostic successor to the `table_data_model` option.
- `metadata_quality`: How the metric type metadata was obtained — that is, how much you can trust the `metric.type` value. One of:
  - `declared` — the ingestion protocol stated the instrument type explicitly (for example OTLP metrics carry the type). Trustworthy.
  - `inferred` — the type was guessed from the metric name (for example a Prometheus `_total` suffix is read as a counter). May be wrong for non-conventional names.
  - `unknown` — could not be determined.
- `semantic_options`: A JSON string holding the remaining semantic options after the promoted keys are removed, with the `greptime.semantic.` prefix stripped from each key. The keys are sorted, so the string is stable across queries. See [Semantic options keys](#semantic-options-keys) below.

## Semantic options keys

The following keys can appear inside `semantic_options`. They are signal-specific, which is why they are kept in the JSON tail rather than promoted to columns.

- `metric.type`: The instrument kind. One of `counter`, `gauge`, `histogram`, `summary`, `updown_counter`, `gauge_histogram`, `info`, `stateset`, `mixed`, or `unknown`. `mixed` means one table holds more than one instrument kind.
- `metric.unit`: The unit in [UCUM](https://ucum.org/) notation, for example `s`, `By`, or `{request}`. The row encoders discard the unit, so it is unrecoverable from the data once ingested.
- `metric.temporality`: The aggregation temporality (OTLP only). One of `cumulative`, `delta`, `mixed`, or `unknown`. It is invisible in the metric name, so it is unrecoverable from the table alone.
- `metric.original_name`: The pre-translation OpenTelemetry metric name, recorded when the table name was converted to Prometheus style. It is the key a consumer uses to look the metric up in the OpenTelemetry semantic conventions.
- `trace.conventions`: The semantic-conventions version the rows conform to, typically an OpenTelemetry schema URL such as `https://opentelemetry.io/schemas/1.27.0`, or `unknown` / `mixed`.

`unknown` and `mixed` are shared sentinels: `unknown` means the value could not be determined when the option was stamped, and `mixed` means a single-valued key saw conflicting values over the table's lifetime.

## Examples

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
| public       | metrics_tagged | metric      | opentelemetry |                    | declared         | {"metric.type":"counter","metric.unit":"By"}                    |
| public       | traces_tagged  | trace       | opentelemetry | greptime_trace_v1  |                  | {"trace.conventions":"https://opentelemetry.io/schemas/1.27.0"} |
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
