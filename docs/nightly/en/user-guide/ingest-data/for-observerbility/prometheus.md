# Prometheus

GreptimeDB can be used as long-term storage for Prometheus. Using GreptimeDB as a Prometheus backend is a seamless experience. 

## Remote Write

To configure Prometheus, use the following settings in the [Prometheus configuration file](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration-file) (`prometheus.yml`):

```yaml
remote_write:
- url: http://localhost:4000/v1/prometheus/write?db=public&physical_table=greptime_physical_table
#  basic_auth:
#    username: greptime_user
#    password: greptime_pwd

remote_read:
- url: http://localhost:4000/v1/prometheus/read?db=public
#  basic_auth:
#    username: greptime_user
#    password: greptime_pwd
```

Since Prometheus has built-in support for setting up basic authentication information during the configuration of remote write and read, all you need to do is add your configured username and password to the config YAML file and you're good to go!

:::tip NOTE
Be sure to uncomment `basic_auth` section and replace `greptime_user(username)`, `greptime_pwd(password)` with your own username and password when you enable database authentication. Please refer to client [authentication](../clients/authentication.md).
:::

The `db` parameter in the URL represents the database that we want to write data. It's optional.
By default, the database is `public`.
If you want to write to another database, you can [create a new database](../table-management.md#create-a-database)
and replace `public` with the new database name.


## Data Model

<!-- GreptimeDB automatically groups multiple Prometheus metrics (../clients/prometheus#data-model) into the corresponding logical tables, so you do not need to specify the logical table in the URL of `remote_write`. -->

Data in GreptimeDB is organized as tables, which can be thought of as groups of columns. There are three types of columns: Time Index, Primary Key, and non of both. When mapping to Prometheus, Time Index is the timestamp, Primary Key is the tag (or label) and the rest are values. Hence, GreptimeDB can be thought of as a multi-value data model, one table is a group of multiple Prometheus metrics. For example:

![Data Model](/PromQL-multi-value-data-model.png)

When the metrics are written into GreptimeDB by remote write endpoint, they will be transformed as
follows:

| Sample Metrics | In GreptimeDB               | GreptimeDB Data Types |
| :------------- | :-------------------------- | :-------------------- |
| Name           | Table (Auto-created) Name   | String                |
| Value          | Column (greptime_value)     | Double                |
| Timestamp      | Column (greptime_timestamp) | Timestamp             |
| Label          | Column                      | String                |

 A primary key with all label columns will be created automatically. When a new label is added, it
 will be added into primary key automatically too.

 Example: Prometheus metrics in GreptimeDB Table

```txt
prometheus_remote_storage_samples_total{instance="localhost:9090", job="prometheus",
remote_name="648f0c", url="http://localhost:4000/v1/prometheus/write"} 500
```

This example will be transformed as a row in the table `prometheus_remote_storage_samples_total`：

| Column             | Value                                       | Column  Data  Type |
| :----------------- | :------------------------------------------ | :----------------- |
| instance           | localhost:9090                              | String             |
| job                | prometheus                                  | String             |
| remote_name        | 648f0c                                      | String             |
| url                | `http://localhost:4000/v1/prometheus/write` | String             |
| greptime_value     | 500                                         | Double             |
| greptime_timestamp | The sample's unix timestamp                 | Timestamp          |


## Improve efficiency by using metric engine

The optional `physical_table` parameter in the URL represents the [physical table](/contributor-guide/datanode/metric-engine#physical-table),
which reduces storage overhead for small tables and improves columnar compression efficiency.
If unspecified, the `greptime_physical_table` is used by default;
if the specified physical table does not exist, it will be automatically created.

The `physical_table` parameter only works when the [`with_metric_engine`](/user-guide/operations/configuration.md#protocol-options) is enabled in the configuration file.
It is enabled by default.

Here is a table of URL parameters:

| Param          | Required | Default Value           |
| -------------- | -------- | ----------------------- |
| db             | optional | public                  |
| physical_table | optional | greptime_physical_table |

Show tables when writing successfully:

```sql
show tables;
```

```sql
+---------------------------------------------------------------+
| Tables                                                        |
+---------------------------------------------------------------+
| go_memstats_heap_inuse_bytes                                  |
| go_memstats_last_gc_time_seconds                              |
| net_conntrack_listener_conn_closed_total                      |
| prometheus_remote_storage_enqueue_retries_total               |
| prometheus_remote_storage_exemplars_pending                   |
| prometheus_remote_storage_read_request_duration_seconds_count |
| prometheus_rule_group_duration_seconds                        |
| prometheus_rule_group_duration_seconds_count                  |
| ......                                                        |
+---------------------------------------------------------------+
```

## A note for VictoriaMetrics remote write

VictoriaMetrics slightly modified Prometheus remote write protocol for better
compression. The protocol is automatically enabled when you are using `vmagent`
to send data to a compatible backend.

GreptimeDB has this variant supported, too. Just configure GreptimeDB's remote
write url for `vmagent`. For example, if you have  GreptimeDB installed locally:

```shell
vmagent -remoteWrite.url=http://localhost:4000/v1/prometheus/write
```
