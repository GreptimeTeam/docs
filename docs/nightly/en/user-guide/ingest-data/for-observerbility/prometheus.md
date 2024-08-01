# Prometheus

GreptimeDB can serve as a long-term storage solution for Prometheus,
providing a seamless integration experience.

## Remote write configuration

To configure Prometheus with GreptimeDB,
update your [Prometheus configuration file](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration-file) (`prometheus.yml`) as follows:

```yaml
remote_write:
- url: http://localhost:4000/v1/prometheus/write?db=public
# Uncomment and set credentials if authentication is enabled
#  basic_auth:
#    username: greptime_user
#    password: greptime_pwd

remote_read:
- url: http://localhost:4000/v1/prometheus/read?db=public
# Uncomment and set credentials if authentication is enabled
#  basic_auth:
#    username: greptime_user
#    password: greptime_pwd
```

- The host and port in the URL represent the GreptimeDB server. In this example, the server is running on `localhost:4000`. You can replace it with your own server address. For the HTTP protocol configuration, please refer to the [protocol options](/user-guide/operations/configuration.md#protocol-options).
- The `db` parameter in the URL represents the database to which we want to write data. It is optional. By default, the database is set to `public`.
- `basic_auth` is the authentication configuration. Fill in the username and password if GreptimeDB authentication is enabled. Please refer to the [authentication document](/user-guide/clients/authentication.md).

## Data Model

In the [data model](/user-guide/concepts/data-model.md) of GreptimeDB, data is organized into tables with columns for tags, time indices, and fields.
GreptimeDB can be thought of as a multi-value data model,
automatically grouping multiple Prometheus metrics into corresponding tables.
This allows for efficient data management and querying.

![Data Model](/PromQL-multi-value-data-model.png)

When the metrics are written into GreptimeDB by remote write endpoint, they will be transformed as
follows:

| Sample Metrics | In GreptimeDB             | GreptimeDB Data Types |
|----------------|---------------------------|-----------------------|
| Name           | Table (Auto-created) Name | String                |
| Value          | Column (Field)            | Double                |
| Timestamp      | Column (Time Index)       | Timestamp             |
| Label          | Column (Tag)              | String                |

For example, the following Prometheus metric:

```txt
prometheus_remote_storage_samples_total{instance="localhost:9090", job="prometheus",
remote_name="648f0c", url="http://localhost:4000/v1/prometheus/write"} 500
```

will be transformed as a row in the table `prometheus_remote_storage_samples_total`：

| Column             | Value                                       | Column  Data  Type |
| :----------------- | :------------------------------------------ | :----------------- |
| instance           | localhost:9090                              | String             |
| job                | prometheus                                  | String             |
| remote_name        | 648f0c                                      | String             |
| url                | `http://localhost:4000/v1/prometheus/write` | String             |
| greptime_value     | 500                                         | Double             |
| greptime_timestamp | The sample's unix timestamp                 | Timestamp          |


## Improve efficiency by using metric engine

The Prometheus remote writing always creates a large number of small tables,
referred to as logical tables in GreptimeDB.
However, having a large number of small tables can be inefficient for both data storage and query performance.
To address this, GreptimeDB introduces the metric engine feature,
which stores the data represented by the logical tables in a single physical table.
This approach reduces storage overhead and improves columnar compression efficiency.

The metric engine is enabled by default in GreptimeDB,
and you don't need to specify any additional configuration.
By default, the physical table used is called `greptime_physical_table`.
If you want to use a specific physical table, you can specify the `physical_table` parameter in the remote write URL.
If the specified physical table doesn't exist, it will be automatically created.

```yaml
remote_write:
- url: http://localhost:4000/v1/prometheus/write?db=public&physical_table=greptime_physical_table
```


Data is stored in the physical table,
while queries are performed on logical tables to provide an intuitive view from a metric perspective.
For instance, when successfully writing data, you can use the following command to display the logical tables:

```sql
show tables;
```

```sql
+---------------------------------------------------------------+
| Tables                                                        |
+---------------------------------------------------------------+
| prometheus_remote_storage_enqueue_retries_total               |
| prometheus_remote_storage_exemplars_pending                   |
| prometheus_remote_storage_read_request_duration_seconds_count |
| prometheus_rule_group_duration_seconds                        |
| ......                                                        |
+---------------------------------------------------------------+
```

## VictoriaMetrics remote write

VictoriaMetrics slightly modified Prometheus remote write protocol for better
compression. The protocol is automatically enabled when you are using `vmagent`
to send data to a compatible backend.

GreptimeDB has this variant supported, too. Just configure GreptimeDB's remote
write url for `vmagent`. For example, if you have GreptimeDB installed locally:

```shell
vmagent -remoteWrite.url=http://localhost:4000/v1/prometheus/write
```
