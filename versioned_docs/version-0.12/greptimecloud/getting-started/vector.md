---
keywords: [Vector, data ingestion, host metrics, configuration, GreptimeCloud]
description: Instructions on creating a service, writing data using Vector, and visualizing data in GreptimeDB.
---

# Vector

## Create Service
import Includecreateservice from './create-service.md'

<Includecreateservice/>

## Write data

The following configuration, written in the `vector.toml` file, collects [host_metrics](https://vector.dev/docs/reference/configuration/sources/host_metrics/) as a Vector source and uses GreptimeDB as the sink destination.

```toml
[sources.in]
type = "host_metrics"
scrape_interval_secs = 30

[sinks.greptime]
inputs = ["in"]
type = "greptimedb"
endpoint = "<host>:5001"
dbname = "<dbname>"
username = "<username>"
password = "<password>"
new_naming = true
tls = {}
```

Then start vector with the specified configuration file:

```shell
vector --config vector.toml
```

## Visualize Data
import Includevisualizedata from './visualize-data.md'

<Includevisualizedata/>
