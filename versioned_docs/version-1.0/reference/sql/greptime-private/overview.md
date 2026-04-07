---
keywords: [system tables, greptime private, pipelines, slow queries]
description: The overview of system tables in the `greptime_private` database.
---

# Greptime Private

GreptimeDB stores some important internal information as system tables in the `greptime_private` database. Similar to the normal tables, the system tables will be persistently stored. You can obtain system configurations and statistical information through the system tables.

## Tables

| Table Name                          | Description                                                                                   |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| [`slow_queries`](./slow_queries.md) | Contains GreptimeDB slow query information, including query statements, execution times, etc. |
| [`pipelines`](./pipelines.md)       | Contains GreptimeDB Pipeline information.                                                     |
