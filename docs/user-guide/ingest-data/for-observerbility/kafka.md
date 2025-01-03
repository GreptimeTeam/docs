---
keywords: [Kafka, data ingestion, observability, metrics, logs, JSON logs, text logs, Vector, InfluxDB line protocol]
description: Learn how to ingest observability data from Kafka into GreptimeDB using Vector. This guide covers metrics and logs ingestion, including JSON and text log formats, with detailed configuration examples.
---

# Kafka

If you are using Kafka or Kafka-compatible message queue for observability data
transporting, it's possible to ingest data into GreptimeDB directly.

Here we are using Vector as the tool to transport data from Kafka to GreptimeDB.

## Metrics

When ingesting metrics from Kafka into GreptimeDB, messages should be formatted in InfluxDB line protocol. For example:

```txt
census,location=klamath,scientist=anderson bees=23 1566086400000000000
```

Then configure Vector to use the `influxdb` decoding codec to process these messages.

```toml
[sources.metrics_mq]
# Specifies that the source type is Kafka
type = "kafka"
# The consumer group ID for Kafka
group_id = "vector0"
# The list of Kafka topics to consume messages from
topics = ["test_metric_topic"]
# The address of the Kafka broker to connect to
bootstrap_servers = "kafka:9092"
# The `influxdb` means the messages are expected to be in InfluxDB line protocol format.
decoding.codec = "influxdb"

[sinks.metrics_in]
inputs = ["metrics_mq"]
# Specifies that the sink type is `greptimedb_metrics`
type = "greptimedb_metrics"
# The endpoint of the GreptimeDB server.
# Replace <host> with the actual hostname or IP address.
endpoint = "<host>:4001"
dbname = "<dbname>"
username = "<username>"
password = "<password>"
tls = {}
```

For details on how InfluxDB line protocol metrics are mapped to GreptimeDB data, please refer to the [Data Model](/user-guide/ingest-data/for-iot/influxdb-line-protocol.md#data-model) section in the InfluxDB line protocol documentation.


## Logs

Developers commonly work with two types of logs: JSON logs and plain text logs.
Consider the following examples sent from Kafka.

A plain text log:

```txt
127.0.0.1 - - [25/May/2024:20:16:37 +0000] "GET /index.html HTTP/1.1" 200 612 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
```

Or a JSON log:

```json
{
  "timestamp": "2024-12-23T10:00:00Z",
  "level": "INFO",
  "message": "Service started"
}
```

GreptimeDB transforms these logs into structured data with multiple columns and automatically creates the necessary tables.
A pipeline processes the logs into structured data before ingestion into GreptimeDB. Different log formats require different [Pipelines](/user-guide/logs/quick-start.md#write-logs-by-pipeline) for parsing. See the following sections for details.

### Logs with JSON format

For logs in JSON format (e.g., `{"timestamp": "2024-12-23T10:00:00Z", "level": "INFO", "message": "Service started"}`),
you can use the built-in [`greptime_identity`](/user-guide/logs/manage-pipelines.md#greptime_identity) pipeline for direct ingestion.
This pipeline creates columns automatically based on the fields in your JSON log message.

Simply configure Vector's `transforms` settings to parse the JSON message and use the `greptime_identity` pipeline as shown in the following example:

```toml
[sources.logs_in]
type = "kafka"
# The consumer group ID for Kafka
group_id = "vector0"
# The list of Kafka topics to consume messages from
topics = ["test_log_topic"]
# The address of the Kafka broker to connect to
bootstrap_servers = "kafka:9092"

# transform the log to JSON format
[transforms.logs_json]
type = "remap"
inputs = ["logs_in"]
source = '''
. = parse_json!(.message)
'''

[sinks.logs_out]
# Specifies that this sink will receive data from the `logs_json` source
inputs = ["logs_json"]
# Specifies that the sink type is `greptimedb_logs`
type = "greptimedb_logs"
# The endpoint of the GreptimeDB server
endpoint = "http://<host>:4000"
compression = "gzip"
# Replace <dbname>, <username>, and <password> with the actual values
dbname = "<dbname>"
username = "<username>"
password = "<password>"
# The table name in GreptimeDB, if it doesn't exist, it will be created automatically
table = "demo_logs"
# Use the built-in `greptime_identity` pipeline
pipeline_name = "greptime_identity"
```

### Logs with text format

For logs in text format, such as the access log format below, you'll need to create a custom pipeline to parse them:

```
127.0.0.1 - - [25/May/2024:20:16:37 +0000] "GET /index.html HTTP/1.1" 200 612 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
```

#### Create a pipeline

To create a custom pipeline,
please refer to the [Create Pipeline](/user-guide/logs/quick-start.md#create-a-pipeline)
and [Pipeline Configuration](/user-guide/logs/pipeline-config.md) documentation for detailed instructions.

#### Ingest data

After creating the pipeline, configure it to the `pipeline_name` field in the Vector configuration file.

```toml
# sample.toml
[sources.log_mq]
# Specifies that the source type is Kafka
type = "kafka"
# The consumer group ID for Kafka
group_id = "vector0"
# The list of Kafka topics to consume messages from
topics = ["test_log_topic"]
# The address of the Kafka broker to connect to
bootstrap_servers = "kafka:9092"

[sinks.sink_greptime_logs]
# Specifies that the sink type is `greptimedb_logs`
type = "greptimedb_logs"
# Specifies that this sink will receive data from the `log_mq` source
inputs = [ "log_mq" ]
# Use `gzip` compression to save bandwidth
compression = "gzip"
# The endpoint of the GreptimeDB server
# Replace <host> with the actual hostname or IP address
endpoint = "http://<host>:4000"
dbname = "<dbname>"
username = "<username>"
password = "<password>"
# The table name in GreptimeDB, if it doesn't exist, it will be created automatically
table = "demo_logs"
# The custom pipeline name that you created
pipeline_name = "your_custom_pipeline"
```

## Demo

For a runnable demo of data transformation and ingestion, please refer to the [Kafka Ingestion Demo](https://github.com/GreptimeTeam/demo-scene/tree/main/kafka-ingestion).

