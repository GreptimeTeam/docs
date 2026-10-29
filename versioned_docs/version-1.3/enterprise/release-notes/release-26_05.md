---
keywords: [release notes, greptimedb enterprise]
description: Release notes for the GreptimeDB Enterprise 26.05 series, highlighting scheduled compaction, Apache Iceberg data lake (early preview), multidimensional region balancing and finer-grained access control.
---

# GreptimeDB Enterprise 26.05

## 26.05.1

We are pleased to announce the **26.05.1** release of GreptimeDB Enterprise —
a minor update to the 26.05 line that brings major new operational capabilities:
scheduled compaction, an early preview of Apache Iceberg data-lake support,
multidimensional region balancing, and finer-grained access control. This
release also moves the GreptimeDB engine base to **v1.2**.

_This release is based on GreptimeDB (open source engine) [v1.2](/release-notes/release-1-2-0)._

### Feature Highlights

#### Scheduled Compaction (Compaction Cronjob)

Compaction can now run on a schedule managed by the meta server, instead of only
on demand. The new compaction cronjob resolves compaction targets across regions,
submits and tracks jobs, persists state in a KV store, and automatically cancels
stale running jobs. A set of admin HTTP endpoints lets operators inspect and
control scheduled compaction. This makes it straightforward to keep storage
healthy on a predictable cadence with less manual intervention.

#### Apache Iceberg Data Lake (Early Preview)

This release introduces an **early preview** of Apache Iceberg data-lake
support, beginning to cover the table lifecycle end to end:

- **Repartition, truncate, and drop** for Iceberg-backed tables, with full table
  state lifecycle management.
- **Bulk ingestion** and region-edit hooks, plus remote-compaction hooks so
  Iceberg data can be compacted through the enterprise compaction pipeline.
- **Histogram data type** support and **metric-engine physical-table** support
  for Iceberg tables. Iceberg export covers tables using the default **mito
  engine** as well as **physical tables of the metric engine**; logical metric
  tables are not exposed through the catalog (query the physical table
  directly).

#### Multidimensional Region Balancing

Region balancing now reasons about more than write load. The balancer tracks
per-region query CPU-rate history and evaluates read-load stability with
separate eligibility rules, and supports multidimensional balancing state.
The result is more stable region placement under mixed read/write workloads and
during planned maintenance.

#### Finer-Grained Access Control

Enterprise RBAC gains several new controls for tighter, more expressive
authorization:

- **Named permission actions** for custom roles.
- **Regex-based database ACLs**, and automatic database-ACL grants to the user
  who creates a database.
- An optional **query guard** that can ban `DROP TABLE` / `DROP DATABASE` for all
  users, protecting against accidental destructive operations.

#### Table Soft Drop

`DROP TABLE` can be configured to **soft drop** (opt-in): the table's data is
retained and recoverable with `UNDROP TABLE` rather than destroyed immediately.
Soft-dropped tables keep occupying storage until they are undropped or purged.

#### Operational Improvements

- Configurable **query spill** for large queries under memory pressure. Query
  spill is not an enterprise-only capability — it has also been open-sourced in
  the GreptimeDB engine (see the [v1.3.0-alpha.1 release
  notes](/release-notes/release-1-3-0-alpha-1)).
- Per-component **maximum CPU** options.
- Enterprise **Flight schemas aligned by default** for consistent wire formats,
  and Flight **bulk inserts can now auto-create** their target tables.
- **Ansible playbooks** for deploying GreptimeDB and a monitoring stack.

#### From the GreptimeDB v1.2 Engine

- **`JSON2`** — an improved data type for working with JSON, optimized for
  columnar storage.
- **Manual compaction with a time range**, complementing the new scheduled
  compaction.
- **Lifecycle event recording** — structured procedure events for
  database/table/view DDL, Flow DDL, repartition, GC, and WAL prune, for much
  better observability of cluster operations. Available from the Enterprise
  Dashboard UI.
- **Performance**: dictionary-encoded series keys for faster queries,
  range-select input-projection pruning, and an asynchronous compaction picker
  that no longer blocks the region worker.

### Important Bug Fixes

**Enterprise:**

- Bulk writes now correctly validate the incoming data type for `JSONB` columns,
  preventing malformed data from being written.
- Ingestion merge batch sizing corrected for the v1.2 engine.
- Remote dynamic-filter controls handled correctly; region-balancer stability
  option names normalized.

**From the GreptimeDB v1.2 engine:**

- `PromQL` `or` queries no longer return incorrect results when operands are
  empty.
- The MySQL protocol now **fails closed** on timestamps it cannot represent,
  instead of silently mishandling them.
- Prometheus remote-write timeouts are now **retryable**, improving ingestion
  resilience under transient failures.
- **Index-build reliability**: asynchronous index builds are fenced by schema
  generation and their publication made conditional, fixing races that could
  occur when index builds and schema changes ran concurrently.
- **Legacy WAL options remain compatible** when upgrading, so existing
  configurations keep working.

### Security Updates

- **Dedicated HTTP API server port** — the HTTP API is now served on a dedicated
  port, isolating the API surface from other server traffic.
- **Sandboxed SQL local-filesystem access** — SQL execution is sandboxed so it can
  no longer read the local filesystem, closing a local-file-access vector.
- `quinn-proto`: 0.11.14 → 0.11.16 _(dependency update)_
