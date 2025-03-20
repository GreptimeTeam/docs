---
keywords: [Prometheus, 存储, 查询, Remote Write, PromQL, GreptimeCloud]
description: 介绍如何将 GreptimeCloud 用作 Prometheus 的存储和查询替代品，包括配置 Remote Write 和使用 Prometheus HTTP API 与 PromQL。
---

# Prometheus

GreptimeCloud 与 GreptimeDB 完全兼容 Prometheus。这意味着你可以无缝地将 GreptimeCloud 用作 Prometheus 存储和查询的替代品。有关更多信息，请参阅 GreptimeDB 用户指南中的 [Prometheus 文档](https://docs.greptime.cn/user-guide/clients/prometheus)。

## Remote Write

GreptimeCloud 实例可以配置为 Prometheus 的 [Remote Write 端点](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#remote_write)。

将以下部分添加到你的 prometheus 配置中：

```yaml
remote_write:
  - url: https://<host>/v1/prometheus/write?db=<dbname>
    basic_auth:
      username: <username>
      password: <password>

```

## Prometheus HTTP API 与 PromQL

用户可以直接通过 Prometheus HTTP API 访问数据库：

- URL 根路径：`https://<host>/v1/prometheus`
- 数据库名：添加 HTTP 头 `x-greptime-db-name`，值 `<dbname>`
- 认证：HTTP Basic 认证，使用数据库的用户名和密码

一个简单的例子，试用 Prometheus API 访问数据库

```shell
curl -X GET \
  -H "x-greptime-db-name: <dbname>" \
  -u "<username>:<password>" \
  "https://<host>/v1/prometheus/api/v1/query?query=1"
```

GreptimeDB 支持 PromQL (Prometheus 查询语言)，这意味着你可以将 GreptimeDB 作为 Prometheus 查询的替代品。有关更多详细信息，请参考 [PromQL](https://docs.greptime.cn/user-guide/clients/prometheus#prometheus-query-language)。
