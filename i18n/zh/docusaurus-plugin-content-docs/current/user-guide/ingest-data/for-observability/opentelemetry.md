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

## HTTP 基础端点

适用于所有信号类型的[HTTP 基础端点](https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/#otel_exporter_otlp_endpoint) URL：`http{s}://<host>/v1/otlp`

当需要将多种信号类型（指标、日志和链路追踪）发送到同一目标数据库时，这个统一端点非常有用，可以简化你的 OpenTelemetry 配置。

## Metrics

GreptimeDB 通过原生支持 [OTLP/HTTP](https://opentelemetry.io/docs/specs/otlp/#otlphttp) 协议，可以作为后端存储服务来接收 OpenTelemetry 指标数据。

### OTLP/HTTP API

使用下面的信息通过 Opentelemetry SDK 库发送 Metrics 到 GreptimeDB：

- URL: `https://<host>/v1/otlp/v1/metrics`
- Headers:
  - `X-Greptime-DB-Name`: `<dbname>`
- `Authorization`: `Basic` 认证，是 `<username>:<password>` 的 Base64 编码字符串。更多信息请参考 [鉴权](https://docs.greptime.cn/user-guide/deployments-administration/authentication/static/) 和 [HTTP API](https://docs.greptime.cn/user-guide/protocols/http#authentication)。

请求中使用 binary protobuf 编码 payload，因此你需要使用支持 `HTTP/protobuf` 的包。例如，在 Node.js 中，可以使用 [`@opentelemetry/exporter-metrics-otlp-proto`](https://www.npmjs.com/package/@opentelemetry/exporter-metrics-otlp-proto)；在 Go 中，可以使用 [`go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp)；在 Java 中，可以使用 [`io.opentelemetry:opentelemetry-exporter-otlp`](https://mvnrepository.com/artifact/io.opentelemetry/opentelemetry-exporter-otlp)；在 Python 中，可以使用 [`opentelemetry-exporter-otlp-proto-http`](https://pypi.org/project/opentelemetry-exporter-otlp-proto-http/)。

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

关于示例代码，请参考 Opentelementry 的官方文档获取它所支持的编程语言获取更多信息。

### 兼容 Prometheus

GreptimeDB 始终使用 Prometheus 兼容格式写入 OTLP 指标。
你可以使用 PromQL 查询这些指标。

:::warning 从旧版 OTLP 格式升级
旧版转换路径已移除。`otlp_metric_compat` 表选项仍可作为元数据保留，但不再决定写入格式。
已有数据不会被重写。新的写入使用下文所述的名称转换、属性筛选和数据模型，
目标表名和表结构可能因此发生变化。升级前，请根据这些映射检查 exporter、已有表和查询。
拆分请求或设置 `otlp_metric_compat='legacy'` 均无法恢复旧行为。
:::

GreptimeDB 会首先对数据进行预处理，包括：
1. 将指标名（表名）和标签名转换成 Prometheus 风格的命名（例如：将 `.` 替换为 `_`）。默认情况下，GreptimeDB 还会根据指标单位和类型添加 Prometheus 风格的后缀。具体信息请参考[这里](https://opentelemetry.io/docs/specs/otel/compatibility/prometheus_and_openmetrics/#metric-metadata-1)

   以下是一些转换示例：

   | OTLP 指标 / 属性 | OTLP 类型 / 单位 | Prometheus 等效名称 |
   | :--- | :--- | :--- |
   | `cache.hit_ratio` | Gauge / `1` | `cache_hit_ratio` |
   | `memory.usage` | Gauge / `By` | `memory_usage_bytes` |
   | `queue.length` | Gauge / `{item}` | `queue_length` |
   | `http.server.request.duration` | Histogram / `s` | `http_server_request_duration_seconds` |
   | `rpc.server.duration` | Histogram / `ms` | `rpc_server_duration_milliseconds` |
   | `http.client.request.size` | Sum (Monotonic) / `By` | `http_client_request_size_bytes_total` |
   | `system.network.io` | Sum (Monotonic) / `By` | `system_network_io_bytes_total` |
   | `http.status_code` (属性) | - | `http_status_code` |
   | `service.name` (属性) | - | `service_name` |

2. 默认丢弃一些 resource 属性和全部的 scope 属性。默认保存的 resource 属性列表可以参考[这里](https://prometheus.io/docs/guides/opentelemetry/#promoting-resource-attributes)。你可以通过配置项对这个行为进行调整

OTLP 的 `Sum`、`Histogram` 和 `ExponentialHistogram` 指标都可以使用增量时序（delta temporality）。
GreptimeDB 保存原始区间值，并添加 `otlp_aggregation_temporality="delta"` 标签，
不会跨数据点或请求累加。该标签用于区分同一表中的增量序列和累积序列。
参考[这里](https://grafana.com/blog/2023/09/26/opentelemetry-metrics-a-guide-to-delta-vs.-cumulative-temporality-trade-offs/)获取更多背景信息。

你可以通过设置 HTTP 请求头来调整预处理的行为。以下是选项列表：
1. `x-greptime-otlp-metric-promote-all-resource-attrs`: 保存所有 resource 资源。默认是 `false`。
2. `x-greptime-otlp-metric-promote-resource-attrs`: 如果不保存所有 resource 资源，需要保存的资源名称列表，用 `;` 连接。
3. `x-greptime-otlp-metric-ignore-resource-attrs`: 如果保存所有的 resource 资源，需要丢弃的资源名称列表，用 `;` 连接。
4. `x-greptime-otlp-metric-promote-scope-attrs`: 是否需要保存 scope 资源。默认是 `false`。
5. `x-greptime-otlp-metric-translation-strategy`: 在保存前如何转换 OTLP 指标名（表名）和标签名（tag 列）。默认是 `UnderscoreEscapingWithSuffixes`。

`x-greptime-otlp-metric-translation-strategy` 请求头支持以下取值：

| 取值 | 指标名行为 | 标签名行为 | 原始名称 | 转换后名称 |
| :--- | :--- | :--- | :--- | :--- |
| `UnderscoreEscapingWithSuffixes` | 将不支持的字符转换为 `_`，并添加 Prometheus 风格的单位和类型后缀。 | 将不支持的字符转换为 `_`。 | 指标：`http.server.request-duration_total`（monotonic sum，单位 `ms`）<br />标签：`_http.status-code` | 指标：`http_server_request_duration_milliseconds_total`<br />标签：`key_http_status_code` |
| `UnderscoreEscapingWithoutSuffixes` | 将不支持的字符转换为 `_`，但不添加单位和类型后缀。 | 将不支持的字符转换为 `_`。 | 指标：`http.server.request-duration_total`（monotonic sum，单位 `ms`）<br />标签：`_http.status-code` | 指标：`http_server_request_duration_total`<br />标签：`key_http_status_code` |
| `NoUTF8EscapingWithSuffixes` | 保留指标名中的原始字符，并添加 Prometheus 风格的单位和类型后缀。 | 保留标签名中的原始字符。 | 指标：`http.server.request-duration_total`（monotonic sum，单位 `ms`）<br />标签：`_http.status-code` | 指标：`http.server.request-duration_milliseconds_total`<br />标签：`_http.status-code` |
| `NoTranslation` | 保留原始指标名，并且不添加后缀。 | 保留标签名中的原始字符。 | 指标：`http.server.request-duration_total`（monotonic sum，单位 `ms`）<br />标签：`_http.status-code` | 指标：`http.server.request-duration_total`<br />标签：`_http.status-code` |

请求头取值区分大小写。无效取值会被拒绝，并返回 `400 Bad Request`。
更多信息请参考 [OTel 规范](https://opentelemetry.io/docs/specs/otel/metrics/sdk_exporters/prometheus/#translation-strategy)和 [Prometheus 文档](https://prometheus.io/docs/guides/opentelemetry/#utf-8)。

### 数据模型

兼容 Prometheus 的 OTLP 指标数据模型按照下方的规则被映射到 GreptimeDB 数据模型中：

- Metric 的名称将被作为 GreptimeDB 表的名称，当表不存在时会自动创建。
- 只有特定 resource 属性会被默认保留。详情和配置选项见上一小节。属性在 GreptimeDB 表中会被作为 tag 列。
- 参考 [Prometheus 数据模型](./prometheus.md#数据模型)了解更多数据模型信息。
- 显式 `Histogram` 数据点存储为 `_bucket`、`_sum` 和 `_count` 序列。
  每个数据点内的桶计数会转换为前缀和，增量数据点也遵循此规则。
  仅当数据点包含 sum 时才生成 `_sum` 序列。
- `Summary` 的分位数存储为带有 `quantile` 标签和 `greptime_value` 字段的行，
  并生成独立的 `_sum` 和 `_count` 序列。
- 默认支持通过 OTLP/HTTP 写入累积（cumulative temporality）和增量（delta temporality）的 `ExponentialHistogram` 指标。
  每个数据点以原生直方图的形式存储在 Struct 字段中，字段名默认为 `greptime_native_histogram`，
  而不是拆分为 `_bucket`、`_sum` 和 `_count` 序列。未指定或无法识别的时序类型会被拒绝。

OTel Arrow 的传输格式缺少 `zero_threshold`，因此不支持指数直方图。

启用 metric engine 时，传入的时间戳会对齐到目标表的时间索引精度。
新建逻辑表继承物理表的精度；自动创建的物理表使用毫秒精度。
未启用 metric engine 时，OTLP 指标使用毫秒时间戳。

### 查询增量指数直方图

每个增量指数直方图保存一个区间内的计数、总和与桶数据。
使用 `sum_over_time` 合并多个区间，再除以查询范围的秒数，即可得到每秒的直方图值。
假设指标存储在 `request_duration` 表中：

```promql
sum_over_time(request_duration{otlp_aggregation_temporality="delta"}[3m])
sum_over_time(request_duration{otlp_aggregation_temporality="delta"}[3m]) / 180
histogram_count(sum_over_time(request_duration{otlp_aggregation_temporality="delta"}[3m]))
histogram_sum(sum_over_time(request_duration{otlp_aggregation_temporality="delta"}[3m]))
```

查询范围根据数据点的结束时间戳选择样本，左边界不包含、右边界包含。
每个选中的样本贡献整个区间的值，即使区间起点早于查询范围。
例如，在第 `60`、`120`、`180` 秒结束的三个区间计数分别为 `10`、`20`、`15`，
则在第 `180` 秒查询 `[3m]` 范围得到的总计数为 `45`，除以 `180` 后为每秒 `0.25` 次观测。
缺失区间不会缩短分母所用的时长。只有一个样本时使用其完整值，空窗口不返回样本。
不会按区间重叠比例折算，也不会外推。

不要对原始增量直方图使用原生直方图的 `rate()` 或 `increase()`：
无论是否带有时序标签，这两个函数都保留计数器语义。
对于带有该标签的增量 `Sum` 和显式 `Histogram` 浮点序列，
GreptimeDB 的 `increase()` 会对区间值求和，`rate()` 则将该总和除以查询范围的时长。

在默认存储配置下，表名、标签和存储时间戳均相同的数据点会覆盖此前的值，而不会累加桶计数。
时间戳对齐可能使不同的结束时间落在同一个存储时间戳上。区间起点不属于主键。

请先升级所有接收写入的 frontend，再启用发送端的增量指数直方图。

### 部分成功

数据点转换或表结构校验失败时，GreptimeDB 会拒绝受影响的源数据点，
同一 OTLP/HTTP 请求中的有效数据点仍可写入。
此行为适用于 gauge、sum、显式直方图、summary 和指数直方图。
如果一个数据点生成多行或多个序列，例如 `_bucket`、`_sum` 和 `_count`，
任一输出校验失败都会拒绝该数据点的全部输出。
新列定义存在冲突时，所有参与冲突的数据点都会被拒绝，
包括共享同一物理指标表的不同逻辑表之间的冲突。

请求中既有接受的数据点也有拒绝的数据点时，返回 HTTP `200`，
响应包含 `partial_success.rejected_data_points` 和错误信息。
该计数表示被拒绝的源数据点数，而不是生成的行数。
如果请求中只有被拒绝的数据点，则返回 HTTP `400` 和 `InvalidArgument` 错误。
身份认证、权限校验和存储故障仍可能导致整个请求失败。

## Logs

GreptimeDB 是能够通过 [OTLP/HTTP](https://opentelemetry.io/docs/specs/otlp/#otlphttp) 协议原生地消费 OpenTelemetry 日志。

### OTLP/HTTP API

要通过 OpenTelemetry SDK 库将 OpenTelemetry 日志发送到 GreptimeDB，请使用以下信息：

- **URL:** `https://<host>/v1/otlp/v1/logs`
- **Headers:**
  - `X-Greptime-DB-Name`: `<dbname>`
  - `Authorization`: `Basic` 认证，这是一个 Base64 编码的 `<username>:<password>` 字符串。更多信息，请参考 [鉴权](/user-guide/deployments-administration/authentication/static.md) 和 [HTTP API](/user-guide/protocols/http.md#鉴权)。
  - `X-Greptime-Log-Table-Name`: `<table_name>`（可选）- 存储日志的表名。如果未提供，默认表名为 `opentelemetry_logs`。
  - `X-Greptime-Log-Extract-Keys`: `<extract_keys>`（可选）- 从属性中提取对应 key 的值到表的顶级字段。key 应以逗号（`,`）分隔。例如，`key1,key2,key3` 将从属性中提取 `key1`、`key2` 和 `key3`，并将它们提升到日志的顶层，设置为标签。key 匹配不区分大小写。如果同一个 key 同时存在于 log attributes、scope attributes 和 resource attributes 中，优先使用 log attributes 的值，其次是 scope attributes，最后是 resource attributes。可提取的值类型包括字符串、有符号整数、无符号整数和布尔值。如果提取的字段类型是数组、浮点数或对象，将返回错误。如果提供了 pipeline name，此设置将被忽略。
  - `X-Greptime-Pipeline-Name`: `<pipeline_name>`（可选）- 处理日志的 pipeline 名称。如果未提供，GreptimeDB 使用内置的 OTLP 日志映射，并在提供 `X-Greptime-Log-Extract-Keys` 时应用该配置。
  - `X-Greptime-Pipeline-Version`: `<pipeline_version>`（可选）- 处理日志的 pipeline 版本。如果未提供，将使用 pipeline 的最新版本。
  - `X-Greptime-Pipeline-Params`: `<pipeline_params>`（可选）- 使用自定义 pipeline 处理日志时传入的 pipeline 参数。

`X-Greptime-Log-Pipeline-Name` 和 `X-Greptime-Log-Pipeline-Version` 也可以作为通用 pipeline header 的旧别名使用。新的配置建议使用 `X-Greptime-Pipeline-Name` 和 `X-Greptime-Pipeline-Version`。

请求使用二进制 protobuf 编码负载，因此您需要使用支持 `HTTP/protobuf` 的包。

:::tip 提示
包名可能会根据 OpenTelemetry 的更新而变化，因此我们建议您参考官方 OpenTelemetry 文档以获取最新信息。
:::

有关 OpenTelemetry SDK 的更多信息，请参考您首选编程语言的官方文档。

### 示例代码

请参考 [OpenTelemetry Collector 文档](otel-collector.md)中的示例代码，里面包含了如何将 OpenTelemetry 日志发送到 GreptimeDB。
也可参考 [Alloy 文档](alloy.md#日志)中的示例代码，了解如何将 OpenTelemetry 日志发送到 GreptimeDB。

### 自定义 Pipeline 输入

当设置了 `X-Greptime-Pipeline-Name` 时，GreptimeDB 会把每条 OTLP 日志记录转换成一个 pipeline event。event 包含以下字段：

| 字段 | 说明 |
| --- | --- |
| `Timestamp` | OTLP 的 `time_unix_nano`。 |
| `ObservedTimestamp` | OTLP 的 `observed_time_unix_nano`。 |
| `TraceId`、`SpanId` | 十六进制编码后的 ID。 |
| `TraceFlags`、`SeverityText`、`SeverityNumber`、`Body` | 对应的 OTLP 日志字段。`Body` 会被转换成字符串。 |
| `ResourceSchemaUrl`、`ScopeSchemaUrl`、`ScopeName`、`ScopeVersion` | 对应的 resource 和 scope 字段。 |
| `ResourceAttributes`、`ScopeAttributes`、`LogAttributes` | 包含对应 OTLP attributes 的对象。 |

### 数据模型

OTLP 日志数据模型根据以下规则映射到 GreptimeDB 数据模型：

新建表的默认表结构：

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
| trace_flags           | Int32               |      | YES  |         | FIELD         |
| scope_name            | String              | PRI  | YES  |         | TAG           |
| scope_version         | String              |      | YES  |         | FIELD         |
| scope_attributes      | Json                |      | YES  |         | FIELD         |
| scope_schema_url      | String              |      | YES  |         | FIELD         |
| resource_attributes   | Json                |      | YES  |         | FIELD         |
| resource_schema_url   | String              |      | YES  |         | FIELD         |
+-----------------------+---------------------+------+------+---------+---------------+
14 rows in set (0.00 sec)
```

- 您可以使用 `X-Greptime-Log-Table-Name` 指定存储日志的表名。如果未提供，默认表名为 `opentelemetry_logs`。
- 所有属性，包括资源属性、范围属性和日志属性，将作为 JSON 列存储在 GreptimeDB 表中。
- `body` 列默认会创建 fulltext 索引。该索引使用默认的全文索引配置：
  `analyzer=English`、`case_sensitive=false` 和 `backend=bloom`。对于 Bloom
  后端，默认的 `granularity` 为 `10240`，默认的 `false_positive_rate` 为
  `0.01`。更多信息请参考[全文索引文档](/user-guide/manage-data/data-index.md#全文索引)。
- 日志的时间戳将用作 GreptimeDB 中的时间戳索引，列名为 `timestamp`。建议使用 `time_unix_nano` 作为时间戳列。如果未提供 `time_unix_nano`，将使用 `observed_time_unix_nano`。

### Append-only 模式

通过此接口创建的表，默认为[Append-only 模式](/user-guide/deployments-administration/performance-tuning/design-table.md#何时使用-append-only-表)。

## Traces

GreptimeDB 支持直接写入 OpenTelemetry 协议的 traces 数据，并内置 OpenTelemetry 的 traces 的表模型来让用户方便地查询和分析 traces 数据。

### OTLP/HTTP API

你可以使用 [OpenTelemetry SDK](https://opentelemetry.io/docs/languages/) 或其他类似的技术方案来为应用添加 traces 数据。你还可以用 [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) 来收集 traces 数据，并使用 GreptimeDB 作为后端存储。

要通过 OpenTelemetry SDK 库将 OpenTelemetry 的 traces 数据发送到 GreptimeDB，请使用以下信息：

- URL: `http{s}://<host>/v1/otlp/v1/traces`
- Headers:
  - `Content-Type`: 应配置为 `application/x-protobuf`
  - `Authorization`: `Basic` 认证。
  - `X-Greptime-DB-Name`: `<dbname>`
  - `X-Greptime-Trace-Table-Name`: `<table_name>`（可选）- 存储 traces 的表名。如果未提供，默认表名为 `opentelemetry_traces`。
  - `X-Greptime-Pipeline-Name`: `greptime_trace_v1` 或 `greptime_trace_v2`（必选）- 处理 traces 的 pipeline 名称。

GreptimeDB 会通过 **HTTP 协议** 接受 **protobuf 编码的 traces 数据**。

### 示例代码

你可以直接将 OpenTelemetry traces 数据发送到 GreptimeDB，也可以使用 OpenTelemetry Collector 来收集 traces 数据，并使用 GreptimeDB 作为后端存储，请参考 [OpenTelemetry Collector 文档](/user-guide/traces/read-write.md#opentelemetry-collector)中的示例代码，了解如何将 OpenTelemetry traces 数据发送到 GreptimeDB。

### 数据模型

Trace 数据模型的表结构、属性存储方式和表选项统一介绍于[Trace 数据模型](/user-guide/traces/data-model.md)。该页分别说明 `greptime_trace_v1` 和 `greptime_trace_v2`。

### Schema 演进与 Partial Success

`greptime_trace_v1` 模型会自动添加新的打平 attribute 列。当 trace 表已经存在时，GreptimeDB 会根据已有表结构协调新写入 attribute 的值类型。兼容的标量值可以转换为已有列类型；当已有 `Int64` attribute 列后续收到整数和浮点数混合写入时，该列可能会被扩展为 `Float64`。

如果一次 trace 请求中有部分 span 因 schema 或值不兼容而无法写入，GreptimeDB 仍可能接受其他 span，并返回包含 `rejected_spans` 和 `error_message` 的 OTLP `partial_success` 响应。如果所有 span 都被拒绝，接口会返回 `400 Bad Request`。

### 辅助表

GreptimeDB 会自动创建辅助表（例如 `opentelemetry_traces_services` 和 `opentelemetry_traces_operations`），以便于搜索服务和操作。详情请参阅[辅助表](/user-guide/traces/data-model.md#辅助表)。

### Append-only 模式

通过此接口创建的表，默认为[Append-only 模式](/user-guide/deployments-administration/performance-tuning/design-table.md#何时使用-append-only-表)。
