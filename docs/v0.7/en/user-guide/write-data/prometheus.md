# Prometheus

GreptimeDB can be used as long-term storage for Prometheus. Using GreptimeDB as a Prometheus backend is a seamless experience. Since Prometheus has built-in support for setting up basic authentication information during the configuration of remote write and read, all you need to do is add your configured username and password to the config YAML file and you're good to go!

To configure Prometheus, use the following settings in the [Prometheus configuration file](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration-file) (`prometheus.yml`):

```yaml
remote_write:
- url: http://localhost:4000/v1/prometheus/write?db=public
#  basic_auth:
#    username: greptime_user
#    password: greptime_pwd

remote_read:
- url: http://localhost:4000/v1/prometheus/read?db=public
#  basic_auth:
#    username: greptime_user
#    password: greptime_pwd
```

:::tip NOTE
Be sure to uncomment `basic_auth` section and replace `greptime_user(username)`, `greptime_pwd(password)` with your own username and password when you enable database authentication. Please refer to client [authentication](../clients/authentication.md).
:::

The `db` parameter in the url represents the database that we want to write data.
By default, the database is `public`.
If you want to write to another database, you can [create a new database](../table-management.md#create-database)
and replace `public` with the new database name.

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

## Prometheus Metrics in GreptimeDB

When the metrics are written into GreptimeDB by remote write endpoint, they will be transformed as
follows:

| Sample Metrics | In GreptimeDB                | GreptimeDB Data Types |
|:---------------|:-----------------------------|:----------------------|
| Name           | Table (Auto-created) Name    | String                |
| Value          | Column (greptime_value)     | Double                |
| Timestamp      | Column (greptime_timestamp) | Timestamp             |
| Label          | Column                       | String                |

 A primary key with all label columns will be created automatically. When a new label is added, it
 will be added into primary key automatically too.

## Example: Prometheus metrics in GreptimeDB Table

```txt
prometheus_remote_storage_samples_total{instance="localhost:9090", job="prometheus",
remote_name="648f0c", url="http://localhost:4000/v1/prometheus/write"} 500
```

This example will be transformed as a row in the table `prometheus_remote_storage_samples_total`：

| Column             | Value                                       | Column  Data  Type |
|:-------------------|:--------------------------------------------|:-------------------|
| instance           | localhost:9090                              | String             |
| job                | prometheus                                  | String             |
| remote_name        | 648f0c                                      | String             |
| url                | `http://localhost:4000/v1/prometheus/write` | String             |
| greptime_value     | 500                                         | Double             |
| greptime_timestamp | The sample's unix timestamp                 | Timestamp          |

## A note for VictoriaMetrics remote write

VictoriaMetrics slightly modified Prometheus remote write protocol for better
compression. The protocol is automatically enabled when you are using `vmagent`
to send data to a compatible backend.

GreptimeDB has this variant supported, too. Just configure GreptimeDB's remote
write url for `vmagent`. For example, if you have greptimedb installed locally:

```shell
vmagent -remoteWrite.url=http://localhost:4000/v1/prometheus/write
```
