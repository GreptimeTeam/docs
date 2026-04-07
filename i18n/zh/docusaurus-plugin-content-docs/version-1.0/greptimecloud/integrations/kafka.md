---
keywords: [Kafka, 数据传输, 日志数据, 指标数据, 配置示例]
description: 介绍如何使用 Kafka 将数据传输到 GreptimeCloud，并提供了日志和指标数据的配置示例。
---

# Kafka

如果您正在使用 Kafka 或兼容 Kafka 的消息队列来传输可观测性数据，可以直接将数据写入到 GreptimeDB 中。
在这里，我们使用 Vector 作为工具，将数据从 Kafka 传输到 GreptimeDB。

## Logs

以下是一个示例配置。请注意，您需要创建您的
[Pipeline](https://docs.greptime.cn/user-guide/logs/use-custom-pipelines/) 用于日志
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

## 参考文档

请参考[通过 Kafka 写入数据](https://docs.greptime.cn/user-guide/ingest-data/for-observability/kafka)获取数据写入过程的详细信息。

