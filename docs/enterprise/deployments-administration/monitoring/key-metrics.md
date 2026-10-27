---
keywords: [monitoring key metrics, GreptimeDB monitoring, GreptimeDB key metrics, GreptimeDB cluster monitoring]
description: Monitor key metrics of GreptimeDB clusters, including CPU, memory, disk I/O, and network bandwidth usage.
---

# Key Metrics

The key metrics for monitoring include CPU, memory, disk I/O, and network bandwidth usage.

## Alert Metrics

Since each company typically has its own alerting system with potentially different configuration methods, this document does not provide specific alert configuration procedures. Instead, it lists key metrics that should be monitored. You can configure alerts based on whether these metrics remain at abnormal values for extended periods (several minutes). You should set alert thresholds according to your specific circumstances.

The following reference alert rules are **not built in** to GreptimeDB and need to be configured in your own alerting system (for example, Prometheus alert rules).

| Metric | Description | Reference Rule |
| --- | --- | --- |
| `sum(process_resident_memory_bytes{}) by (instance, pod)` | Process memory usage | Usage rate continuously exceeds threshold |
| `sum(rate(process_cpu_seconds_total{}[$__rate_interval]) * 1000) by (instance, pod)` | Process CPU usage, displayed in millicores | Utilization rate continuously exceeds threshold |
| `sum by(instance, pod) (greptime_mito_write_stall_total{instance=~"$datanode"})` | Number of backlogged write requests on datanode | Remains greater than 0 for n minutes |
| `sum(rate(greptime_table_operator_ingest_rows{instance=~"$frontend"}[$__rate_interval]))` | Current rows written per second | Drops to 0 (or below threshold) for n minutes |
| `greptime_mito_compaction_failure_total` | Compaction failures | Recent increase greater than 0 |
| `greptime_mito_flush_failure_total` | Flush failures | Recent increase greater than 0 |
| `sum by (instance, pod, region_id) (rate(greptime_mito_region_query_cpu_time{instance=~"$frontend"}[$__rate_interval]))` | Per-region query CPU time in nanoseconds | Use for read-load hotspot analysis after enabling `logging.enable_per_region_metrics`; avoid broad alerting because this metric has high cardinality |
| `sum by (instance, pod, region_id) (rate(greptime_mito_region_query_scanned_bytes{instance=~"$frontend"}[$__rate_interval]))` | Per-region scanned bytes during queries | Use for read-load hotspot analysis after enabling `logging.enable_per_region_metrics`; avoid broad alerting because this metric has high cardinality |
| `sum by(instance, pod, path, method, code) (rate(greptime_servers_http_requests_elapsed_count{path!~"/health\|/metrics"}[$__rate_interval]))` | HTTP request count and response codes | HTTP 200 request count below threshold for n minutes or non-200 response count above normal threshold for n minutes |
| `sum by (instance, pod) (rate(greptime_mito_write_rows_total{instance=~"$datanode"}[$__rate_interval]))` | Storage engine write row count | Below normal threshold for n minutes |
| `up{job="greptimedb-instance"}` | Instance availability | Equals 0 for more than 1 minute |
| `sum by (instance) (changes(process_start_time_seconds[5m]))` | Instance restarts | Greater than 0 in the last 5 minutes |
| `sum by (instance) (rate(greptime_servers_http_requests_elapsed_count{path=~"/v1/.*", code!~"2.."}[5m]))` | Non-2xx HTTP responses | Greater than 0 for more than 5 minutes |
| `histogram_quantile(0.99, sum by (le, instance) (rate(greptime_servers_http_requests_elapsed_bucket{path=~"/v1/.*"}[5m])))` | HTTP request latency | p99 above 5s for more than 5 minutes |
| `histogram_quantile(0.99, sum by (le, instance) (rate(greptime_servers_grpc_requests_elapsed_bucket[5m])))` | gRPC request latency | p99 above 5s for more than 5 minutes |
| `sum by (instance) (greptime_mito_write_stalling_count)` | Write stalling | Greater than 0 for more than 5 minutes |
| `sum by (instance) (increase(greptime_datanode_region_request_fail_count[5m]))` | Datanode region request failures | Greater than 0 in the last 5 minutes |
| `sum by (instance) (increase(greptime_datanode_region_failed_insert_count[5m]))` | Datanode region insert failures | Greater than 0 in the last 5 minutes |
| `sum by (instance) (increase(greptime_meta_region_migration_fail[5m]))` | Metasrv region migration failures | Greater than 0 in the last 5 minutes |
| `sum by (instance) (increase(greptime_meta_reconciliation_procedure_error[5m]))` | Metasrv reconciliation errors | Greater than 0 in the last 5 minutes |
| `sum by (instance) (increase(greptime_flow_errors[5m]))` | Flow engine errors | Greater than 0 in the last 5 minutes |
| `sum by (instance) (increase(greptime_trigger_evaluate_failure_count[5m]) + increase(greptime_trigger_send_alert_failure_count[5m]) + increase(greptime_trigger_save_alert_record_failure_count[5m]))` | Trigger evaluation/send failures | Greater than 0 in the last 5 minutes |
| `sum by (instance) (increase(greptime_pending_rows_flush_failures[5m]) + increase(greptime_pending_rows_flush_dropped_rows[5m]))` | Buffered ingestion data loss | Greater than 0 in the last 5 minutes |
| `sum by (instance) (greptime_prom_store_pending_rows)` | Prometheus remote-write backlog | Greater than 100000 for more than 5 minutes |

We also recommend configuring disk alerts at the Pod level to trigger when disk usage exceeds a certain threshold.
Additionally, you can monitor the following events based on keywords from error logs listed in the operational [key logs](key-logs.md):

- Region lease renewal failures
- Region failover
