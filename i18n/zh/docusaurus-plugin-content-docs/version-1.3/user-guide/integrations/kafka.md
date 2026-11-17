---
keywords: [Kafka, Kafka Connect, sink connector, 数据写入]
description: 使用 GreptimeDB 的 Kafka Connect sink connector 将 Kafka 记录写入 GreptimeDB。
---

# Kafka

[GreptimeDB Kafka Connect sink connector](https://github.com/GreptimeTeam/greptimedb-kafka-connect)
通过 gRPC 把 Kafka 记录写入 GreptimeDB。记录中哪些字段作为 time index、tag 和 field，
在 connector 配置中指定，概念见[数据模型](/user-guide/concepts/data-model.md)。
表和列由 GreptimeDB 自动创建。

Connector 运行需要 Java 8 或更高版本，已在 Kafka Connect 3.9 和 GreptimeDB v1.3 上测试。

消息在写入前需要解码或加工时，改用 Vector 写入，例如 InfluxDB 行协议格式的指标，
以及需要用 VRL 改写或用 [pipeline](/user-guide/logs/use-custom-pipelines.md) 解析的日志。
参见[通过 Kafka 写入数据](/user-guide/ingest-data/for-observability/kafka.md)。

## 安装 connector

1. 从 [GitHub Releases](https://github.com/GreptimeTeam/greptimedb-kafka-connect/releases)
   下载插件压缩包及其 SHA-512 校验文件，并校验压缩包：

   ```shell
   curl -LO https://github.com/GreptimeTeam/greptimedb-kafka-connect/releases/download/vVAR::kafkaConnectVersion/greptimedb-kafka-connect-VAR::kafkaConnectVersion.zip
   curl -LO https://github.com/GreptimeTeam/greptimedb-kafka-connect/releases/download/vVAR::kafkaConnectVersion/greptimedb-kafka-connect-VAR::kafkaConnectVersion.zip.sha512
   sha512sum -c greptimedb-kafka-connect-VAR::kafkaConnectVersion.zip.sha512
   ```

2. 在每个 Connect worker 上，把压缩包解压到 `plugin.path` 配置的目录下：

   ```shell
   unzip greptimedb-kafka-connect-VAR::kafkaConnectVersion.zip -d /opt/connectors
   ```

3. 重启 Connect worker。`curl -s http://localhost:8083/connector-plugins` 的输出中出现
   `io.greptime.kafka.connect.GreptimeDBSinkConnector`，说明安装成功。

## 创建 connector

下面的请求通过 Kafka Connect REST API 创建名为 `greptimedb-sink` 的 connector，
把 topic `sensor` 中不带 schema 的 JSON 记录写入表 `kafka_sensor`：

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

`greptimedb.endpoints` 填 Connect worker 能访问到的 GreptimeDB gRPC 地址，gRPC 默认端口为 `4001`。

向 `sensor` 发送下面这条记录后，connector 创建表 `kafka_sensor`：`ts` 是 time index，
`device` 是 tag，`temperature` 是 `DOUBLE` 类型的 field。

```json
{"ts": 1700000000000, "device": "d1", "temperature": 21.5}
```

常用配置如下：

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `greptimedb.endpoints` | 必填 | gRPC 地址，格式为 `host:port`，多个地址用逗号分隔。 |
| `greptimedb.database` | `public` | 目标数据库。 |
| `greptimedb.username`、`greptimedb.password` | 空 | 用户名和密码。用户名为空时不认证。 |
| `table.name.format` | `${topic}` | 目标表名。`${topic}` 替换为记录所在的 topic。 |
| `timestamp.field` | 空 | 作为 time index 的顶层字段。为空时使用 Kafka 记录自带的时间戳，写入 `greptime_timestamp` 列。 |
| `timestamp.precision` | `ms` | Time index 列的精度：`s`、`ms`、`us` 或 `ns`。整数时间戳按此单位解析。 |
| `tag.fields` | 空 | 作为 tag 列的顶层字段。 |

TLS、字段筛选、重试、Avro 与 Schema Registry、类型映射和性能调优见
[connector README](https://github.com/GreptimeTeam/greptimedb-kafka-connect#configuration)。
仓库里的 [quick start](https://github.com/GreptimeTeam/greptimedb-kafka-connect#quick-start)
用 Docker Compose 在本地启动 Kafka、Connect worker 和 GreptimeDB。

## 限制

- 表在首次写入时创建，tag 和列类型也在这时确定。之后修改 `tag.fields` 不影响已有的表。
- 写入与列类型不一致的值会被拒绝。不带 schema 的 JSON 中，`20` 是整数，`20.5` 是浮点数，
  浮点列的值要带小数点，例如 `20.0`。
- Time index 只能是整数 epoch 值或 Connect `Timestamp`。字符串时间戳先用
  `TimestampConverter` transform 转换。
- 不支持嵌套的 `STRUCT`、`MAP` 和 `ARRAY` 值。这类字段用 `field.exclude` 排除，
  或用 `Flatten` transform 展开 struct 和 map。
- 无法写入的记录按 Kafka Connect 的 `errors.tolerance` 处理：默认 task 失败；
  设为 `all` 时记录进入死信队列，没有配置死信队列则丢弃。
- GreptimeDB 不可达或繁忙时，connector 重试当前 batch，不会丢弃数据。
- 交付语义为 at-least-once。重复写入的行覆盖 tag 和 time index 都相同的已有行；
  `append_mode = 'true'` 的表会保留重复行。
