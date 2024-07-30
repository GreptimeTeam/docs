# Vector

## Create Service
<!--@include: ./create-service.md-->

## Write data

The following configuration, written in the `vector.toml` file, collects [host_metrics](https://vector.dev/docs/reference/configuration/sources/host_metrics/) as a Vector source and uses GreptimeDB as the sink destination.

```toml
[sources.in]
type = "host_metrics"
scrape_interval_secs = 30

[sinks.greptime]
inputs = ["in"]
type = "greptimedb"
endpoint = "<host>:4001"
dbname = "<dbname>"
username = "<username>"
password = "<password>"
```

Then start vector with the specified configuration file:

```shell
vector --config vector.toml
```

## Visualize Data
<!--@include: ./visualize-data.md-->
