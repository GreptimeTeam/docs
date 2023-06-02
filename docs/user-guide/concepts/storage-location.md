# Storage Location

GreptimeDB supports storing data in local file system, AWS S3, Azure Blob Storage and Aliyun OSS.

## Local File Structure

The storage file structure of GreptimeDB includes of the following:

```cmd
├── data
│   ├── greptime
│   ├── procedure
│   └── system
├── logs
│   ├── greptime-standalone-err
│   ├── greptime-standalone
└── wal
    ├── raftlog
    ├── rewrite
    └── LOCK
```

- `data`: The files in data directory store time series data of GreptimeDB. To customize this path, please refer to [Storage option](../operations/configuration.md#storage-option).
- `logs`: The log files contains all the logs of operations in GreptimeDB.
- `wal`: The wal directory contains the write-ahead log files.

## Cloud storage

All dictionries in local file system can be stored in cloud storage. Please refer to [Storage option](../operations/configuration.md#storage-option) for more details.
