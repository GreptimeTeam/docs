# Vector

[Vector](https://vector.dev/) is a high-performance observability data pipeline that puts organizations in control of their observability data. Our integration page on Vector is [here](https://vector.dev/docs/reference/configuration/sinks/greptimedb/).

## Integration

<!--@include: ../../db-cloud-shared/clients/vector-integration.md-->

GreptimeDB uses gRPC to communicate with Vector, so the default port for the Vector sink is `4001`.
If you have changed the default gRPC port when starting GreptimeDB with [custom configurations](../operations/configuration.md#configuration-file), use your own port instead.

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
