
The following command collects system metric data, such as CPU and memory usage, and sends them to GreptimeCloud. Once sent successfully, the metrics can be viewed on the GreptimeCloud dashboard.

```shell
npx greptime-cloud-quick-start --host=<host> --db=<dbname> --username=<username> --password=<password>
```

This demo is based on OpenTelemetry OTLP/http. The source code is available on [Github](https://github.com/GreptimeCloudStarters/quick-start-node-js).
