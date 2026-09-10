---
keywords: [系统表, greptime private, pipelines, 慢查询, 语义图]
description: greptime_private 数据库中系统表的概述。
---

# Greptime Private

GreptimeDB 将一些重要的内部信息以系统表的形式放在 `greptime_private` 数据库中，可以通过它们获取系统配置和统计信息。

其中大部分表与普通表一样持久化存储。两张语义图表是计算表，本身不存数据，行在读取时派生。

## 表

| 表名                                | 描述                                                     |
| ----------------------------------- | -------------------------------------------------------- |
| [`events`](./events.md) | 保存 GreptimeDB 运行期间产生的事件记录。 |
| [`slow_queries`](./slow_queries.md) | 包含 GreptimeDB 的慢查询信息，包括查询语句、执行时间等。 |
| [`pipelines`](./pipelines.md)       | 包含 GreptimeDB 的 Pipeline 信息。                       |
| [`semantic_entities`](./semantic-entities.md) | 遥测数据所描述的实体，读时计算。 |
| [`semantic_relationships`](./semantic-relationships.md) | 这些实体之间的关系，读时计算。 |
