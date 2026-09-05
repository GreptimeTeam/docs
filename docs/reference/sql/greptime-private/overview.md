---
keywords: [system tables, greptime private, pipelines, slow queries, semantic graph]
description: The overview of system tables in the `greptime_private` database.
---

# Greptime Private

GreptimeDB stores some important internal information as system tables in the `greptime_private` database. Similar to the normal tables, the system tables will be persistently stored. You can obtain system configurations and statistical information through the system tables.

## Tables

| Table Name                          | Description                                                                                   |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| [`events`](./events.md) | Stores events recorded while GreptimeDB runs. |
| [`slow_queries`](./slow_queries.md) | Contains GreptimeDB slow query information, including query statements, execution times, etc. |
| [`pipelines`](./pipelines.md)       | Contains GreptimeDB Pipeline information.                                                     |
| [`semantic_entities`](./semantic-entities.md) | The entities the stored telemetry describes. Computed at read time. |
| [`semantic_relationships`](./semantic-relationships.md) | The relationships between those entities. Computed at read time. |
