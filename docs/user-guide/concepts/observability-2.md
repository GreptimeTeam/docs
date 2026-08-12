---
keywords: [observability 2.0, wide events, unified observability, three pillars, high cardinality, AI agents]
description: Explains Observability 2.0 as a unified observability data model, its trade-offs, and how the approach maps to GreptimeDB.
---

# Observability 2.0

Observability 2.0 is an industry term for an approach to telemetry, not a product category. It usually refers to retaining context-rich events and analyzing them without deciding every question in advance.

GreptimeDB supports this approach, but does not require it. Metrics, logs, and traces remain first-class capabilities. GreptimeDB provides ingestion paths for each signal, SQL queries across all signal types, PromQL for metrics, and an experimental Jaeger-compatible query API for traces. You can keep these signals in their existing forms, introduce wide events for selected workloads, or use both models together.

## The Limits of Three Pillars

Metrics, logs, and traces remain useful abstractions. The problem is not the signals themselves, but the operational boundary that often forms around each one:

1. **Separate context**: When signals are stored and queried in separate systems, correlating an alert with the relevant logs and traces takes extra work.
2. **Questions fixed at collection time**: Pre-aggregated metrics answer known questions efficiently, but cannot recover dimensions that were not recorded.
3. **Lost structure**: Plain-text logs often contain useful fields that are expensive to parse and index later.

A unified model reduces these boundaries by using consistent schemas and query tools. Wide events are one way to retain more context, not a replacement for every metric, log, or trace.

## Wide Events: A Unified Data Model

A wide event is a structured record with many fields describing one operation or business event. It can include high-cardinality values such as user IDs, session IDs, trace IDs, and request attributes.

### What is a Wide Event?

For example, an event for a POST request might include user and subscription data, database and cache operations, HTTP attributes, outcome, and duration:

```json
{
  "timestamp": "2026-08-12T08:15:30Z",
  "method": "POST",
  "path": "/articles",
  "service": "articles",
  "outcome": "ok",
  "status_code": 201,
  "duration": 268,
  "user": {
    "id": "fdc4ddd4-8b30-4ee9-83aa-abd2e59e9603",
    "subscription": { "plan": "free", "trial": true }
  },
  "db": {
    "query": "INSERT INTO articles (...)"
  },
  "cache": { "operation": "write" },
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736"
}
```

Capture only the context that is useful and safe to retain. Credentials, personal data, query parameters, prompts, and request bodies may require filtering or redaction before ingestion.

<AnchorAlias id="metrics-logs-and-traces-as-projections" />

### Views Derived from Context-Rich Events

In this approach, a context-rich event can produce several views:

- a metric aggregated by status and time window;
- a searchable log record containing the event details;
- a trace or span view linked by trace and span IDs.

This is a useful mental model, not a requirement that every signal must be reconstructed from raw events. Native metrics are often the better representation for fixed aggregations, and standard trace data remains useful for call graphs and latency analysis.

## AI and the Need for Fine-Grained Observability

AI applications often need to relate model requests, responses, tool calls, latency, token use, evaluations, and application state. A structured event can keep this context queryable when the instrumentation captures it.

The same trade-offs apply as in other workloads: prompts and responses can be large or sensitive, session identifiers create high cardinality, and incomplete instrumentation produces incomplete context. Teams should choose fields, retention periods, and redaction rules based on the questions they need to answer.

The [table semantic layer](./semantic-layer.md) can describe what each table represents so that agents and tools do not have to infer signal type, source, or metric type from column names.

<AnchorAlias id="why-greptimedb-is-built-for-this" />

## How GreptimeDB Maps to This Model

<AnchorAlias id="unified-tag--timestamp--field-model" />
<AnchorAlias id="sql--promql-for-cross-signal-correlation" />
<AnchorAlias id="flow-engine-for-real-time-derivation" />
<AnchorAlias id="wide-events-in-production" />

GreptimeDB uses a common [data model](/user-guide/concepts/data-model.md) and query layer across observability workloads. The mapping is:

| Pattern | GreptimeDB capability | How to use it |
| --- | --- | --- |
| Native metrics | Prometheus remote write and PromQL | Keep metrics and existing dashboards in their native form. |
| Logs and traces | Loki Push API, OpenTelemetry, Elasticsearch Bulk API, and the experimental Jaeger-compatible query API | Ingest with the supported protocols; query all signal types with SQL, and traces with the experimental Jaeger-compatible API. |
| Shared schema concepts | Tag, timestamp, and field columns | Apply a consistent table model across different telemetry tables. |
| Context-rich events | Wide tables, SQL, and object-storage-backed storage | Keep selected raw events for detailed or retrospective analysis. |
| Derived metrics | [Flow](/user-guide/flow-computation/overview.md) | Continuously aggregate raw events into a separate metrics table. |
| Cross-signal analysis | SQL across tables and shared correlation identifiers | Relate signals when their schemas and instrumentation provide common keys. |

**A unified table model does not mean writing all data into one physical table.** Metrics, logs, traces, and raw events can use separate tables with different schemas, retention policies, and indexes. The unification is at the schema concepts, storage system, and query layer.

For example, Flow can derive a status metric from an event table:

```sql
CREATE FLOW http_status_count
SINK TO status_metrics
AS
SELECT
  status_code,
  COUNT(*) AS count,
  date_bin('1 minute'::INTERVAL, timestamp) AS time_window
FROM access_logs
GROUP BY status_code, time_window;
```

The raw events remain available for detailed SQL queries, while the sink table serves fixed dashboards and alerts efficiently.

## Trade-offs

The unified-event approach changes where you pay for flexibility:

- **Wider events increase data volume.** More fields and repeated context consume ingestion bandwidth and storage, even with columnar compression.
- **High cardinality and long retention increase cost.** Keep only useful dimensions, and set retention independently for raw and derived data.
- **Complete context depends on instrumentation quality.** Missing identifiers, inconsistent schemas, or poor propagation cannot be repaired by the database.
- **Native metrics still fit fixed aggregations.** Counters, gauges, histograms, recording rules, dashboards, and alerts usually do not need a raw event behind every sample.

Schema governance, sampling, redaction, and retention are part of the design. A wide event should be as wide as the investigation requires, not as wide as the application can produce.

<AnchorAlias id="getting-started" />

## Adoption Paths

### Keep Native Signals and Unify Storage and Query

Continue using existing ingestion protocols. Query metrics with PromQL, query all signal types with SQL, and use the experimental Jaeger-compatible API for traces. Store each signal in separate GreptimeDB tables, and use shared identifiers and SQL when cross-signal analysis is needed. This path minimizes instrumentation and dashboard changes.

Start with [Prometheus](/user-guide/ingest-data/for-observability/prometheus.md), [logs](/user-guide/logs/overview.md), [OpenTelemetry](/user-guide/ingest-data/for-observability/opentelemetry.md), or [traces](/user-guide/traces/overview.md).

### Add Raw Events Where Full Context Matters

Instrument selected business operations or AI workflows as structured events. Keep the raw event table for retrospective analysis, and use [Flow](/user-guide/flow-computation/overview.md) to derive metrics for known dashboards and alerts. This path provides more context at the cost of higher data volume and stricter schema and retention management.

The two paths can coexist. Adopt raw events only where the additional context justifies their cost.

## Further Reading

- [Observability 2.0 and the Database for It](https://greptime.com/blogs/2025-04-25-greptimedb-observability2-new-database) — An earlier description of the wide-event approach
- [Unified Storage for Observability - GreptimeDB's Approach](https://greptime.com/blogs/2024-12-24-observability) — GreptimeDB's unified storage model
- [Agent Observability: Can the Old Playbook Handle the New Game?](https://greptime.com/blogs/2025-12-11-agent-observability) — Context needed for AI application debugging
- [Scaling Observability at Poizon](https://greptime.com/blogs/2025-05-06-poizon-observability-greptimedb-monitoring-use-case) — Raw events and continuous aggregation in production
