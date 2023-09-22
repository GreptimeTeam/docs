
GreptimeDB can be used as a Vector Sink component to receive metrics. To integrate Vector with GreptimeDB, use the following configuration:

```toml
[sinks.my_sink_id]
inputs = ["my-source-or-transform-id"]
type = "greptimedb"
endpoint = "<host>:4001"
dbname = "<dbname>"
username = "<username>"
password = "Your database password of GreptimeDB"
```

For more configuration options, see [Vector GreptimeDB Configuration](https://vector.dev/docs/reference/sinks/greptimedb/).
