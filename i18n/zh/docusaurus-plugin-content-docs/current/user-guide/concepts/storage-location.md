---
keywords: [存储位置, 本地文件系统, 云存储, AWS S3, Azure Blob Storage, 阿里云 OSS, 存储文件结构]
description: 介绍 GreptimeDB 支持的存储位置，包括本地文件系统和各种云存储服务，以及存储文件结构。
---

# 存储位置

GreptimeDB 支持将数据存储在本地文件系统、AWS S3 及其兼容服务（包括 minio、digitalocean space、腾讯云对象存储 (COS)、百度云对象存储 (BOS) 等）、Azure Blob Storage 和阿里云 OSS 中。

## 本地文件结构

GreptimeDB 的存储文件结构包括以下内容：

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

- `metadata`: 内部元数据目录，保存 catalog、数据库以及表的元信息、procedure 状态等内部状态。在集群模式下，此目录不存在，因为所有这些状态（包括区域路由信息）都保存在 `Metasrv` 中。
- `data`: 存储 GreptimeDB 的实际的时间序列数据和索引文件。如果要自定义此路径，请参阅 [存储选项](../deployments/configuration.md#storage-options)。该目录按照 catalog 和 schema 的两级结构组织。
- `cache`: 内部的数据缓存目录，比如对象存储的本地缓存等。
- `logs`: GreptimeDB 日志文件目录。
- `wal`:  预写日志文件目录。
- `index_intermediate`: 索引构建和查询相关的的临时中间数据目录。

## 云存储

文件结构中的 `data` 目录可以存储在云存储中。请参考[存储选项](../deployments/configuration.md#存储选项)了解更多细节。

请注意，仅将 `data` 目录存储在对象存储中不足以确保数据可靠性和灾难恢复，`wal` 和 `metadata` 也需要考虑灾难恢复，更详细地请参阅[灾难恢复文档](/user-guide/deployments-administration/disaster-recovery/overview.md)。

## 多存储引擎支持

GreptimeDB 的另一个强大功能是可以为每张表单独选择存储引擎。例如，您可以将一些表存储在本地磁盘上，将另一些表存储在 Amazon S3 或 Google Cloud Storage 中，请参考 [create table](/reference/sql/create.md#create-table)。
