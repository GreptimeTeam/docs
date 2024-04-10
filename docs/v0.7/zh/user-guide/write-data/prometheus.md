# Prometheus

GreptimeDB 可以作为 Prometheus 的长期存储。使用 GreptimeDB 作为 Prometheus 的后端存储可以获得无缝体验。由于 Prometheus 支持在配置远程写和读的过程中设置基本的认证信息，你只需要把配置的用户名和密码添加到配置 YAML 文件中就可以了。

请按照 [Prometheus configuration](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration-file) (`prometheus.yml`) 中的设置进行配置：

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

:::tip 注意
请将 `greptime_user(username)`, `greptime_pwd(password)` 替换为用户自己的用户名和密码，详情请参考客户端[鉴权认证](../clients/authentication.md)。
:::

url 中的 `db` 参数表示我们要写入的数据库，默认为 `public`。
如果你想要写入到其他数据库，可以[创建新数据库](../table-management.md#create-database)并将 `public` 替换为新的数据库名称。

写入数据成功后，使用下面的命令展示数据库中的表：

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

## GreptimeDB 中的 Prometheus 指标

当指标被远程写入 GreptimeDB 时，它们将被转换为下面这样：

| Sample Metrics | In GreptimeDB                | GreptimeDB Data Types |
|:---------------|:-----------------------------|:----------------------|
| Name           | Table (Auto-created) Name    | String                |
| Value          | Column (greptime_value)     | Double                |
| Timestamp      | Column (greptime_timestamp) | Timestamp             |
| Label          | Column                       | String                |

所有标签列将会被自动创建为主键。当添加新的标签时，它也会自动添加到主键中。

## 举例: GreptimeDB 表中的 Prometheus 指标

```txt
prometheus_remote_storage_samples_total{instance="localhost:9090", job="prometheus",
remote_name="648f0c", url="http://localhost:4000/v1/prometheus/write"} 500
```

上面这个例子将被转化为表 `prometheus_remote_storage_samples_total` 中的一行：

| Column             | Value                                       | Column  Data  Type |
|:-------------------|:--------------------------------------------|:-------------------|
| instance           | localhost:9090                              | String             |
| job                | prometheus                                  | String             |
| remote_name        | 648f0c                                      | String             |
| url                | `http://localhost:4000/v1/prometheus/write` | String             |
| greptime_value     | 500                                         | Double             |
| greptime_timestamp | The sample's unix timestamp                 | Timestamp          |
