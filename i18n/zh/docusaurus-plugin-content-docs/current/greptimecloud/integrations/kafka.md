# Kafka

如果您正在使用 Kafka 或兼容 Kafka 的消息队列来传输可观测性数据，可以直接将数据摄取到 GreptimeDB 中。
在这里，我们使用 Vector 作为工具，将数据从 Kafka 传输到 GreptimeDB。

## Logs

以下是一个示例配置。请注意，您需要创建您的
[Pipeline](https://docs.greptime.com/user-guide/logs/pipeline-config/) 用于日志
解析。

```toml
# sample.toml

[sources.log_mq]
type = "kafka"
group_id = "vector0"
topics = ["test_log_topic"]
bootstrap_servers = "kafka:9092"

[sinks.sink_greptime_logs]
type = "greptimedb_logs"
inputs = [ "log_mq" ]
compression = "gzip"
endpoint = "https://<host>"
dbname = "<dbname>"
username = "<username>"
password = "<password>"
compression = "gzip"
## customize to your own table and pipeline name
table = "demo_logs"
pipeline_name = "demo_pipeline"
```

## Metrics

如果您正在使用 Kafka 传输 InfluxDB 行协议格式的指标数据，您也可以直接导入它。

```toml
# sample.toml

[sources.metrics_mq]
type = "kafka"
group_id = "vector0"
topics = ["test_metric_topic"]
bootstrap_servers = "kafka:9092"
decoding.codec = "influxdb"

[sinks.metrics_in]
inputs = ["metrics_mq"]
type = "greptimedb"
endpoint = "<host>:5001"
dbname = "<dbname>"
username = "<username>"
password = "<password>"
tls = {}
```
