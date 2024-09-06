### Prerequisites

- [Node.js](https://nodejs.org/en/download)
- [TypeScript](https://www.typescriptlang.org/download)
- [npx](https://www.npmjs.com/package/npx)

### Example Application

In this section, we will create a quick start demo and showcase the core code to collect host metrics and send them to GreptimeDB. The demo is based on [OTLP/HTTP](https://opentelemetry.io/). For reference, you can obtain the entire demo on [GitHub](https://github.com/GreptimeCloudStarters/quick-start-node-js).

To begin, create a new directory named `quick-start-node-js` to host our project. Then set up an empty `package.json` in a new directory:

```shell
npm init -y
```

Next, install dependencies:

```shell
npm install @opentelemetry/api@1.4.1 \
    @opentelemetry/exporter-metrics-otlp-proto@0.41.0 \
    @opentelemetry/host-metrics@0.33.0 \
    @opentelemetry/sdk-metrics@1.15.0 \
    minimist@1.2.8
```

Once the required packages are installed,create a new file named `app.ts` and write the code to create a metric export object that sends metrics to GreptimeDB.
For the configuration about the exporter, please refer to OTLP integration documentation in [GreptimeDB](/user-guide/protocols/opentelemetry.md) or [GreptimeCloud](/greptimecloud/integrations/otlp.md).

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

Then attach the exporter to the MetricReader and start the host metrics collection:

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

For more details about the code, you can refer to the [OpenTelemetry Documentation](https://opentelemetry.io/docs/instrumentation/js/getting-started/nodejs/).

Congratulations on successfully completing the core section of the demo! You can now run the complete demo by following the instructions in the `README.md` file on the [GitHub repository](https://github.com/GreptimeCloudStarters/quick-start-node-js).
