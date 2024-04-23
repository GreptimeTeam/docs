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
│   └── system
├── logs
├── index_intermediate
└── wal
    ├── raftlog
    ├── rewrite
    └── LOCK
```

- `metadata`:  The internal metadata directory that keeps catalog/table info, procedure states, etc. In cluster mode, this directory does not exist in Datanodes or Frontends, because all those states including region route info are saved in Metasrv.
- `data`: The files in data directory store time series data of GreptimeDB. To customize this path, please refer to [Storage option](../operations/configuration.md#storage-options).
- `logs`: The log files contains all the logs of operations in GreptimeDB.
- `wal`: The wal directory contains the write-ahead log files.
- `index_intermediate`: the temporary intermediate data while indexing.

## Cloud storage

The `data` directory in the file structure can be stored in cloud storage. Please refer to [Storage option](../operations/configuration.md#storage-options) for more details.

## Multiple storage engines

Another powerful feature of GreptimeDB is that you can choose the storage engine for each table. For example, you can store some tables on the local disk, and some tables in Amazon S3 or Google Cloud Storage, see [create table](/reference/sql/create#create-table).
