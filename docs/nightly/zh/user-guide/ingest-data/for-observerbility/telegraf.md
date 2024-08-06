# Telegraf

GreptimeDB 支持 [InfluxDB 行协议](../for-iot/influxdb-line-protocol.md)也意味着 GreptimeDB 与 Telegraf 兼容。
要配置 Telegraf，只需将 GreptimeDB 的 URL 添加到 Telegraf 配置中：

::: code-group

```toml [InfluxDB line protocol v2]
[[outputs.influxdb_v2]]
  urls = ["http://<greptimedb-host>:4000/v1/influxdb"]
  token = "<greptime_user>:<greptimedb_password>"
  bucket = "<db-name>"
  ## Leave empty
  organization = ""
```

```toml [InfluxDB line protocol v1]
[[outputs.influxdb]]
  urls = ["http://<greptimedb-host>:4000/v1/influxdb"]
  database = "<db-name>"
  username = "<greptime_user>"
  password = "<greptimedb_password>"
```

:::

