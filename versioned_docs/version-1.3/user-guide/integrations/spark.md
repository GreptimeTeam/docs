---
keywords: [Apache Spark, Spark connector, data ingestion, batch processing, Structured Streaming, DataSource V2]
description: Write batch DataFrames and Structured Streaming micro-batches to GreptimeDB with the Apache Spark connector.
---

# Apache Spark

The [GreptimeDB connector for Apache Spark](https://github.com/GreptimeTeam/spark-connector-greptimedb)
is a DataSource V2 connector that writes batch DataFrames and Structured
Streaming micro-batches to GreptimeDB.

The connector requires Java 17 or later and the Scala 2.13 distribution of
Apache Spark 4.2.0. It is write-only and requires an existing GreptimeDB table.

## Install the connector

### Download from Maven Central

For a Maven-based Spark application, add the connector as a dependency:

```xml
<dependency>
  <groupId>io.greptime</groupId>
  <artifactId>spark-connector-greptimedb</artifactId>
  <version>VAR::sparkConnectorVersion</version>
</dependency>
```

To load the connector directly into a Spark runtime, download the shaded JAR
from [Maven Central](https://central.sonatype.com/artifact/io.greptime/spark-connector-greptimedb/VAR::sparkConnectorVersion):

```bash
mvn dependency:copy \
  -Dartifact=io.greptime:spark-connector-greptimedb:VAR::sparkConnectorVersion:jar:shaded \
  -DoutputDirectory=/path/to/spark/jars
```

### Build from source

Build the connector from source:

```bash
git clone https://github.com/GreptimeTeam/spark-connector-greptimedb.git
cd spark-connector-greptimedb
mvn package
```

The build creates a shaded JAR under `target/`. Add it when submitting your
Spark application:

```bash
./bin/spark-submit \
  --jars /path/to/spark-connector-greptimedb-*-shaded.jar \
  /path/to/application.jar
```

## Write a batch DataFrame

Create the destination table in GreptimeDB before writing data:

```sql
CREATE TABLE cpu_metrics (
  ts TIMESTAMP(6) TIME INDEX,
  host STRING,
  usage DOUBLE,
  PRIMARY KEY (host)
);
```

Then write a DataFrame in append mode:

```java
Dataset<Row> metrics = ...;

metrics.write()
        .format("greptimedb")
        .mode("append")
        .option("endpoints", "127.0.0.1:4001")
        .option("database", "public")
        .option("table", "cpu_metrics")
        .option("time-index", "ts")
        .option("tags", "host")
        .option("batch.max-rows", "1000")
        .save();
```

`endpoints` uses the GreptimeDB gRPC endpoint, whose default port is `4001`.
The `time-index` column must have the Spark SQL type `TIMESTAMP` or
`TIMESTAMP_NTZ`, and its values must not be null. Columns listed in `tags`
should match the primary key columns of the destination GreptimeDB table.

## Write a Structured Streaming DataFrame

Use the connector as a Structured Streaming sink in append output mode:

```java
StreamingQuery query = metrics.writeStream()
        .format("greptimedb")
        .outputMode("append")
        .option("checkpointLocation", "/path/to/checkpoint")
        .option("endpoints", "127.0.0.1:4001")
        .option("database", "public")
        .option("table", "cpu_metrics")
        .option("time-index", "ts")
        .option("tags", "host")
        .start();
```

## Connector options

| Option | Required | Default | Description |
| --- | --- | --- | --- |
| `endpoints` | Yes | - | Comma-separated GreptimeDB gRPC endpoints in `hostname:port` or `IPv4:port` format. |
| `table` | Yes | - | Existing destination table. |
| `time-index` | Yes | - | `TIMESTAMP` or `TIMESTAMP_NTZ` column used as the GreptimeDB time index. |
| `database` | No | `public` | Destination database. |
| `tags` | No | - | Comma-separated columns written as GreptimeDB tags. |
| `username` | No | - | GreptimeDB username. Configure with `password`. |
| `password` | No | - | GreptimeDB password. Configure with `username`. |
| `batch.max-rows` | No | `1000` | Rows per ingester bulk message in each Spark task. |

For advanced bulk-write options, see the
[connector README](https://github.com/GreptimeTeam/spark-connector-greptimedb#options).

## Supported data types

| Spark SQL type | GreptimeDB type |
| --- | --- |
| `BOOLEAN` | `BOOLEAN` |
| `TINYINT` | `INT8` |
| `SMALLINT` | `INT16` |
| `INT` | `INT32` |
| `BIGINT` | `INT64` |
| `FLOAT` | `FLOAT32` |
| `DOUBLE` | `FLOAT64` |
| `STRING`, `CHAR`, `VARCHAR` | `STRING` |
| `BINARY` | `BINARY` |
| `DATE` | `DATE` |
| `TIMESTAMP`, `TIMESTAMP_NTZ` | `TIMESTAMP_MICROSECOND` |
| `DECIMAL(p, s)` | `DECIMAL128(p, s)` |

The connector rejects unsupported complex Spark SQL types before submitting
the job. It does not validate the server-side schema, so the DataFrame columns
and mapped types must match the destination table.

Writes are insert-only and provide at-least-once delivery. Failed or retried
Spark tasks and streaming epochs can produce duplicate rows. The connector
does not support reads, overwrite, delete, upsert, automatic table creation,
or exactly-once commits.
