---
keywords: [disaster recovery, GreptimeDB, backup and restore, region failover, cross-region deployment, RTO, RPO]
description: Explains GreptimeDB disaster-recovery building blocks, their failure boundaries, and how to validate recovery objectives.
---

# Disaster Recovery

GreptimeDB does not assign a fixed RPO or RTO to a deployment. Recovery depends on the WAL, data storage, metadata backend, failure detection, replacement capacity, network, and operating procedure. Design and test these dependencies as one recovery system.

## Recovery objectives

- **Recovery Point Objective (RPO)** is the maximum acceptable amount of data loss, measured in time.
- **Recovery Time Objective (RTO)** is the maximum acceptable time to restore service after a failure.

An architecture only meets its objectives if every required dependency survives the target failure. For example, placing Datanodes in multiple regions does not provide region-level recovery if Kafka, object storage, metadata, or request routing still has a single-region dependency.

## Persistent state

GreptimeDB recovery involves three types of persistent state:

- **WAL** stores data that has been accepted but not yet persisted in SST files. Local WAL is tied to a Datanode's disk. Remote WAL stores entries in Kafka and is required for safe automatic Region Failover.
- **Data storage** contains SST and index files. In a distributed deployment, Region Failover requires shared storage, such as object storage, that the target Datanode can access.
- **Metadata storage** contains catalogs, schemas, table routes, procedures, and other control-plane state. Its replication and backup policy is independent of data storage.

Protect all three. Object-store durability does not protect WAL or metadata, and a metadata snapshot does not contain table data.

## Recovery patterns

### Standalone with local storage

A standalone instance with local WAL and local data depends on its host and volumes. Recovery normally uses volume-level backups or GreptimeDB data and metadata exports. RPO follows the last recoverable backup or retained source data; RTO includes provisioning, restoring, and validation.

If a standalone instance uses Remote WAL and object storage, its persisted data is decoupled from the process host. This reduces the amount of local state needed for restart, but it does not make RPO zero or guarantee a restart time. Kafka and object-storage durability, retained WAL entries, metadata availability, and the restart procedure still determine the result.

### Distributed cluster with Region Failover

GreptimeDB can reopen a failed Datanode's Regions on healthy Datanodes when all of the following are true:

- Data is stored in shared storage accessible to the target Datanodes.
- Remote WAL is used. Enabling failover with local WAL is unsafe and can lose unflushed data.
- Metasrv Region Failover is explicitly enabled; it is disabled by default.
- The cluster has healthy replacement Datanodes with enough capacity.

See [Region Failover](/user-guide/deployments-administration/manage-data/region-failover.md) for configuration and startup precautions. For a deployment spanning failure domains, also see [Cross-region deployment](./dr-solution-based-on-cross-region-deployment-in-single-cluster.md).

Region Failover changes the Region route and opens it on another Datanode. It does not by itself replicate Kafka, object storage, the metadata backend, or application traffic across regions. Those systems need their own high-availability and recovery configuration.

### Backup and restore

Use backups to recover from logical corruption, accidental deletion, or a failure that exceeds the live deployment's fault tolerance:

- [Export/Import V2](./export-import-v2.md) exports table schemas and data.
- [Metadata export and import](./back-up-&-restore-meta-data.md) snapshots the metadata backend.

Data and metadata exports are separate operations, not a single atomic cluster snapshot. If a recovery point must be mutually consistent, control writes and metadata changes while taking the exports, retain the original ingest source where possible, and test the combined restore procedure.

RPO is determined by backup frequency and any replayable source data. RTO depends on snapshot size, storage and network throughput, import parallelism, schema reconciliation, and validation time.

### Active-active failover

GreptimeDB Enterprise supports active-active failover between standalone instances. Replication is asynchronous, so data that is still pending when the source node and its local storage are lost may be unavailable on the peer. See [Active-active failover](/enterprise/deployments-administration/disaster-recovery/dr-solution-based-on-active-active-failover.md) for its failure model and operating procedure.

<AnchorAlias id="solution-comparison" />

## Compare and validate

| Pattern | Protects against | Primary RPO factors | Primary RTO factors |
| --- | --- | --- | --- |
| Standalone backup and restore | Host or volume loss within backup coverage | Backup interval and source replay | Provisioning and restore duration |
| Distributed Region Failover | Datanode loss within the surviving shared dependencies | Remote WAL and storage durability | Detection, Region opening, and spare capacity |
| Cross-region cluster | A tested failure domain within the surviving dependencies | Cross-region durability of every state layer | Detection, dependency failover, routing, and spare capacity |
| Export and import | Logical or deployment-wide failures covered by the exports | Export schedule and source replay | Import and validation duration |
| Enterprise active-active | Failure of one standalone peer or site | Replication lag and failure mode | External routing and peer readiness |

Measure RPO and RTO with failure drills. Include dependency failures, not only Datanode termination, and verify that queries return the expected recovery point before declaring service restored.
