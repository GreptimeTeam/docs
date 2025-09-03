---
keywords: [monitoring key metrics, GreptimeDB monitoring, GreptimeDB key metrics, GreptimeDB cluster monitoring]
description: Monitor key metrics of GreptimeDB clusters, including CPU, memory, disk I/O, and network bandwidth usage.
---

# Key Metrics

The key metrics for monitoring include CPU, memory, disk I/O, and network bandwidth usage.

## Configuring

To avoid storage system complexity,
we recommend using GreptimeDB in Standalone mode to store cluster logs and metrics data for monitoring purposes.

- Deploy a Standalone version of GreptimeDB (you can use the Standalone [Helm Chart](https://github.com/GreptimeTeam/helm-charts/tree/main/charts/greptimedb-standalone));
- Configure Prometheus Remote Write to send data to GreptimeDB;
- Configure GreptimeDB logs to output in JSON format (logging.log_format=json) and set up Vector or FluentBit to write log data into GreptimeDB. Use the following schema to ensure compatibility with the Enterprise Dashboard for log searching:

```sql
CREATE TABLE IF NOT EXISTS `_gt_logs` (
  `pod_ip` STRING NULL,
  `namespace` STRING NULL,
  `cluster` STRING NULL,
  `level` STRING NULL,
  `target` STRING NULL,
  `role` STRING NULL,
  `pod` STRING NULL SKIPPING INDEX WITH(granularity = '10240', type = 'BLOOM'),
  `message` STRING NULL FULLTEXT INDEX WITH(analyzer = 'English', case_sensitive = 'false'),
  `err` STRING NULL FULLTEXT INDEX WITH(analyzer = 'English', case_sensitive = 'false'),
  `timestamp` TIMESTAMP(9) NOT NULL,
  TIME INDEX (`timestamp`),
  PRIMARY KEY (`level`, `target`, `role`)
)
```

GreptimeDB monitoring can include the following aspects:

- Basic Monitoring
  - Pod CPU / Memory / Disk usage / Network bandwidth traffic monitoring
- GreptimeDB Core Business Monitoring
  - Error log monitoring (such as the error logs listed in the operational [key logs](key-logs.md))
  - Latency monitoring
  - API error monitoring

## Importing Monitoring Metrics into Grafana

We have exported GreptimeDB metrics Grafana dashboards as JSON files, which can be downloaded [here](https://github.com/GreptimeTeam/greptimedb/tree/main/grafana).
Using Grafana's [Import Dashboard](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/import-dashboards/) feature, you can easily create the dashboards needed to monitor GreptimeDB.

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
