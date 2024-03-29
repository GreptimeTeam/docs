---
template: ../../db-cloud-shared/clients/vector-integration.md
---

# Vector

<docs-template>

[Vector](https://vector.dev/) 是一种高性能的可以帮助工程师控制可观测性数据的通道工具。我们的 Vector 集成页面在[这里](https://vector.dev/docs/reference/configuration/sinks/greptimedb/)。

{template toml-config%

## 集成

使用 GreptimeDB 的 Vector 集成的最小配置如下：

```toml
# sample.toml

[sources.in]
type = "host_metrics"

[sinks.my_sink_id]
inputs = ["in"]
type = "greptimedb"
endpoint = "<host>:4001"
dbname = "<dbname>"
username = "<username>"
password = "<password>"
```

GreptimeDB 使用 gRPC 与 Vector 进行通信，因此 Vector sink 的默认端口是 `4001`。
如果你在使用 [自定义配置](../operations/configuration.md#configuration-file) 启动 GreptimeDB 时更改了默认的 gRPC 端口，请使用你自己的端口。

%}

{template data-model%

## 数据模型

我们使用这样的规则将 Vector 指标存入 GreptimeDB：

- 使用 `<metric namespace>_<metric name>` 作为 GreptimeDB 的表名，例如 `host_cpu_seconds_total`；
- 将指标中的时间戳作为 GreptimeDB 的时间索引，默认列名 ts；
- 指标所关联的 tag 列将被作为 GreptimeDB 的 tag 字段；
- Vector 的指标，和其他指标类似，有多种子类型：
  - Counter 和 Gauge 类型的指标，数值直接被存入 val 列；
  - Set 类型，我们将集合的数据个数存入 val 列；
  - Distribution 类型，各个百分位数值点分别存入 pxx 列，其中 xx 是 quantile 数值，此外我们还会记录 min/max/avg/sum/count 列；
  - AggregatedHistoragm 类型，每个 bucket 的数值将被存入 bxx 列，其中 xx 是 bucket 数值的上限，此外我们还会记录 sum/count 列；
  - AggregatedSummary 类型，各个百分位数值点分别存入 pxx 列，其中 xx 是 quantile 数值，此外我们还会记录 sum/count 列；
  - Sketch 类型，各个百分位数值点分别存入 pxx 列，其中 xx 是 quantile 数值，此外我们还会记录 min/max/avg/sum 列；

%}

</docs-template>
