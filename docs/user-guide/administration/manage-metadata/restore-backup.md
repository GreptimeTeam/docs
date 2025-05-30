---
keywords: [GreptimeDB, metadata backup, restore, migration, etcd, MySQL, PostgreSQL, disaster recovery]
description: Guide for backing up, restoring, and migrating GreptimeDB metadata across different storage backends (etcd, MySQL, PostgreSQL) with best practices for data consistency.
---

# Backup and Restore, Migrate

GreptimeDB provides metadata backup and restore capabilities through its CLI tool. This functionality supports all major metadata storage backends including etcd, MySQL, and PostgreSQL. For detailed instructions on using these features, refer to the [Backup and Restore](/user-guide/administration/disaster-recovery/back-up-&-restore-data.md) guide.

## Backup

For optimal backup reliability, schedule metadata backups during periods of low DDL (Data Definition Language) activity. This helps ensure data consistency and reduces the risk of partial or incomplete backups.

To perform a backup:

1. Verify that your GreptimeDB cluster is operational
2. Execute the backup using the CLI tool, follows the export metadata steps in [Backup and Restore](/user-guide/administration/disaster-recovery/back-up-&-restore-meta-data.md) guide.
3. Ensure the backup output file is created, and the file size is greater than 0.

## Restore

To restore from a backup:

1. Use the CLI tool to restore the metadata, follows the import metadata steps in [Backup and Restore](/user-guide/administration/disaster-recovery/back-up-&-restore-meta-data.md) guide.
2. Restart the GreptimeDB cluster to apply the restored metadata.

## Migrate

We recommend to migrate metadata during periods of low DDL (Data Definition Language) activity to ensure data consistency and minimize the risk of partial or incomplete migrations.

Migrate metadata from one metadata storage to another.

1. Backup the metadata from the source storage.
2. Restore the metadata to the target storage.
3. Restart the whole GreptimeDB cluster(all components) to apply the restored metadata.

