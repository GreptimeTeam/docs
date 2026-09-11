---
keywords: [日志, 日志写入, Pipeline, 全文搜索, 日志收集器, Vector, Fluent Bit, Loki, Splunk]
description: 日志如何写入 GreptimeDB、Pipeline 在入库前如何解析和转换日志，以及入库后如何查询。
---

# 日志

日志和指标、链路共用同一个引擎，所以日志表可以用 SQL 查询，也能和其他信号做 JOIN。和指标相比，日志多一个环节，发生在入库之前：Pipeline 把一行原始日志拆成列，并决定哪些列需要索引。

![log-collection-flow](/log-collection-flow.drawio.svg)

<AnchorAlias id="日志收集流程" />
<AnchorAlias id="pipeline-处理" />

## 一条日志如何变成一行数据

指标写入时已经是结构化的：指标名、一组标签、一个值。日志没有这层结构，它就是一个字符串，里面有什么取决于当初写日志的人。Pipeline 负责补上结构化这一步，在数据落库之前完成。

Pipeline 分两个阶段：

- **Processor** 解析和改写输入字段。`dissect` 和 `regex` 把原始日志切分成命名字段，`json_parse` 和 `csv` 读取结构化格式，`date` 和 `epoch` 把文本转成时间戳，`vrl`、`gsub`、`select`、`filter` 用于进一步整形或丢弃字段。
- **Transform** 决定这些字段如何存储：每个字段的列类型、是否作为 tag，以及是否建立 `inverted`、`skipping` 或 `fulltext` 索引。

处理完得到的是一张普通的表，查询方式和其他数据没有区别。如果同一个来源混着多种日志类型，可以用 [dispatcher](/reference/pipeline/pipeline-config.md#dispatcher) 把它们分别路由到不同的表。

如果写入的数据本身已经结构化，则不需要任何配置：内置的 `greptime_identity` Pipeline 会把每个字段按列存储。

<AnchorAlias id="快速开始" />

## 从这里开始

[快速开始](./quick-start.md)用内置的 `greptime_identity` Pipeline 演示日志写入。

<AnchorAlias id="集成到日志收集器" />

<AnchorAlias id="日志收集器" />

## 通过收集器写入

每篇文档都包含对应收集器的配置，以及配套的 Pipeline 设置：

- [Vector](/user-guide/ingest-data/for-observability/vector.md#using-greptimedb_logs-sink-recommended)
- [Fluent Bit](/user-guide/ingest-data/for-observability/fluent-bit.md#http)
- [OpenTelemetry Collector](/user-guide/ingest-data/for-observability/otel-collector.md)
- [Kafka](/user-guide/ingest-data/for-observability/kafka.md#logs)
- [Loki](/user-guide/ingest-data/for-observability/loki.md#using-pipeline-with-loki-push-api)
- [Splunk](/user-guide/ingest-data/for-observability/splunk.md#使用-pipeline)

<AnchorAlias id="了解更多关于-pipeline-的信息" />

## 编写自己的 Pipeline

内置 Pipeline 覆盖不到的日志格式，需要自己写配置。

- [使用自定义 Pipeline](./use-custom-pipelines.md)——Pipeline 配置的写法。
- [管理 Pipeline](./manage-pipelines.md)——创建、更新和删除 Pipeline。

## 查询日志

- [全文搜索](./fulltext-search.md)——在日志内容中匹配文本。
- [GreptimeDB 控制台](/getting-started/installation/greptimedb-dashboard.md#logs-query)——在内置控制台中用查询构建器或代码编辑器筛选和搜索。

## 参考

- [内置 Pipeline](/reference/pipeline/built-in-pipelines.md)——GreptimeDB 自带的 Pipeline。
- [日志写入 API](/reference/pipeline/write-log-api.md)——接收日志写入的 HTTP 接口。
- [Pipeline 配置](/reference/pipeline/pipeline-config.md)——全部 processor 和 transform 选项。
