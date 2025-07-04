In this section, we will create a quick start demo and showcase the core code to collect host metrics and send them to GreptimeDB. The demo is based on [OTLP/HTTP](https://opentelemetry.io/). For reference, you can obtain the entire demo on [GitHub](https://github.com/GreptimeCloudStarters/quick-start-go).

To begin, create a new directory named `quick-start-go` to host our project. Then, run the command `go mod init quick-start` in the directory from your terminal. This will generate a `go.mod` file, which is used by Go to manage imports.

Next, create new file named `app.go` and install the required OpenTelemetry packages:

```shell
go get go.opentelemetry.io/otel@v1.16.0 \
    go.opentelemetry.io/contrib/instrumentation/host@v0.42.0 \
    go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp@v0.39.0
```

Once the required packages are installed, write the code to create a metric export object that sends metrics to GreptimeDB in `app.go`.
For the configuration about the exporter, please refer to OTLP integration documentation in [GreptimeDB](/user-guide/protocols/opentelemetry.md) or [GreptimeCloud](/greptimecloud/integrations/otlp.md).

```go
auth := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s:%s", *username, *password)))
exporter, err := otlpmetrichttp.New(
 context.Background(),
 otlpmetrichttp.WithEndpoint(*dbHost),
 otlpmetrichttp.WithURLPath("/v1/otlp/v1/metrics"),
 otlpmetrichttp.WithHeaders(map[string]string{
  "x-greptime-db-name": *db,
  "Authorization":      "Basic " + auth,
 }),
 otlpmetrichttp.WithTimeout(time.Second*5),
)

if err != nil {
 panic(err)
}

reader := metric.NewPeriodicReader(exporter, metric.WithInterval(time.Second*2))
```

Then attach the exporter to the MeterProvider and start the host metrics collection:

```go
res := resource.NewWithAttributes(
 semconv.SchemaURL,
 semconv.ServiceName("quick-start-go"),
)

meterProvider := metric.NewMeterProvider(
 metric.WithResource(res),
 metric.WithReader(reader),
)

log.Print("Sending metrics...")
err = appHost.Start(appHost.WithMeterProvider(meterProvider))
if err != nil {
 log.Fatal(err)
}
```

For more details about the code, you can refer to the [OpenTelemetry Documentation](https://opentelemetry.io/docs/instrumentation/go/).

Congratulations on successfully completing the core section of the demo! You can now run the complete demo by following the instructions in the `README.md` file on the [GitHub repository](https://github.com/GreptimeCloudStarters/quick-start-go).
