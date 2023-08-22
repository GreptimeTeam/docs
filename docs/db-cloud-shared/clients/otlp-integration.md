
GreptimeDB can be used as a collector to receive OpenTelemetry Metrics via the [OTLP/HTTP](https://opentelemetry.io/docs/specs/otlp/#otlphttp) protocol. 

### API

To send OpenTelemetry Metrics to GreptimeDB through OpenTelemetry SDK libraries, use the following information:

* URL: `https://<host>/v1/otlp/v1/metrics`
* Headers:
  * `X-Greptime-DB-Name`: `<dbName>`
  * `Authorization`: `Basic` authentication, which is a Base64 encoded string of `<username>:<Your database password>`. For more information, please refer to [Authentication](https://docs.greptime.com/user-guide/clients/authentication) and [HTTP API](https://docs.greptime.com/user-guide/clients/http-api#authentication)

The request uses binary protobuf to encode the payload, so you need to use packages that support `HTTP/protobuf`. For example, in Node.js, you can use [`exporter-trace-otlp-proto`](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto); in Go, you can use [`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp); in Java, you can use [`io.opentelemetry:opentelemetry-exporter-otlp`](https://mvnrepository.com/artifact/io.opentelemetry/opentelemetry-exporter-otlp); and in Python, you can use [`opentelemetry-exporter-otlp-proto-http`](https://pypi.org/project/opentelemetry-exporter-otlp-proto-http/).

:::tip NOTE
The package names may change according to OpenTelemetry, so we recommend that you refer to the official OpenTelemetry documentation for the most up-to-date information.
:::

For more information about the OpenTelemetry SDK, please refer to the official documentation for your preferred programming language.

### Example Code

Here are some example codes about how to setup the request in different languages:

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

You can find executable demos on GitHub at the links: [Go](https://github.com/GreptimeCloudStarters/quick-start-go), [Java](https://github.com/GreptimeCloudStarters/quick-start-java), [Python](https://github.com/GreptimeCloudStarters/quick-start-python), and [Node.js](https://github.com/GreptimeCloudStarters/quick-start-node-js).


:::tip NOTE
The example codes above may be outdated according to OpenTelemetry. We recommend that you refer to the official OpenTelemetry documentation for the most up-to-date information.
:::

For more information on the example code, please refer to the official documentation for your preferred programming language.
