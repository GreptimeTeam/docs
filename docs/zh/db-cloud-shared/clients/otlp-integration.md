
GreptimeDB 可以作为 collector 通过 [OTLP/HTTP](https://opentelemetry.io/docs/specs/otlp/#otlphttp) 协议接收 OpenTelemetry 指标。

### API

使用下面的信息通过 Opentelemetry SDK 库发送 Metrics 到 GreptimeDB：

* URL: `https://<host>/v1/otlp/v1/metrics`
* Headers:
  * `X-Greptime-DB-Name`: `<dbName>`
* `Authorization`: `Basic` 认证，是 `<username>:<Your database password>` 的 Base64 编码字符串。更多信息请参考 [鉴权](https://docs.greptime.cn/user-guide/clients/authentication) 和 [HTTP API](https://docs.greptime.com/user-guide/clients/http-api#authentication)。

请求中使用 binary protobuf 编码 payload，因此你需要使用支持 `HTTP/protobuf` 的包。例如，在 Node.js 中，可以使用 [`exporter-trace-otlp-proto`](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto)；在 Go 中，可以使用 [`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp)；在 Java 中，可以使用 [`io.opentelemetry:opentelemetry-exporter-otlp`](https://mvnrepository.com/artifact/io.opentelemetry/opentelemetry-exporter-otlp)；在 Python 中，可以使用 [`opentelemetry-exporter-otlp-proto-http`](https://pypi.org/project/opentelemetry-exporter-otlp-proto-http/)。

:::tip 注意
包名可能会根据 OpenTelemetry 的发展发生变化，因此建议你参考 OpenTelemetry 官方文档以获取最新信息。
:::

请参考 Opentelementry 的官方文档获取它所支持的编程语言的更多信息。

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
