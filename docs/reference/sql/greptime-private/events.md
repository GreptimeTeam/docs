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

The first event creates the internal `greptime.greptime_private.events` table, even
when the server-side global `auto_create_table` setting is `false`. When an existing
events table is missing columns from the current event schema, recording an event
adds the missing columns. This exception applies only to the internal events table;
`auto_create_table=false` still prevents automatic creation and schema changes for
user tables. If no event has been recorded, or event recording is disabled,
querying it returns a table-not-found error. Configure recording in [Event recording](/user-guide/deployments-administration/configuration.md#event-recording).

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
