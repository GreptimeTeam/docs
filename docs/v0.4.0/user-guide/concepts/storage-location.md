# Storage Location

GreptimeDB supports storing data in local file system, AWS S3 and compatible services (including minio, digitalocean space, Tencent Cloud Object Storage(COS), Baidu Object Storage(BOS) and so on), Azure Blob Storage and Aliyun OSS.

## Local File Structure

The storage file structure of GreptimeDB includes of the following:

```cmd
├── cluster
│   └── dn-0
├── data
│   ├── greptime
│   └── system
├── logs
└── wal
    ├── raftlog
    ├── rewrite
    └── LOCK
```
- `cluster`: The cluster directory contains internal data, and organizes the data grouped by datanode id.
- `data`: The files in data directory store time series data of GreptimeDB. To customize this path, please refer to [Storage option](../operations/configuration.md#storage-option).
- `logs`: The log files contains all the logs of operations in GreptimeDB.
- `wal`: The wal directory contains the write-ahead log files.

## Cloud storage

`cluster` and `data` dictionaries in the file structure can be stored in cloud storage. Please refer to [Storage option](../operations/configuration.md#storage-option) for more details.
