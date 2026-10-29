---
keywords: [Splunk, HEC, HTTP Event Collector, 日志数据, API 信息, 数据模型, vector, opentelemetry]
description: 介绍如何使用 Splunk HTTP Event Collector (HEC) 协议将日志数据写入 GreptimeDB。
---

# Splunk

## 概述

GreptimeDB 实现了 [Splunk HTTP Event Collector (HEC)](https://docs.splunk.com/Documentation/Splunk/latest/Data/UsetheHTTPEventCollector) 协议的一个子集。已经在用 HEC 的采集器——比如 Vector 和 OpenTelemetry Collector——只需要改一下地址和 token 就能写入 GreptimeDB。

提供两个写入端点：

- `/services/collector/event` 接收结构化的 JSON 事件。
- `/services/collector/raw` 接收纯文本，原样存储。

Splunk 的 `index` 对应 GreptimeDB 的表。`host`、`source`、`sourcetype` 以及 `fields` 下的各个 key 会成为 Tag 列，GreptimeDB 会把它们加进表的主键。

不支持 indexer acknowledgment（`/services/collector/ack`）。`channel` 参数会被接收但忽略。

:::tip 注意
Fluent Bit 自带的 `splunk` output 用不了这个端点。它把请求路径写死成 `/services/collector/event`，也没有提供配置路径的选项，所以在没有反向代理的情况下访问不到 GreptimeDB 的 `/v1/splunk`。要从 Fluent Bit 写入，请改用[它的 HTTP output](/user-guide/ingest-data/for-observability/fluent-bit.md)。
:::

## HTTP API

基础路径是 `/v1/splunk`，采集路径由客户端自己拼接。把采集器指向 `http://${db_host}:${db_http_port}/v1/splunk` 即可，例如 `http://localhost:4000/v1/splunk`。

| 端点 | 方法 | 用途 |
| --- | --- | --- |
| `/v1/splunk/services/collector/event` | `POST` | 写入 JSON 事件。别名：`/services/collector`、`/services/collector/event/1.0` |
| `/v1/splunk/services/collector/raw` | `POST` | 写入纯文本。别名：`/services/collector/raw/1.0` |
| `/v1/splunk/services/collector/health` | `GET` | 健康检查。别名：`/services/collector/health/1.0` |

请求体支持 gzip 压缩（`Content-Encoding: gzip`）。

### 鉴权

只有在服务端配置了 [user provider](/user-guide/deployments-administration/authentication/overview.md) 时才会校验鉴权。没有配置时请求直接放行。

HEC 客户端发送的是 `Authorization: Splunk <token>`，GreptimeDB 把这个 token 按 `username:password` 解析：

```
Authorization: Splunk greptime_user:greptime_pwd
```

`Authorization: Basic <base64>` 同样接受。

:::warning
大多数 Splunk 客户端默认用一个不含冒号的 opaque token，这种 token 会被 GreptimeDB 拒绝并返回 HEC code `4`。请把客户端的 token 配置成 `<username>:<password>` 的形式。
:::

健康检查端点是公开的，任何情况下都不需要 token。

## 写入 JSON 事件

`POST /v1/splunk/services/collector/event`

请求体是一个或多个 HEC 事件对象。它们可以直接拼接、用换行或空格这类 JSON 空白字符分隔，也可以放在一个顶层 JSON 数组里。其他分隔符（比如逗号、分号）会导致解析失败，请求返回 HEC code `6`。

### 字段映射

| HEC 字段 | 对应到 |
| --- | --- |
| `time` | `greptime_timestamp` 时间索引 |
| `index` | 表名 |
| `host`、`source`、`sourcetype` | Tag 列 |
| `fields` 下的各个 key | Tag 列，每个 key 一列 |
| `event` 及其余 key | 数据列 |

`time` 是 epoch 秒，可以带小数。大于等于 `1e12` 的值按毫秒解析。`time` 缺失或为 `null` 时使用服务端的写入时间。

:::warning
`time` 存在但解析不了不会回退，而是直接报错，请求返回 HEC code `6`。raw 端点的 `?time=` 同理。
:::

### 表名路由

表名按以下顺序确定：

1. 事件里的 `index`，会被规整成合法表名。`[A-Za-z0-9_:\-.@#]` 之外的字符替换成 `_`，首字符不合法时在前面补一个下划线。例如 `my index/2026` 会变成 `my_index_2026`。
2. `table` query 参数。
3. 默认表 `splunk_logs`。

### Query 参数

| 参数 | 说明 |
| --- | --- |
| `db` | 目标数据库，默认 `public`。 |
| `table` | 事件里没有 `index` 时使用的兜底表名。 |
| `pipeline_name` | 使用的 Pipeline，默认是内置的 `greptime_identity`。 |
| `version` | Pipeline 版本，默认使用最新版本。 |

:::tip 注意
这个端点只认上面这几个参数。其他日志写入参数如 `msg_field`、`custom_time_index`、`ignore_errors` 在这里不生效。
:::

### 示例

```bash
curl -X POST "http://localhost:4000/v1/splunk/services/collector/event" \
  -H "Authorization: Splunk greptime_user:greptime_pwd" \
  -H "Content-Type: application/json" \
  -d '{"time":1785312000,"host":"web-01","source":"/var/log/nginx/access.log","sourcetype":"nginx:access","index":"splunk_events","fields":{"env":"prod","region":"us-west"},"event":{"status":200,"path":"/api/v1/health","latency_ms":12}}
{"time":1785312001,"host":"web-02","source":"/var/log/nginx/access.log","sourcetype":"nginx:access","index":"splunk_events","fields":{"env":"prod","region":"eu-central"},"event":{"status":503,"path":"/api/v1/orders","latency_ms":841}}'
```

写入成功返回：

```json
{"code":0,"text":"Success"}
```

第一次写入时会自动建表 `splunk_events`：

```sql
DESC TABLE splunk_events;
```

```
+--------------------+---------------------+------+------+---------+---------------+
| Column             | Type                | Key  | Null | Default | Semantic Type |
+--------------------+---------------------+------+------+---------+---------------+
| greptime_timestamp | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
| env                | String              | PRI  | YES  |         | TAG           |
| event.latency_ms   | Int64               |      | YES  |         | FIELD         |
| event.path         | String              |      | YES  |         | FIELD         |
| event.status       | Int64               |      | YES  |         | FIELD         |
| host               | String              | PRI  | YES  |         | TAG           |
| region             | String              | PRI  | YES  |         | TAG           |
| source             | String              | PRI  | YES  |         | TAG           |
| sourcetype         | String              | PRI  | YES  |         | TAG           |
+--------------------+---------------------+------+------+---------+---------------+
```

默认 Pipeline 会把嵌套的 `event` 对象打平，所以数据列的名字是 `event.status`、`event.path`、`event.latency_ms`。

```sql
SELECT * FROM splunk_events ORDER BY greptime_timestamp;
```

```
+---------------------+------+------------------+----------------+--------------+--------+------------+---------------------------+--------------+
| greptime_timestamp  | env  | event.latency_ms | event.path     | event.status | host   | region     | source                    | sourcetype   |
+---------------------+------+------------------+----------------+--------------+--------+------------+---------------------------+--------------+
| 2026-07-29 08:00:00 | prod |               12 | /api/v1/health |          200 | web-01 | us-west    | /var/log/nginx/access.log | nginx:access |
| 2026-07-29 08:00:01 | prod |              841 | /api/v1/orders |          503 | web-02 | eu-central | /var/log/nginx/access.log | nginx:access |
+---------------------+------+------------------+----------------+--------------+--------+------------+---------------------------+--------------+
```

后续写入里 `fields` 新出现的 key 会自动加成 Tag 列并加入主键。

## 写入纯文本

`POST /v1/splunk/services/collector/raw`

请求体原样存进 `message` 列，GreptimeDB 不解析内容。如果需要结构化，用[自定义 Pipeline](#使用-pipeline) 读 `message` 字段。

:::warning
默认情况下**整个请求体是一个事件**，这样堆栈这类多行内容能保持完整。要把请求体切成多个事件，用 `linebreaker` 传入分隔符（需要百分号编码），例如 `?linebreaker=%0A` 按换行切分。只含空白的片段会被丢弃。
:::

这个端点的元数据是请求级的：来自 query 参数，对请求里的所有事件生效。

### Query 参数

| 参数 | 说明 |
| --- | --- |
| `host`、`source`、`sourcetype` | Tag 列，对请求内所有事件生效。 |
| `index` | 表名，规整规则和 `/event` 的 `index` 字段一致。 |
| `time` | 对所有事件生效的 epoch 时间戳，默认使用写入时间。 |
| `table` | 没有 `index` 时的兜底表名。 |
| `linebreaker` | 用于切分请求体的分隔符字面量，需要百分号编码。不传时整个请求体是一个事件。 |
| `pipeline_name` | 使用的 Pipeline，默认 `greptime_identity`。 |
| `version` | Pipeline 版本。 |
| `db` | 目标数据库，默认 `public`。 |
| `channel` | 接收但忽略。也可以用 `x-splunk-request-channel` 请求头传。 |

### 示例

```bash
printf 'line one\nline two\nline three\n' | curl -X POST \
  "http://localhost:4000/v1/splunk/services/collector/raw?index=splunk_raw&host=web-01&source=app.log&sourcetype=applog&linebreaker=%0A" \
  -H "Authorization: Splunk greptime_user:greptime_pwd" \
  --data-binary @-
```

这会写入三行。同样的请求去掉 `linebreaker` 则只写入一行，内容是完整的三行文本。

```sql
SHOW CREATE TABLE splunk_raw;
```

```sql
CREATE TABLE IF NOT EXISTS `splunk_raw` (
  `greptime_timestamp` TIMESTAMP(9) NOT NULL,
  `host` STRING NULL,
  `message` STRING NULL,
  `source` STRING NULL,
  `sourcetype` STRING NULL,
  TIME INDEX (`greptime_timestamp`),
  PRIMARY KEY (`host`, `source`, `sourcetype`)
)

ENGINE=mito
WITH(
  'comment' = 'Created on insertion',
  append_mode = 'true'
)
```

## 使用 Pipeline

两个端点都会让每个事件走一遍 [Pipeline](/user-guide/logs/manage-pipelines.md)。默认是内置的 `greptime_identity`，它把输入的每个 key 映射成同名的列。

可以用 `pipeline_name` query 参数或 `x-greptime-pipeline-name` 请求头覆盖，两者同时存在时 query 参数优先。用 `version` 可以指定 Pipeline 版本。

:::warning
把 `host`、`source`、`sourcetype` 和 `fields` 的 key 提升为 Tag 列只发生在默认的 `greptime_identity` 路径上。自定义 Pipeline 自己决定输出 schema，需要索引哪些列要在 Pipeline 里自己声明。
:::

## 响应码

响应体是 `{"text": ..., "code": ...}`，和 HEC 一致，客户端根据 `code` 分支处理。

| Code | 含义 |
| --- | --- |
| `0` | 成功 |
| `2` | 缺少 token |
| `4` | token 非法 |
| `5` | 没有数据 |
| `6` | 数据格式错误，包括 `time` 或 `version` 解析失败 |
| `7` | index 错误，即最终解析出的表名不合法 |
| `8` | 服务端内部错误 |
| `12` | 缺少 `event` 字段 |
| `13` | `event` 字段为空 |
| `17` | 健康检查端点返回，表示 collector 正常 |

:::warning
校验失败会让整个请求失败。一批事件里只要有一条缺 `event`、`event` 为空，或者 `time` 存在但解析不了，这一批就一条都不会写入——端点不会跳过坏事件继续写其余的。`host`、`source` 这类可选元数据缺失不影响写入。
:::

## Vector

Vector 的 [`splunk_hec_logs`](https://vector.dev/docs/reference/configuration/sinks/splunk_hec_logs/) sink 不需要额外改造就能写入 GreptimeDB：

```toml
[sinks.greptime]
type = "splunk_hec_logs"
inputs = ["my_source"]
endpoint = "http://localhost:4000/v1/splunk"
default_token = "greptime_user:greptime_pwd"
index = "vector_logs"
compression = "gzip"
encoding.codec = "json"
```

- `endpoint`：填 `/v1/splunk` 基础路径，不要带采集路径，Vector 会自己拼。
- `default_token`：必须是 `<username>:<password>`，不能是 opaque token。
- `index`：目标表名。
- `encoding.codec`：这个 sink 的必填项。
- `endpoint_target`：默认 `event`，走 `/services/collector/event`。设成 `raw` 则走 raw 端点。

改用 raw 端点：

```toml
[sinks.greptime]
type = "splunk_hec_logs"
inputs = ["my_source"]
endpoint = "http://localhost:4000/v1/splunk"
default_token = "greptime_user:greptime_pwd"
index = "vector_raw_logs"
endpoint_target = "raw"
encoding.codec = "text"
batch.max_events = 1
```

Vector 批量发送时事件之间没有分隔符，所以在 raw 端点上一整批会被当成一个事件。像上面这样设 `batch.max_events = 1`，或者用默认的 `event` 模式即可。

:::tip 注意
服务端的 `linebreaker` 本来可以把这样一批切开，但这个 sink 送不出去：它没有配置任意 query 参数的选项，把参数拼到 `endpoint` 上也不行——Vector 是把 `endpoint` 和采集路径按字符串直接拼接的，`http://localhost:4000/v1/splunk?linebreaker=%0A` 会拼成 `/v1/splunk?linebreaker=%0A/services/collector/raw?index=...`，路由匹配不上。能自由设置 query 参数的 HEC 客户端可以正常使用 `linebreaker`。
:::

## OpenTelemetry Collector

[`splunk_hec` exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/splunkhecexporter/README.md) 的配置方式类似：

```yaml
exporters:
  splunk_hec:
    endpoint: "http://localhost:4000/v1/splunk/services/collector"
    token: "greptime_user:greptime_pwd"
    index: "otel_logs"
    tls:
      insecure: true

service:
  pipelines:
    logs:
      receivers: [otlp]
      exporters: [splunk_hec]
```

和 Vector 不同，这个 exporter 的 `endpoint` 需要填完整的采集路径。
