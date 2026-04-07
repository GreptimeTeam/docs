---
keywords: [InfluxDB Line Protocol, 写入数据, PING, health API]
description: 介绍如何使用 InfluxDB Line Protocol 向 GreptimeDB 写入数据。
---

# InfluxDB Line Protocol

## 写入数据

请参考[写入数据](/user-guide/ingest-data/for-iot/influxdb-line-protocol.md)文档来了解如何使用 InfluxDB Line Protocol 向 GreptimeDB 写入数据。

## HTTP API

请参考 [HTTP API](http.md#post-influxdb-line-protocol-数据) 文档来了解 Influxdb Line Protocol 的接口详情。

## PING

GreptimeDB 同样支持 InfluxDB 的 `ping` 和 `health` API。

使用 `curl` 请求 `ping` API：

```shell
curl -i "127.0.0.1:4000/v1/influxdb/ping"
```

```shell
HTTP/1.1 204 No Content
date: Wed, 22 Feb 2023 02:29:44 GMT
```

Use `curl` to request `health` API.

```shell
curl -i "127.0.0.1:4000/v1/influxdb/health"
```

```shell
HTTP/1.1 200 OK
content-length: 0
date: Wed, 22 Feb 2023 02:30:46 GMT
```
