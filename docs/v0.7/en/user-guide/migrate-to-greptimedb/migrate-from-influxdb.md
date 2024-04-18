# Migrate from InfluxDB

GreptimeDB is compatible with InfluxDB's line protocol format, both v1 and v2.
Which means you can easily migrate from InfluxDB to GreptimeDB.

## Data model in difference

While you are likely familiar with [InfluxDB key concepts](https://docs.influxdata.com/influxdb/v2/reference/key-concepts/), the [data model](../concepts/data-model.md) of GreptimeDB is something new to explore.
Let's start with similarities and differences:

- Both solutions are [schemaless](/user-guide/write-data/overview#automatic-schema-generation), which means there is no need to define a schema before writing data.
- In InfluxDB, a point represents a single data record with a measurement, tag set, field set, and a timestamp. In GreptimeDB, it is represented as a row of data in the time-series table. The table name corresponds to the measurement, and the columns consist of three types: Tag, Field, and Timestamp.
- GreptimeDB uses `TimestampNanosecond` as the data type for timestamp data from the [InfluxDB line protocol API](/user-guide/write-data/influxdb-line).
- GreptimeDB uses `Float64` as the data type for numeric data from the InfluxDB line protocol API.

Let’s consider the following [sample data](https://docs.influxdata.com/influxdb/v2/reference/key-concepts/data-elements/#sample-data) borrowed from InfluxDB docs as an example:

|_time|_measurement|location|scientist|_field|_value|
|---|---|---|---|---|---|
|2019-08-18T00:00:00Z|census|klamath|anderson|bees|23|
|2019-08-18T00:00:00Z|census|portland|mullen|ants|30|
|2019-08-18T00:06:00Z|census|klamath|anderson|bees|28|
|2019-08-18T00:06:00Z|census|portland|mullen|ants|32|

The InfluxDB line protocol format for the above data is:


```shell
census,location=klamath,scientist=anderson bees=23 1566086400000000000
census,location=portland,scientist=mullen ants=30 1566086400000000000
census,location=klamath,scientist=anderson bees=28 1566086760000000000
census,location=portland,scientist=mullen ants=32 1566086760000000000
```

In GreptimeDB data model the above data be represented as the following in `census` table:

```sql
+----------+-----------+------+---------------------+------+
| location | scientist | bees | ts                  | ants |
+----------+-----------+------+---------------------+------+
| klamath  | anderson  |   23 | 2019-08-18 00:00:00 | NULL |
| klamath  | anderson  |   28 | 2019-08-18 00:06:00 | NULL |
| portland | mullen    | NULL | 2019-08-18 00:00:00 |   30 |
| portland | mullen    | NULL | 2019-08-18 00:06:00 |   32 |
+----------+-----------+------+---------------------+------+
```

The schema of `census` table is as following:

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

## Write data

### Prerequisites


## Migrate data

## Query data
