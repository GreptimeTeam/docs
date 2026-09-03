---
keywords: [storage architecture, local storage, object storage, storage providers, WAL, metadata, cache]
description: Explains local and object-storage deployments, the roles of data files, WAL, metadata, and cache, and how tables select configured storage providers.
---

# Storage Location

GreptimeDB can keep persistent data files on a local file system or in object storage. Local storage is the default fit for standalone deployments. Shared object storage is commonly used by distributed deployments that need compute-storage separation.

Storage location is separate from table engine selection. [Mito Engine and Metric Engine](/reference/about-greptimedb-engines.md) define how table data is organized and processed; local file systems, Amazon S3, Google Cloud Storage, and Azure Blob Storage are storage providers used to persist the resulting data files. Metric Engine is built on Mito Engine and uses its storage capabilities.

<AnchorAlias id="local-file-structure" />

## Local and Object Storage

With local storage, persistent data files are placed under the configured `data_home`. This is simple for standalone deployments, but the files are tied to that host and must be included in its backup and recovery plan.

With object storage, persistent data files are placed in a configured bucket or container. Datanodes can use local disks as cache while object storage remains the shared persistent location. Object storage makes it possible to scale compute separately from storage, but query latency and cost still depend on cache behavior, network performance, request volume, and provider pricing.

## Storage Responsibilities

A GreptimeDB deployment contains several kinds of state:

| State | Responsibility | Typical location | Durability and recovery |
| --- | --- | --- | --- |
| Persistent data files | Table data, SST files, and persistent indexes | Local file system or object storage | Protect local files with backups. For object storage, configure retention, versioning, and replication to match recovery requirements. |
| WAL | Records accepted writes before they are represented in persistent data files | Local WAL, remote WAL, or Noop WAL, depending on configuration | Protects accepted but unflushed writes. Recovery depends on the selected WAL mode; Noop WAL does not retain these writes. |
| Metadata | Catalogs, schemas, table definitions, Region routes, and procedure state | Local metadata in standalone mode; Metasrv state in cluster mode | Required to reconstruct database state. Persist, replicate, or back it up according to the deployment mode. |
| Local cache | Cached object-storage data and temporary index data | Datanode or standalone local disk | Disposable and rebuildable from persistent data. It should not be part of the durability boundary. |
| Process logs | Operational logs from GreptimeDB components | Local logging destination or configured log collector | Not required for database recovery. Retain them according to operational and compliance requirements. |

These requirements are deployment-dependent. See the recovery documentation below before assigning an RPO or RTO.

<AnchorAlias id="cloud-storage" />

## Object Storage and Disaster Recovery

Putting persistent data files in object storage does not by itself provide a complete disaster-recovery plan. Recovery also depends on the selected WAL mode, metadata backup or replication, Region state, object-store versioning and retention, and deployment configuration.

For recovery planning, see [Disaster Recovery](/user-guide/deployments-administration/disaster-recovery/overview.md) and the [WAL Overview](/user-guide/deployments-administration/wal/overview.md). Disabling WAL with Noop WAL changes the durability boundary and should be evaluated separately.

## Supported Storage Providers

GreptimeDB supports:

- local file storage;
- Amazon S3 and S3-compatible services, including MinIO, DigitalOcean Spaces, Tencent Cloud Object Storage, and Baidu Object Storage;
- Google Cloud Storage;
- Azure Blob Storage;
- Alibaba Cloud OSS.

See [Storage Options](/user-guide/deployments-administration/configuration.md#storage-options) for the complete configuration keys and current provider list.

<AnchorAlias id="multiple-storage-engines" />

## Multiple Storage Providers

An administrator can configure multiple storage providers under `[[storage.providers]]`. A table can then select one configured provider through its `storage` table option:

```sql
CREATE TABLE archive_events (
  ts TIMESTAMP TIME INDEX,
  payload STRING
) WITH (storage = 'archive_s3');
```

This setting chooses where the table engine stores persistent files. It does not select a different table engine. Provider names and credentials must be configured before the table is created. See [Create a Table with Custom Storage](/reference/sql/create.md#create-a-table-with-custom-storage).
