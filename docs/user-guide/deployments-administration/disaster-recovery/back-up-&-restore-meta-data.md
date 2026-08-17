---
keywords: [backup, restore, metadata snapshot, etcd, MySQL, PostgreSQL, RaftEngine, disaster recovery]
description: Back up, inspect, and restore the GreptimeDB metadata backend with the greptime CLI.
---

# Back Up and Restore Metadata

The metadata snapshot command exports key-value records from the GreptimeDB metadata backend. It does **not** export table data, SST files, or WAL entries. Use [Export/Import V2](./export-import-v2.md) when the recovery plan also requires table data.

The CLI supports etcd, PostgreSQL, MySQL, and RaftEngine metadata backends. The source and target backends may differ.

## Before taking a snapshot

A metadata snapshot is collected separately from a data export. To avoid capturing metadata while DDL or Region procedures are changing it:

1. Stop schema changes and automated placement operations.
2. [Pause the Procedure Manager](/user-guide/deployments-administration/maintenance/prevent-metadata-changes.md).
3. Wait for existing procedures to finish.
4. Save the metadata snapshot, then resume the Procedure Manager.

Store the snapshot as sensitive data. It can contain catalog definitions, connection configuration, and other operational metadata.

## Save a local snapshot

The default output file is `metadata_snapshot.metadata.fb` in the current directory. Use `--file-path` to choose another path.

PostgreSQL:

```bash
greptime cli meta snapshot save \
  --backend postgres-store \
  --store-addrs 'password=PASSWORD dbname=greptime user=greptime host=127.0.0.1 port=5432' \
  --file-path /backup/prod-metadata.metadata.fb
```

MySQL:

```bash
greptime cli meta snapshot save \
  --backend mysql-store \
  --store-addrs 'mysql://greptime:PASSWORD@127.0.0.1:3306/greptime' \
  --file-path /backup/prod-metadata.metadata.fb
```

etcd:

```bash
greptime cli meta snapshot save \
  --backend etcd-store \
  --store-addrs 127.0.0.1:2379 \
  --file-path /backup/prod-metadata.metadata.fb
```

RaftEngine locks its metadata directory while a standalone instance is running. Stop the standalone instance before saving or restoring its RaftEngine metadata:

```bash
greptime cli meta snapshot save \
  --backend raft-engine-store \
  --store-addrs 'raftengine:///var/lib/greptimedb/metadata' \
  --file-path /backup/prod-metadata.metadata.fb
```

Use the same `--store-key-prefix` and, for MySQL or PostgreSQL, `--meta-table-name` values as the source deployment when they are customized.

## Save to S3-compatible storage

Enable one object-storage backend explicitly. This example writes the snapshot object `snapshots/prod-metadata.metadata.fb` to S3:

```bash
greptime cli meta snapshot save \
  --backend postgres-store \
  --store-addrs 'password=PASSWORD dbname=greptime user=greptime host=127.0.0.1 port=5432' \
  --file-path snapshots/prod-metadata.metadata.fb \
  --s3 \
  --s3-bucket greptime-backups \
  --s3-region us-west-2
```

For MinIO or another S3-compatible service, also set `--s3-endpoint` and the required credentials. OSS, GCS, and Azure Blob Storage are available through the corresponding CLI backend flags. See the [command reference](/reference/command-lines/utilities/metadata.md) for the complete option list.

## Inspect a snapshot

Inspect the file before scheduling a restore:

```bash
greptime cli meta snapshot info \
  --file-path /backup/prod-metadata.metadata.fb \
  --limit 20
```

The command parses and prints metadata records; it does not prove that the snapshot matches a separate data export. Restrict access to its output because records may contain sensitive values.

## Restore a snapshot

:::warning

Restore into an empty metadata backend while no GreptimeDB component is writing to it. `--force` only bypasses the non-empty-backend check: it writes keys from the snapshot but does not remove extra keys already in the target. It is not a substitute for cleaning or recreating the target backend.

:::

Restore a local snapshot to PostgreSQL:

```bash
greptime cli meta snapshot restore \
  --backend postgres-store \
  --store-addrs 'password=PASSWORD dbname=greptime user=greptime host=127.0.0.1 port=5432' \
  --file-path /backup/prod-metadata.metadata.fb
```

To restore from S3, use the same `--file-path` and object-storage options used for the save command:

```bash
greptime cli meta snapshot restore \
  --backend postgres-store \
  --store-addrs 'password=PASSWORD dbname=greptime user=greptime host=127.0.0.1 port=5432' \
  --file-path snapshots/prod-metadata.metadata.fb \
  --s3 \
  --s3-bucket greptime-backups \
  --s3-region us-west-2
```

After restore, restart all GreptimeDB components that use the target metadata backend. Follow [metadata restore and migration](/user-guide/deployments-administration/manage-metadata/restore-backup.md) to validate the next table ID and reconcile table metadata with the restored data.
