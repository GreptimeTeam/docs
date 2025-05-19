---
keywords: [OpenTelemetry, OTLP, metrics, logs, 数据模型]
description: 介绍如何使用 OpenTelemetry Protocol (OTLP) 将观测数据（如 metrics 和 logs）导出到 GreptimeDB，包括示例代码和数据模型的映射规则。
---

# OpenTelemetry Protocol (OTLP)

[OpenTelemetry](https://opentelemetry.io/) 是一个供应商中立的开源可观测性框架，用于检测、生成、收集和导出观测数据，例如 traces, metrics 和 logs。
OpenTelemetry Protocol (OTLP) 定义了观测数据在观测源和中间进程（例如收集器和观测后端）之间的编码、传输机制。

## OpenTelemetry Collectors

你可以很简单地将 GreptimeDB 配置为 OpenTelemetry 采集器写入的目标。
有关更多信息，请参阅 [OTel Collector](otel-collector.md) 和[Grafana Alloy](alloy.md) 示例。

## Metrics

GreptimeDB 通过原生支持 [OTLP/HTTP](https://opentelemetry.io/docs/specs/otlp/#otlphttp) 协议，可以作为后端存储服务来接收 OpenTelemetry 指标数据。

### OTLP/HTTP API

使用下面的信息通过 Opentelemetry SDK 库发送 Metrics 到 GreptimeDB：

- URL: `https://<host>/v1/otlp/v1/metrics`
- Headers:
  - `X-Greptime-DB-Name`: `<dbname>`
- `Authorization`: `Basic` 认证，是 `<username>:<password>` 的 Base64 编码字符串。更多信息请参考 [鉴权](https://docs.greptime.cn/user-guide/deployments/authentication/static/) 和 [HTTP API](https://docs.greptime.cn/user-guide/protocols/http#authentication)。

请求中使用 binary protobuf 编码 payload，因此你需要使用支持 `HTTP/protobuf` 的包。例如，在 Node.js 中，可以使用 [`exporter-trace-otlp-proto`](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto)；在 Go 中，可以使用 [`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp)；在 Java 中，可以使用 [`io.opentelemetry:opentelemetry-exporter-otlp`](https://mvnrepository.com/artifact/io.opentelemetry/opentelemetry-exporter-otlp)；在 Python 中，可以使用 [`opentelemetry-exporter-otlp-proto-http`](https://pypi.org/project/opentelemetry-exporter-otlp-proto-http/)。

:::tip 注意
包名可能会根据 OpenTelemetry 的发展发生变化，因此建议你参考 OpenTelemetry 官方文档以获取最新信息。
:::

请参考 Opentelementry 的官方文档获取它所支持的编程语言的更多信息。

### 示例代码

下面是一些编程语言设置请求的示例代码：

<Tabs>

<TabItem value="TypeScript" label="TypeScript">

```ts
const auth = Buffer.from(`${username}:${password}`).toString('base64')
const exporter = new OTLPMetricExporter({
  url: `https://${dbHost}/v1/otlp/v1/metrics`,
  headers: {
    Authorization: `Basic ${auth}`,
    'X-Greptime-DB-Name': db,
  },
  timeoutMillis: 5000,
})
```

</TabItem>

<TabItem value="Go" label="Go">

```Go
auth := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s:%s", *username, *password)))
exporter, err := otlpmetrichttp.New(
    context.Background(),
    otlpmetrichttp.WithEndpoint(*dbHost),
    otlpmetrichttp.WithURLPath("/v1/otlp/v1/metrics"),
    otlpmetrichttp.WithHeaders(map[string]string{
        "X-Greptime-DB-Name": *dbName,
        "Authorization":      "Basic " + auth,
    }),
    otlpmetrichttp.WithTimeout(time.Second*5),
)
```

</TabItem>

<TabItem value="Java" label="Java">

```Java
String endpoint = String.format("https://%s/v1/otlp/v1/metrics", dbHost);
String auth = username + ":" + password;
String b64Auth = new String(Base64.getEncoder().encode(auth.getBytes()));
OtlpHttpMetricExporter exporter = OtlpHttpMetricExporter.builder()
                .setEndpoint(endpoint)
                .addHeader("X-Greptime-DB-Name", db)
                .addHeader("Authorization", String.format("Basic %s", b64Auth))
                .setTimeout(Duration.ofSeconds(5))
                .build();
```

</TabItem>

<TabItem value="Python" label="Python">

```python
auth = f"{username}:{password}"
b64_auth = base64.b64encode(auth.encode()).decode("ascii")
endpoint = f"https://{host}/v1/otlp/v1/metrics"
exporter = OTLPMetricExporter(
    endpoint=endpoint,
    headers={"Authorization": f"Basic {b64_auth}", "X-Greptime-DB-Name": db},
    timeout=5)
```

</TabItem>

</Tabs>

你可以在 Github 中找到可执行的 Demo：[Go](https://github.com/GreptimeCloudStarters/quick-start-go), [Java](https://github.com/GreptimeCloudStarters/quick-start-java), [Python](https://github.com/GreptimeCloudStarters/quick-start-python), and [Node.js](https://github.com/GreptimeCloudStarters/quick-start-node-js).

:::tip 注意
示例代码可能会根据 OpenTelemetry 的发展发生变化，因此建议你参考 OpenTelemetry 官方文档以获取最新信息。
:::

关于示例代码，请参考 Opentelementry 的官方文档获取它所支持的编程语言获取更多信息。

### 数据模型

OTLP 指标数据模型按照下方的规则被映射到 GreptimeDB 数据模型中：

- Metric 的名称将被作为 GreptimeDB 表的名称，当表不存在时会自动创建。
- 所有的 Attribute，包含 resource 级别、scope 级别和 data_point 级别，都被作为 GreptimeDB 表的 tag 列。
- 数据点的时间戳被作为 GreptimeDB 的时间戳索引，列名 `greptime_timestamp`。
- Gauge/Sum 两种类型的数据点数据被作为 field 列，列名 `greptime_value`。
- Summary 类型的每个 quantile 被作为单独的数据列，列名 `greptime_pxx`，其中 xx 是 quantile 的数据，如 90 / 99 等。
- Histogram 和 ExponentialHistogram 暂时未被支持，我们可能在后续版本中推出 Histogram 数据类型来原生支持这两种类型。

## Logs

GreptimeDB 是能够通过 [OTLP/HTTP](https://opentelemetry.io/docs/specs/otlp/#otlphttp) 协议原生地消费 OpenTelemetry 日志。

### OTLP/HTTP API

要通过 OpenTelemetry SDK 库将 OpenTelemetry 日志发送到 GreptimeDB，请使用以下信息：

- **URL:** `https://<host>/v1/otlp/v1/logs`
- **Headers:**
  - `X-Greptime-DB-Name`: `<dbname>`
  - `Authorization`: `Basic` 认证，这是一个 Base64 编码的 `<username>:<password>` 字符串。更多信息，请参考 [鉴权](/user-guide/deployments/authentication/static.md) 和 [HTTP API](/user-guide/protocols/http.md#鉴权)。
  - `X-Greptime-Log-Table-Name`: `<table_name>`（可选）- 存储日志的表名。如果未提供，默认表名为 `opentelemetry_logs`。
  - `X-Greptime-Log-Extract-Keys`: `<extract_keys>`（可选）- 从属性中提取对应 key 的值到表的顶级字段。key 应以逗号（`,`）分隔。例如，`key1,key2,key3` 将从属性中提取 `key1`、`key2` 和 `key3`，并将它们提升到日志的顶层，设置为标签。如果提取的字段类型是数组、浮点数或对象，将返回错误。如果提供了 pipeline name，此设置将被忽略。
  - `X-Greptime-Log-Pipeline-Name`: `<pipeline_name>`（可选）- 处理日志的 pipeline 名称。如果未提供，将使用 `X-Greptime-Log-Extract-Keys` 来处理日志。
  - `X-Greptime-Log-Pipeline-Version`: `<pipeline_version>`（可选）- 处理日志的 pipeline 的版本。如果未提供，将使用 pipeline 的最新版本。

请求使用二进制 protobuf 编码负载，因此您需要使用支持 `HTTP/protobuf` 的包。

:::tip 提示
包名可能会根据 OpenTelemetry 的更新而变化，因此我们建议您参考官方 OpenTelemetry 文档以获取最新信息。
:::

有关 OpenTelemetry SDK 的更多信息，请参考您首选编程语言的官方文档。

### 示例代码

请参考 [opentelemetry-collector](#opentelemetry-collector) 中的示例代码，里面包含了如何将 OpenTelemetry 日志发送到 GreptimeDB。
也可参考 [Alloy 文档](alloy.md#日志)中的示例代码，了解如何将 OpenTelemetry 日志发送到 GreptimeDB。

### 数据模型

OTLP 日志数据模型根据以下规则映射到 GreptimeDB 数据模型：

默认表结构：

```sql
+-----------------------+---------------------+------+------+---------+---------------+
| Column                | Type                | Key  | Null | Default | Semantic Type |
+-----------------------+---------------------+------+------+---------+---------------+
| timestamp             | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
| trace_id              | String              |      | YES  |         | FIELD         |
| span_id               | String              |      | YES  |         | FIELD         |
| severity_text         | String              |      | YES  |         | FIELD         |
| severity_number       | Int32               |      | YES  |         | FIELD         |
| body                  | String              |      | YES  |         | FIELD         |
| log_attributes        | Json                |      | YES  |         | FIELD         |
| trace_flags           | UInt32              |      | YES  |         | FIELD         |
| scope_name            | String              | PRI  | YES  |         | TAG           |
| scope_version         | String              |      | YES  |         | FIELD         |
| scope_attributes      | Json                |      | YES  |         | FIELD         |
| scope_schema_url      | String              |      | YES  |         | FIELD         |
| resource_attributes   | Json                |      | YES  |         | FIELD         |
| resource_schema_url   | String              |      | YES  |         | FIELD         |
+-----------------------+---------------------+------+------+---------+---------------+
17 rows in set (0.00 sec)
```

- 您可以使用 `X-Greptime-Log-Table-Name` 指定存储日志的表名。如果未提供，默认表名为 `opentelemetry_logs`。
- 所有属性，包括资源属性、范围属性和日志属性，将作为 JSON 列存储在 GreptimeDB 表中。
- 日志的时间戳将用作 GreptimeDB 中的时间戳索引，列名为 `timestamp`。建议使用 `time_unix_nano` 作为时间戳列。如果未提供 `time_unix_nano`，将使用 `observed_time_unix_nano`。

### Append 模式

通过此接口创建的表，默认为[Append 模式](/user-guide/administration/design-table.md#何时使用-append-only-表).

## Traces

GreptimeDB 支持直接写入 OpenTelemetry 协议的 traces 数据，并内置 OpenTelemetry 的 traces 的表模型来让用户方便地查询和分析 traces 数据。

### OTLP/HTTP API

你可以使用 [OpenTelemetry SDK](https://opentelemetry.io/docs/languages/) 或其他类似的技术方案来为应用添加 traces 数据。你还可以用 [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) 来收集 traces 数据，并使用 GreptimeDB 作为后端存储。

要通过 OpenTelemetry SDK 库将 OpenTelemetry 的 traces 数据发送到 GreptimeDB，请使用以下信息：

- URL: `http{s}://<host>/v1/otlp/v1/traces`
- Headers: headers 与 [Logs](#Logs) 部分相同，你可以参考 [Logs](#Logs) 部分获取更多信息。

默认地，GreptimeDB 会将 traces 数据写入到 `public` 数据库中的 `opentelemetry_traces` 表中。如果想要将 traces 数据写入到不同的表中，你可以使用 `X-Greptime-DB-Name` 和 `X-Greptime-Log-Table-Name` 头部信息来指定数据库和表名。

GreptimeDB 会接受 **protobuf 编码的 traces 数据** 通过 **HTTP 协议** 发送，其中对 HTTP header 有如下要求：

- `content-type` 应配置为 `application/x-protobuf`；
- `x-greptime-pipeline-name` 应配置为 `greptime_trace_v1`；

### 示例代码

你可以直接将 OpenTelemetry traces 数据发送到 GreptimeDB，也可以使用 OpenTelemetry Collector 来收集 traces 数据，并使用 GreptimeDB 作为后端存储，请参考 [OpenTelemetry Collector 文档](/user-guide/traces/read-write.md#opentelemetry-collector)中的示例代码，了解如何将 OpenTelemetry traces 数据发送到 GreptimeDB。

### 数据模型

OTLP traces 数据模型根据以下规则映射到 GreptimeDB 数据模型：

默认表结构：

```sql
+------------------------------------+---------------------+------+------+---------+---------------+
| Column                             | Type                | Key  | Null | Default | Semantic Type |
+------------------------------------+---------------------+------+------+---------+---------------+
| timestamp                          | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
| timestamp_end                      | TimestampNanosecond |      | YES  |         | FIELD         |
| duration_nano                      | UInt64              |      | YES  |         | FIELD         |
| parent_span_id                     | String              |      | YES  |         | FIELD         |
| trace_id                           | String              |      | YES  |         | FIELD         |
| span_id                            | String              |      | YES  |         | FIELD         |
| span_kind                          | String              |      | YES  |         | FIELD         |
| span_name                          | String              |      | YES  |         | FIELD         |
| span_status_code                   | String              |      | YES  |         | FIELD         |
| span_status_message                | String              |      | YES  |         | FIELD         |
| trace_state                        | String              |      | YES  |         | FIELD         |
| scope_name                         | String              |      | YES  |         | FIELD         |
| scope_version                      | String              |      | YES  |         | FIELD         |
| service_name                       | String              | PRI  | YES  |         | TAG           |
| span_attributes.net.sock.peer.addr | String              |      | YES  |         | FIELD         |
| span_attributes.peer.service       | String              |      | YES  |         | FIELD         |
| span_events                        | Json                |      | YES  |         | FIELD         |
| span_links                         | Json                |      | YES  |         | FIELD         |
+------------------------------------+---------------------+------+------+---------+---------------+
```

- 每一行代表一个单一的 span；
- 核心的 OpenTelemetry 字段，如 `trace_id`, `span_id`, 和 `service_name` 等将被单独作为表的列；
- Resource Attributes 和 Span Attributes 将被自动展平为单独的列，列名为其 JSON 格式表示时的 key（多层嵌套时将用 `.` 连接）；
- `span_events` 和 `span_links` 默认存储为 JSON 数据类型；

默认地，表会根据 `trace_id` 均匀划分为 16 个 Region 以高效地存储和查询所有的 traces 数据。

### Append 模式

通过此接口创建的表，默认为[Append 模式](/user-guide/administration/design-table.md#何时使用-append-only-表).
