
Run the following command with Python 3.10+ to collect system metric data, such as CPU and memory usage, and sends it to GreptimeCloud. Once sent successfully, the metrics can be viewed on the GreptimeCloud dashboard.

```shell
pipx run --no-cache greptime-cloud-quick-start -host <host> -db <dbname> -u <username> -p <password>
```

This demo is based on OpenTelemetry OTLP/http. The source code is available on [Github](https://github.com/GreptimeCloudStarters/quick-start-node-python).

:::tip
[pipx](https://pypa.github.io/pipx/) is a tool to help you install and run end-user applications written in Python.
:::
