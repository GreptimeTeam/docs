# Prometheus

## 数据模型

GreptimeDB 以表的形式组织数据，可以将其视为列的组合。其中有三种类型的列：时间索引列、主键列和值。在映射到 Prometheus 时，时间索引列是时间戳，主键是 `tag`（或 `label`），其余是 `value` 。因此，GreptimeDB 可以被视为一个多值数据模型，其中一个表是多个 Prometheus 指标的组合。例如：

![Data Model](/PromQL-multi-value-data-model.png)

## 存储

请参考 [写入数据](../ingest-data/for-observability/prometheus.md)。

## Prometheus Query Language

请参考[读取数据](../query-data/promql.md)。
