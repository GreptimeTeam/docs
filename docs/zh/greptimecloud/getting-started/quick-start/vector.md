
将下方配置写在 `vector.toml` 文件中，配置内容为将 [host_metrics](https://vector.dev/docs/reference/configuration/sources/host_metrics/) 作为 Vector source ，将 GreptimeCloud 作为 Vector sink destination。

```toml
[sources.in]
type = "host_metrics"
scrape_interval_secs = 30

[sinks.cloud]
inputs = ["in"]
type = "greptimedb"
endpoint = "<host>:4001"
dbname = "<dbName>"
username = "<username>"
password = "<password>"
```

然后使用配置文件启动 Vector：

```shell
vector --config vector.toml
```
