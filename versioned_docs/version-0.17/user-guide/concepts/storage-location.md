---
keywords: [storage options, local file system, cloud storage, AWS S3, Azure Blob Storage]
description: Describes the storage options for GreptimeDB, including local file systems, cloud storage services like AWS S3, Azure Blob Storage, and more. It explains the local file structure and considerations for disaster recovery and multiple storage engines.
---

# Storage Location

GreptimeDB supports storing data in local file system, AWS S3 and compatible services (including minio, digitalocean space, Tencent Cloud Object Storage(COS), Baidu Object Storage(BOS) and so on), Azure Blob Storage and Aliyun OSS.

## Local File Structure

The storage file structure of GreptimeDB includes of the following:

```cmd
├── metadata
    ├── raftlog
    ├── rewrite
    └── LOCK
├── data
│   ├── greptime
│       └── public
├── cache
├── logs
├── index_intermediate
│   └── staging
└── wal
    ├── raftlog
    ├── rewrite
    └── LOCK
```

- `metadata`:  The internal metadata directory that keeps catalog, database and table info, procedure states, etc. In cluster mode, this directory does not exist, because all those states including region route info are saved in `Metasrv`.
- `data`: The files in data directory store time series data and index files of GreptimeDB. To customize this path, please refer to [Storage option](/user-guide/deployments-administration/configuration.md#storage-options). The directory is organized in a two-level structure of catalog and schema.
- `cache`: The directory for internal caching, such as object storage cache, etc.
- `logs`: The log files contains all the logs of operations in GreptimeDB.
- `wal`: The wal directory contains the write-ahead log files.
- `index_intermediate`: the temporary intermediate data while indexing.

## Cloud storage

The `data` directory in the file structure can be stored in cloud storage. Please refer to [Storage option](/user-guide/deployments-administration/configuration.md#storage-options) for more details.

Please note that only storing the data directory in object storage is not sufficient to ensure data reliability and disaster recovery. The `wal` and `metadata` also need to be considered for disaster recovery. Please refer to the [disaster recovery documentation](/user-guide/deployments-administration/disaster-recovery/overview.md).

## Multiple storage engines

Another powerful feature of GreptimeDB is that you can choose the storage engine for each table. For example, you can store some tables on the local disk, and some tables in Amazon S3 or Google Cloud Storage, see [create table](/reference/sql/create.md#create-table).
