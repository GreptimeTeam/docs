---
keywords: [backup metadata, backup database, GreptimeDB backup]
description: GreptimeDB backup guide, including steps for backing up metadata and databases.
---

# Backup

## Backup Metadata

The metadata store of a GreptimeDB cluster can be stored in etcd or a relational database.
For production clusters,
it is recommended to use cloud provider managed relational database services (RDS) with periodic backup features enabled.
If using etcd, you can periodically backup etcd data using the [official etcd tools](https://etcd.io/docs/v3.5/op-guide/recovery/).

## Backup Database

Since object storage typically maintains multiple replicas,
if GreptimeDB data is stored on object storage,
additional database backups are usually unnecessary.
You may also consider enabling versioning features of object storage to prevent data loss from accidental operations.

If you need to export data from a database,
you can use GreptimeDB's `COPY DATABASE` functionality.
GreptimeDB's export feature supports incremental backups,
allowing you to backup only data written on a specific day.
The principle is to use the `COPY DATABASE` command with a specified time range for that day;
GreptimeDB will export the incremental data written to the database during that period as GreptimeDB data files and save them to disk for future data recovery.

Please refer to the [COPY DATABASE](/reference/sql/copy.md#copy-database) documentation for more information.

