---
keywords: [GreptimeDB metrics, Prometheus, metrics export, monitoring, configuration examples]
description: Guide on exporting GreptimeDB metrics to Prometheus and saving metrics to GreptimeDB itself. Includes configuration examples for standalone and distributed cluster modes, and details on various metrics.
---

# Export Metrics

By monitoring metrics, you can assess the state of the database, maintain the deployment without crisis, and diagnose problems when they occur.

For detailed metrics of GreptimeDB, please refer to the [Metrics Detail](#metrics-detail) section.

## Start GreptimeDB

Please refer to the [documentation](/getting-started/installation/overview.md) to learn how to start GreptimeDB.

## Export metrics to Prometheus

GreptimeDB supports exporting metrics to Prometheus.
Before configuring export of metrics, you need to setup Prometheus by following their official [documentation](https://prometheus.io/docs/prometheus/latest/installation/).

To scrape metrics from GreptimeDB, write a Prometheus configuration file and save it as `prometheus.yml`:

```yml
global:
  scrape_interval: 15s 

scrape_configs:
  - job_name: 'greptimedb'
    static_configs:
      # Assuming that GreptimeDB is running locally.
      # The default HTTP port of 4000.
      - targets: ['localhost:4000']
```

Start Prometheus using the configuration file.
For example, bind-mount the configuration file when starting Prometheus using Docker:

```bash
docker run \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

:::tip NOTE
To avoid accidentally exit the Docker container, you may want to run it in the "detached" mode: add the `-d` flag to
the `docker run` command.
:::

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
db = "information_schema"
```

The `db` option specifies the database where metrics are saved. You can change it to a different database.

### Distributed cluster

Configuration files need to be written for each component in the cluster.

#### Frontend

you can simply use `self_import` to export metrics.

```toml
[export_metrics]
enable=true
# The interval of writing metrics.
write_interval = "30s"
[export_metrics.self_import]
db = "information_schema"
```

The `db` option specifies the database where metrics are saved. You can change it to a different database.

#### Datanode and Metasrv

To export metrics for Datanode and Metasrv, you can use the `remote_write` configuration:

```toml
[export_metrics]
enable=true
write_interval = "30s"
[export_metrics.remote_write]
url = "http://127.0.0.1:4000/v1/prometheus/write?db=system"
```

GreptimeDB is compatible with the Prometheus Remote-Write protocol. For more information, please refer to the [Prometheus Remote-Write](/user-guide/ingest-data/for-observability/prometheus.md) documentation.

## Metrics Detail
You can check the output of `curl http://<host>:<port>/metrics` by getting the latest metrics of GreptimeDB. We will add more documents of the metrics sooner.

### Frontend

| Key                                          | Type    |
|----------------------------------------------|---------|
| greptime_table_operator_ingest_rows          | counter |
| greptime_servers_error                       | counter |
| greptime_servers_http_requests_total         | counter |
| greptime_servers_postgres_connection_count   | gauge   |
| greptime_servers_mysql_connection_count      | gauge   |
| greptime_query_merge_scan_regions            | summary |
| greptime_servers_http_sql_elapsed            | summary |
| greptime_query_optimize_physicalplan_elapsed | summary |
| greptime_frontend_handle_sql_elapsed         | summary |
| greptime_http_track_metrics                  | summary |
| greptime_query_create_physicalplan_elapsed   | summary |
| greptime_servers_mysql_query_elapsed         | summary |
| greptime_servers_http_requests_elapsed       | summary |
| greptime_query_execute_plan_elapsed          | summary |
| greptime_catalog_kv_get_remote               | summary |
| greptime_grpc_region_request                 | summary |
| greptime_query_merge_scan_poll_elapsed       | summary |
| greptime_catalog_kv_get                      | summary |
| greptime_table_operator_create_table         | summary |


### Datanode

| Key                                        | Type    |
|--------------------------------------------|---------|
| greptime_opendal_bytes_total               | counter |
| greptime_servers_http_requests_total       | counter |
| greptime_opendal_requests_total            | counter |
| greptime_catalog_catalog_count             | gauge   |
| greptime_catalog_schema_count              | gauge   |
| greptime_opendal_requests_duration_seconds | summary |
| greptime_http_track_metrics                | summary |
| greptime_servers_http_requests_elapsed     | summary |


### Meta

| Key                                    | Type    |
|----------------------------------------|---------|
| greptime_meta_create_schema            | counter |
| greptime_servers_http_requests_total   | counter |
| greptime_meta_create_catalog           | counter |
| greptime_meta_heartbeat_connection_num | gauge   |
| greptime_meta_txn_request              | summary |
| greptime_meta_kv_request               | summary |
| greptime_meta_create_schema            | summary |
| greptime_meta_create_catalog           | summary |
| greptime_meta_handler_execute          | summary |
| greptime_servers_http_requests_elapsed | summary |
| greptime_http_track_metrics            | summary |
| greptime_meta_procedure_create_table   | summary |
| greptime_grpc_region_request           | summary |
