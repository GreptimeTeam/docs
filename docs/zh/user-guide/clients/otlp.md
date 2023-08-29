# OpenTelemetry Protocol(OTLP)

[OpenTelemetry](https://opentelemetry.io/) 是一个供应商中立的开源可观测性框架，用于检测、生成、收集和导出观测数据，例如 traces, metrics 和 logs。
OpenTelemetry Protocol (OTLP) 定义了观测数据在观测源和中间进程（例如收集器和观测后端）之间的编码、传输机制。

## OTLP/HTTP

<!--@include: ../../db-cloud-shared/clients/otlp-integration.md-->


### 示例代码

下面是一些编程语言设置请求的示例代码：

::: code-group

```ts [TypeScript]
const auth = Buffer.from(`${username}:${password}`).toString('base64')
const exporter = new OTLPMetricExporter({
    url: `https://${dbHost}/v1/otlp/v1/metrics`,
    headers: {
        Authorization: `Basic ${auth}`,
        "X-Greptime-DB-Name": db,
    },
    timeoutMillis: 5000,
})
```


```Go [Go]
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

```Java [Java]
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

```python [Python]
auth = f"{username}:{password}"
b64_auth = base64.b64encode(auth.encode()).decode("ascii")
endpoint = f"https://{host}/v1/otlp/v1/metrics"
exporter = OTLPMetricExporter(
    endpoint=endpoint,
    headers={"Authorization": f"Basic {b64_auth}", "X-Greptime-DB-Name": db},
    timeout=5)
```

:::

你可以在 Github 中找到可执行的 Demo：[Go](https://github.com/GreptimeCloudStarters/quick-start-go), [Java](https://github.com/GreptimeCloudStarters/quick-start-java), [Python](https://github.com/GreptimeCloudStarters/quick-start-python), and [Node.js](https://github.com/GreptimeCloudStarters/quick-start-node-js).


:::tip 注意
示例代码可能会根据 OpenTelemetry 的发展发生变化，因此建议你参考 OpenTelemetry 官方文档以获取最新信息。
:::

关于示例代码，请参考 Opentelementry 的官方文档获取它所支持的编程语言获取更多信息。


## 数据模型

OTLP 指标数据模型按照下方的规则被映射到 GreptimeDB 数据模型中：
- Metric 的名称将被作为 GreptimeDB 表的名称，当表不存在时会自动创建。
- 所有的 Attribute ，包含 resource 级别、scope 级别和 data_point 级别，都被作为 GreptimeDB 表的 tag 列。
- 数据点的时间戳被作为 GreptimeDB 的时间戳索引，列名 greptime_timestamp。
- Gauge/Sum 两种类型的数据点数据被作为 field 列，列名 greptime_value。
- Summay 类型的每个 quantile 被作为单独的数据列，列名 greptime_pxx ，其中 xx 是quantile 的数据，如  90 / 99 等。
- Histogram 和 ExponentialHistogram 暂时未被支持，我们可能在后续版本中推出 Histogram 数据类型来原生支持这两种类型。
