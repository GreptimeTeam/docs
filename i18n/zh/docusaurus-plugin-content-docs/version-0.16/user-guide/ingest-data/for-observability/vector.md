---
keywords: [Vector, 数据写入, gRPC 通信, 数据模型, 配置示例]
description: 介绍如何使用 Vector 将数据写入 GreptimeDB，包括最小配置示例和数据模型的映射规则。
---

# Vector

Vector 是高性能的可观测数据管道。
它原生支持 GreptimeDB 指标数据接收端。
通过 Vector，你可以从各种来源接收指标数据，包括 Prometheus、OpenTelemetry、StatsD 等。
GreptimeDB 可以作为 Vector 的 Sink 组件来接收指标数据。

## 收集主机指标

### 配置

使用 GreptimeDB 的 Vector 集成的最小配置如下：

```toml
# sample.toml

[sources.in]
type = "host_metrics"

[sinks.my_sink_id]
inputs = ["in"]
type = "greptimedb_metrics"
endpoint = "<host>:4001"
dbname = "<dbname>"
username = "<username>"
password = "<password>"
new_naming = true
```

GreptimeDB 使用 gRPC 与 Vector 进行通信，因此 Vector sink 的默认端口是 `4001`。
如果你在使用 [自定义配置](/user-guide/deployments-administration/configuration.md#configuration-file) 启动 GreptimeDB 时更改了默认的 gRPC 端口，请使用你自己的端口。

启动 Vector:

```
vector -c sample.toml
```

请前往 [Vector GreptimeDB Configuration](https://vector.dev/docs/reference/configuration/sinks/greptimedb_metrics/) 查看更多配置项。

### 数据模型

我们使用这样的规则将 Vector 指标存入 GreptimeDB：

- 使用 `<metric namespace>_<metric name>` 作为 GreptimeDB 的表名，例如 `host_cpu_seconds_total`；
- 将指标中的时间戳作为 GreptimeDB 的时间索引，默认列名 `ts`；
- 指标所关联的 tag 列将被作为 GreptimeDB 的 tag 字段；
- Vector 的指标，和其他指标类似，有多种子类型：
  - Counter 和 Gauge 类型的指标，数值直接被存入 `val` 列；
  - Set 类型，我们将集合的数据个数存入 `val` 列；
  - Distribution 类型，各个百分位数值点分别存入 `pxx` 列，其中 xx 是 quantile 数值，此外我们还会记录 `min/max/avg/sum/count` 列；
  - AggregatedHistoragm 类型，每个 bucket 的数值将被存入 `bxx` 列，其中 xx 是 bucket 数值的上限，此外我们还会记录 `sum/count` 列；
  - AggregatedSummary 类型，各个百分位数值点分别存入 `pxx` 列，其中 xx 是 quantile 数值，此外我们还会记录 `sum/count` 列；
  - Sketch 类型，各个百分位数值点分别存入 `pxx` 列，其中 xx 是 quantile 数值，此外我们还会记录 `min/max/avg/sum` 列；

## 收集 InfluxDB 行协议格式的指标

Vector 可以收集 InfluxDB 行协议格式的指标并将其发送到 GreptimeDB。更多信息请参考 [Kafka 指南](/user-guide/ingest-data/for-observability/kafka.md#指标)。


## 收集日志

Vector 可以收集日志并发送到 GreptimeDB。更多信息请参考 [Kafka 指南](/user-guide/ingest-data/for-observability/kafka.md#日志)。

