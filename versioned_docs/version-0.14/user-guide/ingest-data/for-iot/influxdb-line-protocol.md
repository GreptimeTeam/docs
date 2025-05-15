---
keywords: [InfluxDB Line Protocol, HTTP API, data ingestion, Telegraf integration, data model, authentication]
description: Guide on using InfluxDB Line Protocol to ingest data into GreptimeDB, including examples, authentication, Telegraf integration, and data model differences.
---

# InfluxDB Line Protocol

GreptimeDB supports HTTP InfluxDB Line protocol.

## Ingest data

### Protocols

#### Post metrics

You can write data to GreptimeDB using the `/influxdb/write` API.
Here's an example of how to use this API:

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

The `/influxdb/write` supports query params including:

* `db`: Specifies the database to write to. The default value is `public`.
* `precision`: Defines the precision of the timestamp provided in the request body.  Accepted values are `ns` (nanoseconds), `us` (microseconds), `ms` (milliseconds), and `s` (seconds). The data type of timestamps written by this API is `TimestampNanosecond`, so the default precision is `ns` (nanoseconds). If you use timestamps with other precisions in the request body, you need to specify the precision using this parameter. This parameter ensures that timestamp values are accurately interpreted and stored with nanosecond precision.

You can also omit the timestamp when sending requests. GreptimeDB will use the current system time (in UTC) of the host machine as the timestamp. For example:

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

#### Authentication

GreptimeDB is compatible with InfluxDB's line protocol authentication format, both V1 and V2.
If you have [configured authentication](/user-guide/deployments/authentication/overview.md) in GreptimeDB, you need to provide the username and password in the HTTP request.

<Tabs>

<TabItem value="InfluxDB line protocol V2" label="InfluxDB line protocol V2">

InfluxDB's [V2 protocol](https://docs.influxdata.com/influxdb/v1.8/tools/api/?t=Auth+Enabled#apiv2query-http-endpoint) uses a format much like HTTP's standard basic authentication scheme.

```shell
curl 'http://localhost:4000/v1/influxdb/api/v2/write?db=public' \
    -H 'authorization: token {{username:password}}' \
    -d 'monitor,host=127.0.0.1 cpu=0.1,memory=0.4'
```

</TabItem>

<TabItem value="InfluxDB line protocol V1" label="InfluxDB line protocol V1">

For the authentication format of InfluxDB's [V1 protocol](https://docs.influxdata.com/influxdb/v1.8/tools/api/?t=Auth+Enabled#query-string-parameters-1). Add `u` for user and `p` for password to the HTTP query string as shown below:

```shell
curl 'http://localhost:4000/v1/influxdb/write?db=public&u=<username>&p=<password>' \
    -d 'monitor,host=127.0.0.1 cpu=0.1,memory=0.4'
```

</TabItem>
</Tabs>

### Telegraf

GreptimeDB's support for the [InfluxDB line protocol](../for-iot/influxdb-line-protocol.md) ensures its compatibility with Telegraf.
To configure Telegraf, simply add GreptimeDB URL into Telegraf configurations:

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

## Data model

While you may already be familiar with [InfluxDB key concepts](https://docs.influxdata.com/influxdb/v2/reference/key-concepts/), the [data model](/user-guide/concepts/data-model.md) of GreptimeDB is something new to explore.
Here are the similarities and differences between the data models of GreptimeDB and InfluxDB:

- Both solutions are [schemaless](/user-guide/ingest-data/overview.md#automatic-schema-generation), eliminating the need to define a schema before writing data.
- The GreptimeDB table is automatically created with the [`merge_mode` option](/reference/sql/create.md#create-a-table-with-merge-mode) set to `last_non_null`.
That means the table merges rows with the same tags and timestamp by keeping the latest value of each field, which is the same behavior as InfluxDB.
- In InfluxDB, a point represents a single data record with a measurement, tag set, field set, and a timestamp.
In GreptimeDB, it is represented as a row of data in the time-series table,
where the table name aligns with the measurement,
and the columns are divided into three types: Tag, Field, and Timestamp.
- GreptimeDB uses `TimestampNanosecond` as the data type for timestamp data from the [InfluxDB line protocol API](/user-guide/ingest-data/for-iot/influxdb-line-protocol.md).
- GreptimeDB uses `Float64` as the data type for numeric data from the InfluxDB line protocol API.

Consider the following [sample data](https://docs.influxdata.com/influxdb/v2/reference/key-concepts/data-elements/#sample-data) borrowed from InfluxDB docs as an example:

|_time|_measurement|location|scientist|_field|_value|
|---|---|---|---|---|---|
|2019-08-18T00:00:00Z|census|klamath|anderson|bees|23|
|2019-08-18T00:00:00Z|census|portland|mullen|ants|30|
|2019-08-18T00:06:00Z|census|klamath|anderson|bees|28|
|2019-08-18T00:06:00Z|census|portland|mullen|ants|32|

The data mentioned above is formatted as follows in the InfluxDB line protocol:


```shell
census,location=klamath,scientist=anderson bees=23 1566086400000000000
census,location=portland,scientist=mullen ants=30 1566086400000000000
census,location=klamath,scientist=anderson bees=28 1566086760000000000
census,location=portland,scientist=mullen ants=32 1566086760000000000
```

In the GreptimeDB data model, the data is represented as follows in the `census` table:

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

The schema of the `census` table is as follows:

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

## Reference

- [InfluxDB Line protocol](https://docs.influxdata.com/influxdb/v2.7/reference/syntax/line-protocol/)

