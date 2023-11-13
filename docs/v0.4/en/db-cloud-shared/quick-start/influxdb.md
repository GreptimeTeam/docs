
To quickly get started with InfluxDB line protocol, we can use Bash to collect system metrics, such as CPU and memory usage, and send it to GreptimeDB. The source code is avaliable on [GitHub](https://github.com/GreptimeCloudStarters/quick-start-influxdb-line-protocol).

```shell
curl -L https://raw.githubusercontent.com/GreptimeCloudStarters/quick-start-influxdb-line-protocol/main/quick-start.sh | bash -s -- -h <host> -d <dbname> -u <username> -p <password>
```
