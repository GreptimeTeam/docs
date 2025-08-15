---
keywords: [backup metadata, backup database, GreptimeDB backup]
description: GreptimeDB backup guide, including steps for backing up metadata and databases.
---

# Backup

## Backup Metadata

The metadata store of a GreptimeDB cluster can be stored in etcd or a relational database.
For production clusters,
it is recommended to use cloud provider managed relational database services (RDS) with periodic backup features enabled.

Please refer to [Metadata Export & Import documentation](/user-guide/deployments-administration/disaster-recovery/back-up-&-restore-meta-data.md) for the details.

## Backup Database

Since object storage typically maintains multiple replicas,
if GreptimeDB data is stored on object storage,
additional database backups are usually unnecessary.
You may also consider enabling versioning features of object storage to prevent data loss from accidental operations.

You can also use GreptimeDB's `COPY DATABASE` functionality to create backups.
For more information, please refer to the [Data Export & Import documentation](/user-guide/deployments-administration/disaster-recovery/back-up-&-restore-data.md).

