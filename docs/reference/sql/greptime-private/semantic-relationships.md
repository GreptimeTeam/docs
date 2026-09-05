---
keywords: [semantic relationships, semantic graph, service graph, topology, RED metrics, greptime private]
description: The computed semantic_relationships table and the semantic_relationships_declared table in the `greptime_private` database.
---

# semantic_relationships

`semantic_relationships` is the edge set of the [semantic graph](/user-guide/semantic-layer/semantic-graph.md): typed, time-ranged relationships between entities.

The table is computed, not stored. Scanning it pairs trace spans, applies the co-declaration rules to the declaring tables, and unions the result with the rows of `semantic_relationships_declared`. It is read-only: `INSERT`, `CREATE`, `ALTER`, `TRUNCATE`, and `DROP` are rejected.

```sql
SELECT src_id, dst_id, rel_type, provenance, request_count, error_count
FROM greptime_private.semantic_relationships
WHERE observed_at >= now() - INTERVAL '15' MINUTE
ORDER BY dst_id;
```

| Column | Type | Description |
| --- | --- | --- |
| `observed_at` | `TimestampMillisecond` | Time index. The 60-second bucket the edge was observed in. |
| `window_start` | `TimestampMillisecond` | Start of the observation window. |
| `window_end` | `TimestampMillisecond` | End of the window (`window_start` + 60 seconds). |
| `fresh_until` | `TimestampMillisecond` | Time up to which the edge counts as live. |
| `src_type` | `String` | Type of the source endpoint. |
| `src_id` | `String` | Canonical id of the source endpoint. |
| `dst_type` | `String` | Type of the destination endpoint. |
| `dst_id` | `String` | Canonical id of the destination endpoint. |
| `rel_type` | `String` | Relationship kind: `calls`, `runs_on`, `contains`, `part_of`, `uses`, `invokes`, `depends_on`, `owns`, or a custom value on a declared edge. Direction is `src` → `dst`. |
| `provenance` | `String` | How the edge was obtained: `trace` (paired spans), `attribute` (identities on the same row), `declared` (asserted by hand), or `agent` (inferred by an agent). |
| `confidence` | `Float64` | Derivation certainty in `[0, 1]`. `1.0` for paired and declared edges, `0.5` for virtual-node edges. It does not correct for trace sampling. |
| `request_count` | `Int64` | Requests over the window. `calls` edges only. |
| `unmatched_count` | `Int64` | Client spans on this edge with no matching server span. |
| `error_count` | `Int64` | Errored requests over the window. |
| `duration_sum` | `Float64` | Sum of request durations, in seconds. |
| `duration_count` | `Int64` | Number of durations summed. |
| `duration_max` | `Float64` | Longest single request, in seconds, over the population `duration_sum` covers. |
| `attributes` | `Json` | Edge attributes, for example `{"connection_type":"database"}`. |

`provenance` is part of an edge's identity, so a declared edge and a derived edge between the same pair coexist as separate rows.

The `observed_at` predicate bounds the derivation. Without one, the last hour is used; a predicate with no lower bound is an error. See [The query window](/user-guide/semantic-layer/semantic-graph.md#the-query-window).

Derivation runs with the querying user's permissions. Source tables the caller cannot read are excluded, and a join-derived edge requires read access to every table it joins.

## semantic_relationships_declared

`semantic_relationships_declared` is a physical table holding the edges you assert yourself. Its rows are unioned into `semantic_relationships`. GreptimeDB creates it with a canonical schema on the first `INSERT` and rejects user `CREATE` and `ALTER`; `INSERT`, `DELETE`, and `DROP` are allowed. It has a 90-day TTL.

It carries the same columns as `semantic_relationships`, minus `unmatched_count` and `duration_max`, plus:

| Column | Type | Description |
| --- | --- | --- |
| `valid_from` | `TimestampMillisecond` | Start of business validity. `NULL` means valid since the declaration. |
| `valid_until` | `TimestampMillisecond` | End of business validity. `NULL` means valid for as long as the row exists. |
| `scope` | `String` | Namespace or environment the edge is scoped to. Part of the primary key; not exposed by the computed table. |
| `generation_id` | `String` | Free-form generation marker. Part of the primary key; not exposed by the computed table. |

The primary key is `(src_type, src_id, rel_type, dst_type, dst_id, provenance, scope, generation_id)`, and `observed_at` is the time index. Re-inserting the same key stores a new revision; reads keep the latest revision as of the queried window.

See [Declaring edges by hand](/user-guide/semantic-layer/declaring-entities.md#declaring-edges-by-hand) for usage.
