
Run the following command with Python 3.10+ to collect system metric data, such as CPU and memory usage, and sends it to GreptimeCloud. Once sent successfully, the metrics can be viewed on the GreptimeCloud dashboard.

```shell
pipx run --no-cache greptime-cloud-quick-start -host <host> -db <dbname> -u <username> -p <password>
```

This command line is supported by a [quick start demo](https://github.com/GreptimeCloudStarters/quick-start-python), which uses OpenTelemetry Protocol to export metrics.
