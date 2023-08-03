### Prerequisites

* [Node.js](https://nodejs.org/en/download)
* [TypeScript](https://www.typescriptlang.org/download)
* [npx](https://www.npmjs.com/package/npx)


### Example Application

Now we will create a quick start demo step by step to collect host metrics and send them to Greptime. The demo is based on [OTLP/HTTP](https://opentelemetry.io/). For reference, you can view the complete demo on [Github](https://github.com/GreptimeCloudStarters/quick-start-node-js).

To begin, create a new directory named `quick-start-node-js` to house our project. Then set up an empty `package.json` in a new directory:

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

After the packages installed, create a new file named `app.ts` and add the following:

```typescript
#!/usr/bin/env node

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

import {OTLPMetricExporter} from "@opentelemetry/exporter-metrics-otlp-proto";
import {PeriodicExportingMetricReader, MeterProvider} from "@opentelemetry/sdk-metrics";
import {HostMetrics} from '@opentelemetry/host-metrics';

function main() {
    var argv = require('minimist')(process.argv.slice(2));
    const dbHost = argv.host
    const db = argv.db
    const username = argv.username
    const password = argv.password

    const auth = Buffer.from(`${username}:${password}`).toString('base64')

    const metricReader = new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            url: `https://${dbHost}/v1/otlp/v1/metrics`,
            headers: {
                Authorization: `Basic ${auth}`,
                "x-greptime-db-name": db,
            },
            timeoutMillis: 5000,
        }),
        exportIntervalMillis: 2000,
    })

    const meterProvider = new MeterProvider();
    meterProvider.addMetricReader(metricReader);
    const hostMetrics = new HostMetrics({ meterProvider, name: 'quick-start-demo-node' });
    hostMetrics.start();
    console.log('Sending metrics...')
    setInterval(() => {}, 1000);
}

if (require.main === module) {
    main();
}
```

The code above utilizes the `@opentelemetry/host-metrics` package to collect host metrics and the `@opentelemetry/exporter-metrics-otlp-proto` package to send the metrics to Greptime. It defines a `main` function that uses the `minimist` package to parse command-line arguments and extract the values of the database host address, database name, username, and password.

The function also creates a `PeriodicExportingMetricReader` that periodically exports metrics to Greptime. It constructs an authorization header using the command-line arguments when exporting metrics to Greptime.
For more details about the code, you can refer to the [OpenTelemetry Documentation](https://opentelemetry.io/docs/instrumentation/js/getting-started/nodejs/).

Now we can run the application like this:

```shell
npx ts-node app.ts --host=<host> --db=<dbname> --username=<username> --password=<password>
```
