---
keywords: [日志, 日志写入, Pipeline, 全文搜索, 日志收集器, Vector, Fluent Bit, Loki, Splunk]
description: 日志如何写入 GreptimeDB、Pipeline 在入库前如何解析和转换日志，以及入库后如何查询。
---

# 日志

日志和指标、链路存在同一个引擎里，因此日志表可以用 SQL 查询，也可以和其他信号做 JOIN。日志特有的部分在入库之前：Pipeline 把一行原始日志解析成列，并决定其中哪些列建索引。

![log-collection-flow](/log-collection-flow.drawio.svg)

日志收集器把原始日志发送给 GreptimeDB，Pipeline 将其转换成行，最终得到一张可以用 SQL 和全文索引检索的表。

## 一条日志如何变成一行数据

指标写入时已经是结构化的：指标名、一组标签、一个值。日志不是——它就是一个字符串，里面有什么取决于当初写日志的人。Pipeline 就是补上这一步的环节，它运行在写入路径上，在数据落库之前。

Pipeline 分两个阶段：

- **Processor** 解析和改写输入字段。`dissect` 和 `regex` 把原始日志切分成命名字段，`json_parse` 和 `csv` 读取结构化格式，`date` 和 `epoch` 把文本转成时间戳，`vrl`、`gsub`、`select`、`filter` 用于进一步整形或丢弃字段。
- **Transform** 决定这些字段如何存储：每个字段的列类型、是否作为 tag，以及是否建立 `inverted`、`skipping` 或 `fulltext` 索引。

处理结果是一张普通的表，入库后的日志和其他数据一样查询。如果同一个来源混合了多种日志类型，可以用 [dispatcher](/reference/pipeline/pipeline-config.md#dispatcher) 把它们分别路由到不同的表。

如果写入的数据本身已经结构化，则不需要任何配置：内置的 `greptime_identity` Pipeline 会把每个字段按列存储。

## 从这里开始

[快速开始](./quick-start.md)使用内置的 `greptime_identity` Pipeline 写入日志。

<AnchorAlias id="集成到日志收集器" />

## 从收集器发送日志

下面每篇文档都包含对应收集器的配置，以及它所需的 Pipeline 设置：

- [Vector](/user-guide/ingest-data/for-observability/vector.md#using-greptimedb_logs-sink-recommended)
- [Fluent Bit](/user-guide/ingest-data/for-observability/fluent-bit.md#http)
- [OpenTelemetry Collector](/user-guide/ingest-data/for-observability/otel-collector.md)
- [Kafka](/user-guide/ingest-data/for-observability/kafka.md#logs)
- [Loki](/user-guide/ingest-data/for-observability/loki.md#using-pipeline-with-loki-push-api)
- [Splunk](/user-guide/ingest-data/for-observability/splunk.md#使用-pipeline)

## 编写自己的 Pipeline

Pipeline 负责解析日志行、转换提取出的值，并配置结果列上的索引。

- [使用自定义 Pipeline](./use-custom-pipelines.md)——为内置 Pipeline 未覆盖的日志格式编写 Pipeline。
- [管理 Pipeline](./manage-pipelines.md)——创建、更新和删除 Pipeline。

## 查询日志

- [全文搜索](./fulltext-search.md)——在日志内容中匹配文本。
- [GreptimeDB 控制台](/getting-started/installation/greptimedb-dashboard.md#logs-query)——在内置控制台中用查询构建器或代码编辑器筛选和搜索。

## 参考

- [内置 Pipeline](/reference/pipeline/built-in-pipelines.md)——GreptimeDB 自带的 Pipeline。
- [日志写入 API](/reference/pipeline/write-log-api.md)——接收日志写入的 HTTP 接口。
- [Pipeline 配置](/reference/pipeline/pipeline-config.md)——全部 processor 和 transform 选项。
