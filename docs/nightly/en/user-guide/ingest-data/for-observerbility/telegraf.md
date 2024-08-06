# Telegraf

GreptimeDB's support for the [InfluxDB line protocol](../for-iot/influxdb-line-protocol.md) ensures its compatibility with Telegraf.
To configure Telegraf, simply add GreptimeDB URL into Telegraf configurations:

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

