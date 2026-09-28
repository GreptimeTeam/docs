---
keywords: [GreptimeDB, write batching, ingestion, configuration, frontend, standalone]
description: Configure write batching in GreptimeDB standalone and frontend configuration files.
---

# Write batching

You can configure write batching in the standalone or frontend configuration file. It batches writes before flushing them to storage. Write batching is disabled by default.

`[pending_rows_batcher]` batches writes to ordinary tables. `[pending_rows_batcher.logical_table]` batches Prometheus Remote Write and Prometheus-compatible OTLP metrics that use metric engine logical tables.

## Configure batching for ordinary tables

To enable batching for ordinary tables, configure at least one protocol and a non-zero flush interval:

```toml
[pending_rows_batcher]
protocols = ["influxdb"]
pending_rows_flush_interval = "500ms"
```

Batching for ordinary tables supports `influxdb`, `opentsdb`, `otlp`, `logs`, `loki`, `splunk`, `elasticsearch`, `http_sql`, `mysql`, `postgres`, and `prom`.

Prometheus Remote Write uses this batcher only when the metric engine is disabled. OTLP logs, traces, and metrics without the metric engine also use it. MySQL and PostgreSQL use it for eligible `INSERT` statements. It does not support streaming Flow source tables.

## Configure batching for metric engine logical tables

Only `prom` and `otlp` support batching for metric engine logical tables. When the metric engine is enabled, this batcher handles Prometheus Remote Write and Prometheus-compatible OTLP metrics:

```toml
[prom_store]
with_metric_engine = true

[pending_rows_batcher.logical_table]
protocols = ["prom"]
pending_rows_flush_interval = "500ms"
```

Logs, traces, and OTLP metrics that use the legacy ingestion format do not use this batcher. Its settings are independent of `[pending_rows_batcher]`. Values omitted from this section use its defaults; they do not inherit values from the parent section.

If you omit this section, GreptimeDB uses the legacy Prometheus batching settings in `[prom_store]`. It does not enable OTLP metric batching. An empty `protocols` array or a `0s` interval disables batching for logical tables, without falling back to the legacy settings.

## Batch flush conditions

GreptimeDB flushes a batch when either condition is met:

- The configured `pending_rows_flush_interval` elapses, measured from the first pending write request.
- The batch reaches `max_batch_rows` after GreptimeDB adds a complete incoming write request.

`max_batch_rows` does not cap the size of a batch. GreptimeDB does not split an incoming write request to stay below it.

## Request acknowledgment and HTTP timeouts

By default, GreptimeDB responds after it writes the batch to storage. Set `PENDING_ROWS_BATCH_SYNC` to `false` to respond after GreptimeDB accepts the request for batching. Storage errors that occur after that point cannot be returned to the client. In synchronous mode, writes over a single connection and `INSERT SELECT` can wait for a flush.

In synchronous mode, GreptimeDB increases a non-zero `http.timeout` when it is no greater than the active flush interval plus 1 second. It uses the larger active interval from `pending_rows_batcher.pending_rows_flush_interval` and `pending_rows_batcher.logical_table.pending_rows_flush_interval`. This applies to Prometheus Remote Write, metric-engine OTLP metrics, and HTTP writes to ordinary tables. MySQL and PostgreSQL batching does not change the HTTP timeout. Set `http.timeout = "0s"` to disable it.

See the [Configuration Reference](https://github.com/GreptimeTeam/greptimedb/blob/VAR::greptimedbVersion/config/config.md) for all batching options and defaults.
