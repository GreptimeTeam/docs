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
`greptime_private.events` system table. If an existing table is missing columns
from the current event schema, the recorder adds them. It performs both actions
even when automatic table creation is disabled. Disabling event recording does
not remove an existing table. A query returns a table-not-found error only if the
table has never been created, for example because event recording was disabled
before any event was recorded. Configure recording in [Event recording](/user-guide/deployments-administration/configuration.md#event-recording).

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
