---
keywords: [table semantics, semantic metadata, table options, signal type, metric type, MCP, information_schema]
description: The greptime.semantic.* table options, how ingestion sets them, how to set them yourself, and how to query them.
---

# Table semantics

:::warning
Table semantics are experimental and may change in future releases. Tables without semantic options keep working unchanged.
:::

Table semantics are `greptime.semantic.*` table options that record what a table represents: the telemetry signal, the ingestion source, and signal-specific metadata such as a metric's instrument type and unit. They sit alongside options such as `ttl` and `table_data_model`, appear in `SHOW CREATE TABLE`, and are listed by [`information_schema.table_semantics`](/reference/sql/information-schema/table-semantics.md).

## Vocabulary

All keys are flat strings under the `greptime.semantic.` prefix, and all values are strings. The vocabulary holds only metadata that a consumer cannot recover from the schema, the columns, or metric naming conventions. It omits constants, values already encoded in a metric name such as the Prometheus `_total` suffix, and information that repeats a column.

The whitelist is closed: an unrecognized key under the prefix (such as `greptime.semantic.future.key`) or an out-of-domain value is rejected. The one exception is the open `greptime.semantic.entity.*` sub-namespace, described in [Declaring entities and relationships](./declaring-entities.md).

### Common keys (all signals)

| Key | Description | Example values |
| --- | --- | --- |
| `greptime.semantic.signal_type` | The telemetry signal the table represents. | `metric` / `trace` / `log` / `event` / `unknown` |
| `greptime.semantic.source` | The ingestion ecosystem that wrote the data. | `opentelemetry` / `prometheus` / `influxdb` / `opentsdb` / `loki` / `elasticsearch` / `custom` / `mixed` / `unknown` |
| `greptime.semantic.source_version` | The source protocol version. Stamped by the Prometheus remote write path. | `1.0` / `2.0` |
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

Verify an `inferred` counter before applying `rate()` semantics: the type was derived from its name rather than declared by the protocol.

`unknown` and `mixed` are shared sentinel values. `unknown` means the value could not be determined when the option was set. `mixed` means a single-valued key received conflicting values over the table's lifetime, for example when a table received rows from more than one source. Treat a single-valued semantic key as descriptive metadata, not an enforced constraint.

## Automatic stamping on ingestion

Supported auto-create paths stamp identity (`signal_type` + `source`). OTLP metrics also carry metric type, unit, and temporality because the OTLP wire format declares them; OTLP traces carry pipeline and convention metadata. Other protocols generally provide only identity metadata.

| Ingestion path | `signal_type` | `source` | Additional keys |
| --- | --- | --- | --- |
| OTLP metrics | `metric` | `opentelemetry` | `metric.type`, `metric.unit`, `metric.temporality`, `metric.metadata_quality` = `declared`, `metric.original_name` |
| OTLP traces | `trace` | `opentelemetry` | `pipeline` = `greptime_trace_v1`, `trace.conventions` |
| OTLP logs | `log` | `opentelemetry` | — |
| Prometheus remote write | `metric` | `prometheus` | `source_version`, `metric.metadata_quality` = `inferred` |
| InfluxDB line protocol | `metric` | `influxdb` | identity only |
| OpenTSDB | `metric` | `opentsdb` | identity only |
| Loki | `log` | `loki` | identity only |
| Elasticsearch Bulk API | `log` | `elasticsearch` | identity only |

Remote write 2.0 carries per-series metadata inline. When a series declares its type, the table gets `metric.type` with `metric.metadata_quality` = `declared` instead of the name-based guess.

Semantic options are set when the table is created and are not updated by later writes. For example, later writes do not change `metadata_quality` from `inferred` to `declared` or revise `trace.conventions`.

## Setting the options yourself

Set the same options in `CREATE TABLE ... WITH (...)`. Only whitelisted keys with a valid value are accepted:

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

Add or remove options on an existing table with `ALTER TABLE`:

```sql
ALTER TABLE my_metrics SET 'greptime.semantic.metric.unit' = 's';

ALTER TABLE my_metrics UNSET 'greptime.semantic.metric.unit';
```

The options appear in `SHOW CREATE TABLE` output and in the `table_semantics` view.

## Discovering semantic metadata

List every table that carries semantic metadata:

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

`signal_type`, `source`, `source_version`, `pipeline`, and `metadata_quality` are promoted to dedicated columns, so you can filter on them directly. Every other option, including the `entity.*` keys, is folded into the `semantic_options` JSON string with the `greptime.semantic.` prefix stripped. A further `entity_declarations` column reports the resolved entity identities, built-in conventions included; see [Inspecting declarations](./declaring-entities.md#inspecting-declarations).

See the [`TABLE_SEMANTICS`](/reference/sql/information-schema/table-semantics.md) reference for the full schema.

The [GreptimeDB MCP Server](/user-guide/integrations/mcp.md) reads this view so AI assistants can identify tables from metadata instead of manual descriptions.
