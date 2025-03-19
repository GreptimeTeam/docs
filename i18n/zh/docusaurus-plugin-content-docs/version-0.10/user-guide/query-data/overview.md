# 概述

## 查询语言

- [SQL](./sql.md)
- [PromQL](promql.md)

从 v0.9 开始，GreptimeDB 开始支持查询视图和公共表表达式（CTE），用于简化查询语句：

* [View](./view.md)
* [公共表表达式（CTE）](./cte.md)

## 推荐的查询库

由于 GreptimeDB 使用 SQL 作为主要查询语言，并支持 [MySQL](/user-guide/protocols/mysql.md) 和 [PostgreSQL](/user-guide/protocols/postgresql.md) 协议，
你可以使用支持 MySQL 或 PostgreSQL 的成熟 SQL Driver 来查询数据。

有关更多信息，请参考[SQL 工具](/reference/sql-tools.md)文档。

## 查询外部数据

GreptimeDB 具有查询外部数据文件的能力，更多信息请参考[查询外部数据](./query-external-data.md)文档。
