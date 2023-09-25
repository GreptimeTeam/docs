
为了使用 InfluxDB line protocol 快速开始，我们可以使用 Bash 脚本收集系统指标，例如 CPU 和内存使用情况，并将其发送到 GreptimeCloud。

```shell
curl -L https://raw.githubusercontent.com/GreptimeCloudStarters/quick-start-influxdb-line-protocol/main/quick-start.sh | bash -s -- -h <host> -d <dbname> -u <username> -p <password>
```

源代码位于 [GitHub](https://github.com/GreptimeCloudStarters/quick-start-influxdb-line-protocol).
