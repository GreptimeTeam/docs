---
keywords: [backup, restore, export tool, import tool, database metadata backup, data recovery, command line tool]
description: Introduction to GreptimeDB's metadata export and import tools for backing up and restoring database metadata, including command syntax, options, and common use cases
---

# GreptimeDB Metadata Export and Import Tools

This guide describes how to use GreptimeDB's metadata export and import tools for metadata backup and recovery.

The export and import tools provide functionality for backing up and restoring GreptimeDB metadata.

## Export Tool

### Command Syntax

```bash
greptime cli meta-snapshot [OPTIONS]
```

### Options

| Option             | Required | Default           | Description                                                                                                                                        |
| ------------------ | -------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| --store-addrs      | Yes      | -                 | Metadata storage service addresses to connect to (only supports etcd MySQL PostgreSQL) format consistent with store-addrs in metasrv configuration |
| --backend          | Yes      | -                 | Type of metadata storage backend, one of `etcd-store`, `postgres-store`, `mysql-store`                                                             |
| --store-key-prefix | No       | ""                | Unified prefix for data in metasrv, refer to metasrv configuration                                                                                 |
| --meta-table-name  | No       | greptime_metakv   | When backend is one of `postgres-store`, `mysql-store`, the table name storing metadata                                                            |
| --max-txn-ops      | No       | 128               | Maximum number of txn operations                                                                                                                   |
| --file-name        | No       | metadata_snapshot | File name for metadata export, will automatically add `.metadata.fb` suffix                                                                        |
| --output-dir       | No       | ""                | Directory to store exported data                                                                                                                   |
| --s3               | No       | false             | Whether to use s3 as storage medium for exported data                                                                                              |
| --s3-bucket        | No       | -                 | Valid when s3 is true, s3 bucket name                                                                                                              |
| --s3-region        | No       | -                 | Valid when s3 is true, s3 region name                                                                                                              |
| --s3-access-key    | No       | -                 | Valid when s3 is true, s3 access key name                                                                                                          |
| --s3-secret-key    | No       | -                 | Valid when s3 is true, s3 secret key name                                                                                                          |
| --s3-endpoint      | No       | -                 | Valid when s3 is true, s3 endpoint name, defaults based on bucket region, generally not needed                                                     |

### Examples

Exporting metadata from PostgreSQL to s3. This command will export to the `metadata_snapshot.metadata.fb` file in `your-bucket-name`:

```bash
greptime cli meta-snapshot --store-addrs 'password=password dbname=postgres user=postgres host=localhost port=5432' --backend postgres-store --s3 --s3-bucket your-bucket-name --s3-region ap-southeast-1 --s3-access-key <s3-access-key> --s3-secret-key <s3-secret-key>
```

Exporting metadata from PostgreSQL to local directory. This command will export to the `metadata_snapshot.metadata.fb` file in the current directory:

```bash
greptime cli meta-snapshot --store-addrs 'password=password dbname=postgres user=postgres host=localhost port=5432' --backend postgres-store
```

Exporting metadata from etcd to local directory. This command will export to the `metadata_snapshot.metadata.fb` file in the current directory:

```bash
greptime cli meta-snapshot --store-addrs 127.0.0.1:2379 --backend etcd-store
```

## Import Tool

### Command Syntax

```bash
greptime cli meta-restore [OPTIONS]
```

### Options

| Option             | Required | Default                       | Description                                                                                                                                          |
| ------------------ | -------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| --store-addrs      | Yes      | -                             | Metadata storage service addresses to connect to (only supports etcd MySQL PostgreSQL) format consistent with store-addrs in metasrv configuration   |
| --backend          | Yes      | -                             | Type of metadata storage backend, one of `etcd-store`, `postgres-store`, `mysql-store`                                                               |
| --store-key-prefix | No       | ""                            | Unified prefix for data in metasrv, refer to metasrv configuration                                                                                   |
| --meta-table-name  | No       | greptime_metakv               | When backend is `postgres-store`, `mysql-store`, the table name storing metadata                                                                     |
| --max-txn-ops      | No       | 128                           | Maximum number of txn operations                                                                                                                     |
| --file-name        | No       | metadata_snapshot.metadata.fb | File name of metadata export to import, will automatically add `.metadata.fb` suffix                                                                 |
| --input-dir        | No       | ""                            | Directory storing exported data                                                                                                                      |
| --s3               | No       | false                         | Whether to use s3 as storage medium for exported data                                                                                                |
| --s3-bucket        | No       | -                             | Valid when s3 is true, s3 bucket name                                                                                                                |
| --s3-region        | No       | -                             | Valid when s3 is true, s3 region name                                                                                                                |
| --s3-access-key    | No       | -                             | Valid when s3 is true, s3 access key name                                                                                                            |
| --s3-secret-key    | No       | -                             | Valid when s3 is true, s3 secret key name                                                                                                            |
| --s3-endpoint      | No       | -                             | Valid when s3 is true, s3 endpoint name, defaults based on bucket region, generally not needed                                                       |
| --force            | No       | false                         | Whether to force import, when target backend is detected to not be in a clean state, import is disabled by default, enable this flag to force import |

### Examples

Importing exported metadata from s3 to PostgreSQL storage backend. This command will import data from the `metadata_snapshot.metadata.fb` file in `your-bucket-name`:

```bash
greptime cli meta-restore --store-addrs 'password=password dbname=postgres user=postgres host=localhost port=5432' --backend postgres-store --s3 --s3-bucket your-bucket-name --s3-region ap-southeast-1 --s3-access-key <s3-access-key> --s3-secret-key <s3-secret-key>
```

Importing exported metadata from local file to PostgreSQL storage backend. This command will import data from the `metadata_snapshot.metadata.fb` file in the current directory:

```bash
greptime cli meta-restore --store-addrs 'password=password dbname=postgres user=postgres host=localhost port=5432' --backend postgres-store
```

Importing exported metadata from local file to etcd storage backend. This command will import data from the `metadata_snapshot.metadata.fb` file in the current directory:

```bash
greptime cli meta-restore --store-addrs 127.0.0.1:2379 --backend etcd-store
```

### Notes

- Generally, please ensure that the target backend for import is in a clean state, i.e., contains no data. If the target backend already contains data, the import operation may contaminate the data
