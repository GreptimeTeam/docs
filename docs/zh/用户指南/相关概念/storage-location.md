# 存储位置

GreptimeDB 支持将数据存储在本地文件系统、AWS S3、Azure Blob Storage 和阿里云 OSS 中。

## 本地文件结构

GreptimeDB 的存储文件结构包括以下内容：

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

- `cluster`：集群目录包含了内部数据，并按数据节点的 ID 组织数据。
- `data`：data 目录下的文件存储 GreptimeDB 的时序数据。要定制这个路径，请参考 [Storage option](../operations/configuration.md#storage-option)。
- `logs`：日志文件包含 GreptimeDB 中所有的操作日志。
- `wal`：wal 目录包含了预写日志文件。

## 云存储

文件结构中的 `cluster` 和 `data` 目录可以存储在云存储中。请参考[存储选项](../operations/configuration.md#storage-option)了解更多细节。
