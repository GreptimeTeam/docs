---
keywords: [GreptimeDB, write batching, ingestion, configuration, frontend, standalone]
description: Configure server-side write batching in the GreptimeDB standalone and frontend configuration files.
---

# Server-side write batching

GreptimeDB can batch writes before flushing them to storage. Configure it in the standalone or frontend configuration file. Write batching is disabled by default.

`[pending_rows_batcher]` batches writes to ordinary tables. `[pending_rows_batcher.logical_table]` batches Prometheus Remote Write and Prometheus-compatible OTLP metrics that use metric engine logical tables.

## Ordinary-table batching

To enable batching for ordinary tables, configure at least one protocol and a non-zero flush interval:

```toml
[pending_rows_batcher]
protocols = ["influxdb"]
pending_rows_flush_interval = "500ms"
```

This batcher supports `influxdb`, `opentsdb`, `otlp`, `logs`, `loki`, `splunk`, `elasticsearch`, `http_sql`, `mysql`, `postgres`, and `prom`.

Prometheus Remote Write uses this batcher only when the metric engine is disabled. OTLP logs, traces, and metrics without the metric engine also use it. MySQL and PostgreSQL use it for eligible `INSERT` statements. It does not support streaming Flow source tables.

## Metric-engine logical-table batching

This batcher supports only `prom` and `otlp`. When the metric engine is enabled, it handles Prometheus Remote Write and Prometheus-compatible OTLP metrics:

```toml
[prom_store]
with_metric_engine = true

[pending_rows_batcher.logical_table]
protocols = ["prom"]
pending_rows_flush_interval = "500ms"
```

Logs, traces, and OTLP metrics that use the legacy ingestion format do not use this batcher. Its settings are independent of `[pending_rows_batcher]`. Omitted values use this section's defaults, not the parent section's values.

An empty `protocols` array or a `0s` interval disables batching for logical tables, without falling back to the legacy settings.

:::note
For compatibility, GreptimeDB uses existing `[prom_store]` batching settings only when `[pending_rows_batcher.logical_table]` is omitted and `[pending_rows_batcher]` does not enable `prom`.
:::

## Options

Both batchers use these options. Their defaults are independent.

| Option | Default | Description |
| --- | --- | --- |
| `protocols` | `[]` | Protocols that use the batcher. An empty array disables batching. The logical-table batcher supports only `prom` and `otlp`. |
| `pending_rows_flush_interval` | `"0s"` | Flush interval for a pending batch. The interval starts when GreptimeDB begins accumulating the batch. A non-zero value is required to enable batching. |
| `max_batch_rows` | `100000` | Accumulated row threshold that triggers a flush. See [Batch flush conditions](#batch-flush-conditions). |
| `max_concurrent_flushes` | `256` | Maximum concurrent flush operations. |
| `worker_channel_capacity` | `65536` | Maximum queued submissions for each table worker. |
| `max_inflight_requests` | `3000` | Maximum original write requests waiting for batch completion. |
| `flow_notification_queue_capacity` | `1024` | Maximum queued Flow notifications. This value must be greater than `0`. |

## Batch flush conditions

GreptimeDB flushes a batch when either of these conditions is met:

- The configured `pending_rows_flush_interval` elapses after GreptimeDB starts accumulating the batch.
- The batch reaches `max_batch_rows` after GreptimeDB adds a complete incoming write request.

`max_batch_rows` is not a hard batch-size limit. GreptimeDB does not split an incoming write request to stay below it.

## Request acknowledgment and HTTP timeouts

By default, GreptimeDB responds after it writes the batch to storage. Set `PENDING_ROWS_BATCH_SYNC` to `false` to respond after GreptimeDB accepts the request for batching. Storage errors after that point cannot be returned to the client. In synchronous mode, writes over a single connection and `INSERT SELECT` can wait for a flush.

In synchronous mode, GreptimeDB compares a non-zero `http.timeout` with the largest active flush interval from `[pending_rows_batcher]` and `[pending_rows_batcher.logical_table]`. If the timeout is no greater than that interval plus 1 second, GreptimeDB raises it to that value. This applies to Prometheus Remote Write, Prometheus-compatible OTLP metrics with the metric engine enabled, and HTTP writes to ordinary tables. MySQL and PostgreSQL batching does not change the HTTP timeout. Set `http.timeout = "0s"` to disable it.
