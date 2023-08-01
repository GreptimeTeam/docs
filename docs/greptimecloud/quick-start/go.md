
The following command collects system metric data, such as CPU and memory usage, and sends it to GreptimeCloud. Once sent successfully, the metrics can be viewed on the GreptimeCloud dashboard.

```shell
go run github.com/GreptimeCloudStarters/quick-start-go@latest -host=<host> -db=<dbname> -username=<username> -password=<password>
```

This command line is supported by a [quick start demo](https://github.com/GreptimeCloudStarters/quick-start-go), which uses OpenTelemetry Protocol to export metrics.
