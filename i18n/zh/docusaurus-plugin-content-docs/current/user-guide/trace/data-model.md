---
keywords: [Trace, OpenTelemetry, Jaeger]
description: 介绍 Trace 数据如何存入 GreptimeDB.
---

# Trace 数据模型

:::warning

本章内容目前仍处于实验阶段，在未来的版本中可能会有所调整。

:::

在本节，我们主要描述 Trace 数据如何转换成 GreptimeDB 的表结构。

我们复用了 Pipeline 的概念来标记数据模型的版本，因此注意在 Trace 数据中暂时只能
使用内置的 Pipeline。

## 数据模型版本机制

GreptimeDB 本身的数据类型和相关功能在持续演化。为了实现向后兼容，我们使用
Pipeline 的名称来作为数据模型的版本。目前可用的 Pipeline 包括：

- `greptime_trace_v1`

在使用 OTLP/HTTP 协议写入数据时，HTTP 头是必须设置的 `x-greptime-pipeline-name:
greptime_trace_v1`.

在未来我们可能引入新的 Pipeline 名称，即数据模型版本。但已有的版本会持续保持维护。
新的 Pipeline 可能与老版本不兼容，倒是需要创建新的数据表来使用。

## 数据模型

`greptime_trace_v1` 数据模型是非常直观的：

- 所有常见的 [OpenTelemetry
  Trace](https://opentelemetry.io/docs/concepts/signals/traces/) 数据字段都被映
  射为 GreptimeDB 的列。
- `duration_nano` 列由 `end_time - start_time` 生成。
- 所有的属性字段被打平为列，按照 `[span|resource|scope]_attributes.[attribute_key]`
  的命名方式生成名称。如果属性的值是复合类型，如 `Array` 或 `Kvlist`，它将被存储
  为 GreptimeDB 的 JSON 类型。
- 其他复合类型字段 `span_links` 和 `span_events` 将被存储为 JSON 类型。

在插入第一条数据时，表将被创建。并且当数据中涉及新的字段时，表的结构会自动变更增
加列。

以下是一个使用 OpenTelemetry Django 埋点生成的表结构：

```
timestamp                                  | 2025-05-07 10:03:29.657544
timestamp_end                              | 2025-05-07 10:03:29.661714
duration_nano                              | 4169970
trace_id                                   | fb60d19aa36fdcb7d14a71ca0b9b42ae
span_id                                    | 49806a2671f2ddcb
span_kind                                  | SPAN_KIND_SERVER
span_name                                  | POST todos/
span_status_code                           | STATUS_CODE_UNSET
span_status_message                        |
trace_state                                |
scope_name                                 | opentelemetry.instrumentation.django
scope_version                              | 0.51b0
service_name                               | myproject
span_attributes.http.request.method        | POST
span_attributes.url.full                   |
span_attributes.server.address             | django:8000
span_attributes.network.peer.address       |
span_attributes.server.port                | 8000
span_attributes.network.peer.port          |
span_attributes.http.response.status_code  | 201
span_attributes.network.protocol.version   | 1.1
resource_attributes.telemetry.sdk.language | python
resource_attributes.telemetry.sdk.name     | opentelemetry
resource_attributes.telemetry.sdk.version  | 1.30.0
span_events                                | []
span_links                                 | []
parent_span_id                             | eccc18b6fc210f31
span_attributes.db.system                  |
span_attributes.db.name                    |
span_attributes.db.statement               |
span_attributes.url.scheme                 | http
span_attributes.url.path                   | /todos/
span_attributes.client.address             | 10.89.0.5
span_attributes.client.port                | 44302
span_attributes.user_agent.original        | python-requests/2.32.3
span_attributes.http.route                 | todos/
```

可以通过执行 `show create table <table>` 来查看表建表语句：

```
Table        | web_trace_demo
Create Table | CREATE TABLE IF NOT EXISTS "web_trace_demo" (                                           +
             |   "timestamp" TIMESTAMP(9) NOT NULL,                                                    +
             |   "timestamp_end" TIMESTAMP(9) NULL,                                                    +
             |   "duration_nano" BIGINT UNSIGNED NULL,                                                 +
             |   "trace_id" STRING NULL SKIPPING INDEX WITH(granularity = '10240', type = 'BLOOM'),    +
             |   "span_id" STRING NULL,                                                                +
             |   "span_kind" STRING NULL,                                                              +
             |   "span_name" STRING NULL,                                                              +
             |   "span_status_code" STRING NULL,                                                       +
             |   "span_status_message" STRING NULL,                                                    +
             |   "trace_state" STRING NULL,                                                            +
             |   "scope_name" STRING NULL,                                                             +
             |   "scope_version" STRING NULL,                                                          +
             |   "service_name" STRING NULL SKIPPING INDEX WITH(granularity = '10240', type = 'BLOOM'),+
             |   "span_attributes.http.request.method" STRING NULL,                                    +
             |   "span_attributes.url.full" STRING NULL,                                               +
             |   "span_attributes.server.address" STRING NULL,                                         +
             |   "span_attributes.network.peer.address" STRING NULL,                                   +
             |   "span_attributes.server.port" BIGINT NULL,                                            +
             |   "span_attributes.network.peer.port" BIGINT NULL,                                      +
             |   "span_attributes.http.response.status_code" BIGINT NULL,                              +
             |   "span_attributes.network.protocol.version" STRING NULL,                               +
             |   "resource_attributes.telemetry.sdk.language" STRING NULL,                             +
             |   "resource_attributes.telemetry.sdk.name" STRING NULL,                                 +
             |   "resource_attributes.telemetry.sdk.version" STRING NULL,                              +
             |   "span_events" JSON NULL,                                                              +
             |   "span_links" JSON NULL,                                                               +
             |   "parent_span_id" STRING NULL,                                                         +
             |   "span_attributes.db.system" STRING NULL,                                              +
             |   "span_attributes.db.name" STRING NULL,                                                +
             |   "span_attributes.db.statement" STRING NULL,                                           +
             |   "span_attributes.url.scheme" STRING NULL,                                             +
             |   "span_attributes.url.path" STRING NULL,                                               +
             |   "span_attributes.client.address" STRING NULL,                                         +
             |   "span_attributes.client.port" BIGINT NULL,                                            +
             |   "span_attributes.user_agent.original" STRING NULL,                                    +
             |   "span_attributes.http.route" STRING NULL,                                             +
             |   TIME INDEX ("timestamp"),                                                             +
             |   PRIMARY KEY ("service_name")                                                          +
             | )                                                                                       +
             | PARTITION ON COLUMNS ("trace_id") (                                                     +
             |   trace_id < '1',                                                                       +
             |   trace_id >= 'f',                                                                      +
             |   trace_id >= '1' AND trace_id < '2',                                                   +
             |   trace_id >= '2' AND trace_id < '3',                                                   +
             |   trace_id >= '3' AND trace_id < '4',                                                   +
             |   trace_id >= '4' AND trace_id < '5',                                                   +
             |   trace_id >= '5' AND trace_id < '6',                                                   +
             |   trace_id >= '6' AND trace_id < '7',                                                   +
             |   trace_id >= '7' AND trace_id < '8',                                                   +
             |   trace_id >= '8' AND trace_id < '9',                                                   +
             |   trace_id >= '9' AND trace_id < 'a',                                                   +
             |   trace_id >= 'a' AND trace_id < 'b',                                                   +
             |   trace_id >= 'b' AND trace_id < 'c',                                                   +
             |   trace_id >= 'c' AND trace_id < 'd',                                                   +
             |   trace_id >= 'd' AND trace_id < 'e',                                                   +
             |   trace_id >= 'e' AND trace_id < 'f'                                                    +
             | )                                                                                       +
             | ENGINE=mito                                                                             +
             | WITH(                                                                                   +
             |   append_mode = 'true',                                                                 +
             |   table_data_model = 'greptime_trace_v1'                                                +
             | )
```

### 分区规则

Trace 表包含了默认的 [分区规
则](/user-guide/administration/manage-data/table-sharding.md#partition)，在
`trace_id` 列上根据首个字符的取值划分区间。

这个规则默认将引入 16 个分区，适合在 3-5 个 datanode 的部署规模下使用。

如果数据量和部署规模更大，需要自定义分区规则，可以拷贝这个建表语句，并更新
`PARTITION ON` 这部分来设置更细致的分区规则，并在写入数据之前创建这个表。

### 索引

我们默认使用对 `service_name` 和 `trace_id` 两个常用字段使用[跳数索
引](/user-guide/manage-data/data-index.md#skipping-index)，满足常见的查询场景。

实际使用中，用户可能希望对一些特定的属性列增加索引，这可以通过[alter
table](/reference/sql/alter.md#create-an-index-for-a-column)语句来实现。不同于分
区规则，索引可以增量添加而不用重新建表。

### Append 模式

通过此接口创建的表，默认为[Append 模
式](/user-guide/administration/design-table.md#何时使用-append-only-表)。

### TTL

可以对 Trace 表应用 [过期时间规则](/reference/sql/alter.md#alter-table-options)。
