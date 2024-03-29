Vector 是高性能的可观测数据管道。
它原生支持 GreptimeDB 指标数据接收端。
通过 Vector，你可以从各种来源接收指标数据，包括 Prometheus、OpenTelemetry、StatsD 等。
GreptimeDB 可以作为 Vector 的 Sink 组件来接收指标数据。

{template toml-config%%}

启动 Vector:

```
vector -c sample.toml
```

请前往 [Vector GreptimeDB Configuration](https://vector.dev/docs/reference/sinks/greptimedb/) 查看更多配置项。

{template data-model%%}
