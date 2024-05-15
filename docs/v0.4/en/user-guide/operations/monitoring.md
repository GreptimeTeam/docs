# Monitoring

The GreptimeDB exposes the Prometheus metrics, and the users can also use [Prometheus](https://prometheus.io/) to collect the metrics.

## Prometheus Configuration

Write a Prometheus configuration file and save it as `prometheus.yml`:
```
global:
  scrape_interval: 15s 

scrape_configs:
  - job_name: 'greptimedb'
    static_configs:
      - targets: ['localhost:4000']
```

## Start GreptimeDB and Prometheus
### Binary

Use Binary to deploy Prometheus and GreptimeDB:

1. Install GreptimeDB according to the [documentation](/getting-started/installation/greptimedb-standalone#binary).

2. Visit [the official documentation for Prometheus](https://prometheus.io/download/) to download the binary. Afterward, execute the following command:

```
./prometheus --config.file=prometheus.yml
```

Access Prometheus by entering `localhost:9090` in your web browser.


### Docker

Use Docker to deploy Prometheus and GreptimeDB:

1. Install GreptimeDB according to the [documentation](/getting-started/installation/greptimedb-standalone#docker).

2. Start the Prometheus:
```
docker run \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

### Kubernetes

1. Install [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) chart:
```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack
```

2. Use [gtctl](/user-guide/operations/gtctl) to deploy GreptimeDB cluster:
```
gtctl cluster create mycluster -n default \
  --set cluster.prometheusMonitor.enabled=true \
  --set cluster.prometheusMonitor.path="/metrics" \
  --set cluster.prometheusMonitor.port="http" \
  --set cluster.prometheusMonitor.interval="30s" \
  --set cluster.prometheusMonitor.honorLabels=true \
  --set cluster.prometheusMonitor.labelsSelector.release="prometheus"
```


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
