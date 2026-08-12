---
keywords: [GreptimeDB events, Procedure events, Region events, maintenance events, greptime_private]
description: Query event records in greptime_private.events.
---

# Events

The `greptime_private.events` table stores events recorded while GreptimeDB runs.
Use it to inspect DDL changes and background Procedures without searching service
logs.

GreptimeDB writes event records asynchronously on a best-effort basis. Records
are normally flushed every five seconds, so a recent operation might not appear
immediately. An event row does not confirm that the operation succeeded.

## Configure event recording

The event recorder can be configured in standalone deployments or on Metasrv in distributed deployments. See [Lifecycle event recorder](/user-guide/deployments-administration/configuration.md#lifecycle-event-recorder) for configuration options and the supported type list.

Standalone deployments record supported local DDL Procedure events. In distributed
deployments, Metasrv can also record Region and maintenance events.

## Query events

The table is created when the first event is recorded. If no event has been
recorded yet, or event recording is disabled, this query returns a table-not-found
error.

When investigating a recent operation, start with a bounded query:

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
