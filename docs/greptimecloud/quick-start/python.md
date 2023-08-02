
Run the following command with Python 3.10+ to collect system metric data, such as CPU and memory usage, and sends it to GreptimeCloud. Once sent successfully, the metrics can be viewed on the GreptimeCloud dashboard.

```shell
pipx run --no-cache greptime-cloud-quick-start -host <host> -db <dbname> -u <username> -p <password>
```

The command line is supported by a quick start demo based on OTLP/http. The source code is available on [Github](https://github.com/GreptimeCloudStarters/quick-start-python).
