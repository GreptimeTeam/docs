---
keywords: [events, greptime private, system tables]
description: The events table in the `greptime_private` database.
---

# events

The `events` table stores lifecycle and operational events recorded while
GreptimeDB runs. Event recording is asynchronous and best-effort, so rows are
not an acknowledgement that an operation succeeded.

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

For the event data model and queries for DDL Procedures, see [Events](/user-guide/deployments-administration/monitoring/events/overview.md).
