# 监控

监控是数据库管理的重要组成部分。通过监控指标，你可以评估数据库的状态，维护部署并诊断问题。

请参考[指标详情](#指标详情)章节了解 GreptimeDB 的具体指标。

## 启动 GreptimeDB

请参考[此处](/getting-started/installation/overview)了解如何启动 GreptimeDB。

## 导出数据到 Prometheus

GreptimeDB 支持导出数据到 Prometheus。 在配置导出数据之前，你需要按照 Prometheus 的[官方文档](https://prometheus.io/docs/prometheus/latest/installation/)安装 Prometheus.

要从 GreptimeDB 中抓取指标，请编写 Prometheus 配置文件并将其保存为 `prometheus.yml`：

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

使用该配置文件启动 Prometheus。
例如，使用 Docker 启动 Prometheus 时，可以将配置文件挂载到 Docker 容器中：

```bash
docker run \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

:::tip NOTE
为了防止不小心退出 Docker 容器，你可能想以 “detached” 模式运行它：在 `docker run` 命令中添加 `-d` 参数即可。
:::

## 将指标保存到 GreptimeDB 自身

你还可以将指标保存到 GreptimeDB 本身，以便于使用 SQL 语句进行查询和分析。
本节提供了相关配置示例，有关配置的更多详细信息，请参阅[监控指标选项](./configuration.md#monitor-metrics-options)。

### 单机模式

在单机模式下，你可以简单地使用 `self_import` 来导出指标。
相关配置如下：

```toml
[export_metrics]
enable=true
# The interval of writing metrics.
write_interval = "30s"
[export_metrics.self_import]
db = "information_schema"
```

`db` 选项指定了保存指标的数据库，你可以将其修改为其他数据库。

### 分布式集群

集群中的每个组件都需要编写配置文件。

#### Frontend

你可以简单地使用 `self_import` 来导出指标。

```toml
[export_metrics]
enable=true
# The interval of writing metrics.
write_interval = "30s"
[export_metrics.self_import]
db = "information_schema"
```

`db` 选项指定了保存指标的数据库，你可以将其修改为其他数据库。

#### Datanode 和 Metasrv

在 Datanode 和 Metasrv 中，你需要使用 `remote_write` 配置来导出指标。

```toml
[export_metrics]
enable=true
write_interval = "30s"
[export_metrics.remote_write]
url = "http://127.0.0.1:4000/v1/prometheus/write?db=system"
```

GreptimeDB 兼容 Prometheus Remote-Write 协议。
请参考 [Prometheus Remote-Write](/user-guide/ingest-data/for-observerbility/prometheus.md) 获取更多信息。

## 指标详情

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
