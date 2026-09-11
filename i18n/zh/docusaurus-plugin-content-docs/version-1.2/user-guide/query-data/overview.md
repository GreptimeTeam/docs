---
keywords: [查询数据, SQL, PromQL, Jaeger, 视图, CTE, SQL 驱动, 外部数据]
description: GreptimeDB 提供的查询接口——SQL、PromQL 和 Jaeger 兼容接口——以及可以连接它们的驱动和工具。
---

# 查询数据

GreptimeDB 在同一批表之上提供多种查询接口，选哪一种取决于信号类型，以及由哪个工具发起查询。

## 查询语言

- [SQL](./sql.md)——跨指标、日志、链路查询，支持范围查询。[视图](./view.md)和[公共表表达式（CTE）](./cte.md)用于把反复书写的查询抽出来复用。
- [PromQL](./promql.md)——通过 Prometheus HTTP 接口查询指标，也可以在 SQL 中使用 `TQL`。
- [Jaeger 接口](./jaeger.md)——从 Jaeger UI 或 Grafana 查询 trace。
- [Log Query](./log-query.md)——面向日志检索的独立 HTTP 接口，实验性功能。

## 客户端与驱动

GreptimeDB 支持 [MySQL](/user-guide/protocols/mysql.md) 和 [PostgreSQL](/user-guide/protocols/postgresql.md) 线协议，现有的 SQL 驱动无需专用客户端即可连接。驱动列表和连接参数见 [SQL 工具](/reference/sql-tools.md)。

## 查询未入库的数据文件

GreptimeDB 可以直接对外部数据文件执行 SQL 查询，见[查询外部数据](./query-external-data.md)。
