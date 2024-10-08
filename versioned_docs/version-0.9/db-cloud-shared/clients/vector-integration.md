
Vector is [a high performance observability data
pipeline](https://vector.dev). It has native support for GreptimeDB metrics data
sink. With vector, you can ingest metrics data from various sources, including
Prometheus, OpenTelemetry, StatsD and many more.
GreptimeDB can be used as a Vector Sink component to receive metrics. 

<InjectContent id="toml-config" content={props.children}/>

Execute Vector with:

```
vector -c sample.toml
```

For more configuration options, see [Vector GreptimeDB
Configuration](https://vector.dev/docs/reference/sinks/greptimedb/).

<InjectContent id="data-model" content={props.children}/>
