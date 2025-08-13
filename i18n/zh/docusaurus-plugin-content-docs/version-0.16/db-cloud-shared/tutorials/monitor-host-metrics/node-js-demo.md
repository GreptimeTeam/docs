### 准备

- [Node.js](https://nodejs.org/en/download)
- [TypeScript](https://www.typescriptlang.org/download)
- [npx](https://www.npmjs.com/package/npx)

### 示例 Demo

在本节中，我们将创建一个快速开始的 Demo，并展示收集 host 指标并发送到 GreptimeDB 的核心代码。该 Demo 基于[OTLP/HTTP](https://opentelemetry.io/)。你可以在 [GitHub](https://github.com/GreptimeCloudStarters/quick-start-node-js) 上获取整个 Demo 以作参考。

首先，创建一个名为 `quick-start-node-js` 的新目录来托管我们的项目，然后在根目录中创建 `package.json` 文件：

```shell
npm init -y
```

安装依赖：

```shell
npm install @opentelemetry/api@1.4.1 \
    @opentelemetry/exporter-metrics-otlp-proto@0.41.0 \
    @opentelemetry/host-metrics@0.33.0 \
    @opentelemetry/sdk-metrics@1.15.0 \
    minimist@1.2.8
```

成功安装依赖后，创建一个名为 `app.ts` 的文件，并编写代码创建一个 metric exporter 对象，将 metrics 发送到 GreptimeDB。
请参考 [GreptimeDB](/user-guide/protocols/opentelemetry.md) 或 [GreptimeCloud](/greptimecloud/integrations/otlp.md) 中的 OTLP 集成文档获取 exporter 的相关配置。

```ts
const exporter = new OTLPMetricExporter({
  url: `https://${dbHost}/v1/otlp/v1/metrics`,
  headers: {
    Authorization: `Basic ${auth}`,
    'X-Greptime-DB-Name': db,
  },
  timeoutMillis: 5000,
})
```

将 exporter 附加到 MeterProvider 并开始收集 host metrics：

```ts
const metricReader = new PeriodicExportingMetricReader({
  exporter: exporter,
  exportIntervalMillis: 2000,
})

const meterProvider = new MeterProvider()
meterProvider.addMetricReader(metricReader)
const hostMetrics = new HostMetrics({ meterProvider, name: 'quick-start-demo-node' })
hostMetrics.start()
```

请参考 [OpenTelemetry 文档](https://opentelemetry.io/docs/instrumentation/js/getting-started/nodejs/) 获取有关代码的更多详细信息。

恭喜你完成了 Demo 的核心部分！现在可以按照 [GitHub 库](https://github.com/GreptimeCloudStarters/quick-start-node-js)中 `README.md` 文件中的说明运行完整的 Demo。
