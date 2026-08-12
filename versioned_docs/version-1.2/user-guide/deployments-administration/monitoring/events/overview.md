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

The event recorder can be configured in standalone deployments or on Metasrv in distributed deployments. See [Lifecycle event recorder](/user-guide/deployments-administration/configuration.md#lifecycle-event-recorder) for configuration options and the supported type list.

Standalone deployments record supported local DDL Procedure events. Distributed deployments with Metasrv can additionally record operational event types.

## Query events

The table is created when the first event is recorded. If no event has been
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
