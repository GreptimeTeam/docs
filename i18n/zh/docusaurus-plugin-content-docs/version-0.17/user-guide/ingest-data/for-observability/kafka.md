---
keywords: [Kafka, 数据提取, 可观察性, 指标, 日志, JSON 日志, 文本日志, Vector, InfluxDB 行协议]
description: 了解如何使用 Vector 将可观察性数据从 Kafka 写入到 GreptimeDB。本指南涵盖指标和日志提取，包括 JSON 和文本日志格式，并附有详细的配置示例。
---

# Kafka

如果你使用 Kafka 或兼容 Kafka 的消息队列进行可观测性数据传输，可以直接将数据写入到 GreptimeDB 中。

这里我们使用 Vector 作为工具将数据从 Kafka 传输到 GreptimeDB。

## 指标

从 Kafka 写入指标到 GreptimeDB 时，消息应采用 InfluxDB 行协议格式。例如：

```txt
census,location=klamath,scientist=anderson bees=23 1566086400000000000
```

然后配置 Vector 使用 `influxdb` 解码器来处理这些消息。

```toml
[sources.metrics_mq]
# 指定源类型为 Kafka
type = "kafka"
# Kafka 的消费者组 ID
group_id = "vector0"
# 要消费消息的 Kafka 主题列表
topics = ["test_metric_topic"]
# 要连接的 Kafka 地址
bootstrap_servers = "kafka:9092"
# `influxdb` 表示消息应采用 InfluxDB 行协议格式
decoding.codec = "influxdb"

[sinks.metrics_in]
inputs = ["metrics_mq"]
# 指定接收器类型为 `greptimedb_metrics`
type = "greptimedb_metrics"
# GreptimeDB 服务器的端点
# 将 <host> 替换为实际的主机名或 IP 地址
endpoint = "<host>:4001"
dbname = "<dbname>"
username = "<username>"
password = "<password>"
tls = {}
```

有关 InfluxDB 行协议指标如何映射到 GreptimeDB 数据的详细信息，请参阅 InfluxDB 行协议文档中的[数据模型](/user-guide/ingest-data/for-iot/influxdb-line-protocol.md#数据模型)部分。

## 日志

开发人员通常处理两种类型的日志：JSON 日志和纯文本日志。
例如以下从 Kafka 发送的日志示例。

纯文本日志：

```txt
127.0.0.1 - - [25/May/2024:20:16:37 +0000] "GET /index.html HTTP/1.1" 200 612 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
```

或 JSON 日志：

```json
{
  "timestamp": "2024-12-23T10:00:00Z",
  "level": "INFO",
  "message": "Service started"
}
```

GreptimeDB 将这些日志转换为具有多个列的结构化数据，并自动创建必要的表。
Pipeline 在写入到 GreptimeDB 之前将日志处理为结构化数据。
不同的日志格式需要不同的 [Pipeline](/user-guide/logs/quick-start.md#write-logs-by-pipeline) 来解析，详情请继续阅读下面的内容。

### JSON 格式的日志

对于 JSON 格式的日志（例如 `{"timestamp": "2024-12-23T10:00:00Z", "level": "INFO", "message": "Service started"}`），
你可以使用内置的 [`greptime_identity`](/user-guide/logs/manage-pipelines.md#greptime_identity) pipeline 直接写入日志。
此 pipeline 根据 JSON 日志消息中的字段自动创建列。

你只需要配置 Vector 的 `transforms` 设置以解析 JSON 消息，并使用 `greptime_identity` pipeline，如以下示例所示：

```toml
[sources.logs_in]
type = "kafka"
# Kafka 的消费者组 ID
group_id = "vector0"
# 要消费消息的 Kafka 主题列表
topics = ["test_log_topic"]
# 要连接的 Kafka 代理地址
bootstrap_servers = "kafka:9092"

# 将日志转换为 JSON 格式
[transforms.logs_json]
type = "remap"
inputs = ["logs_in"]
source = '''
. = parse_json!(.message)
'''

[sinks.logs_out]
# 指定此接收器将接收来自 `logs_json` 源的数据
inputs = ["logs_json"]
# 指定接收器类型为 `greptimedb_logs`
type = "greptimedb_logs"
# GreptimeDB 服务器的端点
endpoint = "http://<host>:4000"
compression = "gzip"
# 将 <dbname>、<username> 和 <password> 替换为实际值
dbname = "<dbname>"
username = "<username>"
password = "<password>"
# GreptimeDB 中的表名，如果不存在，将自动创建
table = "demo_logs"
# 使用内置的 `greptime_identity` 管道
pipeline_name = "greptime_identity"
```

### 文本格式的日志

对于文本格式的日志，例如下面的访问日志格式，你需要创建自定义 pipeline 来解析它们：

```
127.0.0.1 - - [25/May/2024:20:16:37 +0000] "GET /index.html HTTP/1.1" 200 612 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
```

#### 创建 pipeline

要创建自定义 pipeline，
请参阅[创建 pipeline](/user-guide/logs/quick-start.md#创建-pipeline) 和 [pipeline 配置](/user-guide/logs/pipeline-config.md)文档获取详细说明。

#### 写入数据

创建 pipeline 后，将其配置到 Vector 配置文件中的 `pipeline_name` 字段。

```toml
# sample.toml
[sources.log_mq]
# 指定源类型为 Kafka
type = "kafka"
# Kafka 的消费者组 ID
group_id = "vector0"
# 要消费消息的 Kafka 主题列表
topics = ["test_log_topic"]
# 要连接的 Kafka 地址
bootstrap_servers = "kafka:9092"

[sinks.sink_greptime_logs]
# 指定接收器类型为 `greptimedb_logs`
type = "greptimedb_logs"
# 指定此接收器将接收来自 `log_mq` 源的数据
inputs = [ "log_mq" ]
# 使用 `gzip` 压缩以节省带宽
compression = "gzip"
# GreptimeDB 服务器的端点
# 将 <host> 替换为实际的主机名或 IP 地址
endpoint = "http://<host>:4000"
dbname = "<dbname>"
username = "<username>"
password = "<password>"
# GreptimeDB 中的表名，如果不存在，将自动创建
table = "demo_logs"
# 你创建的自定义管道名称
pipeline_name = "your_custom_pipeline"
```

## Demo

有关数据转换和写入的可运行演示，请参阅 [Kafka Ingestion Demo](https://github.com/GreptimeTeam/demo-scene/tree/main/kafka-ingestion)。

