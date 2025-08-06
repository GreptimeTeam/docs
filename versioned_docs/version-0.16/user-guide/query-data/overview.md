---
keywords: [query languages, PromQL, SQL, views, CTE, query libraries, external data, log query]
description: Overview of query languages and features supported by GreptimeDB, including PromQL, SQL, and log query capabilities.
---

# Query Data

## Query languages

- [PromQL](./promql.md)
- [SQL](./sql.md)
- [Log Query](./log-query.md) (Experimental)

Since v0.9, GreptimeDB supports view and CTE just like other databases, used to simplify queries:

* [View](./view.md)
* [Common Table Expression (CTE)](./cte.md)

## Recommended libraries

Since GreptimeDB uses SQL as its main query language and supports both [MySQL](/user-guide/protocols/mysql.md) and [PostgreSQL](/user-guide/protocols/postgresql.md) protocols,
you can use mature SQL drivers that support MySQL or PostgreSQL to query data.

For more information, please refer to the [SQL Tools](/reference/sql-tools.md) documentation.

## Query external data

GreptimeDB has the capability to query external data files. For more information, please refer to the [Query External Data](./query-external-data.md) documentation.
