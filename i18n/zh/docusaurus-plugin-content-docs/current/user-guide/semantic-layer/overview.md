---
keywords: [语义层, 表语义, 语义图, 实体, 关系, 可观测性元数据]
description: GreptimeDB 语义层概览——表语义选项与派生的实体图。
---

# 语义层

:::warning
语义层目前处于实验阶段，未来版本可能发生变化。本章描述的表选项、表名和列名尚未纳入兼容性保证。没有语义元数据的表照常工作；语义层是可选的、增量式的。
:::

语义层用机器可读的方式描述 GreptimeDB 所存的数据，由两部分组成，都用普通 SQL 查询。背景介绍见基础概念中的[语义层](/user-guide/concepts/semantic-layer.md)。

**[表语义](./table-semantics.md)。** `greptime.semantic.*` 表选项记录一张表所存的遥测信号、写入它的接入来源，以及 instrument 类型、单位等信号特定的元数据。支持的接入路径在建表时写入，你也可以用 DDL 设置。[`information_schema.table_semantics`](/reference/sql/information-schema/table-semantics.md) 列出所有带这些选项的表。

**[语义图](./semantic-graph.md)。** `greptime_private.semantic_entities` 和 `greptime_private.semantic_relationships` 暴露遥测数据描述的实体以及它们之间的关系。两张表都在查询时派生，数据来自各表携带的实体声明和内置约定，除人工声明的边以外不物化任何内容。哪些数据无需配置即可进入图、其余如何声明，见[声明实体与关系](./declaring-entities.md)。

## 无需配置即可获得的内容

| 数据 | 得到的内容 |
| --- | --- |
| OTLP traces | trace 表上的表语义；`service`、`service.instance`、`host`、`container`、`k8s.pod`、`k8s.node`、`k8s.container` 实体；service 之间带 RED 指标的 `calls` 边 |
| OTLP metrics 和 logs | 各表上的表语义 |
| Prometheus remote write | 各表上的表语义；来自白名单内 kube-state-metrics 和 `target_info` 描述性指标的实体与包含关系边 |
| InfluxDB、OpenTSDB、Loki、Elasticsearch | 各表上的表语义 |

其余的表需要声明后才会进入图。
