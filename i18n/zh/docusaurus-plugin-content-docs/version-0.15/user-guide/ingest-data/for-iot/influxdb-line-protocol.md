---
keywords: [InfluxDB Line Protocol, 数据写入, Telegraf 集成, 数据模型, 鉴权]
description: 详细介绍如何使用 InfluxDB Line Protocol 将数据写入 GreptimeDB，包括协议、鉴权、Telegraf 集成和数据模型映射。
---

# InfluxDB Line Protocol

GreptimeDB 支持 HTTP InfluxDB Line 协议。

## 写入新数据

### 协议

#### Post 指标

你可以通过 `/influxdb/write` API 写入数据。
以下是一个示例：

<Tabs>

<TabItem value="InfluxDB line protocol V2" label="InfluxDB line protocol V2">

```shell
curl -i -XPOST "http://localhost:4000/v1/influxdb/api/v2/write?db=public&precision=ms" \
 -H "authorization: token {{greptime_user:greptimedb_password}}" \
  --data-binary \
  'monitor,host=127.0.0.1 cpu=0.1,memory=0.4 1667446797450
  monitor,host=127.0.0.2 cpu=0.2,memory=0.3 1667446798450
  monitor,host=127.0.0.1 cpu=0.5,memory=0.2 1667446798450'
```
</TabItem>

<TabItem value="InfluxDB line protocol V1" label="InfluxDB line protocol V1">

```shell
curl -i -XPOST "http://localhost:4000/v1/influxdb/write?db=public&precision=ms&u=<greptime_user>&p=<greptimedb_password>" \
--data-binary \
'monitor,host=127.0.0.1 cpu=0.1,memory=0.4 1667446797450
 monitor,host=127.0.0.2 cpu=0.2,memory=0.3 1667446798450
 monitor,host=127.0.0.1 cpu=0.5,memory=0.2 1667446798450'
```
</TabItem>

</Tabs>

`/influxdb/write` 支持查询参数，包括：

* `db`：指定要写入的数据库。默认值为 `public`。
* `precision`：定义请求体中提供的时间戳的精度，可接受的值为 `ns`（纳秒）、`us`（微秒）、`ms`（毫秒）和 `s`（秒），默认值为 `ns`（纳秒）。该 API 写入的时间戳类型为 `TimestampNanosecond`，因此默认精度为 `ns`（纳秒）。如果你在请求体中使用了其他精度的时间戳，需要使用此参数指定精度。该参数确保时间戳能够被准确解释并以纳秒精度存储。

你还可以在发送请求时省略 timestamp，GreptimeDB 将使用主机机器的当前系统时间（UTC 时间）作为 timestamp。例如：

<Tabs>

<TabItem value="InfluxDB line protocol V2" label="InfluxDB line protocol V2">

```shell
curl -i -XPOST "http://localhost:4000/v1/influxdb/api/v2/write?db=public" \
  -H "authorization: token {{greptime_user:greptimedb_password}}" \
  --data-binary \
  'monitor,host=127.0.0.1 cpu=0.1,memory=0.4
  monitor,host=127.0.0.2 cpu=0.2,memory=0.3
  monitor,host=127.0.0.1 cpu=0.5,memory=0.2'
```
</TabItem>

<TabItem value="InfluxDB line protocol V1" label="InfluxDB line protocol V1">

```shell
curl -i -XPOST "http://localhost:4000/v1/influxdb/write?db=public&u=<greptime_user>&p=<greptimedb_password>" \
--data-binary \
'monitor,host=127.0.0.1 cpu=0.1,memory=0.4
 monitor,host=127.0.0.2 cpu=0.2,memory=0.3
 monitor,host=127.0.0.1 cpu=0.5,memory=0.2'
```
</TabItem>

</Tabs>

#### 鉴权

GreptimeDB 与 InfluxDB 的行协议鉴权格式兼容，包括 V1 和 V2。
如果你在 GreptimeDB 中[配置了鉴权](/user-guide/deployments-administration/authentication/overview.md)，需要在 HTTP 请求中提供用户名和密码。

<Tabs>

<TabItem value="InfluxDB line protocol V2" label="InfluxDB line protocol V2">

InfluxDB 的 [V2 协议](https://docs.influxdata.com/influxdb/v1.8/tools/api/?t=Auth+Enabled#apiv2query-http-endpoint) 使用了类似 HTTP 标准 basic 认证方案的格式。

```shell
curl 'http://localhost:4000/v1/influxdb/api/v2/write?db=public' \
    -H 'authorization: token {{username:password}}' \
    -d 'monitor,host=127.0.0.1 cpu=0.1,memory=0.4'
```

</TabItem>

<TabItem value="InfluxDB line protocol V1" label="InfluxDB line protocol V1">

对于 InfluxDB 的 [V1 协议](https://docs.influxdata.com/influxdb/v1.8/tools/api/?t=Auth+Enabled#query-string-parameters-1) 的鉴权格式。在 HTTP 查询字符串中添加 `u` 作为用户和 `p` 作为密码，如下所示：

```shell
curl 'http://localhost:4000/v1/influxdb/write?db=public&u=<username>&p=<password>' \
    -d 'monitor,host=127.0.0.1 cpu=0.1,memory=0.4'
```

</TabItem>
</Tabs>

### Telegraf

GreptimeDB 支持 [InfluxDB 行协议](../for-iot/influxdb-line-protocol.md)也意味着 GreptimeDB 与 Telegraf 兼容。
要配置 Telegraf，只需将 GreptimeDB 的 URL 添加到 Telegraf 配置中：

<Tabs>

<TabItem value="InfluxDB line protocol v2" label="InfluxDB line protocol v2">

```toml
[[outputs.influxdb_v2]]
  urls = ["http://<host>:4000/v1/influxdb"]
  token = "<greptime_user>:<greptimedb_password>"
  bucket = "<db-name>"
  ## Leave empty
  organization = ""
```

</TabItem>

<TabItem value="InfluxDB line protocol v1" label="InfluxDB line protocol v1">

```toml
[[outputs.influxdb]]
  urls = ["http://<host>:4000/v1/influxdb"]
  database = "<db-name>"
  username = "<greptime_user>"
  password = "<greptimedb_password>"
```

</TabItem>

</Tabs>

## 数据模型

你可能已经熟悉了 [InfluxDB 的关键概念](https://docs.influxdata.com/influxdb/v2/reference/key-concepts/)，
GreptimeDB 的[数据模型](/user-guide/concepts/data-model.md) 是值得了解的新事物。
下方解释了 GreptimeDB 和 InfluxDB 数据模型的相似和不同之处：

- 两者都是 [schemaless 写入](/user-guide/ingest-data/overview.md#自动生成表结构)的解决方案，这意味着在写入数据之前无需定义表结构。
- GreptimeDB 的表在自动创建时会设置表选项 [`merge_mode`](/reference/sql/create.md#创建带有-merge-模式的表)为 `last_non_null`。
  这意味着表会通过保留每个字段的最新值来合并具有相同主键和时间戳的行，该行为与 InfluxDB 相同。
- 在 InfluxDB 中，一个点代表一条数据记录，包含一个 measurement、tag 集、field 集和时间戳。
  在 GreptimeDB 中，它被表示为时间序列表中的一行数据。
  表名对应于 measurement，列由三种类型组成：Tag、Field 和 Timestamp。
- GreptimeDB 使用 `TimestampNanosecond` 作为来自 [InfluxDB 行协议 API](/user-guide/ingest-data/for-iot/influxdb-line-protocol.md) 的时间戳数据类型。
- GreptimeDB 使用 `Float64` 作为来自 InfluxDB 行协议 API 的数值数据类型。

以 InfluxDB 文档中的[示例数据](https://docs.influxdata.com/influxdb/v2/reference/key-concepts/data-elements/#sample-data)为例：

|_time|_measurement|location|scientist|_field|_value|
|---|---|---|---|---|---|
|2019-08-18T00:00:00Z|census|klamath|anderson|bees|23|
|2019-08-18T00:00:00Z|census|portland|mullen|ants|30|
|2019-08-18T00:06:00Z|census|klamath|anderson|bees|28|
|2019-08-18T00:06:00Z|census|portland|mullen|ants|32|

上述数据的 InfluxDB 行协议格式为：

```shell
census,location=klamath,scientist=anderson bees=23 1566086400000000000
census,location=portland,scientist=mullen ants=30 1566086400000000000
census,location=klamath,scientist=anderson bees=28 1566086760000000000
census,location=portland,scientist=mullen ants=32 1566086760000000000
```

在 GreptimeDB 数据模型中，上述数据将被表示为 `census` 表中的以下内容：

```sql
+---------------------+----------+-----------+------+------+
| ts                  | location | scientist | bees | ants |
+---------------------+----------+-----------+------+------+
| 2019-08-18 00:00:00 | klamath  | anderson  |   23 | NULL |
| 2019-08-18 00:06:00 | klamath  | anderson  |   28 | NULL |
| 2019-08-18 00:00:00 | portland | mullen    | NULL |   30 |
| 2019-08-18 00:06:00 | portland | mullen    | NULL |   32 |
+---------------------+----------+-----------+------+------+
```

`census` 表结构如下：

```sql
+-----------+----------------------+------+------+---------+---------------+
| Column    | Type                 | Key  | Null | Default | Semantic Type |
+-----------+----------------------+------+------+---------+---------------+
| location  | String               | PRI  | YES  |         | TAG           |
| scientist | String               | PRI  | YES  |         | TAG           |
| bees      | Float64              |      | YES  |         | FIELD         |
| ts        | TimestampNanosecond  | PRI  | NO   |         | TIMESTAMP     |
| ants      | Float64              |      | YES  |         | FIELD         |
+-----------+----------------------+------+------+---------+---------------+
```

## 参考

- [InfluxDB Line protocol](https://docs.influxdata.com/influxdb/v2.7/reference/syntax/line-protocol/)

