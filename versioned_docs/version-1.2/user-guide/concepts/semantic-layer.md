---
keywords: [semantic layer, semantic metadata, observability metadata, table options, MCP, AI agents, OpenTelemetry, signal type]
description: Explains GreptimeDB's experimental table semantic layer — the greptime.semantic.* metadata that tells machine consumers what observability concept a table represents.
---

# Table Semantic Layer (Experimental)

:::warning
The semantic layer is experimental and may change in future releases. Tables without semantic metadata keep working unchanged; the layer is optional and additive.
:::

The semantic layer attaches a thin layer of metadata to each table so machine consumers — LLM agents, alert and dashboard builders, [MCP servers](/user-guide/integrations/mcp.md), ETL pipelines — can align a table with the observability concept it represents, without guessing from column names.

## Why it exists

GreptimeDB ingests OTLP metrics, traces, and logs, plus Prometheus remote write, InfluxDB, OpenTSDB, Loki, and Elasticsearch. Each protocol carries rich metadata on the wire — instrument kind, temporality, unit, semantic-conventions version — and most of it is dropped once rows land in a table:

- An OTLP traces table looks like any other wide table; signal type and source must be guessed from naming.
- A metric's unit (`s`, `By`) is discarded by the row encoders and is unrecoverable from the data.
- OTLP aggregation temporality (`cumulative` vs `delta`) is invisible in the metric name.
- A Prometheus `counter` typed from a `_total` suffix is a *guess*, not a declaration — but the table never flags that.

The metadata to remove the guess already exists at ingest time. The semantic layer preserves it instead of throwing it away. An alert generator can then choose between `rate()` and absolute thresholds; a dashboard builder can pick a visualization by signal type; an agent can read a structured catalog instead of inferring from column names.

## How it works

The layer reuses existing SQL surfaces — no new protocol, no new DDL keyword. It has three mechanisms:

1. **`greptime.semantic.*` table options** — table-level identity and lineage, carried inside the existing `table_options` slot (the same slot that holds `ttl`, `table_data_model`, etc.).
2. **Column `COMMENT`** — standard SQL, for column-level supplements.
3. **[`information_schema.table_semantics`](/reference/sql/information-schema/table-semantics.md)** — a queryable view, the discovery entry point. It returns one row per table that carries at least one `greptime.semantic.*` option.

## Vocabulary

All keys are flat strings under the `greptime.semantic.` prefix; all values are strings. The vocabulary is deliberately small — a key earns its place only when it records something a consumer cannot cheaply recover from the schema, the columns, or the metric naming conventions it already understands. Keys whose value is already in the metric name (a Prometheus `_total` suffix), is a constant, or merely restates a column are intentionally omitted.

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
| `greptime.semantic.metric.metadata_quality` | How the metric type was obtained — how much you can trust `metric.type`. | `declared` (the protocol stated it) / `inferred` (guessed from a name suffix) / `unknown` |
| `greptime.semantic.metric.original_name` | The pre-translation OpenTelemetry name, recorded when the table name was Prometheus-ised. | `http.server.duration` |

`metadata_quality` is the load-bearing field for confidence-aware tooling: an `inferred` counter should be re-checked before betting on `rate()`-style semantics.

`unknown` and `mixed` are shared sentinels. `unknown` means the value could not be determined when the option was stamped; `mixed` means a single-valued key saw conflicting values over the table's lifetime — for a long-lived table that received rows from more than one source. Treat any single-valued semantic key as best-effort, not strong evidence.

## Automatic stamping on ingestion

The auto-create paths stamp identity (`signal_type` + `source`) on every supported protocol. OTLP metrics additionally carry the full metric vocabulary, because the OTLP wire format declares type/unit/temporality and then discards them; OTLP traces carry the pipeline and conventions.

| Ingestion path | `signal_type` | `source` | Additional keys |
| --- | --- | --- | --- |
| OTLP metrics | `metric` | `opentelemetry` | `metric.type`, `metric.unit`, `metric.temporality`, `metric.metadata_quality` = `declared`, `metric.original_name` |
| OTLP traces | `trace` | `opentelemetry` | `pipeline` = `greptime_trace_v1`, `trace.conventions` |
| OTLP logs | `log` | `opentelemetry` | — |
| Prometheus remote write | `metric` | `prometheus` | identity only (type/unit live in the metric name) |
| InfluxDB line protocol | `metric` | `influxdb` | identity only |
| OpenTSDB | `metric` | `opentsdb` | identity only |
| Loki | `log` | `loki` | identity only |
| Elasticsearch | `log` | `elasticsearch` | identity only |

Semantic options are stamped at table creation. There is no update path yet: promoting `metadata_quality` from `inferred` to `declared`, or revising `trace.conventions` on later writes, is deferred.

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

A consumer's first query on connect lists every semantic-tagged table:

```sql
SELECT table_schema, table_name, signal_type, source, pipeline, metadata_quality, semantic_options
FROM information_schema.table_semantics
ORDER BY table_name;
```

`signal_type`, `source`, `pipeline`, and `metadata_quality` are promoted to dedicated columns; the remaining signal-specific keys are folded into the `semantic_options` JSON string (with the `greptime.semantic.` prefix stripped). See the [`TABLE_SEMANTICS`](/reference/sql/information-schema/table-semantics.md) reference for the full schema and more examples.

The [GreptimeDB MCP Server](/user-guide/integrations/mcp.md) reads this view so AI assistants can understand your tables without you spelling out what each one means.
