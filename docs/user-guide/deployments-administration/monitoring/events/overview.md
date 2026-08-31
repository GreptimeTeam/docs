---
keywords: [GreptimeDB events, Procedure events, operational events, greptime_private]
description: Query event records in greptime_private.events.
---

# Events

The `greptime_private.events` table stores events recorded while GreptimeDB runs. It helps operators inspect DDL changes and background procedures without searching service logs.

GreptimeDB writes event records asynchronously on a best-effort basis. Records are
normally flushed every five seconds, so a recent operation might not be visible
immediately. Event recording should not be treated as the operation's success
acknowledgement.

## Configure event recording

See [Event recording](/user-guide/deployments-administration/configuration.md#event-recording) for configuration options and the event types supported by standalone, Frontend, and Metasrv.

## Query events

When the event recorder writes its first event, it creates the
`greptime_private.events` system table. If an existing table is missing columns
from the current event schema, the recorder adds them. It performs both actions
even when automatic table creation is disabled. If no event has been recorded yet,
or event recording is disabled, this query returns a table-not-found error.

Start with a bounded query while investigating a recent operation:

```sql
SELECT timestamp, type
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```

Use the following pages for focused queries and event details:

- [Query events](/user-guide/deployments-administration/monitoring/events/query-events.md)
- [Event data model](/user-guide/deployments-administration/monitoring/events/event-data-model.md)
- [DDL events](/user-guide/deployments-administration/monitoring/events/ddl-events.md)
- [Region events](/user-guide/deployments-administration/monitoring/events/region-events.md)
- [Maintenance events](/user-guide/deployments-administration/monitoring/events/maintenance-events.md)
