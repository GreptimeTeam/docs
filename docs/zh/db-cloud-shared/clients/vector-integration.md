
GreptimeDB 可以作为 Vector Sink 组件用于接收 metrics，请使用以下配置集成 Vector：

```toml
[sinks.my_sink_id]
inputs = ["my-source-or-transform-id"]
type = "greptimedb"
endpoint = "<host>:4001"
dbname = "<dbName>"
username = "<username>"
password = "Your database password of GreptimeDB"
```

请前往 [Vector GreptimeDB Configuration](https://vector.dev/docs/reference/sinks/greptimedb/) 查看更多配置项。
