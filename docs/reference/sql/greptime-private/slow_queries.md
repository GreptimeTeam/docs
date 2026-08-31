---
keywords: [slow queries, greptime private]
description: The slow queries table in the `greptime_private` database.
---

# slow_queries

The `slow_queries` table records SQL and PromQL queries selected by the slow-query recorder.
When the slow-query recorder writes to this table, it may create or additively
reconcile it even when automatic table creation is disabled by the server-side
global setting or a request-level `auto_create_table` hint. An entry in the
whitelist does not apply to other tables in the same write request.

:::tip NOTE
The `slow_queries` table requires slow query logging to be enabled. See [Slow Query](/user-guide/deployments-administration/monitoring/slow-query.md) for configuration details.
:::

```sql
USE greptime_private;

SELECT *
FROM slow_queries
ORDER BY timestamp DESC;
```

| Column | Type | Description |
| --- | --- | --- |
| `type` | `String` | Event type. Slow-query rows use `slow_query`. |
| `payload` | `Json` | Structured diagnostic context attached to the event. It can be JSON `null`. |
| `timestamp` | `TimestampNanosecond` | Time when the query event was recorded. |
| `cost` | `UInt64` | Query duration in milliseconds. |
| `threshold` | `UInt64` | Slow-query threshold in milliseconds. |
| `query` | `String` | SQL statement, PromQL expression, or planned query text. |
| `is_promql` | `Boolean` | Whether the row describes a PromQL query. |
| `promql_range` | `UInt64` | PromQL query range in milliseconds; `0` for non-PromQL queries. |
| `promql_step` | `UInt64` | PromQL step in milliseconds; `0` for non-PromQL queries. |
| `promql_start` | `TimestampMillisecond` | PromQL range start; Unix epoch for non-PromQL queries. |
| `promql_end` | `TimestampMillisecond` | PromQL range end; Unix epoch for non-PromQL queries. |
| `schema_name` | `String` | Database schema in which the query ran. |

See [Slow Query](/user-guide/deployments-administration/monitoring/slow-query.md) for configuration and retention behavior.
