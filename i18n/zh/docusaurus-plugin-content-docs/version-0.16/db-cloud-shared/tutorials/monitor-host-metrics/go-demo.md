在本节中，我们将创建一个快速开始的 Demo，并展示收集 host 指标并发送到 GreptimeDB 的核心代码。该 Demo 基于[OTLP/HTTP](https://opentelemetry.io/)。你可以在 [GitHub](https://github.com/GreptimeCloudStarters/quick-start-go) 上获取整个 Demo 以作参考。

首先，创建一个名为 `quick-start-go` 的新目录来托管我们的项目，然后在根目录中运行命令 `go mod init quick-start` 生成一个`go.mod`文件，该文件在 Go 中用于做包管理。

接下来，创建一个名为 `app.go` 的新文件并安装所需的 OpenTelemetry 依赖：

```shell
go get go.opentelemetry.io/otel@v1.16.0 \
    go.opentelemetry.io/contrib/instrumentation/host@v0.42.0 \
    go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp@v0.39.0
```

安装所需的包后，在 `app.go` 中编写代码创建一个 metric exporter 对象，将 metrics 发送到 GreptimeDB。
请参考 [GreptimeDB](/user-guide/protocols/opentelemetry.md) 或 [GreptimeCloud](/greptimecloud/integrations/otlp.md) 中的 OTLP 集成文档获取 exporter 的相关配置。

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

将 exporter 附加到 MeterProvider 并开始收集 host metrics：

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

请参考 [OpenTelemetry 文档](https://opentelemetry.io/docs/instrumentation/go/) 获取有关代码的更多详细信息。

恭喜你完成了 Demo 的核心部分！现在可以按照 [GitHub 库](https://github.com/GreptimeCloudStarters/quick-start-go)中 `README.md` 文件中的说明运行完整的 Demo。
