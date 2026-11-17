---
keywords: [Kafka, Kafka Connect, sink connector, 数据写入]
description: 使用 GreptimeDB 的 Kafka Connect sink connector 将 Kafka 记录写入 GreptimeDB。
---

# Kafka

[GreptimeDB Kafka Connect sink connector](https://github.com/GreptimeTeam/greptimedb-kafka-connect)
通过 gRPC 将 Kafka 记录写入 GreptimeDB。在 connector 配置中指定记录的哪些字段作为
time index、tag 和 field，概念定义见[数据模型](/user-guide/concepts/data-model.md)。
GreptimeDB 自动创建表和列。

Connector 面向 Java 8 构建，已在 Kafka Connect 3.9 和 GreptimeDB v1.3 上测试。

如果 Kafka 中是 InfluxDB 行协议格式的指标，或需要由 [pipeline](/user-guide/logs/use-custom-pipelines.md)
解析的日志，请改用 Vector，参见[通过 Kafka 写入数据](/user-guide/ingest-data/for-observability/kafka.md)。

## 安装 connector

1. 从 [GitHub Releases](https://github.com/GreptimeTeam/greptimedb-kafka-connect/releases)
   下载插件压缩包及其 SHA-512 校验文件，并校验压缩包：

   ```shell
   curl -LO https://github.com/GreptimeTeam/greptimedb-kafka-connect/releases/download/vVAR::kafkaConnectVersion/greptimedb-kafka-connect-VAR::kafkaConnectVersion.zip
   curl -LO https://github.com/GreptimeTeam/greptimedb-kafka-connect/releases/download/vVAR::kafkaConnectVersion/greptimedb-kafka-connect-VAR::kafkaConnectVersion.zip.sha512
   sha512sum -c greptimedb-kafka-connect-VAR::kafkaConnectVersion.zip.sha512
   ```

2. 将压缩包解压到每个 Connect worker 的 `plugin.path` 所列的目录中：

   ```shell
   unzip greptimedb-kafka-connect-VAR::kafkaConnectVersion.zip -d /opt/connectors
   ```

3. 重启 Connect worker。`curl -s http://localhost:8083/connector-plugins` 的输出中包含
   `io.greptime.kafka.connect.GreptimeDBSinkConnector` 即表示安装成功。

## 创建 connector

以下请求通过 Kafka Connect REST API 创建名为 `greptimedb-sink` 的 connector，
将 topic `sensor` 中不带 schema 的 JSON 记录写入表 `kafka_sensor`：

```shell
curl -X PUT -H 'Content-Type: application/json' \
  http://localhost:8083/connectors/greptimedb-sink/config -d '{
  "connector.class": "io.greptime.kafka.connect.GreptimeDBSinkConnector",
  "topics": "sensor",
  "value.converter": "org.apache.kafka.connect.json.JsonConverter",
  "value.converter.schemas.enable": "false",
  "greptimedb.endpoints": "127.0.0.1:4001",
  "table.name.format": "kafka_${topic}",
  "timestamp.field": "ts",
  "tag.fields": "device"
}'
```

`greptimedb.endpoints` 填写 Connect worker 可访问的 GreptimeDB gRPC 地址，默认端口为 `4001`。

写入下面这条记录后，connector 创建表 `kafka_sensor`，`ts` 为 time index，
`device` 为 tag，`temperature` 为 `DOUBLE` 类型的 field：

```json
{"ts": 1700000000000, "device": "d1", "temperature": 21.5}
```

常用配置如下：

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `greptimedb.endpoints` | 必填 | 以逗号分隔的 gRPC 地址，格式为 `host:port`。 |
| `greptimedb.database` | `public` | 目标数据库。 |
| `greptimedb.username`、`greptimedb.password` | 空 | 认证信息。用户名为空时不进行认证。 |
| `table.name.format` | `${topic}` | 目标表名。`${topic}` 会替换为记录所属的 topic。 |
| `timestamp.field` | 空 | 用作 time index 的顶层字段。为空时，将 Kafka 记录的时间戳写入名为 `greptime_timestamp` 的列。 |
| `timestamp.precision` | `ms` | Time index 列的精度：`s`、`ms`、`us` 或 `ns`。整数时间戳按此单位解析。 |
| `tag.fields` | 空 | 写为 tag 列的顶层字段。 |

TLS、字段筛选、重试、Avro 与 Schema Registry、类型映射和性能调优，参见
[connector README](https://github.com/GreptimeTeam/greptimedb-kafka-connect#configuration)。
仓库中还提供了基于 Docker Compose 的
[quick start](https://github.com/GreptimeTeam/greptimedb-kafka-connect#quick-start)，
可在本地运行 Kafka、Connect worker 和 GreptimeDB。

## 限制

- 首次写入时创建表，表的 tag 和列类型随之确定。之后修改 `tag.fields` 不会改变已有的表，
  类型不同的值会被拒绝。在不带 schema 的 JSON 中，`20` 是整数，`20.5` 是浮点数。
- Time index 必须是整数 epoch 值或 Connect `Timestamp`。字符串时间戳需用
  `TimestampConverter` transform 转换。
- 不支持嵌套的 `STRUCT`、`MAP` 和 `ARRAY` 值。用 `field.exclude` 排除，
  或用 `Flatten` transform 展开 struct 和 map。
- 无法写入的记录按 Kafka Connect 的 `errors.tolerance` 配置处理：默认会使 task 失败；
  设为 `errors.tolerance=all` 时写入死信队列，未配置死信队列则跳过。暂时性的写入错误会重试，不会跳过。
- 交付语义为 at-least-once。重放的行会覆盖 tag 和 time index 相同的行，
  除非表使用了 `append_mode = 'true'`。
