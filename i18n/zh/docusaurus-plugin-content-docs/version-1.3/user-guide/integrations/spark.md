---
keywords: [Apache Spark, Spark connector, 数据写入, 批处理, Structured Streaming, DataSource V2]
description: 使用 GreptimeDB 的 Apache Spark connector 写入 batch DataFrame 和 Structured Streaming micro-batch。
---

# Apache Spark

[GreptimeDB Apache Spark connector](https://github.com/GreptimeTeam/spark-connector-greptimedb)
是一个 DataSource V2 connector，支持将 batch DataFrame 和 Structured
Streaming micro-batch 写入 GreptimeDB。

Connector 要求使用 Java 17 或更高版本、Apache Spark 4.2.0 的 Scala 2.13
发行版。它仅支持写入，并要求 GreptimeDB 中已经存在目标表。

## 安装 connector

### 从 Maven Central 下载

对于基于 Maven 的 Spark 应用，将 connector 添加为依赖：

```xml
<dependency>
  <groupId>io.greptime</groupId>
  <artifactId>spark-connector-greptimedb</artifactId>
  <version>VAR::sparkConnectorVersion</version>
</dependency>
```

如需将 connector 直接加载到 Spark runtime，从
[Maven Central](https://central.sonatype.com/artifact/io.greptime/spark-connector-greptimedb/VAR::sparkConnectorVersion)
下载 shaded JAR：

```bash
mvn dependency:copy \
  -Dartifact=io.greptime:spark-connector-greptimedb:VAR::sparkConnectorVersion:jar:shaded \
  -DoutputDirectory=/path/to/spark/jars
```

### 从源码构建

从源码构建 connector：

```bash
git clone https://github.com/GreptimeTeam/spark-connector-greptimedb.git
cd spark-connector-greptimedb
mvn package
```

构建会在 `target/` 目录下生成 shaded JAR。提交 Spark 应用时加载该文件：

```bash
./bin/spark-submit \
  --jars /path/to/spark-connector-greptimedb-*-shaded.jar \
  /path/to/application.jar
```

## 写入 batch DataFrame

写入数据前，在 GreptimeDB 中创建目标表：

```sql
CREATE TABLE cpu_metrics (
  ts TIMESTAMP(6) TIME INDEX,
  host STRING,
  usage DOUBLE,
  PRIMARY KEY (host)
);
```

然后以 append 模式写入 DataFrame：

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

`endpoints` 使用 GreptimeDB gRPC endpoint，默认端口为 `4001`。
`time-index` 列的 Spark SQL 类型必须为 `TIMESTAMP` 或 `TIMESTAMP_NTZ`，
并且列值不能为 null。`tags` 中的列应与 GreptimeDB 目标表的主键列一致。

## 写入 Structured Streaming DataFrame

以 append output mode 将 connector 用作 Structured Streaming sink：

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

## Connector 配置

| 配置项 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `endpoints` | 是 | - | 以逗号分隔、格式为 `hostname:port` 或 `IPv4:port` 的 GreptimeDB gRPC endpoints。 |
| `table` | 是 | - | 已存在的目标表。 |
| `time-index` | 是 | - | 用作 GreptimeDB time index 的 `TIMESTAMP` 或 `TIMESTAMP_NTZ` 列。 |
| `database` | 否 | `public` | 目标数据库。 |
| `tags` | 否 | - | 以逗号分隔、写为 GreptimeDB tag 的列。 |
| `username` | 否 | - | GreptimeDB 用户名，必须与 `password` 同时配置。 |
| `password` | 否 | - | GreptimeDB 密码，必须与 `username` 同时配置。 |
| `batch.max-rows` | 否 | `1000` | 每个 Spark task 的每条 ingester bulk message 包含的行数。 |

高级 bulk-write 配置请参阅
[connector README](https://github.com/GreptimeTeam/spark-connector-greptimedb#options)。

## 支持的数据类型

| Spark SQL 类型 | GreptimeDB 类型 |
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

Connector 会在提交 job 前拒绝不支持的复杂 Spark SQL 类型。它不会验证服务端
schema，因此 DataFrame 列及其映射类型必须与目标表一致。

写入仅支持 insert，提供 at-least-once 交付语义。失败或重试的 Spark task 和
streaming epoch 可能产生重复数据。Connector 不支持读取、overwrite、delete、
upsert、自动建表和 exactly-once commit。
