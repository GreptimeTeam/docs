---
keywords: [observability 2.0, wide events, unified observability, three pillars, high cardinality, AI agents]
description: Explains the Observability 2.0 paradigm and how GreptimeDB is designed as the native database for wide events.
---

# Observability 2.0

Observability 2.0 represents an evolution from the foundational "three pillars" (metrics, logs, and traces) toward a unified data foundation based on high-cardinality, wide-event datasets. Instead of maintaining separate systems for each signal type, this approach emphasizes a single source of truth that enables retroactive analysis rather than pre-aggregation.

Despite its contested naming, the core concept is clear: breaking down the silos between metrics, logs, and traces to provide a more comprehensive view of modern distributed systems.

## The Limits of Three Pillars

For years, observability has relied on the three pillars of metrics, logs, and traces. While these pillars spawned countless successful tools (including [OpenTelemetry](/user-guide/ingest-data/for-observability/opentelemetry.md)), their limitations become evident as systems grow in complexity:

1. **Data silos**: Metrics, logs, and traces are stored separately, leading to uncorrelated datasets. Correlating a spike in error metrics with log patterns requires manual context-switching between systems.

2. **Granularity vs. cost**: Traditional metrics sacrifice detail through pre-aggregation. But retaining full granularity creates millions of time-series with redundant metadata across systems, driving costs up instead of down.

3. **Unstructured logs**: While logs inherently contain structured data, extracting meaning requires intensive parsing, indexing, and computational effort.

These limitations become even more pronounced in modern scenarios like AI agents and microservices, where high-dimensional, semi-structured data is the norm rather than the exception.

## Wide Events: A Unified Data Model

Observability 2.0 addresses these issues by adopting **wide events** as its foundational data structure. A wide event is a context-rich, high-dimensional, and high-cardinality record that captures complete application state in a single event.

### What is a Wide Event?

Instead of precomputing metrics or structuring logs upfront, wide events preserve raw, high-fidelity event data as the single source of truth. For example, a single wide event for a POST request might include:

- User information and subscription data
- Database queries with parameters
- Cache operations
- HTTP headers
- Total: 2KB+ of contextual data in one record

```json
{
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
    "query": "INSERT INTO articles (...)",
    "parameters": { "$1": "f8d4d21c-..." }
  },
  "cache": { "operation": "write", "key": "..." },
  "headers": { "user-agent": "...", "cf-connecting-ip": "..." }
}
```

### Metrics, Logs, and Traces as Projections

Wide events fundamentally change how we think about observability data. Metrics, logs, and traces are not separate data types—they are different projections of the same underlying events:

- **Metrics**: `SELECT COUNT(*) GROUP BY status, date_bin('1m', timestamp)` — aggregated projection
- **Logs**: `SELECT message, timestamp WHERE message @@ 'error'` — text projection
- **Traces**: `SELECT span_id, duration WHERE trace_id = '...'` — relational projection

This allows teams to perform exploratory analysis retroactively, deriving any metric, log query, or trace view from the original dataset—without pre-aggregation or code changes.

## AI and the Need for Fine-Grained Observability

AI agents introduce a new level of observability complexity due to their non-deterministic behavior. Unlike traditional applications with predictable code paths, agents make dynamic decisions—choosing tools, reasoning through multi-step plans, and adapting responses based on context. Debugging "why did the agent do X?" requires preserving complete execution state: the full prompt, reasoning chain, tool calls with parameters, memory state, and quality scores—all in a single queryable record.

This is where wide events become essential. Traditional three-pillar approaches fail here: stuffing prompts into logs loses structure and makes analysis impossible, forcing tool calls into traces is too rigid for dynamic behavior, and pre-aggregating token metrics loses the critical context needed for debugging. AI agents produce high-cardinality (millions of unique sessions), high-dimensional (dozens of fields per execution), context-rich events—exactly what wide events are designed to handle. This isn't "observability for the AI age" as a marketing slogan; it's a direct technical consequence: non-deterministic systems require fine-grained, structured, retroactive analysis that only wide events can provide.

## Why GreptimeDB is Built for This

GreptimeDB's [architecture](/user-guide/concepts/architecture.md) naturally aligns with the Observability 2.0 paradigm. Its columnar engine efficiently compresses wide events (achieving 50–90% storage reduction in production), and [native object storage](/user-guide/concepts/storage-location.md) (S3, Azure Blob, GCS) keeps costs low as wide event volumes grow. Below are the capabilities that matter most for wide events.

### Unified Tag + Timestamp + Field Model

All observability data—metrics, logs, traces—share the same [schema model](/user-guide/concepts/data-model.md) in GreptimeDB:
- **Tags**: Entity identifiers (pod_name, service, region, trace_id, session_id)
- **Timestamp**: Temporal tracking
- **Fields**: Multi-dimensional values (message, duration, status_code, prompts, responses)

This unified model enables cross-signal correlation in a single SQL query.

### SQL + PromQL for Cross-Signal Correlation

Use one [SQL query](/user-guide/query-data/sql.md) to correlate metrics spikes, log patterns, and trace latency:

```sql
SELECT
  date_bin('1m', timestamp) AS minute,
  COUNT(*) FILTER (WHERE status >= 500) AS errors,
  AVG(duration) AS avg_latency
FROM access_logs
WHERE timestamp >= NOW() - INTERVAL '1 hour'
  AND message @@ 'timeout'
GROUP BY minute;
```

No context-switching between systems—all signals in one database. GreptimeDB also supports [PromQL](/user-guide/query-data/promql.md) for metrics queries, maintaining compatibility with existing dashboards.

### Flow Engine for Real-Time Derivation

GreptimeDB's [Flow Engine](/user-guide/flow-computation/overview.md) derives metrics from raw events in real-time without preprocessing pipelines:

```sql
CREATE FLOW http_status_count
SINK TO status_metrics
AS
SELECT
  status,
  COUNT(*) AS count,
  date_bin('1m', timestamp) AS time_window
FROM access_logs
GROUP BY status, time_window;
```

Metrics are computed continuously from raw wide events, enabling both pre-aggregated dashboards and ad-hoc exploratory queries on the same dataset.

## Wide Events in Production

Wide events are proven in production at scale:

- **Poizon (得物)**: One of the early production deployments of Wide Events. Flow Engine with multi-level continuous aggregation reduced P99 latency from seconds to milliseconds. [Read more →](https://greptime.com/blogs/2025-05-06-poizon-observability-greptimedb-monitoring-use-case)

- **OB Cloud**: Replaced Loki for billions of logs daily across 170+ availability zones. 10x query performance, 30% TCO reduction. [Read more →](https://greptime.com/blogs/2025-08-07-beyond-loki-greptimedb-log-scenario-performance-report)

- **Trace Storage**: Replaced Elasticsearch as Jaeger backend. 45x storage cost reduction, 3x faster cold queries, enabled full-volume tracing at 400B rows/day. [Read more →](https://greptime.com/blogs/2025-04-24-elasticsearch-greptimedb-comparison-performance)

## Getting Started

Transitioning to Observability 2.0 doesn't require ripping out your entire stack. Start from any pillar—[logs](/user-guide/logs/overview.md), [metrics](/user-guide/ingest-data/for-observability/prometheus.md), or [traces](/user-guide/traces/overview.md)—and extend naturally. GreptimeDB supports [PromQL](/user-guide/query-data/promql.md), [Jaeger](/user-guide/query-data/jaeger.md), [OpenTelemetry](/user-guide/ingest-data/for-observability/opentelemetry.md), and [Grafana](/user-guide/integrations/grafana.md) out of the box, so existing dashboards and alerts keep working. See [Why GreptimeDB](./why-greptimedb.md) for detailed migration paths.

## Further Reading

- [Observability 2.0 and the Database for It](https://greptime.com/blogs/2025-04-25-greptimedb-observability2-new-database) — Full vision and technical deep dive
- [Unified Storage for Observability - GreptimeDB's Approach](https://greptime.com/blogs/2024-12-24-observability) — GreptimeDB's unified model philosophy
- [Agent Observability: Can the Old Playbook Handle the New Game?](https://greptime.com/blogs/2025-12-11-agent-observability) — Why AI agents need wide events
- [Scaling Observability at Poizon - Building a Cost-Effective and Real-Time Monitoring Architecture with GreptimeDB](https://greptime.com/blogs/2025-05-06-poizon-observability-greptimedb-monitoring-use-case) — First production-grade validation
- [Beyond Loki! GreptimeDB Log Scenario Performance Report Released](https://greptime.com/blogs/2025-08-07-beyond-loki-greptimedb-log-scenario-performance-report) — Logs pillar migration
- [Beyond ELK: Lightweight and Scalable Cloud-Native Log Monitoring](https://greptime.com/blogs/2025-04-24-elasticsearch-greptimedb-comparison-performance) — Traces pillar migration
