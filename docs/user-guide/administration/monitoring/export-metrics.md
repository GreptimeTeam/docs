---
keywords: [GreptimeDB metrics, Prometheus, metrics export, monitoring, configuration examples]
description: Guide on exporting GreptimeDB metrics to Prometheus and saving metrics to GreptimeDB itself. Includes configuration examples for standalone and distributed cluster modes, and details on various metrics.
---

# Export Metrics

By monitoring metrics, you can assess the state of the database, maintain the deployment without crisis, and diagnose problems when they occur.

For detailed metrics of GreptimeDB, please refer to the [Metrics Detail](#metrics-detail) section.

## Export metrics to Prometheus

GreptimeDB supports exporting metrics to Prometheus.
Before configuring export of metrics, you need to setup Prometheus by following their official [documentation](https://prometheus.io/docs/prometheus/latest/installation/).

To scrape metrics from GreptimeDB, you must configure the Prometheus, please refer to this [document](https://github.com/GreptimeTeam/greptimedb/tree/VAR::greptimedbVersion/grafana#deployment), which explains how to deploy GreptimeDB monitoring either through Helm charts with built-in monitoring and Grafana, or by manually configuring Prometheus to scrape metrics and importing appropriate dashboards into Grafana. **This is our recommended approach**.

## Save metrics to GreptimeDB itself

You can also save metrics to GreptimeDB itself for convenient querying and analysis using SQL statements.
This section provides some configuration examples.
For more details about configuration, please refer to the [Monitor metrics options](/user-guide/deployments/configuration.md#monitor-metrics-options).

### Standalone

In standalone mode, you can simply use `self_import` to export metrics.
The configuration looks like this:

```toml
[export_metrics]
enable=true
# The interval of writing metrics.
write_interval = "30s"
[export_metrics.self_import]
db = "greptime_metrics"
```

The `db` option specifies the database where metrics are saved. You can change it to a different database. You must create the database manually in advance.

### Distributed cluster

Configuration files need to be written for each component in the cluster.

::::tip
You must create the database manually in advance before configuration.
::::

#### Frontend

you can simply use `self_import` to export metrics.

```toml
[export_metrics]
enable=true
# The interval of writing metrics.
write_interval = "30s"
[export_metrics.self_import]
db = "greptime_metrics"
```

The `db` option specifies the database where metrics are saved. You can change it to a different database.

#### Datanode and Metasrv

To export metrics for Datanode and Metasrv, you can use the `remote_write` configuration:

```toml
[export_metrics]
enable=true
write_interval = "30s"
[export_metrics.remote_write]
url = "http://127.0.0.1:4000/v1/prometheus/write?db=greptime_metrics"
```

You can specify the address as any frontend node in the cluster. GreptimeDB is compatible with the Prometheus Remote-Write protocol. For more information, please refer to the [Prometheus Remote-Write](/user-guide/ingest-data/for-observability/prometheus.md) documentation.

## Grafana Dashboard

The OSS version of GreptimeDB provides Grafana dashboards for both standalone and cluster deployments. Please refer to this [document](https://github.com/GreptimeTeam/greptimedb/tree/VAR::greptimedbVersion/grafana).

The GreptimeDB Enterprise offers more advanced monitoring features, including alerting and fault diagnosis etc. [Contact us](https://greptime.com/contactus) to request a demo.

## Metrics Detail

You can check the output of `curl http://<host>:<port>/metrics` by getting the latest metrics of GreptimeDB.

For example:

```bash
curl http://localhost:4000/metrics
```

```text
# TYPE greptime_app_version gauge
greptime_app_version{app="greptime-standalone",short_version="main-864cc117",version="0.15.0"} 1
# HELP greptime_catalog_catalog_count catalog catalog count
# TYPE greptime_catalog_catalog_count gauge
greptime_catalog_catalog_count 1
# HELP greptime_catalog_schema_count catalog schema count
# TYPE greptime_catalog_schema_count gauge
greptime_catalog_schema_count 3
# HELP greptime_datanode_handle_region_request_elapsed datanode handle region request elapsed
# TYPE greptime_datanode_handle_region_request_elapsed histogram
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Create",region_id="4569845202944(1064, 0)",le="0.005"} 0
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Create",region_id="4569845202944(1064, 0)",le="0.01"} 0
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Create",region_id="4569845202944(1064, 0)",le="0.025"} 1
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Create",region_id="4569845202944(1064, 0)",le="0.05"} 1
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Create",region_id="4569845202944(1064, 0)",le="0.1"} 1
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Create",region_id="4569845202944(1064, 0)",le="0.25"} 1
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Create",region_id="4569845202944(1064, 0)",le="0.5"} 1
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Create",region_id="4569845202944(1064, 0)",le="1"} 1
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Create",region_id="4569845202944(1064, 0)",le="2.5"} 1
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Create",region_id="4569845202944(1064, 0)",le="5"} 1
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Create",region_id="4569845202944(1064, 0)",le="10"} 1
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Create",region_id="4569845202944(1064, 0)",le="+Inf"} 1
greptime_datanode_handle_region_request_elapsed_sum{datanode_region_request_type="Create",region_id="4569845202944(1064, 0)"} 0.015692709
greptime_datanode_handle_region_request_elapsed_count{datanode_region_request_type="Create",region_id="4569845202944(1064, 0)"} 1
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Put",region_id="4574140170240(1065, 0)",le="0.005"} 0
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Put",region_id="4574140170240(1065, 0)",le="0.01"} 0
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Put",region_id="4574140170240(1065, 0)",le="0.025"} 8
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Put",region_id="4574140170240(1065, 0)",le="0.05"} 104
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Put",region_id="4574140170240(1065, 0)",le="0.1"} 108
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Put",region_id="4574140170240(1065, 0)",le="0.25"} 108
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Put",region_id="4574140170240(1065, 0)",le="0.5"} 108
greptime_datanode_handle_region_request_elapsed_bucket{datanode_region_request_type="Put",region_id="4574140170240(1065, 0)",le="1"} 108
......
```