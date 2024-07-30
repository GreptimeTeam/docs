import DocTemplate from './../../db-cloud-shared/clients/vector-integration.md' 


# Vector

<DocTemplate>

<div id="toml-config">

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

</div>

</DocTemplate>
