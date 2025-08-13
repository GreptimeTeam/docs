---
keywords: [standalone monitoring, GreptimeDB, metrics, Grafana]
description: Guide to monitor GreptimeDB standalone instance using Prometheus metrics and Grafana.
---

# Standalone Monitoring

GreptimeDB standalone provides a `/metrics` endpoint on the HTTP port (default `4000`) that exposes [Prometheus metrics](/reference/http-endpoints.md#metrics).

## Monitoring configuration

You can configure GreptimeDB to export metrics to GreptimeDB itself or to an external Prometheus instance.

### Internal Metrics Storage

Configuring GreptimeDB to store its own metrics internally is convenient and recommended for self-monitoring,
it also enables SQL-based querying and analysis.

To enable self-monitoring, configure the `export_metrics` section in your TOML configuration file:

```toml
[export_metrics]
enable = true
# Metrics collection interval
write_interval = "30s"
[export_metrics.self_import]
db = "greptime_metrics"
```

This configuration:
- Collects and writes metrics every 30 seconds.
- Exports metrics to the `greptime_metrics` database within GreptimeDB. Ensure the `greptime_metrics` database [is created](/reference/sql/create.md#create-database) before exporting metrics.

### Export metrics to Prometheus

For environments with existing Prometheus infrastructure,
GreptimeDB can export metrics via the Prometheus remote write protocol.

To do this, configure the `export_metrics` section in your TOML configuration file with the `remote_write` option:

```toml
[export_metrics]
enable=true
write_interval = "30s"
[export_metrics.remote_write]
# URL specified by Prometheus Remote-Write protocol
url = "https://your/remote_write/endpoint"
# Some optional HTTP parameters, such as authentication information
headers = { Authorization = {{Authorization}} }
```

This configuration:
- Sets the export interval to 30 seconds
- Specifies the Prometheus remote write URL, which should point to your Prometheus instance
- Optionally includes HTTP headers for the remote write URL, such as authentication information

## Grafana Dashboard Integration

GreptimeDB provides pre-built Grafana dashboards for monitoring standalone deployments.
You can access the dashboard JSON files from the [GreptimeDB repository](https://github.com/GreptimeTeam/greptimedb/tree/VAR::greptimedbVersion/grafana/dashboards/metrics/standalone).


