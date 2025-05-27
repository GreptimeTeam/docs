---
keywords: [导出指标, Prometheus, 监控指标, self_import, remote_write]
description: 介绍如何导出 GreptimeDB 的监控指标到 Prometheus 或 GreptimeDB 自身，并提供各组件的指标详情。
---

# 导出指标

通过监控指标，你可以评估数据库的状态，维护部署并诊断问题。

请参考[指标详情](#指标详情)章节了解 GreptimeDB 的具体指标。

## 导出数据到 Prometheus

GreptimeDB 支持导出数据到 Prometheus。在配置导出数据之前，你需要按照 Prometheus 的[官方文档](https://prometheus.io/docs/prometheus/latest/installation/)安装 Prometheus.

要从 GreptimeDB 抓取指标，您需要配置 Prometheus，具体请参考 [GreptimeDB 的 Grafana 仪表板](https://github.com/GreptimeTeam/greptimedb/tree/VAR::greptimedbVersion/grafana#deployment)的部署文档。该文档介绍了通过内置监控与 Grafana 的 Helm Chart 部署，或者手动配置 Prometheus 抓取指标，并将相应仪表盘导入 Grafana 的方法。**这是我们推荐的方式**。

## 将指标保存到 GreptimeDB 自身

你还可以将指标保存到 GreptimeDB 本身，以便于使用 SQL 语句进行查询和分析。
本节提供了相关配置示例，有关配置的更多详细信息，请参阅[监控指标选项](/user-guide/deployments/configuration.md#monitor-metrics-options)。

### 单机模式

在单机模式下，你可以简单地使用 `self_import` 来导出指标。
相关配置如下：

```toml
[export_metrics]
enable=true
# The interval of writing metrics.
write_interval = "30s"
[export_metrics.self_import]
db = "greptime_metrics"
```

`db` 选项指定了保存指标的数据库，你可以将其修改为其他数据库。请注意，你必须提前手工创建数据库。

### 分布式集群

集群中的每个组件都需要编写配置文件。

::::tip
在下列配置之前，你必须提前手工创建数据库。
::::

#### Frontend

你可以简单地使用 `self_import` 来导出指标。

```toml
[export_metrics]
enable=true
# The interval of writing metrics.
write_interval = "30s"
[export_metrics.self_import]
db = "greptime_metrics"
```

`db` 选项指定了保存指标的数据库，你可以将其修改为其他数据库。

#### Datanode 和 Metasrv

在 Datanode 和 Metasrv 中，你需要使用 `remote_write` 配置来导出指标。

```toml
[export_metrics]
enable=true
write_interval = "30s"
[export_metrics.remote_write]
url = "http://127.0.0.1:4000/v1/prometheus/write?db=greptime_metrics"
```

您可以将地址指定为集群中的任意一台 frontend。GreptimeDB 兼容 Prometheus Remote-Write 协议。
请参考 [Prometheus Remote-Write](/user-guide/ingest-data/for-observability/prometheus.md) 获取更多信息。

## Grafana 仪表盘
GreptimeDB 开源版（OSS）为单机与集群部署模式都提供了 Grafana 仪表盘。请参考 [GreptimeDB 的Grafana 仪表板](https://github.com/GreptimeTeam/greptimedb/tree/VAR::greptimedbVersion/grafana)文档。

GreptimeDB 企业版提供了更强大的监控功能，包括告警和故障诊断等。[联系我们](https://greptime.cn/contactus)申请演示。

## 指标详情

可以通过执行`curl http://<host>:<port>/metrics`的输出来获取 GreptimeDB 的最新指标。

例如:

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