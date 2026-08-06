---
keywords: [Apache Flink, Flink connector, 数据写入, 流处理, table source, table sink]
description: 使用 GreptimeDB 的 Apache Flink connector 写入数据和读取有界表。
---

# Apache Flink

[GreptimeDB Apache Flink connector](https://github.com/GreptimeTeam/flink-connector-greptimedb)
支持：

- 通过 Flink SQL、Table API 或 DataStream API 写入仅包含 insert 操作的数据。
- 通过 Flink SQL 或 Table API 将 GreptimeDB 表作为有界数据源读取。

Connector 要求使用 Java 17 和 Apache Flink 2.0.x。

## 安装 connector

### 从 Maven Central 下载

对于基于 Maven 的 Flink 应用，将 connector 添加为依赖：

```xml
<dependency>
  <groupId>io.greptime</groupId>
  <artifactId>flink-connector-greptimedb</artifactId>
  <version>VAR::flinkConnectorVersion</version>
</dependency>
```

对于 Flink SQL Client 或 Flink 集群，从
[Maven Central](https://central.sonatype.com/artifact/io.greptime/flink-connector-greptimedb/VAR::flinkConnectorVersion)
下载 shaded JAR：

```bash
mvn dependency:copy \
  -Dartifact=io.greptime:flink-connector-greptimedb:VAR::flinkConnectorVersion:jar:shaded \
  -DoutputDirectory=/path/to/flink/lib
```

### 从源码构建

从源码构建 connector：

```bash
git clone https://github.com/GreptimeTeam/flink-connector-greptimedb.git
cd flink-connector-greptimedb
mvn package
```

构建会在 `target/` 目录下生成 shaded JAR。启动 Flink SQL Client 时加载该文件：

```bash
./bin/sql-client.sh embedded \
  -j /path/to/flink-connector-greptimedb-*-shaded.jar
```

## 使用 Flink SQL 写入数据

写入数据前，在 GreptimeDB 中创建目标表：

```sql
CREATE TABLE cpu_metrics (
  ts TIMESTAMP(3) TIME INDEX,
  host STRING,
  usage DOUBLE,
  PRIMARY KEY (host)
);
```

然后创建使用 GreptimeDB connector 的 Flink 表：

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

`endpoints` 使用 GreptimeDB gRPC endpoint，默认端口为 `4001`。
`time-index` 列必须声明为非空的 `TIMESTAMP` 或 `TIMESTAMP_LTZ` 列。
`tags` 中的列应与 GreptimeDB 目标表的主键列一致。

常用的 sink 配置如下：

| 配置项 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `connector` | 是 | - | 必须为 `greptimedb`。 |
| `endpoints` | 是 | - | 以逗号分隔的 GreptimeDB gRPC endpoints。 |
| `time-index` | 是 | - | 用作 GreptimeDB time index 的非空 timestamp 列。 |
| `database` | 否 | `public` | 目标数据库。 |
| `table` | 否 | Flink 表名 | 目标表。 |
| `username` | 否 | - | GreptimeDB 用户名，必须与 `password` 同时配置。 |
| `password` | 否 | - | GreptimeDB 密码，必须与 `username` 同时配置。 |
| `tags` | 否 | - | 以逗号分隔、写为 GreptimeDB tag 的列。 |
| `batch.max-rows` | 否 | `1000` | 每个写入 batch 的最大行数。 |

Sink 提供 at-least-once 交付语义。写入失败、重试或恢复可能产生重复数据。
它不支持 update、delete 或 retract 记录、主键 upsert、自动建表和 exactly-once commit。

在 DataStream 应用中，使用 `GreptimeSink` 并提供 `GreptimeRecordSerializer`。
Java API 示例和高级 bulk-write 配置请参阅
[connector README](https://github.com/GreptimeTeam/flink-connector-greptimedb#datastream-sink-usage)。

## 使用 Flink SQL 读取数据

Table source 通过 MySQL 协议读取已有的 GreptimeDB 表。
除 GreptimeDB connector 外，还需要将 MySQL Connector/J 加载到 Flink runtime：

```bash
./bin/sql-client.sh embedded \
  -j /path/to/flink-connector-greptimedb-*-shaded.jar \
  -j /path/to/mysql-connector-j-8.4.0.jar
```

创建与 GreptimeDB 表 schema 一致的 source 表：

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

启用认证时，请使用独立的 `username` 和 `password` 配置。
不要在 `query.jdbc-url` 中放入凭证或 timeout 参数。

Source 使用单个 task 执行有界扫描。它不支持流式读取、CDC、lookup read
和 schema discovery。Connector 不会将 projection、filter 或 limit 下推到
GreptimeDB；Flink 会在读取数据后执行这些操作。
所有 source 配置项和支持的数据类型请参阅
[connector README](https://github.com/GreptimeTeam/flink-connector-greptimedb#sqltable-source-options)。
