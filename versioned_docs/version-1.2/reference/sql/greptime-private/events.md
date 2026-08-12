---
keywords: [events, greptime private, system tables]
description: The events table in the `greptime_private` database.
---

# events

The `events` table stores events recorded while GreptimeDB runs. Standalone
deployments record supported local DDL Procedure events. In distributed
deployments, Metasrv can also record Region and maintenance event types. Event
recording is asynchronous and best-effort, so rows are not an acknowledgement
that an operation succeeded.

The table is created when the first event is recorded. If no event has been
recorded, or event recording is disabled, querying it returns a table-not-found
error. Configure recording in [Lifecycle event recorder](/user-guide/deployments-administration/configuration.md#lifecycle-event-recorder).

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
