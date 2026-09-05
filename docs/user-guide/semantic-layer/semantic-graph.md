---
keywords: [semantic graph, entity graph, semantic_entities, semantic_relationships, service graph, topology, RED metrics, root cause analysis]
description: The semantic_entities and semantic_relationships tables — their schemas, how rows are derived, the query window contract, and query patterns.
---

# Semantic graph

:::warning
The semantic graph is experimental. Table names, column names, and derivation rules may change in future releases.
:::

The semantic graph is two read-only tables under `greptime_private`:

| Table | Contents |
| --- | --- |
| `semantic_entities` | The node set: the entities the telemetry describes. |
| `semantic_relationships` | The edge set: typed relationships between those entities. |

Both are computed when you query them. Scanning either one collects the entity declarations that tables carry, builds a query plan per declaring table, and runs it over the telemetry within the queried time window. Nothing is stored, except edges you declare by hand.

Every write path against the two tables is rejected: `INSERT`, `CREATE`, `ALTER`, `TRUNCATE`, and `DROP` all fail with a read-only error. Renaming another table into either name is rejected too.

```sql
SELECT entity_type, entity_id, source_tables
FROM greptime_private.semantic_entities
WHERE observed_at >= now() - INTERVAL '15' MINUTE;
```

## `semantic_entities`

One row per distinct entity observation from one contributing table in one 60-second window. An entity declared by three tables produces at least three rows per window, so deduplicate with `SELECT DISTINCT entity_type, entity_id` when you want a node set.

| Column | Type | Description |
| --- | --- | --- |
| `observed_at` | `TimestampMillisecond` | Time index. The 60-second bucket the entity was observed in. |
| `window_start` | `TimestampMillisecond` | Start of the observation window. |
| `window_end` | `TimestampMillisecond` | End of the window (`window_start` + 60s). |
| `fresh_until` | `TimestampMillisecond` | Time up to which the entity counts as present. Equals `window_end` for derived rows. |
| `entity_type` | `String` | The entity's type, for example `service`, `host`, `k8s.pod`, `gen_ai.agent`. |
| `entity_id` | `String` | Canonical identifier: the identifying column values in declared order, escaped and joined with `,`. |
| `entity_id_attrs` | `Json` | The identifying attributes as an object, so a consumer holding an id can tell which columns produced it. |
| `scope` | `String` | Namespace or environment the id is scoped to; empty when the declaration names no scope column. |
| `descriptive` | `Json` | Snapshot of the declared non-identifying attributes; `NULL` when none were declared. |
| `source_tables` | `Json` | Array of the telemetry tables that contributed this observation, as `schema.table`. |

An entity id renders values, not column names. A service that appears as `service_name` in a trace table and as `job` in a metric table is therefore one node, provided the two columns carry the same value.

The rows below come from a single metric table, `graph_app_metrics`, that declares `service` (scoped by an `env` column), `service.instance`, `host`, and a `process` identified by `service_name` plus `host`:

```sql
SELECT entity_type, entity_id, entity_id_attrs, scope, descriptive, source_tables
FROM greptime_private.semantic_entities
WHERE observed_at >= now() - INTERVAL '15' MINUTE
ORDER BY entity_type, entity_id;
```

```sql
+------------------+-----------+-------------------------------------+---------+-------------------+------------------------------+
| entity_type      | entity_id | entity_id_attrs                     | scope   | descriptive       | source_tables                |
+------------------+-----------+-------------------------------------+---------+-------------------+------------------------------+
| host             | h1        | {"host":"h1"}                       |         |                   | ["public.graph_app_metrics"] |
| process          | cart,h1   | {"host":"h1","service_name":"cart"} |         | {"env":"us-east"} | ["public.graph_app_metrics"] |
| service          | cart      | {"service_name":"cart"}             | us-east |                   | ["public.graph_app_metrics"] |
| service.instance | cart-0    | {"instance":"cart-0"}               |         |                   | ["public.graph_app_metrics"] |
+------------------+-----------+-------------------------------------+---------+-------------------+------------------------------+
```

`source_tables` holds table names for a follow-up query; SQL does not dereference it. Read the entity's telemetry by querying those tables directly.

## `semantic_relationships`

One row per relationship observed in a 60-second window.

| Column | Type | Description |
| --- | --- | --- |
| `observed_at` | `TimestampMillisecond` | Time index. The 60-second bucket the edge was observed in. |
| `window_start` | `TimestampMillisecond` | Start of the observation window. |
| `window_end` | `TimestampMillisecond` | End of the window (`window_start` + 60s). |
| `fresh_until` | `TimestampMillisecond` | Time up to which the edge counts as live. |
| `src_type` / `src_id` | `String` | Type and canonical id of the source endpoint. |
| `dst_type` / `dst_id` | `String` | Type and canonical id of the destination endpoint. |
| `rel_type` | `String` | The relationship kind. Direction is `src` → `dst`. |
| `provenance` | `String` | How the edge was obtained: `trace`, `attribute`, `declared`, or `agent`. |
| `confidence` | `Float64` | Derivation certainty in `[0, 1]`. |
| `request_count` | `Int64` | Requests over the window. `calls` edges only. |
| `unmatched_count` | `Int64` | Client spans on this edge with no matching server span. |
| `error_count` | `Int64` | Errored requests over the window. |
| `duration_sum` | `Float64` | Sum of request durations in seconds. |
| `duration_count` | `Int64` | Number of durations summed. Pair with `duration_sum` for an average. |
| `duration_max` | `Float64` | Longest single request in seconds, over the population `duration_sum` covers. |
| `attributes` | `Json` | Edge attributes, for example `{"connection_type":"database"}`. |

### Relationship types

| `rel_type` | Meaning (src → dst) | How it is derived |
| --- | --- | --- |
| `calls` | A service calls a service; an agent calls a sub-agent | Paired trace spans |
| `runs_on` | A `service.instance`, `process`, `container`, `k8s.pod`, or `k8s.container` runs on a `host`, `k8s.node`, `k8s.pod`, or `container` | Two identities on the same row |
| `contains` | A `k8s.pod` contains a `k8s.container` | Two identities on the same row |
| `part_of` | A `service.instance` belongs to a `service`; a `k8s.pod` belongs to a `k8s.workload` | Two identities on the same row |
| `uses` | A `gen_ai.agent` uses a `gen_ai.model` | Two identities on the same trace row |
| `invokes` | A `gen_ai.agent` invokes a `gen_ai.tool` | Two identities on the same trace row |
| `depends_on` | A logical dependency | Declared by hand |
| `owns` | A team or service owns the destination | Declared by hand |

Only the stored direction exists. The inverse (`called_by`, `hosts`, `dependency_of`) is a query concern: swap the endpoint filter. A custom `rel_type` in a declared edge is just a string; only the derivation rules and the vocabulary above are built in.

`provenance` is part of an edge's identity, so a hand-declared edge and a derived edge between the same pair coexist, and a declared edge survives even when nothing derives it.

`confidence` expresses derivation certainty, not statistical completeness. It is `1.0` for a paired or declared edge and `0.5` for a virtual-node edge. It does not correct for trace sampling.

### Derived call edges

The `calls` derivation pairs each client span with its child server span across all trace tables: a match on `trace_id` where the server span's `parent_span_id` equals the client span's `span_id`. Matched pairs are aggregated per 60-second window into the RED columns. This is the SQL form of the Tempo service graph processor and the OpenTelemetry Collector `service_graph` connector.

Spans of one trace can live in different tables when a deployment routes them with `x-greptime-trace-table-name`. The derivation unions the trace tables before pairing, so a cross-table pair still produces one edge.

A client span with no matching server span points at an uninstrumented peer. It becomes an edge to a **virtual node** named from the first span attribute present, in this order:

| Attribute column | `connection_type` |
| --- | --- |
| `span_attributes.service.peer.name` | `virtual_node` |
| `span_attributes.peer.service` | `virtual_node` |
| `span_attributes.db.namespace` | `database` |
| `span_attributes.db.name` | `database` |
| `span_attributes.server.address` | `virtual_node` |

Virtual-node edges carry `confidence` `0.5` and the `connection_type` in `attributes`. When a window holds any real pair for an edge, the RED columns describe the pairs alone and the unmatched clients are reported in `unmatched_count` on the same row — which is what separates a callee that stopped responding from traffic that stopped arriving.

```sql
SELECT src_id, dst_id, rel_type, provenance, confidence,
       request_count, unmatched_count, error_count,
       duration_sum, duration_count, duration_max, attributes
FROM greptime_private.semantic_relationships
WHERE observed_at >= now() - INTERVAL '15' MINUTE
ORDER BY dst_id;
```

```sql
+----------+-----------+----------+------------+------------+---------------+-----------------+-------------+--------------+----------------+--------------+------------------------------------+
| src_id   | dst_id    | rel_type | provenance | confidence | request_count | unmatched_count | error_count | duration_sum | duration_count | duration_max | attributes                         |
+----------+-----------+----------+------------+------------+---------------+-----------------+-------------+--------------+----------------+--------------+------------------------------------+
| frontend | cart      | calls    | trace      | 1          | 2             | 0               | 1           | 2            | 2              | 1.5          |                                    |
| frontend | orders-db | calls    | trace      | 0.5        | 1             | 1               | 0           | 0.1          | 1              | 0.1          | {"connection_type":"database"}     |
| frontend | redis     | calls    | trace      | 0.5        | 1             | 1               | 0           | 0.25         | 1              | 0.25         | {"connection_type":"virtual_node"} |
+----------+-----------+----------+------------+------------+---------------+-----------------+-------------+--------------+----------------+--------------+------------------------------------+
```

RED metrics describe the span pairs actually stored. Under sampling, counts understate real traffic, and ratios such as error rate are representative only when sampling is unbiased with respect to status and latency; tail sampling that keeps errors and slow traces skews both.

### Derived containment and hosting edges

A row carrying the identities of two entities witnesses a relationship between them, with the direction and type fixed by the built-in vocabulary. These edges carry `provenance` `attribute`, except agent edges from trace rows, which carry `trace`. The rule set is in [Relationships from co-declared identities](./declaring-entities.md#relationships-from-co-declared-identities).

## The query window

Derivation runs over a time window taken from the `observed_at` predicate:

| Predicate | Window |
| --- | --- |
| None | The last hour |
| Lower bound only | From the bound up to now |
| Lower and upper bound | The queried range |
| Upper bound only, or a shape that cannot be extracted | Error |

```sql
SELECT src_id FROM greptime_private.semantic_relationships
WHERE observed_at < '2001-01-02 00:00:00';
```

```sql
ERROR 1815 (HY000): (EngineExecuteQuery): Invalid SQL, error: the observed_at filter has no lower bound; the graph cannot derive over unbounded history — add e.g. observed_at >= '2026-01-01 00:00:00'
```

Use plain range predicates (`>=`, `<`, `BETWEEN`) with literal bounds or `now() - INTERVAL '15' MINUTE`. Disjunctive shapes such as `OR` and `IN` over `observed_at` are rejected the same way.

The source scan is widened to whole 60-second buckets, so RED metrics at the window boundaries are complete rather than truncated.

The window is the resource bound: a bare `SELECT * FROM greptime_private.semantic_entities` scans at most the last hour of each declaring table, and a wider window scans more.

## Permissions

Derivation runs as the caller. Each source table is authorized individually: a table the caller cannot read is excluded from the result, along with its entities, its descriptive attributes, and its `source_tables` entries. A join-derived edge requires read access to every table it joins. Querying the graph never widens access to the underlying telemetry.

## Query patterns

### Which entities exist

```sql
SELECT DISTINCT entity_type, entity_id
FROM greptime_private.semantic_entities
WHERE observed_at >= now() - INTERVAL '15' MINUTE
ORDER BY entity_type, entity_id;
```

### The current topology

```sql
SELECT DISTINCT src_type, src_id, rel_type, dst_type, dst_id, provenance
FROM greptime_private.semantic_relationships
WHERE fresh_until >= now() - INTERVAL '5' MINUTE
  AND observed_at >= now() - INTERVAL '15' MINUTE;
```

### Downstream dependencies of one service, worst first

```sql
SELECT dst_id,
       sum(request_count) AS requests,
       sum(error_count) AS errors,
       max(duration_max) AS slowest
FROM greptime_private.semantic_relationships
WHERE src_type = 'service' AND src_id = 'frontend'
  AND rel_type = 'calls'
  AND observed_at >= now() - INTERVAL '15' MINUTE
GROUP BY dst_id
ORDER BY errors DESC;
```

### Who calls a service

```sql
SELECT DISTINCT src_id
FROM greptime_private.semantic_relationships
WHERE dst_type = 'service' AND dst_id = 'cart'
  AND rel_type = 'calls'
  AND observed_at >= now() - INTERVAL '15' MINUTE;
```

### Where a service runs

Instances belong to a service through `part_of` and point at their host through `runs_on`, so the answer is a join of the two:

```sql
SELECT DISTINCT hosts.dst_type, hosts.dst_id
FROM greptime_private.semantic_relationships AS belongs
JOIN greptime_private.semantic_relationships AS hosts
  ON hosts.src_type = belongs.src_type AND hosts.src_id = belongs.src_id
WHERE belongs.rel_type = 'part_of'
  AND belongs.dst_type = 'service' AND belongs.dst_id = 'cart'
  AND hosts.rel_type = 'runs_on'
  AND belongs.observed_at >= now() - INTERVAL '15' MINUTE
  AND hosts.observed_at >= now() - INTERVAL '15' MINUTE;
```

### Which tables hold an entity's telemetry

```sql
SELECT DISTINCT source_tables
FROM greptime_private.semantic_entities
WHERE entity_type = 'service' AND entity_id = 'cart'
  AND observed_at >= now() - INTERVAL '15' MINUTE;
```

### Multi-hop traversal

Add one self-join per hop. A `LEFT JOIN` keeps the neighbours that have no further hop:

```sql
SELECT DISTINCT hop1.dst_id AS depth1, hop2.dst_id AS depth2
FROM greptime_private.semantic_relationships AS hop1
LEFT JOIN greptime_private.semantic_relationships AS hop2
  ON hop2.src_id = hop1.dst_id
  AND hop2.rel_type = 'calls'
  AND hop2.observed_at >= now() - INTERVAL '15' MINUTE
WHERE hop1.src_type = 'service' AND hop1.src_id = 'frontend'
  AND hop1.rel_type = 'calls'
  AND hop1.observed_at >= now() - INTERVAL '15' MINUTE
ORDER BY depth1, depth2;
```

Recursive CTEs are not supported over the graph tables: a `WITH RECURSIVE` term that scans `semantic_entities` or `semantic_relationships` fails with `Execution error: Stream already exhausted`.

## Limitations

- Entity rows are per observation. Deduplicate in the query.
- RED metrics reflect stored span pairs, not real traffic under sampling.
- Two tables naming the same entity with different values produce two nodes. Align the identifying values, or declare identity columns that carry the same values.
- Read-time derivation repeats its work on every scan. Very large trace tables make wide windows expensive.
- Traversal depth is fixed at query-writing time: one self-join per hop, no `WITH RECURSIVE`.
- The ISO SQL/PGQ `GRAPH_TABLE` / `MATCH` surface is not implemented.
