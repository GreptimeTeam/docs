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

Execute Vector with:

```
vector -c sample.toml
```

For more configuration options, see [Vector GreptimeDB
Configuration](https://vector.dev/docs/reference/sinks/greptimedb/).
