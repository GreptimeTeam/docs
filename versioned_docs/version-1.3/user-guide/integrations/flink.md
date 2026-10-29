---
keywords: [Apache Flink, Flink connector, data ingestion, stream processing, table source, table sink]
description: Write data to GreptimeDB and read bounded tables with the GreptimeDB connector for Apache Flink.
---

# Apache Flink

The [GreptimeDB connector for Apache Flink](https://github.com/GreptimeTeam/flink-connector-greptimedb)
supports:

- Writing insert-only records through Flink SQL, the Table API, or the DataStream API.
- Reading a GreptimeDB table as a bounded source through Flink SQL or the Table API.

The connector requires Java 17 and Apache Flink 2.0.x.

## Install the connector

### Download from Maven Central

For a Maven-based Flink application, add the connector as a dependency:

```xml
<dependency>
  <groupId>io.greptime</groupId>
  <artifactId>flink-connector-greptimedb</artifactId>
  <version>VAR::flinkConnectorVersion</version>
</dependency>
```

For Flink SQL Client or a Flink cluster, download the shaded JAR from
[Maven Central](https://central.sonatype.com/artifact/io.greptime/flink-connector-greptimedb/VAR::flinkConnectorVersion):

```bash
mvn dependency:copy \
  -Dartifact=io.greptime:flink-connector-greptimedb:VAR::flinkConnectorVersion:jar:shaded \
  -DoutputDirectory=/path/to/flink/lib
```

### Build from source

Build the connector from source:

```bash
git clone https://github.com/GreptimeTeam/flink-connector-greptimedb.git
cd flink-connector-greptimedb
mvn package
```

The build creates a shaded JAR under `target/`. Load it when starting the Flink
SQL Client:

```bash
./bin/sql-client.sh embedded \
  -j /path/to/flink-connector-greptimedb-*-shaded.jar
```

## Write data with Flink SQL

Create the destination table in GreptimeDB before writing data:

```sql
CREATE TABLE cpu_metrics (
  ts TIMESTAMP(3) TIME INDEX,
  host STRING,
  usage DOUBLE,
  PRIMARY KEY (host)
);
```

Then create a Flink table that uses the GreptimeDB connector:

```sql
CREATE TEMPORARY TABLE cpu_metrics_sink (
  ts TIMESTAMP(3) NOT NULL,
  host STRING,
  usage DOUBLE
) WITH (
  'connector' = 'greptimedb',
  'endpoints' = '127.0.0.1:4001',
  'database' = 'public',
  'table' = 'cpu_metrics',
  'time-index' = 'ts',
  'tags' = 'host',
  'batch.max-rows' = '1000'
);

INSERT INTO cpu_metrics_sink VALUES
  (TIMESTAMP '2024-01-02 03:04:05.000', 'host-a', 0.42);
```

`endpoints` uses the GreptimeDB gRPC endpoint, whose default port is `4001`.
The `time-index` column must be declared as a non-null `TIMESTAMP` or
`TIMESTAMP_LTZ` column. Columns listed in `tags` should match the primary key
columns of the destination GreptimeDB table.

The commonly used sink options are:

| Option | Required | Default | Description |
| --- | --- | --- | --- |
| `connector` | Yes | - | Must be `greptimedb`. |
| `endpoints` | Yes | - | Comma-separated GreptimeDB gRPC endpoints. |
| `time-index` | Yes | - | Non-null timestamp column used as the GreptimeDB time index. |
| `database` | No | `public` | Destination database. |
| `table` | No | Flink table name | Destination table. |
| `username` | No | - | GreptimeDB username. Configure with `password`. |
| `password` | No | - | GreptimeDB password. Configure with `username`. |
| `tags` | No | - | Comma-separated columns written as GreptimeDB tags. |
| `batch.max-rows` | No | `1000` | Maximum number of rows in each write batch. |

The sink provides at-least-once delivery. Failed writes, retries, or recovery
can produce duplicate writes. It does not support update, delete, or retract
rows, primary-key upserts, automatic table creation, or exactly-once commits.

For DataStream applications, use `GreptimeSink` and provide a
`GreptimeRecordSerializer`. See the
[connector README](https://github.com/GreptimeTeam/flink-connector-greptimedb#datastream-sink-usage)
for the Java API example and advanced bulk-write options.

## Read data with Flink SQL

The Table source reads an existing GreptimeDB table through the MySQL protocol.
Add MySQL Connector/J to the Flink runtime together with the GreptimeDB
connector:

```bash
./bin/sql-client.sh embedded \
  -j /path/to/flink-connector-greptimedb-*-shaded.jar \
  -j /path/to/mysql-connector-j-8.4.0.jar
```

Create the source table with a schema that matches the GreptimeDB table:

```sql
CREATE TEMPORARY TABLE cpu_metrics_source (
  ts TIMESTAMP(3),
  host STRING,
  usage DOUBLE
) WITH (
  'connector' = 'greptimedb',
  'query.jdbc-url' = 'jdbc:mysql://127.0.0.1:4002/public?useSSL=false',
  'database' = 'public',
  'table' = 'cpu_metrics',
  'query.fetch-size' = '1000'
);

SELECT ts, host, usage FROM cpu_metrics_source;
```

Use the separate `username` and `password` options when authentication is
enabled. Do not put credentials or timeout parameters in `query.jdbc-url`.

The source performs a bounded, single-task scan. It does not support streaming
reads, CDC, lookup reads, or schema discovery. The connector does not push
projections, filters, or limits down to GreptimeDB; Flink applies these
operations after reading the data. For all source options and supported data
types, see the
[connector README](https://github.com/GreptimeTeam/flink-connector-greptimedb#sqltable-source-options).
