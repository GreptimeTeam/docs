# Vector

Vector 是高性能的可观测数据管道。
它原生支持 GreptimeDB 指标数据接收端。
通过 Vector，你可以从各种来源接收指标数据，包括 Prometheus、OpenTelemetry、StatsD 等。
GreptimeDB 可以作为 Vector 的 Sink 组件来接收指标数据。

要在 GreptimeCloud 中使用 Vector，你需要使用 Vector 版本 `0.37` 及以上。
当使用你的 GreptimeCloud 实例时，最小配置可以是：

```toml
# sample.toml

[sources.in]
type = "host_metrics"

[sinks.my_sink_id]
inputs = ["in"]
type = "greptimedb"
endpoint = "<host>:5001"
dbname = "<dbname>"
username = "<username>"
password = "<password>"
tls = {}
```

启动 Vector:

```
vector -c sample.toml
```

请前往 [Vector GreptimeDB Configuration](https://vector.dev/docs/reference/sinks/greptimedb/) 查看更多配置项。
