---
keywords: [monitoring key metrics, GreptimeDB monitoring, GreptimeDB key metrics, GreptimeDB cluster monitoring]
description: Monitor key metrics of GreptimeDB clusters, including CPU, memory, disk I/O, and network bandwidth usage.
---

# Key Metrics

The key metrics for monitoring include CPU, memory, disk I/O, and network bandwidth usage.

## Alert Metrics

Since each company typically has its own alerting system with potentially different configuration methods, this document does not provide specific alert configuration procedures. Instead, it lists key metrics that should be monitored. You can configure alerts based on whether these metrics remain at abnormal values for extended periods (several minutes). You should set alert thresholds according to your specific circumstances.

| Metric | Description | Reference Rule |
| --- | --- | --- |
| `sum(process_resident_memory_bytes{}) by (instance, pod)` | Process memory usage | Usage rate continuously exceeds threshold |
| `sum(rate(process_cpu_seconds_total{}[$__rate_interval]) * 1000) by (instance, pod)` | Process CPU usage, displayed in millicores | Utilization rate continuously exceeds threshold |
| `sum by(instance, pod) (greptime_mito_write_stall_total{instance=~"$datanode"})` | Number of backlogged write requests on datanode | Remains greater than 0 for n minutes |
| `sum(rate(greptime_table_operator_ingest_rows{instance=~"$frontend"}[$__rate_interval]))` | Current rows written per second | Drops to 0 (or below threshold) for n minutes |
| `greptime_mito_compaction_failure_total` | Compaction failures | Recent increase greater than 0 |
| `greptime_mito_flush_failure_total` | Flush failures | Recent increase greater than 0 |
| `sum by(instance, pod, path, method, code) (rate(greptime_servers_http_requests_elapsed_count{path!~"/health\|/metrics"}[$__rate_interval]))` | HTTP request count and response codes | HTTP 200 request count below threshold for n minutes or non-200 response count above normal threshold for n minutes |
| `sum by (instance, pod) (rate(greptime_mito_write_rows_total{instance=~"$datanode"}[$__rate_interval]))` | Storage engine write row count | Below normal threshold for n minutes |

We also recommend configuring disk alerts at the Pod level to trigger when disk usage exceeds a certain threshold.
Additionally, you can monitor the following events based on keywords from error logs listed in the operational [key logs](key-logs.md):

- Region lease renewal failures
- Region failover
