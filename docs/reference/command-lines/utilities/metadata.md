---
keywords: [metadata backup, metadata restore, export tool, import tool, database metadata backup, metadata recovery, command line tool, GreptimeDB CLI, disaster recovery]
description: Command-line options for saving, restoring, and inspecting GreptimeDB metadata snapshots.
---

# Metadata Export & Import

The snapshot commands save, restore, and inspect GreptimeDB metadata snapshots.

## Export Tool

### Command Syntax

```bash
greptime cli meta snapshot save [OPTIONS]
```

### Options

#### Storage Backend Options

| Option             | Required | Default           | Description                                                                                                                                        |
| ------------------ | -------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| --store-addrs      | Conditional | -              | Metadata store addresses. Required for persistent backends; the format depends on the backend                                                       |
| --backend          | No       | etcd-store        | Metadata store backend: `etcd-store`, `memory-store`, `postgres-store`, `mysql-store`, or `raft-engine-store`                                      |
| --store-key-prefix | No       | ""                | Unified prefix for data in metasrv, refer to metasrv configuration                                                                                 |
| --meta-table-name  | No       | greptime_metakv   | When backend is one of `postgres-store`, `mysql-store`, the table name storing metadata                                                            |
| --max-txn-ops      | No       | 128               | Maximum number of txn operations                                                                                                                   |

#### File Options

| Option       | Required | Default           | Description                                                                 |
| ------------ | -------- | ----------------- | --------------------------------------------------------------------------- |
| --file-path  | No       | metadata_snapshot.metadata.fb | Path of the snapshot file                                      |
| --dir        | No       | /                             | Root directory used for file or object-store I/O                |

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
| --store-addrs      | Conditional | -            | Metadata store addresses. Required for persistent backends; the format depends on the backend                                                         |
| --backend          | No       | etcd-store      | Metadata store backend: `etcd-store`, `memory-store`, `postgres-store`, `mysql-store`, or `raft-engine-store`                                         |
| --store-key-prefix | No       | ""              | Unified prefix for data in metasrv, refer to metasrv configuration                                                                                   |
| --meta-table-name  | No       | greptime_metakv | When backend is `postgres-store`, `mysql-store`, the table name storing metadata                                                                     |
| --max-txn-ops      | No       | 128             | Maximum number of txn operations                                                                                                                     |

#### File Options

| Option      | Required | Default                       | Description                                                                                                                                          |
| ----------- | -------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| --file-path | No       | metadata_snapshot.metadata.fb | Path of the snapshot file to restore                                                                                                                 |
| --dir       | No       | /                             | Root directory used for file or object-store I/O                                                                                                     |
| --force     | No       | false                         | Whether to force import, when target backend is detected to not be in a clean state, import is disabled by default, enable this flag to force import |

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
| --file-path  | No       | metadata_snapshot.metadata.fb | Path of the snapshot file to inspect        |
| --dir        | No       | /                             | Root directory used for file or object-store I/O |
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
