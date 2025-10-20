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
| --store-addrs      | Yes      | -                 | Metadata storage service addresses to connect to (only supports etcd MySQL PostgreSQL) format consistent with store-addrs in metasrv configuration |
| --backend          | Yes      | -                 | Type of metadata storage backend, one of `etcd-store`, `postgres-store`, `mysql-store`                                                             |
| --store-key-prefix | No       | ""                | Unified prefix for data in metasrv, refer to metasrv configuration                                                                                 |
| --meta-table-name  | No       | greptime_metakv   | When backend is one of `postgres-store`, `mysql-store`, the table name storing metadata                                                            |
| --max-txn-ops      | No       | 128               | Maximum number of txn operations                                                                                                                   |

#### File Options

| Option       | Required | Default           | Description                                                                 |
| ------------ | -------- | ----------------- | --------------------------------------------------------------------------- |
| --file-name  | No       | metadata_snapshot | File name for metadata export, will automatically add `.metadata.fb` suffix |
| --dir        | No       | ""                | Directory to store exported data                                            |

#### Object Storage Options

To use object storage for storing exported metadata, enable one of the following providers and configure its connection parameters:

##### S3

| Option                       | Required | Default | Description                                                      |
| ---------------------------- | -------- | ------- | ---------------------------------------------------------------- |
| --enable-s3                  | No       | false   | Whether to use S3 as storage medium for exported data            |
| --s3-bucket                  | No       | -       | S3 bucket name                                                   |
| --s3-root                    | No       | -       | Root path in S3 bucket                                           |
| --s3-access-key-id           | No       | -       | S3 access key ID                                                 |
| --s3-secret-access-key       | No       | -       | S3 secret access key                                             |
| --s3-region                  | No       | -       | S3 region name                                                   |
| --s3-endpoint                | No       | -       | S3 endpoint URL (optional, defaults based on bucket region)      |
| --s3-enable-virtual-host-style | No     | false   | Enable virtual host style for S3 API requests                    |

##### OSS (Alibaba Cloud)

| Option                  | Required | Default | Description                            |
| ----------------------- | -------- | ------- | -------------------------------------- |
| --enable-oss            | No       | false   | Whether to use OSS for exported data   |
| --oss-bucket            | No       | -       | OSS bucket name                        |
| --oss-root              | No       | -       | Root path in OSS bucket                |
| --oss-access-key-id     | No       | -       | OSS access key ID                      |
| --oss-access-key-secret | No       | -       | OSS access key secret                  |
| --oss-endpoint          | No       | -       | OSS endpoint URL                       |

##### GCS (Google Cloud Storage)

| Option                | Required | Default | Description                           |
| --------------------- | -------- | ------- | ------------------------------------- |
| --enable-gcs          | No       | false   | Whether to use GCS for exported data  |
| --gcs-bucket          | No       | -       | GCS bucket name                       |
| --gcs-root            | No       | -       | Root path in GCS bucket               |
| --gcs-scope           | No       | -       | GCS service scope                     |
| --gcs-credential-path | No       | -       | Path to GCS credential file           |
| --gcs-credential      | No       | -       | GCS credential content                |
| --gcs-endpoint        | No       | -       | GCS endpoint URL                      |

##### Azure Blob Storage

| Option                | Required | Default | Description                                 |
| --------------------- | -------- | ------- | ------------------------------------------- |
| --enable-azblob       | No       | false   | Whether to use Azure Blob for exported data |
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
| --store-addrs      | Yes      | -               | Metadata storage service addresses to connect to (only supports etcd MySQL PostgreSQL) format consistent with store-addrs in metasrv configuration   |
| --backend          | Yes      | -               | Type of metadata storage backend, one of `etcd-store`, `postgres-store`, `mysql-store`                                                               |
| --store-key-prefix | No       | ""              | Unified prefix for data in metasrv, refer to metasrv configuration                                                                                   |
| --meta-table-name  | No       | greptime_metakv | When backend is `postgres-store`, `mysql-store`, the table name storing metadata                                                                     |
| --max-txn-ops      | No       | 128             | Maximum number of txn operations                                                                                                                     |

#### File Options

| Option      | Required | Default                       | Description                                                                                                                                          |
| ----------- | -------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| --file-name | No       | metadata_snapshot.metadata.fb | File name of metadata export to import                                                                                                               |
| --dir       | No       | "."                           | Directory storing exported data                                                                                                                      |
| --force     | No       | false                         | Whether to force import, when target backend is detected to not be in a clean state, import is disabled by default, enable this flag to force import |

#### Object Storage Options

To use object storage for importing metadata, enable one of the following providers and configure its connection parameters:

##### S3

| Option                       | Required | Default | Description                                                      |
| ---------------------------- | -------- | ------- | ---------------------------------------------------------------- |
| --enable-s3                  | No       | false   | Whether to use S3 as storage medium for exported data            |
| --s3-bucket                  | No       | -       | S3 bucket name                                                   |
| --s3-root                    | No       | -       | Root path in S3 bucket                                           |
| --s3-access-key-id           | No       | -       | S3 access key ID                                                 |
| --s3-secret-access-key       | No       | -       | S3 secret access key                                             |
| --s3-region                  | No       | -       | S3 region name                                                   |
| --s3-endpoint                | No       | -       | S3 endpoint URL (optional, defaults based on bucket region)      |
| --s3-enable-virtual-host-style | No     | false   | Enable virtual host style for S3 API requests                    |

##### OSS (Alibaba Cloud)

| Option                  | Required | Default | Description                            |
| ----------------------- | -------- | ------- | -------------------------------------- |
| --enable-oss            | No       | false   | Whether to use OSS for exported data   |
| --oss-bucket            | No       | -       | OSS bucket name                        |
| --oss-root              | No       | -       | Root path in OSS bucket                |
| --oss-access-key-id     | No       | -       | OSS access key ID                      |
| --oss-access-key-secret | No       | -       | OSS access key secret                  |
| --oss-endpoint          | No       | -       | OSS endpoint URL                       |

##### GCS (Google Cloud Storage)

| Option                | Required | Default | Description                           |
| --------------------- | -------- | ------- | ------------------------------------- |
| --enable-gcs          | No       | false   | Whether to use GCS for exported data  |
| --gcs-bucket          | No       | -       | GCS bucket name                       |
| --gcs-root            | No       | -       | Root path in GCS bucket               |
| --gcs-scope           | No       | -       | GCS service scope                     |
| --gcs-credential-path | No       | -       | Path to GCS credential file           |
| --gcs-credential      | No       | -       | GCS credential content                |
| --gcs-endpoint        | No       | -       | GCS endpoint URL                      |

##### Azure Blob Storage

| Option                | Required | Default | Description                                 |
| --------------------- | -------- | ------- | ------------------------------------------- |
| --enable-azblob       | No       | false   | Whether to use Azure Blob for exported data |
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
| --file-name  | No       | metadata_snapshot | File name of the metadata snapshot to view  |
| --dir        | No       | "."               | Directory where the snapshot file is stored |
| --inspect-key| No       | "*"               | Query pattern to filter metadata keys       |
| --limit      | No       | -                 | Maximum number of entries to display        |

#### Object Storage Options

To inspect snapshots stored in object storage, enable one of the following providers and configure its connection parameters:

##### S3

| Option                       | Required | Default | Description                                                      |
| ---------------------------- | -------- | ------- | ---------------------------------------------------------------- |
| --enable-s3                  | No       | false   | Whether to use S3 as storage medium for the snapshot             |
| --s3-bucket                  | No       | -       | S3 bucket name                                                   |
| --s3-root                    | No       | -       | Root path in S3 bucket                                           |
| --s3-access-key-id           | No       | -       | S3 access key ID                                                 |
| --s3-secret-access-key       | No       | -       | S3 secret access key                                             |
| --s3-region                  | No       | -       | S3 region name                                                   |
| --s3-endpoint                | No       | -       | S3 endpoint URL (optional, defaults based on bucket region)      |
| --s3-enable-virtual-host-style | No     | false   | Enable virtual host style for S3 API requests                    |

##### OSS (Alibaba Cloud)

| Option                  | Required | Default | Description                            |
| ----------------------- | -------- | ------- | -------------------------------------- |
| --enable-oss            | No       | false   | Whether to use OSS for the snapshot    |
| --oss-bucket            | No       | -       | OSS bucket name                        |
| --oss-root              | No       | -       | Root path in OSS bucket                |
| --oss-access-key-id     | No       | -       | OSS access key ID                      |
| --oss-access-key-secret | No       | -       | OSS access key secret                  |
| --oss-endpoint          | No       | -       | OSS endpoint URL                       |

##### GCS (Google Cloud Storage)

| Option                | Required | Default | Description                           |
| --------------------- | -------- | ------- | ------------------------------------- |
| --enable-gcs          | No       | false   | Whether to use GCS for the snapshot   |
| --gcs-bucket          | No       | -       | GCS bucket name                       |
| --gcs-root            | No       | -       | Root path in GCS bucket               |
| --gcs-scope           | No       | -       | GCS service scope                     |
| --gcs-credential-path | No       | -       | Path to GCS credential file           |
| --gcs-credential      | No       | -       | GCS credential content                |
| --gcs-endpoint        | No       | -       | GCS endpoint URL                      |

##### Azure Blob Storage

| Option                | Required | Default | Description                                 |
| --------------------- | -------- | ------- | ------------------------------------------- |
| --enable-azblob       | No       | false   | Whether to use Azure Blob for the snapshot  |
| --azblob-container    | No       | -       | Azure Blob container name                   |
| --azblob-root         | No       | -       | Root path in container                      |
| --azblob-account-name | No       | -       | Azure Blob account name                     |
| --azblob-account-key  | No       | -       | Azure Blob account key                      |
| --azblob-endpoint     | No       | -       | Azure Blob endpoint URL                     |
| --azblob-sas-token    | No       | -       | Azure Blob SAS token                        |
