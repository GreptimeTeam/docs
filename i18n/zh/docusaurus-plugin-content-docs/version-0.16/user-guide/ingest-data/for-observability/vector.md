---
keywords: [Vector, 数据写入, gRPC 通信, 数据模型, 配置示例]
description: 介绍如何使用 Vector 将数据写入 GreptimeDB，包括最小配置示例和数据模型的映射规则。
---

# Vector

:::tip 注意
本文档基于 Vector v0.49.0 版本编写。
以下的所有示例配置均基于此版本。对于各个 sink 的 host 和 port 配置请根据自己 GreptimeDB 实例的实际情况进行调整。
下文中的所有 port 值均为默认值。
:::

Vector 是高性能的可观测数据管道。
它原生支持 GreptimeDB 指标数据接收端。
通过 Vector，你可以从各种来源接收指标数据，包括 Prometheus、OpenTelemetry、StatsD 等。
GreptimeDB 可以作为 Vector 的 Sink 组件来接收指标数据。

## 写入指标数据

GreptimeDB 支持多种指标数据写入方式，包括：

- 使用 [`greptimedb_metrics` sink](https://vector.dev/docs/reference/configuration/sinks/greptimedb_metrics/)
- 使用 InfluxDB 行协议格式将指标数据写入 GreptimeDB
- 使用 Prometheus Remote Write 协议将指标数据写入 GreptimeDB

### 使用 `greptimedb_metrics` sink

#### 示例

以下是一个使用 `greptimedb_metrics` sink 写入宿主机指标的示例配置：

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

Vector 使用 gRPC 与 GreptimeDB 进行通信，因此 Vector sink 的默认端口是 `4001`。
如果你在使用 [自定义配置](/user-guide/deployments-administration/configuration.md#configuration-file) 启动 GreptimeDB 时更改了默认的 gRPC 端口，请使用你自己的端口。

如有更多需求请前往 [Vector GreptimeDB Configuration](https://vector.dev/docs/reference/configuration/sinks/greptimedb_metrics/) 查看更多配置项。

#### 数据模型

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

### 使用 InfluxDB 行协议格式

可以使用 `influx` sink 来写入指标数据。我们推荐使用 v2 版本的 InfluxDB 行协议格式。

以下是一个使用 `influx` sink 写入宿主机指标的示例配置：

```toml
# sample.toml

[sources.my_source_id]
type = "internal_metrics"

[sinks.my_sink_id]
type = "influxdb_metrics"
inputs = [ "my_source_id" ]
bucket = "public"
endpoint = "http://<host>:4000/v1/influxdb"
org = ""
token = ""
```

上述配置使用的是 InfluxDB 行协议的 v2 版本。Vector 会根据 TOML 配置中的字段来判断 InfluxDB 协议的版本，所以请务必确保配置中存在 `bucket`、`org` 和 `token` 字段。具体字段的解释如下：

- `type`: InfluxDB 行协议的值为 `influxdb_metrics`.
- `bucket`: GreptimeDB 中的 database 名称。
- `org`: GreptimeDB 中的组织名称（需置空）。
- `token`: 用于身份验证的令牌（需置空）。由于 Influx 行协议的 token 有特殊形式，必须以 `Token ` 开头。这和 GreptimeDB 的鉴权方式有所不同，且目前不兼容。如果使用的是含有鉴权的 GreptimeDB 实例，请使用 `greptimedb_metrics`。

更多细节请参考 [InfluxDB Line Protocol 文档](../for-iot/influxdb-line-protocol.md) 了解如何使用 InfluxDB Line Protocol 将数据写入到 GreptimeDB。

### 使用 Prometheus Remote Write 协议

以下是一个使用 Prometheus Remote Write 协议写入宿主机指标的示例配置：

```toml
# sample.toml

[sources.my_source_id]
type = "internal_metrics"

[sinks.prometheus_remote_write]
type = "prometheus_remote_write"
inputs = [ "my_source_id" ]
endpoint = "http://<host>:4000/v1/prometheus/write?db=<dbname>"
compression = "snappy"
auth = { strategy = "basic", username = "<username>", password = "<password>" }
```

## 写入日志数据

GreptimeDB 支持多种日志数据写入方式，包括：

- 使用 [`greptimedb_logs` sink](https://vector.dev/docs/reference/configuration/sinks/greptimedb_logs/) 将日志数据写入 GreptimeDB。
- 使用 Loki 协议将日志数据写入 GreptimeDB。

我们强烈建议所有的用户使用 `greptimedb_logs` sink 来写入日志数据，因为它是为 GreptimeDB 优化的，能够更好地支持 GreptimeDB 的特性。
并且推荐开启各种协议的压缩功能，以提高数据传输效率。

### 使用 `greptimedb_logs` sink (推荐)

```toml
# sample.toml

[sources.my_source_id]
type = "demo_logs"
count = 10
format = "apache_common"
interval = 1

[sinks.my_sink_id]
type = "greptimedb_logs"
inputs = [ "my_source_id" ]
compression = "gzip"
dbname = "public"
endpoint = "http://<host>:4000"
extra_headers = { "skip_error" = "true" }
pipeline_name = "greptime_identity"
table = "<table>"
username = "<username>"
password = "<password>"

[sinks.my_sink_id.extra_params]
source = "vector"
x-greptime-pipeline-params = "flatten_json_object=true"
```

此示例展示了如何使用 `greptimedb_logs` sink 将生成的 demo 日志数据写入 GreptimeDB。更多信息请参考 [Vector greptimedb_logs sink](https://vector.dev/docs/reference/configuration/sinks/greptimedb_logs/) 文档。

### 使用 Loki 协议

#### 示例

```toml
[sources.generate_syslog]
type = "demo_logs"
format = "syslog"
count = 100
interval = 1


[transforms.remap_syslog]
inputs = ["generate_syslog"]
type = "remap"
source = """
.labels = {
    "host": .host,
    "service": .service,
}
.structured_metadata = {
    "source_type": .source_type
}
"""


[sinks.my_sink_id]
type = "loki"
inputs = ["remap_syslog"]
compression = "snappy"
endpoint = "http://<host>:4000"
out_of_order_action = "accept"
path = "/v1/loki/api/v1/push"
encoding = { codec = "raw_message" }
labels = { "*" = "{{labels}}" }
structured_metadata = { "*" = "{{structured_metadata}}" }
auth = {strategy = "basic", user = "<username>", password = "<password>"}
```

上述配置为使用 Loki 协议将日志数据写入 GreptimeDB。具体的配置项说明如下：

- `compression`：设置了数据传输时的压缩算法，这里使用了 `snappy`。
- `endpoint`：指定了 Loki 的接收地址。
- `out_of_order_action`：设置了如何处理乱序的日志，这里选择了 `accept`，表示接受乱序日志。GreptimeDB 支持乱序日志的写入。
- `path`：指定了 Loki 的 API 路径。
- `encoding`：设置了数据的编码方式，这里使用了 `raw_message`。
- `labels`：指定了日志的标签，这里将 `labels` 的内容映射为 `{{labels}}`。即 remap_syslog 中的 `labels` 字段。
- `structured_metadata`：指定了结构化元数据，这里将 `structured_metadata` 的内容映射为 `{{structured_metadata}}`。即 remap_syslog 中的 `structured_metadata` 字段。

关于 `labels` 和 `structured_metadata` 的含义，请参考 [Loki 文档](https://grafana.com/docs/loki/latest/get-started/labels/bp-labels/)。

对于 loki 协议，`labels` 默认会使用时序场景下的 Tag 类型，请注意这部分字段不要使用高基数字段。
`structured_metadata` 将会整体存储为一个 json 字段。
请注意，由于 Vector 的配置里不允许设置 header 所以无法指定 pipeline。
如果需要使用 pipeline 功能，请考虑使用 `greptimedb_logs` sink。
