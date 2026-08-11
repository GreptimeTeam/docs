---
keywords: [GreptimeDB events, Procedure events, operational events, greptime_private]
description: Query event records in greptime_private.events.
---

# Events

The `greptime_private.events` table stores events recorded while GreptimeDB runs. It helps operators inspect DDL changes and background procedures without searching service logs.

GreptimeDB writes event records asynchronously on a best-effort basis. A recent operation might not be visible immediately, and event recording should not be treated as the operation's success acknowledgement.

## Configure event recording

The event recorder can be configured in standalone deployments or on Metasrv in distributed deployments. See [Event recorder](/user-guide/deployments-administration/configuration.md#lifecycle-event-recorder) for configuration options and the supported type list.

Standalone deployments record supported local DDL Procedure events. Distributed deployments with Metasrv can additionally record operational event types.

## Query events

Start with a bounded query while investigating a recent operation:

```sql
SELECT type, procedure_id, procedure_state, timestamp
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```

Use the following pages for focused queries and event details:

- [Query events](/user-guide/deployments-administration/monitoring/events/query-events.md)
- [Procedure events](/user-guide/deployments-administration/monitoring/events/procedure-lifecycle.md)
- [Event data model](/user-guide/deployments-administration/monitoring/events/event-data-model.md)
- [DDL events](/user-guide/deployments-administration/monitoring/events/ddl-events.md)
