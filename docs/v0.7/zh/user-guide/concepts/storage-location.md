# 存储位置

GreptimeDB 支持将数据存储在本地文件系统、AWS S3 及其兼容服务（包括 minio、digitalocean space、腾讯云对象存储(COS)、百度云对象存储(BOS)等）、Azure Blob Storage 和阿里云 OSS 中。

## 本地文件结构

GreptimeDB 的存储文件结构包括以下内容：

```cmd
├── cluster
│   └── dn-0
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

- `cluster`：集群目录包含了内部数据，并按数据节点的 ID 组织数据。
- `data`：data 目录下的文件存储 GreptimeDB 的时序数据。要定制这个路径，请参考 [Storage option](../operations/configuration.md#storage-option)。
- `logs`：日志文件包含 GreptimeDB 中所有的操作日志。
- `wal`：wal 目录包含了预写日志文件。
- `index_intermediate`: 索引相关的临时文件目录。

## 云存储

文件结构中的 `cluster` 和 `data` 目录可以存储在云存储中。请参考[存储选项](../operations/configuration.md#storage-option)了解更多细节。

## 多存储引擎支持

GreptimeDB 的另一个强大功能是可以为每张表单独选择存储引擎。例如，您可以将一些表存储在本地磁盘上，将另一些表存储在 Amazon S3 或 Google Cloud Storage 中，请参考 [create table](/reference/sql/create#create-table)。
