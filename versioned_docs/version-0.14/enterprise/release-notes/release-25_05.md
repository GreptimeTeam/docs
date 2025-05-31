---
keywords: [release notes, elasticsearch, read replicas, triggers]
description: Release notes for GreptimeDB Enterprise version 25.05, highlighting new features like elasticsearch compatibility, read replicas and triggers.
---

# GreptimeDB Enterprise 25.05

We are pleased to introduce the 25.05 release of GreptimeDB Enterprise.

## Feature Highlights

### Elasticsearch Compatibility

The compatibility layer in GreptimeDB Enterprise for Elasticsearch. This layer
allows user to configure GreptimeDB Enterprise as the backend of Kibana UI, for
log search, aggregation and dashboard.

Queries supported in this release:

- match
- match_all
- multi_match
- term
- terms
- prefix
- wildcard
- regexp
- range
- exists
- bool

### Read Replicas

To serve analytical and other heavy queries better, we introduce dedicated query
nodes in this release. These type of nodes are responsible for serve queries
only, so we can push them to resource limit without affecting data ingestion.

Thanks to our compute-storage disaggregated architecture, it's not a huge
refactoring to add read replicas to current architecture. A new type of
datanodes will play the role. It's dedicated to process query workloads. Because
data are available on object storage, there will be no data replication between
these types of datanodes and those original ones who take writes. User will be
able to add hint to their queries to specify whether the query should run on
read replicas.

### Triggers

Trigger evaluate data with your predefined rules periodically and invoke
webhooks if it matches. This is the initial version of triggers. Of course we
designed it to work with Prometheus AlertManager.

```sql
CREATE TRIGGER IF NOT EXISTS cpu_monitor
    ON (SELECT host AS host_label, cpu, memory FROM machine_monitor WHERE cpu > 1 and ts >= now() - '5 minutes'::INTERVAL)
        EVERY '5 minute'::INTERVAL
    LABELS (severity = 'warning')
    ANNOTATIONS (summary = 'CPU utilization is too high', link = 'http://...')
    NOTIFY(
        WEBHOOK alert_manager URL 'http://127.0.0.1:9093' WITH (timeout="1m")
    );
```

### Flow Reliability

Reliability features are added to flow, our light-weighted streaming engine:

- Task migration: move tasks between flow nodes for load balancing.

## Features From GreptimeDB OSS

This release is based on GreptimeDB OSS v0.14.
