# Vector

Vector 是高性能的可观测数据管道。
它原生支持 GreptimeDB 指标数据接收端。
通过 Vector，你可以从各种来源接收指标数据，包括 Prometheus、OpenTelemetry、StatsD 等。
GreptimeDB 可以作为 Vector 的 Sink 组件来接收指标数据。

要在 GreptimeCloud 中使用 Vector，你需要使用 Vector 版本 `0.41` 及以上。
当使用你的 GreptimeCloud 实例时，配置可以是：

```toml
# sample.toml

## metrics
[sources.metrics_in]
type = "host_metrics"

[sinks.metrics_in]
inputs = ["metrics_in"]
type = "greptimedb"
endpoint = "<host>:5001"
dbname = "<dbname>"
username = "<username>"
password = "<password>"
tls = {}

## logs
[sources.logs_in]
type = "demo_logs"
format = "json"

[sinks.logs_out]
inputs = ["logs_in"]
type = "greptimedb_logs"
endpoint = "https://<host>"
compression = "gzip"
dbname = "<dbname>"
username = "<username>"
password = "<password>"
table = "demo_logs"
pipeline_name = "demo_pipeline"
```

启动 Vector:

```
vector -c sample.toml
```

请前往 [Vector GreptimeDB Configuration](https://vector.dev/docs/reference/sinks/greptimedb/) 查看更多配置项。
