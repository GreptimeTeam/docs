---
keywords: [semantic entities, semantic graph, entity registry, greptime private]
description: The computed semantic_entities table in the `greptime_private` database.
---

# semantic_entities

`semantic_entities` is the node set of the [semantic graph](/user-guide/semantic-layer/semantic-graph.md): the entities that the stored telemetry describes.

The table is computed, not stored. Scanning it derives rows at read time from the tables that declare `greptime.semantic.entity.*` identities, within the queried time window. It is read-only: `INSERT`, `CREATE`, `ALTER`, `TRUNCATE`, and `DROP` are rejected.

```sql
SELECT entity_type, entity_id, scope, source_tables
FROM greptime_private.semantic_entities
WHERE observed_at >= now() - INTERVAL '15' MINUTE
ORDER BY entity_type, entity_id;
```

| Column | Type | Description |
| --- | --- | --- |
| `observed_at` | `TimestampMillisecond` | Time index. The 60-second bucket the entity was observed in. |
| `window_start` | `TimestampMillisecond` | Start of the observation window. |
| `window_end` | `TimestampMillisecond` | End of the window (`window_start` + 60 seconds). |
| `fresh_until` | `TimestampMillisecond` | Time up to which the entity counts as present. Equals `window_end` for derived rows. |
| `entity_type` | `String` | The entity's type, for example `service`, `service.instance`, `host`, `k8s.pod`, `gen_ai.agent`. |
| `entity_id` | `String` | Canonical identifier: the identifying column values in declared order, escaped and joined with `,`. |
| `entity_id_attrs` | `Json` | The identifying attributes as an object, keyed by the columns they came from. |
| `scope` | `String` | Namespace or environment the id is scoped to. Empty when the declaration names no scope column. |
| `descriptive` | `Json` | Snapshot of the declared non-identifying attributes. `NULL` when none were declared. |
| `source_tables` | `Json` | Array of the telemetry tables that contributed this observation, as `schema.table`. |

A row is one entity observation from one contributing table in one window, so an entity declared by several tables produces several rows per window. Deduplicate with `SELECT DISTINCT entity_type, entity_id`.

The `observed_at` predicate bounds the derivation. Without one, the last hour is used; a predicate with no lower bound is an error. See [The query window](/user-guide/semantic-layer/semantic-graph.md#the-query-window).

Derivation runs with the querying user's permissions. Source tables the caller cannot read are excluded.
