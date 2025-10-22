---
keywords: [Kafka, Vector, logs, metrics, data ingestion]
description: Guide on using Kafka with Vector to ingest logs and metrics data into GreptimeCloud.
---

# Kafka

If you are using Kafka or Kafka-compatible message queue for observability data
transporting, it's possible to ingest data into GreptimeDB directly.

Here we are using Vector as the tool to transport data from Kafka to GreptimeDB.

## Logs

A sample configuration. Note that you will need to [create your
pipeline](https://docs.greptime.com/reference/pipeline/pipeline-config/) for log
parsing.

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

If you are using Kafka to transport metrics data in InfluxDB line protocol
format, you can also ingest it directly.

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

## Reference

For detailed information on the data ingestion process, please refer to the [Ingest Data via Kafka](https://docs.greptime.com/user-guide/ingest-data/for-observability/kafka) guide.

