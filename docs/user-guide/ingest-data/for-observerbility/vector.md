---
keywords: [Vector, integration, configuration, data model, metrics]
description: Instructions for integrating Vector with GreptimeDB, including configuration, data model mapping, and example configurations.
---

import DocTemplate from '../../../db-cloud-shared/clients/vector-integration.md'


# Vector

<DocTemplate>

<div id="toml-config">

## Integration

A minimal configuration of when using your GreptimeDB instance can be:

```toml
# sample.toml

[sources.in]
type = "host_metrics"

[sinks.my_sink_id]
inputs = ["in"]
type = "greptimedb"
endpoint = "<host>:4001"
dbname = "<dbname>"
username = "<username>"
password = "<password>"
new_naming = true
```

GreptimeDB uses gRPC to communicate with Vector, so the default port for the Vector sink is `4001`.
If you have changed the default gRPC port when starting GreptimeDB with [custom configurations](/user-guide/deployments/configuration.md#configuration-file), use your own port instead.

</div>

<div id="data-model">

## Data Model

The following rules are used when storing Vector metrics into GreptimeDB:

- Use `<metric namespace>_<metric name>` as the table name in GreptimeDB, for example, `host_cpu_seconds_total`;
- Use the timestamp of the metric as the time index of GreptimeDB, the column name is `ts`;
- Use the tags of the metric as GreptimeDB tags;
- For Vector metrics which have multiple subtypes:
  - For Counter and Gauge metrics, the values are stored in the `val` column;
  - For Set metrics, the number of data points are stored in the `val` column;
  - For Distribution metrics, the values of each percentile are stored in the `pxx` column, where xx is the percentile, and the `min/max/avg/sum/count` columns are also stored;
  - For AggregatedHistogram metrics, the values of each bucket are stored in the `bxx` column, where xx is the upper limit of the bucket, and the `sum/count` columns are also stored;
  - For AggregatedSummary metrics, the values of each percentile are stored in the `pxx` column, where xx is the percentile, and the `sum/count` columns are also stored;
  - For Sketch metrics, the values of each percentile are stored in the `pxx` column, where xx is the percentile, and the `min/max/avg/sum` columns are also stored;

</div>

</DocTemplate>
