---
keywords: [GreptimeDB 健康检查, GreptimeDB 运行状态, GreptimeDB 部署状态, GreptimeDB 运行指标]
description: 通过 HTTP 接口检查 GreptimeDB 的健康状态、部署状态和运行指标。
---

# 检查 GreptimeDB 状态

GreptimeDB 包含了一系列的 HTTP 接口可供查询 GreptimeDB 的运行情况。
以下发起的 HTTP 请求均假定 GreptimeDB 运行在节点 `127.0.0.1` 上，其 HTTP 服务监听默认的 `4000` 端口。

## 查看 GreptimeDB 是否正常运行：

- 路径：`/health`
- 方法：`GET`, `POST`
- 描述：验证 GreptimeDB 是否正常运行。
- 用法：用任何 HTTP 客户端访问此路径以检查 GreptimeDB 的健康状态。返回 HTTP 状态码 `200 OK` 就表示 GreptimeDB 正常运行。

例子：

```bash
curl -i -X GET http://127.0.0.1:4000/health
HTTP/1.1 200 OK
content-type: application/json
content-length: 2
date: Tue, 31 Dec 2024 02:15:22 GMT

{}
```

## 查看 GreptimeDB 的部署状态

- 路径：`/status`
- 方法：`GET`
- 描述：查看 GreptimeDB 的部署状态（运行版本等信息）。
- 用法：用任何 HTTP 客户端访问此路径获取 GreptimeDB 的部署的状态信息，包括运行版本等。

例子：

```bash
curl -X GET http://127.0.0.1:4000/status | jq

{
  "source_time": "2024-12-27T07:57:47Z",
  "commit": "b4bd34c530d62b95346a26a9470c03b9f6fb15c8",
  "branch": "main",
  "rustc_version": "rustc 1.84.0-nightly (e92993dbb 2024-10-18)",
  "hostname": "127.0.0.1",
  "version": "0.12.0"
}
```

## 查看 GreptimeDB 的运行指标

- 路径：`/metrics`
- 方法：`GET`
- 描述：获取 GreptimeDB 自身的运行指标以进行监控。
- 用法：用任何 HTTP 客户端访问此路径，以收集 GreptimeDB 自身的指标数据。

例子：

```bash
curl -X GET http://127.0.0.1:4000/metrics

# HELP greptime_app_version app version
# TYPE greptime_app_version gauge
greptime_app_version{app="greptime-edge",short_version="main-b4bd34c5",version="0.12.0"} 1
# HELP greptime_catalog_catalog_count catalog catalog count
# TYPE greptime_catalog_catalog_count gauge
greptime_catalog_catalog_count 1
# HELP greptime_catalog_schema_count catalog schema count
# TYPE greptime_catalog_schema_count gauge
greptime_catalog_schema_count 3
# HELP greptime_flow_run_interval_ms flow run interval in ms
# TYPE greptime_flow_run_interval_ms gauge
greptime_flow_run_interval_ms 1000
# HELP greptime_meta_create_catalog meta create catalog
# TYPE greptime_meta_create_catalog histogram
greptime_meta_create_catalog_bucket{le="0.005"} 1
greptime_meta_create_catalog_bucket{le="0.01"} 1
greptime_meta_create_catalog_bucket{le="0.025"} 1
greptime_meta_create_catalog_bucket{le="0.05"} 1
greptime_meta_create_catalog_bucket{le="0.1"} 1
...
```



