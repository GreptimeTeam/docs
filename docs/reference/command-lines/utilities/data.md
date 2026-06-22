---
keywords: [GreptimeDB CLI, backup, restore, export tool, import tool, database backup, database restoration, command line tool, data export, data import]
description: Introduction to GreptimeDB's data export and import tools for backing up and restoring database data, including command syntax, options.
---

# Data Export & Import

The Export and Import tools provide functionality for backing up and restoring GreptimeDB databases. These tools can handle both schema and data, allowing for complete or selective backup and restoration operations.

## Export Tool

### Command Syntax
```bash
greptime cli data export [OPTIONS]
```

### Options
| Option                    | Required | Default        | Description                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------- | -------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--addr`                  | Yes      | -              | Server address to connect                                                                                                                                                                                                                                                                                                                                                                                                           |
| `--output-dir`            | Yes      | -              | Directory to store exported data. **Important**: This path is on the **remote server's filesystem**, not your local machine. If you need files locally, configure remote storage (S3/OSS/GCS/Azure Blob) for data export and use `--ddl-local-dir` to save SQL files to your local filesystem.                                                                                                                                     |
| `--database`              | No       | all databases | Name of the database to export                                                                                                                                                                                                                                                                                                                                                                                                      |
| `--db-parallelism`, `-j`  | No       | 1              | Number of databases to export in parallel. For example, if there are 20 databases and `db-parallelism` is set to 4, then 4 databases will be exported concurrently. (alias: `--export-jobs`)                                                                                                                                                                                                                                        |
| `--table-parallelism`     | No       | 4              | Number of tables to export in parallel within a single database. For example, if a database contains 30 tables and `table-parallelism` is set to 8, then 8 tables will be exported concurrently.                                                                                                                                                                                                                                    |
| `--max-retry`             | No       | 3              | Maximum retry attempts per job                                                                                                                                                                                                                                                                                                                                                                                                      |
| `--target`, `-t`          | No       | all            | Export target (schema/data/all)                                                                                                                                                                                                                                                                                                                                                                                                     |
| `--start-time`            | No       | -              | Start of time range for data export                                                                                                                                                                                                                                                                                                                                                                                                 |
| `--end-time`              | No       | -              | End of time range for data export                                                                                                                                                                                                                                                                                                                                                                                                   |
| `--auth-basic`            | No       | -              | Use the `<username>:<password>` format                                                                                                                                                                                                                                                                                                                                                                                              |
| `--timeout`               | No       | 0              | The timeout for a single call to the DB, default is 0 which means never timeout (e.g., `30s`, `10min 20s`)                                                                                                                                                                                                                                                                                                                          |
| `--proxy <PROXY>`         | No       | -              | The proxy server address to connect, if set, will override the system proxy. The default behavior will use the system proxy if neither `proxy` nor `no_proxy` is set.                                                                                                                                                                                                                                                               |
| `--no-proxy`              | No       | -              | Disable proxy server, if set, will not use any proxy                                                                                                                                                                                                                                                                                                                                                                                |
| `--s3`                    | No       | -              | If export data to s3                                                                                                                                                                                                                                                                                                                                                                                                                |
| `--ddl-local-dir`         | No       | -              | If both `ddl_local_dir` and remote storage (S3/OSS/GCS/Azure Blob) are set, `ddl_local_dir` will be only used for exported SQL files, and the data will be exported to remote storage. Note that `ddl_local_dir` export sql files to **LOCAL** file system, this is useful if export client don't have direct access to remote storage. If remote storage is set but `ddl_local_dir` is not set, both SQL&data will be exported to remote storage. |
| `--s3-bucket`             | Yes*     | -              | The s3 bucket name if s3 is set, this is required                                                                                                                                                                                                                                                                                                                                                                                   |
| `--s3-root`               | Yes*     | -              | If s3 is set, this is required                                                                                                                                                                                                                                                                                                                                                                                                      |
| `--s3-endpoint`           | No*      | -              | The s3 endpoint if s3 is set, this is required                                                                                                                                                                                                                                                                                                                                                                                      |
| `--s3-access-key-id`      | Yes*     | -              | The s3 access key ID if s3 is set, this is required                                                                                                                                                                                                                                                                                                                                                                                 |
| `--s3-secret-access-key`  | Yes*     | -              | The s3 secret access key if s3 is set, this is required                                                                                                                                                                                                                                                                                                                                                                             |
| `--s3-region`             | Yes*     | -              | The s3 region if s3 is set, this is required                                                                                                                                                                                                                                                                                                                                                                                        |
| `--oss`                   | No       | -              | If export data to oss                                                                                                                                                                                                                                                                                                                                                                                                               |
| `--oss-bucket`            | Yes*     | -              | The oss bucket name if oss is set, this is required                                                                                                                                                                                                                                                                                                                                                                                 |
| `--oss-endpoint`          | No*      | -              | The oss endpoint if oss is set, this is required                                                                                                                                                                                                                                                                                                                                                                                    |
| `--oss-access-key-id`     | Yes*     | -              | The oss access key id if oss is set, this is required                                                                                                                                                                                                                                                                                                                                                                               |
| `--oss-access-key-secret` | Yes*     | -              | The oss access key secret if oss is set, this is required                                                                                                                                                                                                                                                                                                                                                                           |
| `--gcs`                   | No       | -              | If export data to Google Cloud Storage (GCS)                                                                                                                                                                                                                                                                                                                                                                                         |
| `--gcs-bucket`            | Yes*     | -              | The GCS bucket name if gcs is set, this is required                                                                                                                                                                                                                                                                                                                                                                                 |
| `--gcs-root`              | Yes*     | -              | If gcs is set, this is required                                                                                                                                                                                                                                                                                                                                                                                                      |
| `--gcs-scope`             | No       | -              | GCS service scope                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `--gcs-credential`        | No       | -              | GCS credential content                                                                                                                                                                                                                                                                                                                                                                                                               |
| `--gcs-endpoint`          | No       | -              | GCS endpoint URL                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `--azblob`                | No       | -              | If export data to Azure Blob Storage                                                                                                                                                                                                                                                                                                                                                                                                 |
| `--azblob-container`      | Yes*     | -              | The Azure Blob container name if azblob is set, this is required                                                                                                                                                                                                                                                                                                                                                                     |
| `--azblob-root`           | Yes*     | -              | If azblob is set, this is required                                                                                                                                                                                                                                                                                                                                                                                                   |
| `--azblob-account-name`   | Yes*     | -              | The Azure Blob account name if azblob is set, this is required                                                                                                                                                                                                                                                                                                                                                                       |
| `--azblob-account-key`    | No       | -              | Azure Blob account key                                                                                                                                                                                                                                                                                                                                                                                                               |
| `--azblob-endpoint`       | No       | -              | Azure Blob endpoint URL                                                                                                                                                                                                                                                                                                                                                                                                              |
| `--azblob-sas-token`      | No       | -              | Azure Blob SAS token                                                                                                                                                                                                                                                                                                                                                                                                                 |

### Export Targets
- `schema`: Exports table schemas only (`SHOW CREATE TABLE`)
- `data`: Exports table data only (`COPY DATABASE TO`)
- `all`: Exports both schemas and data (default)

## Export V2 Tool

The Export V2 tool creates and manages snapshot-based exports. Compared with the legacy export command, Export V2 stores snapshot metadata in a manifest and supports snapshot management commands such as listing, verifying, and deleting snapshots.

### Command Syntax

```bash
greptime cli data export-v2 <COMMAND> [OPTIONS]
```

### Commands

| Command | Description |
| ------- | ----------- |
| `create` | Create a new snapshot. |
| `list` | List snapshots under a parent storage location. |
| `verify` | Verify snapshot integrity. |
| `delete` | Delete a snapshot and all data under it. |

### `export-v2 create` Options

```bash
greptime cli data export-v2 create [OPTIONS]
```

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `--addr` | Yes | - | Server address to connect, for example `127.0.0.1:4000`. |
| `--to` | Yes | - | Target snapshot location, for example `file:///tmp/snapshot` or `s3://bucket/path`. |
| `--catalog` | No | `greptime` | Catalog name. |
| `--schemas` | No | all non-system schemas | Schema list to export. Can be specified multiple times or as a comma-separated list. |
| `--schema-only` | No | `false` | Export schema only, without table data. |
| `--start-time` | No | - | Start time of the exported data range, in ISO 8601 format. |
| `--end-time` | No | - | End time of the exported data range, in ISO 8601 format. |
| `--chunk-time-window` | No | - | Chunk time window, for example `1h`, `6h`, `1d`, or `7d`. Requires both `--start-time` and `--end-time`. |
| `--format` | No | `parquet` | Data format. Supported values are `parquet`, `csv`, and `json`. |
| `--force` | No | `false` | Delete an existing snapshot at the target location and recreate it. |
| `--parallelism` | No | `1` | Parallelism for server-side `COPY DATABASE` execution, per schema per chunk. |
| `--chunk-parallelism` | No | `1` | Number of export chunks to run concurrently on the client. Supported range: `1` to `64`. |
| `--progress` | No | `auto` | Progress reporting mode. Supported values: `auto`, `always`, `never`. |
| `--auth-basic` | No | - | Basic authentication in `<username>:<password>` format. |
| `--timeout` | No | `60s` | Request timeout, for example `30s` or `10min 20s`. |
| `--proxy` | No | - | Proxy server address. Overrides the system proxy unless `--no-proxy` is set. |
| `--no-proxy` | No | `false` | Disable proxy usage. |
| `--s3`, `--oss`, `--gcs`, `--azblob` | No | - | Enable a remote object store backend. The snapshot URI provides the bucket/container and root path; backend-specific options such as region, endpoint, and credentials are available for the selected backend. |

### `export-v2 list` Options

```bash
greptime cli data export-v2 list --location <LOCATION> [OPTIONS]
```

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `--location` | Yes | - | Parent storage location whose direct subdirectories are snapshots. |
| `--s3`, `--oss`, `--gcs`, `--azblob` | No | - | Enable a remote object store backend and its backend-specific options such as region, endpoint, and credentials. |

### `export-v2 verify` Options

```bash
greptime cli data export-v2 verify --snapshot <SNAPSHOT> [OPTIONS]
```

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `--snapshot` | Yes | - | Snapshot storage location, for example `file:///tmp/snapshot` or `s3://bucket/path`. |
| `--s3`, `--oss`, `--gcs`, `--azblob` | No | - | Enable a remote object store backend and its backend-specific options such as region, endpoint, and credentials. |

### `export-v2 delete` Options

```bash
greptime cli data export-v2 delete --snapshot <SNAPSHOT> [OPTIONS]
```

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `--snapshot` | Yes | - | Snapshot storage location to delete. |
| `--no-confirm`, `--yes` | No | `false` | Skip interactive confirmation. |
| `--s3`, `--oss`, `--gcs`, `--azblob` | No | - | Enable a remote object store backend and its backend-specific options such as region, endpoint, and credentials. |

### Examples

Export schema only to a local snapshot:

```bash
greptime cli data export-v2 create \
  --addr 127.0.0.1:4000 \
  --to file:///tmp/snapshot \
  --schema-only
```

Export data in a time range to object storage:

```bash
greptime cli data export-v2 create \
  --addr 127.0.0.1:4000 \
  --to s3://bucket/snapshots/prod-20250101 \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-01-31T23:59:59Z \
  --chunk-time-window 1d \
  --chunk-parallelism 4 \
  --progress auto \
  --s3 \
  --s3-region us-west-2
```

## Import Tool

### Command Syntax
```bash
greptime cli data import [OPTIONS]
```

### Options
| Option                   | Required | Default       | Description                                                                                                                                                                                  |
| ------------------------ | -------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--addr`                 | Yes      | -             | Server address to connect                                                                                                                                                                    |
| `--input-dir`            | Yes      | -             | Directory containing backup data                                                                                                                                                             |
| `--database`             | No       | all databases | Name of the database to import                                                                                                                                                               |
| `--db-parallelism`, `-j` | No       | 1             | Number of databases to import in parallel. For example, if there are 20 databases and `db-parallelism` is set to 4, then 4 databases will be imported concurrently. (alias: `--import-jobs`) |
| `--max-retry`            | No       | 3             | Maximum retry attempts per job                                                                                                                                                               |
| `--target, -t`           | No       | all           | Import target (schema/data/all)                                                                                                                                                              |
| `--auth-basic`           | No       | -             | Use the `<username>:<password>` format                                                                                                                                                       |

### Import Targets
- `schema`: Imports table schemas only
- `data`: Imports table data only
- `all`: Imports both schemas and data (default)

## Import V2 Tool

The Import V2 tool imports data from snapshots created by Export V2. It supports dry-run verification, schema filtering, progress reporting, and client-side data task parallelism.

### Command Syntax

```bash
greptime cli data import-v2 [OPTIONS]
```

### Options

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `--addr` | Yes | - | Server address to connect, for example `127.0.0.1:4000`. |
| `--from` | Yes | - | Source snapshot location, for example `file:///tmp/snapshot` or `s3://bucket/path`. |
| `--catalog` | No | `greptime` | Target catalog name. |
| `--schemas` | No | all schemas in the snapshot | Schema list to import. Can be specified multiple times or as a comma-separated list. |
| `--dry-run` | No | `false` | Verify the snapshot and planned import without executing the import. |
| `--progress` | No | `auto` | Progress reporting mode. Supported values: `auto`, `always`, `never`. |
| `--task-parallelism` | No | `1` | Number of import data tasks to run concurrently on the client. Supported range: `1` to `64`. |
| `--auth-basic` | No | - | Basic authentication in `<username>:<password>` format. |
| `--timeout` | No | `60s` | Request timeout, for example `30s` or `10min 20s`. |
| `--proxy` | No | - | Proxy server address. Overrides the system proxy unless `--no-proxy` is set. |
| `--no-proxy` | No | `false` | Disable proxy usage. |
| `--s3`, `--oss`, `--gcs`, `--azblob` | No | - | Enable a remote object store backend. The snapshot URI provides the bucket/container and root path; backend-specific options such as region, endpoint, and credentials are available for the selected backend. |

### Examples

Dry-run import from a local snapshot:

```bash
greptime cli data import-v2 \
  --addr 127.0.0.1:4000 \
  --from file:///tmp/snapshot \
  --dry-run
```

Import from object storage with progress reporting:

```bash
greptime cli data import-v2 \
  --addr 127.0.0.1:4000 \
  --from s3://bucket/snapshots/prod-20250101 \
  --task-parallelism 4 \
  --progress auto \
  --s3 \
  --s3-region us-west-2
```
