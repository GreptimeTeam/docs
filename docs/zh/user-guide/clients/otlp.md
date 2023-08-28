# OpenTelemetry Protocol(OTLP)

[OpenTelemetry](https://opentelemetry.io/) 是一个供应商中立的开源可观测性框架，用于检测、生成、收集和导出观测数据，例如 traces, metrics 和 logs。
OpenTelemetry Protocol (OTLP) 定义了观测数据在观测源和中间进程（例如收集器和观测后端）之间的编码、传输机制。

## OTLP/HTTP

<!--@include: ../../db-cloud-shared/clients/otlp-integration.md-->

## 数据模型

OTLP 指标数据模型按照下方的规则被映射到 GreptimeDB 数据模型中：
- Metric 的名称将被作为 GreptimeDB 表的名称，当表不存在时会自动创建。
- 所有的 Attribute ，包含 resource 级别、scope 级别和 data_point 级别，都被作为 GreptimeDB 表的 tag 列。
- 数据点的时间戳被作为 GreptimeDB 的时间戳索引，列名 greptime_timestamp。
- Gauge/Sum 两种类型的数据点数据被作为 field 列，列名 greptime_value。
- Summay 类型的每个 quantile 被作为单独的数据列，列名 greptime_pxx ，其中 xx 是quantile 的数据，如  90 / 99 等。
- Histogram 和 ExponentialHistogram 暂时未被支持，我们可能在后续版本中推出 Histogram 数据类型来原生支持这两种类型。
