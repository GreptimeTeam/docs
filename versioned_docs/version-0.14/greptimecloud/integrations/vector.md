---
keywords: [Vector, GreptimeCloud, metrics ingestion, logs ingestion, data pipeline]
description: Guide for using Vector with GreptimeCloud, including configuration for metrics and logs ingestion, and running Vector with a sample configuration.
---

# Vector

Vector is [a high performance observability data
pipeline](https://vector.dev). It has native support for GreptimeDB as data
sink. With vector, you can ingest metrics and log data from various sources.

To use Vector with GreptimeCloud, we recommend version `0.41` and above.
A minimal configuration of when using your GreptimeCloud instance can be:

```toml
# sample.toml

## metrics
[sources.metrics_in]
type = "host_metrics"

[sinks.metrics_out]
inputs = ["metrics_in"]
type = "greptimedb"
endpoint = "<host>:5001"
dbname = "<dbname>"
username = "<username>"
password = "<password>"
tls = {}
new_naming = true

## logs
[sources.logs_in]
type = "demo_logs"
format = "json"

[transforms.logs_json]
type = "remap"
inputs = ["logs_in"]
source = '''
. = parse_json!(.message)
'''

[sinks.logs_out]
inputs = ["logs_json"]
type = "greptimedb_logs"
endpoint = "https://<host>"
compression = "gzip"
dbname = "<dbname>"
username = "<username>"
password = "<password>"
table = "demo_logs"
pipeline_name = "greptime_identity"
```

Execute Vector with:

```
vector -c sample.toml
```

For more configuration options, see [Vector GreptimeDB
Configuration](https://vector.dev/docs/reference/sinks/greptimedb/).
