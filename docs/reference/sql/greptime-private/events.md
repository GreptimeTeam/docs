---
keywords: [events, greptime private, system tables]
description: The events table in the `greptime_private` database.
---

# events

The `events` table stores events recorded while GreptimeDB runs. Standalone
deployments record supported local DDL Procedure events. Distributed deployments
with Metasrv can additionally record operational event types. Event recording is
asynchronous and best-effort, so rows are not an acknowledgement that an
operation succeeded.

When the event recorder writes its first event, it creates the
`greptime_private.events` system table. During internal writes, this table,
`greptime_private.slow_queries`, and `greptime_private.region_statistics_history`
may be created or additively reconciled when automatic table creation is disabled
by the server-side global setting or a request-level `auto_create_table` hint.
An entry in the whitelist does not apply to other tables in the same write
request.
For `events`, reconciliation adds columns missing from the current event schema. If
no event has been recorded, or event recording is disabled, querying it returns a
table-not-found error. Configure recording in [Event recording](/user-guide/deployments-administration/configuration.md#event-recording).

```sql
USE greptime_private;

SELECT timestamp, type
FROM events
WHERE timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```

For column definitions, see [Event data model](/user-guide/deployments-administration/monitoring/events/event-data-model.md).
For DDL Procedure query examples, see [DDL events](/user-guide/deployments-administration/monitoring/events/ddl-events.md).
