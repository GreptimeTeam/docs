---
keywords: [semantic layer, semantic metadata, observability metadata, table options, MCP, AI agents, OpenTelemetry, signal type]
description: Explains GreptimeDB's experimental greptime.semantic.* table metadata for identifying the observability concept represented by a table.
---

# Table Semantic Layer (Experimental)

:::warning
The semantic layer is experimental and may change in future releases. Tables without semantic metadata keep working unchanged; the layer is optional and additive.
:::

The semantic layer stores metadata on a table so machine consumers such as LLM agents, alert and dashboard builders, [MCP servers](/user-guide/integrations/mcp.md), and ETL pipelines can identify what the table represents without inferring it from column names.

## Why it exists

GreptimeDB ingests OTLP metrics, traces, and logs, plus Prometheus remote write, InfluxDB Line Protocol, OpenTSDB, Loki Push API, and Elasticsearch Bulk API data. Some protocols, especially OpenTelemetry, carry semantic metadata that is not represented by ordinary table columns. The amount and quality of metadata varies by protocol:

- An OTLP traces table looks like any other wide table; signal type and source must be guessed from naming.
- An OTLP metric's unit (`s`, `By`) is discarded by the row encoders and is unrecoverable from the data.
- OTLP aggregation temporality (`cumulative` vs `delta`) is invisible in the metric name.
- A Prometheus `counter` inferred from a `_total` suffix is not a protocol declaration. Without semantic metadata, the table does not record that distinction.

This metadata is available during ingestion but is not represented in ordinary data rows. Keeping it allows an alert generator to distinguish a rate from an absolute value, a dashboard builder to select a visualization by signal type, and an agent to inspect a structured catalog instead of inferring meaning from column names.

## How it works

The layer uses existing SQL interfaces. It does not add a protocol or DDL keyword. It has three parts:

1. **`greptime.semantic.*` table options** store table identity and ingestion metadata alongside options such as `ttl` and `table_data_model`.
2. **Column `COMMENT`** stores additional column-level information through standard SQL.
3. **[`information_schema.table_semantics`](/reference/sql/information-schema/table-semantics.md)** is the discovery view. It returns one row for each table with at least one `greptime.semantic.*` option.

## Vocabulary

All keys are flat strings under the `greptime.semantic.` prefix, and all values are strings. The vocabulary contains only metadata that a consumer cannot readily recover from the schema, columns, or metric naming conventions. It omits constants, values already encoded in a metric name such as the Prometheus `_total` suffix, and information that only repeats a column.

The whitelist is closed: an unrecognized key under the prefix (such as `greptime.semantic.future.key`) or an out-of-domain value is rejected.

### Common keys (all signals)

| Key | Description | Example values |
| --- | --- | --- |
| `greptime.semantic.signal_type` | The telemetry signal the table represents. | `metric` / `trace` / `log` / `event` / `unknown` |
| `greptime.semantic.source` | The ingestion ecosystem that wrote the data. | `opentelemetry` / `prometheus` / `influxdb` / `opentsdb` / `loki` / `elasticsearch` / `custom` / `mixed` / `unknown` |
| `greptime.semantic.pipeline` | The internal ingestion data model. The signal-agnostic successor to `table_data_model`. | `greptime_trace_v1` |

### Trace keys

| Key | Description | Example values |
| --- | --- | --- |
| `greptime.semantic.trace.conventions` | The semantic-conventions version the rows conform to, typically an OTel schema URL. | `https://opentelemetry.io/schemas/1.27.0` / `mixed` / `unknown` |

### Metric keys

| Key | Description | Example values |
| --- | --- | --- |
| `greptime.semantic.metric.type` | The instrument kind. | `counter` / `gauge` / `histogram` / `summary` / `updown_counter` / `gauge_histogram` / `info` / `stateset` / `mixed` / `unknown` |
| `greptime.semantic.metric.unit` | The unit in [UCUM](https://ucum.org/) notation. Discarded by the row encoders, so unrecoverable once ingested. | `s` / `By` / `{request}` |
| `greptime.semantic.metric.temporality` | Aggregation temporality (OTLP only). Invisible in the metric name. | `cumulative` / `delta` / `mixed` / `unknown` |
| `greptime.semantic.metric.metadata_quality` | How the metric type was obtained and how reliable `metric.type` is. | `declared` (the protocol stated it) / `inferred` (derived from a name suffix) / `unknown` |
| `greptime.semantic.metric.original_name` | The original OpenTelemetry name, recorded when the table name is converted to Prometheus naming. | `http.server.duration` |

Consumers should verify an `inferred` counter before applying `rate()` semantics because the type was derived from its name rather than declared by the protocol.

`unknown` and `mixed` are shared sentinel values. `unknown` means the value could not be determined when the option was set. `mixed` means a single-valued key received conflicting values over the table's lifetime, for example when a table received rows from more than one source. Treat a single-valued semantic key as descriptive metadata, not an enforced constraint.

## Automatic stamping on ingestion

Supported auto-create paths stamp identity (`signal_type` + `source`). OTLP metrics also carry metric type, unit, and temporality because the OTLP wire format declares them; OTLP traces carry pipeline and convention metadata. Other protocols generally provide only identity metadata, as shown below.

| Ingestion path | `signal_type` | `source` | Additional keys |
| --- | --- | --- | --- |
| OTLP metrics | `metric` | `opentelemetry` | `metric.type`, `metric.unit`, `metric.temporality`, `metric.metadata_quality` = `declared`, `metric.original_name` |
| OTLP traces | `trace` | `opentelemetry` | `pipeline` = `greptime_trace_v1`, `trace.conventions` |
| OTLP logs | `log` | `opentelemetry` | — |
| Prometheus remote write | `metric` | `prometheus` | identity only |
| InfluxDB line protocol | `metric` | `influxdb` | identity only |
| OpenTSDB | `metric` | `opentsdb` | identity only |
| Loki | `log` | `loki` | identity only |
| Elasticsearch Bulk API | `log` | `elasticsearch` | identity only |

Semantic options are set when the table is created and are not updated by later writes. For example, later writes do not change `metadata_quality` from `inferred` to `declared` or revise `trace.conventions`.

## Manual tagging with DDL

You can set the same options yourself in `CREATE TABLE ... WITH (...)`. Only whitelisted keys with a valid value are accepted:

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

The options appear in `SHOW CREATE TABLE` output and in the `table_semantics` view.

## Discovering semantic metadata

A consumer can list all tables with semantic metadata:

```sql
SELECT table_schema, table_name, signal_type, source, pipeline, metadata_quality, semantic_options
FROM information_schema.table_semantics
ORDER BY table_name;
```

`signal_type`, `source`, `pipeline`, and `metadata_quality` are promoted to dedicated columns; the remaining signal-specific keys are folded into the `semantic_options` JSON string (with the `greptime.semantic.` prefix stripped). See the [`TABLE_SEMANTICS`](/reference/sql/information-schema/table-semantics.md) reference for the full schema and more examples.

The [GreptimeDB MCP Server](/user-guide/integrations/mcp.md) reads this view so AI assistants can identify tables from metadata instead of manual descriptions.
