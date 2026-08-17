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

#### Storage Backend Options

| Option             | Required | Default           | Description                                                                                                                                        |
| ------------------ | -------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| --store-addrs      | Yes      | -                 | Metadata storage service addresses to connect to (supports etcd, MySQL, PostgreSQL, and RaftEngine). Format consistent with store-addrs in metasrv configuration. For RaftEngine, use `raftengine:///path/to/metadata` |
| --backend          | No       | etcd-store        | Type of metadata storage backend, one of `etcd-store`, `postgres-store`, `mysql-store`, `raft-engine-store`                                        |
| --store-key-prefix | No       | ""                | Unified prefix for data in metasrv, refer to metasrv configuration                                                                                 |
| --meta-table-name  | No       | greptime_metakv   | When backend is one of `postgres-store`, `mysql-store`, the table name storing metadata                                                            |
| --max-txn-ops      | No       | 128               | Maximum number of operations in an etcd transaction; only used with `etcd-store`                                                                   |
| --meta-schema-name | No       | -                 | PostgreSQL schema containing the metadata table; uses the current `search_path` when unset                                                          |
| --auto-create-schema | No     | true              | Create the PostgreSQL metadata schema when it does not exist                                                                                       |
| --backend-tls-mode | No       | disable           | TLS mode for the etcd, PostgreSQL, or MySQL connection                                                                                             |
| --backend-tls-cert-path | No  | ""                | Client certificate path for the metadata-backend connection                                                                                        |
| --backend-tls-key-path | No   | ""                | Client private-key path for the metadata-backend connection                                                                                        |
| --backend-tls-ca-cert-path | No | ""              | CA certificate path for the metadata-backend connection                                                                                            |
| --backend-tls-watch | No      | false             | Watch the backend TLS certificate files for changes                                                                                                |

#### File Options

| Option       | Required | Default           | Description                                                                 |
| ------------ | -------- | ----------------- | --------------------------------------------------------------------------- |
| --file-path  | No       | metadata_snapshot.metadata.fb | Snapshot path. A relative local path is resolved from the current directory. |
| --dir        | No       | /                   | Filesystem root used for local snapshot I/O.                                 |

#### Object Storage Options

To use object storage for storing exported metadata, enable one of the following providers and configure its connection parameters:

##### S3

| Option                       | Required | Default | Description                                                      |
| ---------------------------- | -------- | ------- | ---------------------------------------------------------------- |
| --s3                         | No       | false   | Whether to use S3 as storage medium for exported data            |
| --s3-bucket                  | No       | -       | S3 bucket name                                                   |
| --s3-root                    | No       | -       | Root path in S3 bucket                                           |
| --s3-access-key-id           | No       | -       | S3 access key ID                                                 |
| --s3-secret-access-key       | No       | -       | S3 secret access key                                             |
| --s3-region                  | No       | -       | S3 region name                                                   |
| --s3-endpoint                | No       | -       | S3 endpoint URL (optional, defaults based on bucket region)      |
| --s3-enable-virtual-host-style | No       | false   | Enable virtual host style for S3 API requests                    |
| --s3-disable-ec2-metadata      | No       | false   | Disable EC2 metadata service credential lookup                   |

##### OSS (Alibaba Cloud)

| Option                  | Required | Default | Description                            |
| ----------------------- | -------- | ------- | -------------------------------------- |
| --oss                   | No       | false   | Whether to use OSS for exported data   |
| --oss-bucket            | No       | -       | OSS bucket name                        |
| --oss-root              | No       | -       | Root path in OSS bucket                |
| --oss-access-key-id     | No       | -       | OSS access key ID                      |
| --oss-access-key-secret | No       | -       | OSS access key secret                  |
| --oss-endpoint          | No       | -       | OSS endpoint URL                       |

##### GCS (Google Cloud Storage)

| Option                | Required | Default | Description                           |
| --------------------- | -------- | ------- | ------------------------------------- |
| --gcs                 | No       | false   | Whether to use GCS for exported data  |
| --gcs-bucket          | No       | -       | GCS bucket name                       |
| --gcs-root            | No       | -       | Root path in GCS bucket               |
| --gcs-scope           | No       | -       | GCS service scope                     |
| --gcs-credential      | No       | -       | GCS credential content                |
| --gcs-endpoint        | No       | -       | GCS endpoint URL                      |

##### Azure Blob Storage

| Option                | Required | Default | Description                                 |
| --------------------- | -------- | ------- | ------------------------------------------- |
| --azblob              | No       | false   | Whether to use Azure Blob for exported data |
| --azblob-container    | No       | -       | Azure Blob container name                   |
| --azblob-root         | No       | -       | Root path in container                      |
| --azblob-account-name | No       | -       | Azure Blob account name                     |
| --azblob-account-key  | No       | -       | Azure Blob account key                      |
| --azblob-endpoint     | No       | -       | Azure Blob endpoint URL                     |
| --azblob-sas-token    | No       | -       | Azure Blob SAS token                        |



## Import Tool

### Command Syntax

```bash
greptime cli meta snapshot restore [OPTIONS]
```

### Options

#### Storage Backend Options

| Option             | Required | Default         | Description                                                                                                                                          |
| ------------------ | -------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| --store-addrs      | Yes      | -               | Metadata storage service addresses to connect to (supports etcd, MySQL, PostgreSQL, and RaftEngine). Format consistent with store-addrs in metasrv configuration. For RaftEngine, use `raftengine:///path/to/metadata` |
| --backend          | No       | etcd-store      | Type of metadata storage backend, one of `etcd-store`, `postgres-store`, `mysql-store`, `raft-engine-store`                                         |
| --store-key-prefix | No       | ""              | Unified prefix for data in metasrv, refer to metasrv configuration                                                                                   |
| --meta-table-name  | No       | greptime_metakv | When backend is `postgres-store`, `mysql-store`, the table name storing metadata                                                                     |
| --max-txn-ops      | No       | 128             | Maximum number of operations in an etcd transaction; only used with `etcd-store`                                                                     |
| --meta-schema-name | No       | -               | PostgreSQL schema containing the metadata table; uses the current `search_path` when unset                                                            |
| --auto-create-schema | No     | true            | Create the PostgreSQL metadata schema when it does not exist                                                                                          |
| --backend-tls-mode | No       | disable         | TLS mode for the etcd, PostgreSQL, or MySQL connection                                                                                                |
| --backend-tls-cert-path | No  | ""              | Client certificate path for the metadata-backend connection                                                                                           |
| --backend-tls-key-path | No   | ""              | Client private-key path for the metadata-backend connection                                                                                           |
| --backend-tls-ca-cert-path | No | ""            | CA certificate path for the metadata-backend connection                                                                                              |
| --backend-tls-watch | No      | false           | Watch the backend TLS certificate files for changes                                                                                                  |

#### File Options

| Option      | Required | Default                       | Description                                                                                                                                          |
| ----------- | -------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| --file-path | No       | metadata_snapshot.metadata.fb | Snapshot path. A relative local path is resolved from the current directory.                                                                          |
| --dir       | No       | /                             | Filesystem root used for local snapshot I/O.                                                                                                          |
| --force     | No       | false                         | Bypass the non-empty target check. This writes snapshot keys but does not delete extra keys already in the target.                                   |

#### Object Storage Options

To use object storage for importing metadata, enable one of the following providers and configure its connection parameters:

##### S3

| Option                       | Required | Default | Description                                                      |
| ---------------------------- | -------- | ------- | ---------------------------------------------------------------- |
| --s3                         | No       | false   | Whether to use S3 as storage medium for exported data            |
| --s3-bucket                  | No       | -       | S3 bucket name                                                   |
| --s3-root                    | No       | -       | Root path in S3 bucket                                           |
| --s3-access-key-id           | No       | -       | S3 access key ID                                                 |
| --s3-secret-access-key       | No       | -       | S3 secret access key                                             |
| --s3-region                  | No       | -       | S3 region name                                                   |
| --s3-endpoint                | No       | -       | S3 endpoint URL (optional, defaults based on bucket region)      |
| --s3-enable-virtual-host-style | No       | false   | Enable virtual host style for S3 API requests                    |
| --s3-disable-ec2-metadata      | No       | false   | Disable EC2 metadata service credential lookup                   |

##### OSS (Alibaba Cloud)

| Option                  | Required | Default | Description                            |
| ----------------------- | -------- | ------- | -------------------------------------- |
| --oss                   | No       | false   | Whether to use OSS for exported data   |
| --oss-bucket            | No       | -       | OSS bucket name                        |
| --oss-root              | No       | -       | Root path in OSS bucket                |
| --oss-access-key-id     | No       | -       | OSS access key ID                      |
| --oss-access-key-secret | No       | -       | OSS access key secret                  |
| --oss-endpoint          | No       | -       | OSS endpoint URL                       |

##### GCS (Google Cloud Storage)

| Option                | Required | Default | Description                           |
| --------------------- | -------- | ------- | ------------------------------------- |
| --gcs                 | No       | false   | Whether to use GCS for exported data  |
| --gcs-bucket          | No       | -       | GCS bucket name                       |
| --gcs-root            | No       | -       | Root path in GCS bucket               |
| --gcs-scope           | No       | -       | GCS service scope                     |
| --gcs-credential      | No       | -       | GCS credential content                |
| --gcs-endpoint        | No       | -       | GCS endpoint URL                      |

##### Azure Blob Storage

| Option                | Required | Default | Description                                 |
| --------------------- | -------- | ------- | ------------------------------------------- |
| --azblob              | No       | false   | Whether to use Azure Blob for exported data |
| --azblob-container    | No       | -       | Azure Blob container name                   |
| --azblob-root         | No       | -       | Root path in container                      |
| --azblob-account-name | No       | -       | Azure Blob account name                     |
| --azblob-account-key  | No       | -       | Azure Blob account key                      |
| --azblob-endpoint     | No       | -       | Azure Blob endpoint URL                     |
| --azblob-sas-token    | No       | -       | Azure Blob SAS token                        |

## Info Tool

The Info tool allows you to view the contents of a metadata snapshot without restoring it.

### Command Syntax

```bash
greptime cli meta snapshot info [OPTIONS]
```

### Options

#### File Options

| Option       | Required | Default           | Description                                 |
| ------------ | -------- | ----------------- | ------------------------------------------- |
| --file-path  | No       | metadata_snapshot.metadata.fb | Snapshot path to inspect.                    |
| --dir        | No       | /                             | Filesystem root used for local snapshot I/O. |
| --inspect-key| No       | "*"               | Query pattern to filter metadata keys       |
| --limit      | No       | -                 | Maximum number of entries to display        |

#### Object Storage Options

To inspect snapshots stored in object storage, enable one of the following providers and configure its connection parameters:

##### S3

| Option                       | Required | Default | Description                                                      |
| ---------------------------- | -------- | ------- | ---------------------------------------------------------------- |
| --s3                         | No       | false   | Whether to use S3 as storage medium for the snapshot             |
| --s3-bucket                  | No       | -       | S3 bucket name                                                   |
| --s3-root                    | No       | -       | Root path in S3 bucket                                           |
| --s3-access-key-id           | No       | -       | S3 access key ID                                                 |
| --s3-secret-access-key       | No       | -       | S3 secret access key                                             |
| --s3-region                  | No       | -       | S3 region name                                                   |
| --s3-endpoint                | No       | -       | S3 endpoint URL (optional, defaults based on bucket region)      |
| --s3-enable-virtual-host-style | No       | false   | Enable virtual host style for S3 API requests                    |
| --s3-disable-ec2-metadata      | No       | false   | Disable EC2 metadata service credential lookup                   |

##### OSS (Alibaba Cloud)

| Option                  | Required | Default | Description                            |
| ----------------------- | -------- | ------- | -------------------------------------- |
| --oss                   | No       | false   | Whether to use OSS for the snapshot    |
| --oss-bucket            | No       | -       | OSS bucket name                        |
| --oss-root              | No       | -       | Root path in OSS bucket                |
| --oss-access-key-id     | No       | -       | OSS access key ID                      |
| --oss-access-key-secret | No       | -       | OSS access key secret                  |
| --oss-endpoint          | No       | -       | OSS endpoint URL                       |

##### GCS (Google Cloud Storage)

| Option                | Required | Default | Description                           |
| --------------------- | -------- | ------- | ------------------------------------- |
| --gcs                 | No       | false   | Whether to use GCS for the snapshot   |
| --gcs-bucket          | No       | -       | GCS bucket name                       |
| --gcs-root            | No       | -       | Root path in GCS bucket               |
| --gcs-scope           | No       | -       | GCS service scope                     |
| --gcs-credential      | No       | -       | GCS credential content                |
| --gcs-endpoint        | No       | -       | GCS endpoint URL                      |

##### Azure Blob Storage

| Option                | Required | Default | Description                                 |
| --------------------- | -------- | ------- | ------------------------------------------- |
| --azblob              | No       | false   | Whether to use Azure Blob for the snapshot  |
| --azblob-container    | No       | -       | Azure Blob container name                   |
| --azblob-root         | No       | -       | Root path in container                      |
| --azblob-account-name | No       | -       | Azure Blob account name                     |
| --azblob-account-key  | No       | -       | Azure Blob account key                      |
| --azblob-endpoint     | No       | -       | Azure Blob endpoint URL                     |
| --azblob-sas-token    | No       | -       | Azure Blob SAS token                        |
