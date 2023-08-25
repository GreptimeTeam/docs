# OpenTelemetry Protocol(OTLP)

[OpenTelemetry](https://opentelemetry.io/) is a vendor-neutral open-source observability framework for instrumenting, generating, collecting, and exporting telemetry data such as traces, metrics, logs. The OpenTelemetry Protocol (OTLP) defines the encoding, transport, and delivery mechanism of telemetry data between telemetry sources, intermediate processes such as collectors and telemetry backends.

## OTLP/HTTP

<!--@include: ../../db-cloud-shared/clients/otlp-integration.md-->

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

## Data Model

The OTLP metrics data model is mapped to the GreptimeDB data model according to the following rules:
- The name of the Metric will be used as the name of the GreptimeDB table, and the table will be automatically created if it does not exist.
- All attributes, including resource attributes, scope attributes, and data point attributes, will be used as tags field of the GreptimeDB table.
- The timestamp of the data point will be used as the timestamp index of GreptimeDB, and the column name is `greptime_timestamp`.
- The data of Gauge/Sum data types will be used as the field column of GreptimeDB, and the column name is `greptime_value`.
- Each quantile of the Summary data type will be used as a separated data column of GreptimeDB, and the column name is `greptime_pxx`, where xx is the quantile, such as 90/99, etc.
- Histogram and ExponentialHistogrrm are not supported yet, we may introduce the Histogram data type to natively support these two types in a later version.
