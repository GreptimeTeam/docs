# Vector

Vector is [a high performance observability data
pipeline](https://vector.dev). It has native support for GreptimeDB metrics data
sink. With vector, you can ingest metrics data from various sources, including
Prometheus, OpenTelemetry, StatsD and many more.
GreptimeDB can be used as a Vector Sink component to receive metrics. 

To use Vector with GreptimeCloud, you need its version `0.37` and above.
A minimal configuration of when using your GreptimeCloud instance can be:

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

Execute Vector with:

```
vector -c sample.toml
```

For more configuration options, see [Vector GreptimeDB
Configuration](https://vector.dev/docs/reference/sinks/greptimedb/).

