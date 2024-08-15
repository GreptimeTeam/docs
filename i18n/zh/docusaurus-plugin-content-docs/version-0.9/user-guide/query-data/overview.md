# 概述

## 查询语言

- [SQL](./sql.md)
- [PromQL](promql.md)

从 v0.9 开始， GreptimeDB 开始支持查询视图和公共表表达式（CTE），用于简化查询语句：

* [View](./view.md)
* [公共表表达式（CTE）](./cte.md)

## 客户端库

客户端库提供了一种方便的方式来连接 GreptimeDB 并与数据交互。
现有的成熟 SQL driver 库可用于查询 GreptimeDB。
请参考[客户端库](/user-guide/ingest-data/for-iot/grpc-sdks/overview.md)文档获取更多信息。

## 查询外部数据

GreptimeDB 具有查询外部数据文件的能力，更多信息请参考[查询外部数据](./query-external-data.md)文档。
