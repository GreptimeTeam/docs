---
keywords: [semantic layer, table semantics, semantic graph, entities, relationships, observability metadata]
description: Overview of the GreptimeDB semantic layer — table semantic options and the derived entity graph.
---

# Semantic Layer

:::warning
The semantic layer is experimental and may change in future releases. Table options, table names, and column names described in this section are not covered by compatibility guarantees yet. Tables without semantic metadata keep working unchanged; the layer is optional and additive.
:::

The semantic layer describes what GreptimeDB stores in terms machine consumers can read. It has two parts, both queried with ordinary SQL. See [Semantic Layer](/user-guide/concepts/semantic-layer.md) in Concepts for the background.

**[Table semantics](./table-semantics.md).** `greptime.semantic.*` table options record the telemetry signal a table holds, the ingestion source that wrote it, and signal-specific metadata such as a metric's instrument type and unit. Supported ingestion paths set them at table creation; you can also set them in DDL. [`information_schema.table_semantics`](/reference/sql/information-schema/table-semantics.md) lists every table that carries them.

**[Semantic graph](./semantic-graph.md).** `greptime_private.semantic_entities` and `greptime_private.semantic_relationships` expose the entities the telemetry describes and the relationships between them. Both are derived when you query them, from the entity declarations tables carry and from the built-in conventions. Nothing is materialized except hand-declared edges. [Declaring entities and relationships](./declaring-entities.md) covers what reaches the graph without configuration and how to declare the rest.

## What works without configuration

| Data | What you get |
| --- | --- |
| OTLP traces | Table semantics on the trace table; `service`, `service.instance`, `host`, `container`, `k8s.pod`, `k8s.node`, `k8s.container` entities; `calls` edges with RED metrics between services |
| OTLP metrics and logs | Table semantics on each table |
| Prometheus remote write | Table semantics on each table; entities and containment edges from whitelisted kube-state-metrics and `target_info` descriptor metrics |
| InfluxDB, OpenTSDB, Loki, Elasticsearch | Table semantics on each table |

Everything else needs a declaration on the tables you want in the graph.
