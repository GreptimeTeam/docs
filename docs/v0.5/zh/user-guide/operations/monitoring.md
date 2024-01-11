# Monitoring

GreptimeDB 暴露了 Prometheus 指标, 用户可以使用 [Prometheus](https://prometheus.io/) 来采集指标。

## Promethues Configuration

编写 Prometheus 配置文件，并保存为`prometheus.yml`:
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

使用二进制安装 GreptimeDB 和 Prometheus

1. 根据[文档](/getting-started/installation/greptimedb-standalone#binary) 安装 GreptimeDB

2. 进入 [Prometheus 官方文档](https://prometheus.io/download/) 下载二进制，并执行以下命令:

```
./prometheus --config.file=prometheus.yml
```

在浏览器输入`localhost:9090`访问 Prometheus。

### Docker

使用 Docker 安装 GreptimeDB 和 Prometheus

1. 根据[文档](/getting-started/installation/greptimedb-standalone#docker) 安装 GreptimeDB

2. 运行 Prometheus:
```
docker run \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

### Kubernetes

1. 安装 [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) chart: 
```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack
```

2. 使用 [gtctl](/user-guide/operations/gtctl) 安装 GreptimeDB cluster:
```
gtctl cluster create mycluster -n default \
  --set cluster.prometheusMonitor.enabled=true \
  --set cluster.prometheusMonitor.path="/metrics" \
  --set cluster.prometheusMonitor.port="http" \
  --set cluster.prometheusMonitor.interval="30s" \
  --set cluster.prometheusMonitor.honorLabels=true \
  --set cluster.prometheusMonitor.labelsSelector.release="prometheus"
```

## 使用 GreptimeDB 观测 GreptimeDB

在大部分情况下，使用 Prometheus 可以对 GreptimeDB 的各项指标进行很好的观测。但如果用户不想依赖于Prometheus 去处理 GreptimeDB 产生的各种 metrics 数据。GreptimeDB 提供了 export metrics 功能，用于将 GreptimeDB 产生的 metrics 直接存储到 GreptimeDB 内部，从而避免依赖 Prometheus。关于 export metrics 的配置说明，请看 [export metrics 配置](./configuration.md#export-metrics-选项)

### Standalone

在 standalone 模式下建议使用 `self_import` 方式导出数据，默认 `self_import` 方式导入到的数据库库名是 `information_schema`，为了避免 metrics 与 `information_schema` 库中其他数据表混杂，用户可以先创建一个新的数据库，比如 `system`。

```sql
CREATE DATABASE system;
```

最后配置如下所示:

```toml
[export_metrics]
enable = true
write_interval = "30s"
[export_metrics.self_import]
db = "system"
```

### Cluster

在集群模式下，建议 `frontend` 使用 `self_import` 方式导出、`metasrv`、`datanode` 使用 `remote_write` 方式导出。

同上，首先创建数据库 `system`。最后各组件的相关配置如下所示：

`frontend` 的配置，假设 `frontend` 使用 HTTP 协议监听 `127.0.0.1:4000`

```toml
[http]
addr = "127.0.0.1:4000"
...

[export_metrics]
enable = true
write_interval = "30s"
[export_metrics.self_import]
db = "system"
```

`metasrv`、`datanode` 的配置如下所示，使用 `remote_write` 将数据发送到 `frontend`

```toml
[export_metrics]
enable = true
write_interval = "30s"
[export_metrics.remote_write]
url = "http://127.0.0.1:4000/v1/prometheus/write?db=system"
```

## Metrics Detail

可以通过执行`curl http://<host>:<port>/metrics`的输出来获取 GreptimeDB 的最新指标。

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
