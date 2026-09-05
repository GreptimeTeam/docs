---
keywords: [entity declaration, greptime.semantic.entity, semantic graph, kube-state-metrics, target_info, declared edges, semantic_relationships_declared]
description: What reaches the semantic graph without configuration, how to declare entities on your own tables, and how to declare edges by hand.
---

# Declaring entities and relationships

:::warning
Entity declarations are experimental. The option keys, the built-in conventions, and the declared-edge table may change in future releases.
:::

A table joins the [semantic graph](./semantic-graph.md) by declaring which entities its rows describe and which columns identify each one. Built-in conventions cover the common cases; `greptime.semantic.entity.*` table options cover the rest.

## Built-in conventions

Conventions ship with the binary and are not configurable. An explicit declaration of an entity type always overrides the conventional one, including when the explicit declaration turns out to be unusable: a typo never silently falls back to a different identity.

### OTLP trace tables

Any table with `table_data_model` = `greptime_trace_v1` gets these declarations from its flattened resource attributes, without any option on the table:

| Entity | Identifying columns | Descriptive columns |
| --- | --- | --- |
| `service` | `service_name` | — |
| `service.instance` | `service_name`, `resource_attributes.service.instance.id` | — |
| `host` | `resource_attributes.host.id` | `resource_attributes.host.name` |
| `k8s.pod` | `resource_attributes.k8s.pod.uid` | `resource_attributes.k8s.pod.name`, `resource_attributes.k8s.namespace.name` |
| `k8s.node` | `resource_attributes.k8s.node.name` | — |
| `k8s.container` | `resource_attributes.k8s.pod.uid`, `resource_attributes.k8s.container.name` | `resource_attributes.container.id`, `resource_attributes.container.name` |
| `container` | `resource_attributes.container.id` | `resource_attributes.container.name` |

A declaration applies only on rows where all of its identifying columns are present and non-empty. On rows that carry the full `k8s.container` identity, the generic `container` declaration withdraws, so a container inside a pod is one node rather than two.

When `resource_attributes.service.namespace` is present, `service` and `service.instance` ids are rendered as `<namespace>/<service_name>`. That matches the Prometheus `job` label, which the OpenTelemetry compatibility specification defines as `<service.namespace>/<service.name>`, so a service reaching the graph from both traces and metrics is one node.

### Prometheus descriptor metrics

Tables stamped `signal_type` = `metric` and `source` = `prometheus` by the remote write path get implicit declarations when their name matches a whitelisted kube-state-metrics or `target_info` descriptor and the identifying columns exist:

| Table | Entities (identifying columns) |
| --- | --- |
| `kube_pod_info` | `k8s.pod` (`uid`), `k8s.node` (`node`) |
| `kube_node_info` | `k8s.node` (`node`) |
| `kube_pod_owner` | `k8s.pod` (`uid`), `k8s.workload` (`namespace`, `owner_kind`, `owner_name`) |
| `kube_pod_container_info` | `k8s.pod` (`uid`), `k8s.container` (`uid`, `container`) |
| `kube_pod_init_container_info` | `k8s.pod` (`uid`), `k8s.container` (`uid`, `container`) |
| `kube_service_info` | `k8s.service` (`uid`) |
| `target_info` | `service` (`job`), `service.instance` (`job`, `instance`) |

Each also contributes descriptive attributes — pod name and namespace, node kernel version, container image — filtered to the columns the table actually has, since kube-state-metrics label sets vary by version. `target_info` additionally snapshots every remaining tag column onto the `service.instance` entity.

Ordinary metric tables are not scanned for entities: a metric with `job` and `instance` labels contributes nothing on its own, and `target_info` is what puts those services in the graph.

### OTLP resource descriptor

GreptimeDB can synthesize a `greptime_otel_resource_info` table from the resource attributes of incoming OTLP metrics, so metrics-only services reach the graph. It is off by default; enabling it creates and writes a table the client did not send.

```toml
[otlp]
experimental_enable_resource_info = true
```

When enabled, the table declares `service` (`job`), `service.instance` (`job`, `instance`), `host` (`host.id`), `k8s.pod` (`k8s.pod.uid`), `k8s.node` (`k8s.node.name`), `k8s.container` (`k8s.pod.uid`, `k8s.container.name`), and `container` (`container.id`), with the same supersession rule as the trace side.

## Declaring entities on your own tables

Three option keys per entity type:

```
greptime.semantic.entity.<entity_type>.id          = comma-separated column names
greptime.semantic.entity.<entity_type>.descriptive = comma-separated column names   (optional)
greptime.semantic.entity.<entity_type>.scope       = comma-separated column names   (optional)
```

`<entity_type>` is one or more dot-separated segments of `[a-z0-9_]`, for example `service`, `k8s.pod`, `gen_ai.agent`, or a type of your own. Unlike the rest of the semantic vocabulary, entity types are open-ended.

DDL enforces four rules:

- Every named column must exist on the table.
- Every named column must render as a string. `Binary`, `Json`, `Vector`, `List`, `Struct`, and `Dictionary` columns are rejected, as is `ALTER TABLE ... MODIFY COLUMN` changing a referenced column to one of those types.
- Columns may be tags or fields.
- The order of `id` columns is part of the identity. `entity_id` is the values joined in that order, so every table declaring the same entity type must list them the same way, broad to narrow.

```sql
CREATE TABLE app_request_latency (
  ts           TIMESTAMP(3) TIME INDEX,
  service_name STRING,
  instance     STRING,
  host         STRING,
  env          STRING,
  latency      DOUBLE,
  PRIMARY KEY (service_name, instance, host, env)
) WITH (
  'greptime.semantic.signal_type' = 'metric',
  'greptime.semantic.entity.service.id' = 'service_name',
  'greptime.semantic.entity.service.scope' = 'env',
  'greptime.semantic.entity.service.instance.id' = 'instance',
  'greptime.semantic.entity.host.id' = 'host'
);
```

Rows whose identifying columns are `NULL` or empty identify nothing and are skipped.

`scope` is not part of identity; it surfaces a namespace or environment value as a filter and display column. A namespace that actually disambiguates two entities belongs in `id`.

A table can join or leave the graph after it is created:

```sql
ALTER TABLE app_request_latency SET 'greptime.semantic.entity.process.id' = 'service_name,host';

ALTER TABLE app_request_latency UNSET 'greptime.semantic.entity.process.id';
```

Entities appear on the next query of the graph. Nothing is backfilled or rewritten.

## Relationships from co-declared identities

A row carrying the identities of two entities witnesses a relationship between them. The built-in vocabulary fixes which pairs produce an edge, and in which direction:

| Source | Destination | `rel_type` |
| --- | --- | --- |
| `service.instance` | `host` | `runs_on` |
| `service.instance` | `k8s.pod` | `runs_on` |
| `service.instance` | `container` | `runs_on` |
| `service.instance` | `k8s.container` | `runs_on` |
| `service.instance` | `service` | `part_of` |
| `process` | `host` | `runs_on` |
| `container` | `host` | `runs_on` |
| `k8s.container` | `host` | `runs_on` |
| `k8s.pod` | `k8s.node` | `runs_on` |
| `k8s.pod` | `k8s.container` | `contains` |
| `k8s.pod` | `k8s.workload` | `part_of` |

Two more apply to trace tables only:

| Source | Destination | `rel_type` |
| --- | --- | --- |
| `gen_ai.agent` | `gen_ai.model` | `uses` |
| `gen_ai.agent` | `gen_ai.tool` | `invokes` |

Edges derived this way carry `provenance` `attribute`, except the agent edges, which are span-structure observations and carry `trace`. A shared column value alone derives nothing: the pair has to be in this vocabulary, and both identities have to be declared on the same table.

These two tables are the complete rule set. To relate entities that no single table co-declares, declare the edge by hand.

## Declaring edges by hand

`greptime_private.semantic_relationships_declared` holds edges you assert yourself. Its rows are unioned into `semantic_relationships`, so they show up alongside derived edges with `provenance` = `declared`.

GreptimeDB owns the table's definition: it is created with its canonical schema on the first `INSERT`, while `CREATE`, `ALTER`, and renaming another table into the name are rejected. `INSERT`, `DELETE`, and `DROP` are allowed; the next write recreates the table.

```sql
INSERT INTO greptime_private.semantic_relationships_declared
  (observed_at, src_type, src_id, rel_type, dst_type, dst_id, provenance, scope, generation_id)
VALUES
  (now(), 'service', 'frontend', 'depends_on', 'service', 'users-db', 'declared', '', '');
```

| Column | Notes |
| --- | --- |
| `observed_at` | Time index. The declaration time. |
| `src_type`, `src_id`, `rel_type`, `dst_type`, `dst_id`, `provenance`, `scope`, `generation_id` | Tag columns and the primary key. All are required by the key, so pass `''` for `scope` and `generation_id` when you do not use them. |
| `valid_from`, `valid_until` | Business validity. `NULL` `valid_from` means valid since the declaration; `NULL` `valid_until` means valid for as long as the row exists. |
| `confidence`, `request_count`, `error_count`, `duration_sum`, `duration_count` | Optional; usually left `NULL` for declared edges. |
| `attributes` | Optional JSON. |

Set `provenance` to `declared` for edges you assert, or `agent` for edges an LLM inferred. Because `provenance` is part of the edge identity, an inferred edge stays distinguishable from observed structure and cannot overwrite it.

The edge shows up in `semantic_relationships` on the next query, with the columns you left out as `NULL`.

Re-inserting the same edge key stores a new revision; reads keep the latest one as of the queried window. To retire an edge, set `valid_until` to a past timestamp, or delete the row:

```sql
DELETE FROM greptime_private.semantic_relationships_declared
WHERE src_id = 'frontend' AND dst_id = 'users-db' AND rel_type = 'depends_on';
```

The table has a 90-day TTL, so an edge that is never re-asserted eventually expires with its row.

## Inspecting declarations

The `entity_declarations` column of `information_schema.table_semantics` reports every declaration a table contributes, explicit and conventional alike:

```sql
SELECT table_name, entity_declarations
FROM information_schema.table_semantics
WHERE entity_declarations IS NOT NULL;
```

Each element of the JSON array describes one declaration:

| Field | Description |
| --- | --- |
| `entity_type` | The declared type. |
| `origin` | `declared` for a table option, `convention` for a built-in rule. |
| `id` | The identifying columns, in declared order. |
| `id_qualifier` | Column that qualifies the first id component, when a convention uses one. |
| `superseded_by` | Identifying columns of a more specific type that takes over on rows carrying them. |
| `descriptive`, `scope` | The columns in those roles. |

Use it to check what a table contributes before querying the graph, and to confirm that an explicit declaration replaced the conventional one.
