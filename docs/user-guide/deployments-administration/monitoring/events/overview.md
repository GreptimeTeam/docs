---
keywords: [GreptimeDB events, lifecycle events, operational events, greptime_private]
description: Query lifecycle and operational events recorded in greptime_private.events.
---

# Events

The `greptime_private.events` table stores lifecycle and operational events. It helps operators inspect DDL changes and background procedures without searching service logs.

GreptimeDB writes event records asynchronously on a best-effort basis. A recent operation might not be visible immediately, and event recording should not be treated as the operation's success acknowledgement.

## Configure event recording

The lifecycle event recorder can be configured in standalone deployments or on Metasrv in distributed deployments. See [Lifecycle event recorder](/user-guide/deployments-administration/configuration.md#lifecycle-event-recorder) for configuration options and the supported type list.

Standalone deployments record supported local DDL Procedure events. Distributed deployments with Metasrv additionally record Region migration, Repartition, Batch GC, and WAL prune operational events.

## Query events

Start with a bounded query while investigating a recent operation:

```sql
SELECT type, procedure_id, procedure_state, timestamp
FROM greptime_private.events
ORDER BY timestamp DESC
LIMIT 20;
```

Use the following pages for focused queries and event details:

- [Query events](/user-guide/deployments-administration/monitoring/events/query-events.md)
- [Procedure lifecycle](/user-guide/deployments-administration/monitoring/events/procedure-lifecycle.md)
- [Event data model](/user-guide/deployments-administration/monitoring/events/event-data-model.md)
- [DDL events](/user-guide/deployments-administration/monitoring/events/ddl-events.md)
- [Operational events](/user-guide/deployments-administration/monitoring/events/operational-events.md)
