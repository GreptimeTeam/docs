---
keywords: [backup, restore, export tool, import tool, database metadata backup, medata restoration, command line tool, disaster recovery]
description: Learn how to use GreptimeDB's metadata export and import tools for backing up and restoring database metadata, including comprehensive examples and best practices
---

# Metadata Export & Import

This guide describes how to use GreptimeDB's metadata export and import tools for metadata backup and restoration operations.

For detailed command-line options and advanced configurations, please refer to [Metadata Export & Import](/reference/command-lines/utilities/metadata.md).

## Overview

## Export Operations

### Export to S3 Cloud Storage

Export metadata from PostgreSQL to S3 for cloud-based backup storage:

```bash
greptime cli meta snapshot save \
    --store-addrs 'password=password dbname=postgres user=postgres host=localhost port=5432' \
    --backend postgres-store \
    --s3 \
    --s3-bucket your-bucket-name \
    --s3-region ap-southeast-1 \
    --s3-access-key <your-s3-access-key> \
    --s3-secret-key <your-s3-secret-key>
```

**Output**: Creates `metadata_snapshot.metadata.fb` file in the specified S3 bucket.

### Export to Local Directory

#### From PostgreSQL Backend

Export metadata from PostgreSQL to local directory:

```bash
greptime cli meta snapshot save \
    --store-addrs 'password=password dbname=postgres user=postgres host=localhost port=5432' \
    --backend postgres-store
```

### From MySQL Backend

Export metadata from MySQL to local directory:

```bash
greptime cli meta snapshot save \
    --store-addrs 'mysql://user:password@127.0.0.1:3306/database' \
    --backend mysql-store
```

#### From etcd Backend

Export metadata from etcd to local directory:

```bash
greptime cli meta snapshot save \
    --store-addrs 127.0.0.1:2379 \
    --backend etcd-store
```

**Output**: Creates `metadata_snapshot.metadata.fb` file in the current working directory.

## Import Operations

:::warning
**Important**: Before importing metadata, ensure the target backend is in a **clean state** (contains no existing data). Importing to a non-empty backend may result in data corruption or conflicts. 

If you need to import to a backend with existing data, use the `--force` flag to bypass this safety check. However, exercise extreme caution as this can lead to data loss or inconsistencies.

:::

### Import from S3 Cloud Storage

Restore metadata from S3 backup to PostgreSQL storage backend:

```bash
greptime cli meta snapshot restore \
    --store-addrs 'password=password dbname=postgres user=postgres host=localhost port=5432' \
    --backend postgres-store \
    --s3 \
    --s3-bucket your-bucket-name \
    --s3-region ap-southeast-1 \
    --s3-access-key <your-s3-access-key> \
    --s3-secret-key <your-s3-secret-key>
```

### Import from Local File

#### To PostgreSQL Backend

Restore metadata from local backup file to PostgreSQL:

```bash
greptime cli meta snapshot restore \
    --store-addrs 'password=password dbname=postgres user=postgres host=localhost port=5432' \
    --backend postgres-store
```

### From MySQL Backend

Export metadata from MySQL to local directory:

```bash
greptime cli meta snapshot restore \
    --store-addrs 'mysql://user:password@127.0.0.1:3306/database' \
    --backend mysql-store
```

#### To etcd Backend

Restore metadata from local backup file to etcd:

```bash
greptime cli meta snapshot restore \
    --store-addrs 127.0.0.1:2379 \
    --backend etcd-store
```