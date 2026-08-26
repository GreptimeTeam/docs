---
keywords: [InfluxDB Line Protocol, data ingestion, ping API, health API]
description: Instructions on ingesting data to GreptimeDB using InfluxDB Line Protocol and using ping and health APIs.
---

# InfluxDB Line Protocol

## Ingest data

For how to ingest data to GreptimeDB using InfluxDB Line Protocol, 
please refer to the [Ingest Data](/user-guide/ingest-data/for-iot/influxdb-line-protocol.md) document.

## HTTP API

Please refer to the [HTTP API](http.md#post-influxdb-line-protocol-data) document for details on the InfluxDB Line Protocol API.

## PING

Additionally, GreptimeDB also provides support for the `ping` and `health` APIs of InfluxDB.

Use `curl` to request `ping` API.

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
