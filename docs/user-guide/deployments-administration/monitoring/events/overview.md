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

The first event creates the internal `greptime.greptime_private.events` table, even
when the server-side global `auto_create_table` setting is `false`. Recording an event
also adds columns missing from an existing events table. This exception applies
only to the internal events table; `auto_create_table=false` still prevents
automatic creation and schema changes for user tables. If no event has been
recorded yet, or event recording is disabled, this query returns a table-not-found
error.

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
