---
keywords: [metadata backup, metadata restore, export tool, import tool, database metadata backup, metadata recovery, command line tool, GreptimeDB CLI, disaster recovery]
description: Comprehensive guide to GreptimeDB's metadata export and import tools for backing up and restoring database metadata, including command syntax, options.
---

# Metadata Export & Import

The Export and Import tools provide functionality for backing up and restoring GreptimeDB metadata. These tools allow for metadata backup and restoration operations.

## Export Tool

### Command Syntax

```bash
greptime cli meta snapshot save [OPTIONS]
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



## Import Tool

### Command Syntax

```bash
greptime cli meta snapshot restore [OPTIONS]
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
