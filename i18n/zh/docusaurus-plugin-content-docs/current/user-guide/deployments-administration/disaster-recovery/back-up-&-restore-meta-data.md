---
keywords: [备份, 恢复, 导出工具, 导入工具, 数据库元信息备份, 数据恢复, 命令行工具]
description: 介绍 GreptimeDB 的元数据导出和导入工具，用于数据库元信息的备份和恢复，包括命令语法、选项、常见使用场景
---

# GreptimeDB 元信息导出和导入工具

本指南描述了如何使用 GreptimeDB 的元信息导出和导入工具进行元数据库备份和恢复。

有关详细的命令行选项和高级配置，请参阅 [元数据导出和导入](/reference/command-lines/utilities/metadata.md)。

## 概述

## 导出操作

### 导出到 S3 云存储

将元数据从 PostgreSQL 导出到 S3 云存储，用于云备份存储：

```bash
greptime cli meta snapshot save \
    --store-addrs 'password=password dbname=postgres user=postgres host=localhost port=5432' \
    --backend postgres-store \
    --s3 \
    --s3-bucket your-bucket-name \
    --s3-region ap-southeast-1 \
    --s3-access-key-id <your-s3-access-key-id> \
    --s3-secret-access-key <your-s3-secret-access-key>
```

**输出**: 在指定的 S3 桶中创建 `metadata_snapshot.metadata.fb` 文件。

### 导出到本地目录

#### 从 PostgreSQL 后端导出

将元数据从 PostgreSQL 导出到本地目录：

```bash
greptime cli meta snapshot save \
    --store-addrs 'password=password dbname=postgres user=postgres host=localhost port=5432' \
    --backend postgres-store
```

#### 从 MySQL 后端导出

将元数据从 MySQL 导出到本地目录：

```bash
greptime cli meta snapshot save \
    --store-addrs 'mysql://user:password@127.0.0.1:3306/database' \
    --backend mysql-store
```

#### 从 etcd 后端导出

将元数据从 etcd 导出到本地目录：

```bash
greptime cli meta snapshot save \
    --store-addrs 127.0.0.1:2379 \
    --backend etcd-store
```

**输出**: 在当前工作目录中创建 `metadata_snapshot.metadata.fb` 文件。

#### 从 RaftEngine 后端导出

:::note
RaftEngine 在 standalone 实例运行期间会锁定元数据目录，请在导出前停止 standalone 实例。
:::

将元数据从 RaftEngine 导出到本地目录：

```bash
greptime cli meta snapshot save \
    --store-addrs "raftengine:///path/to/metadata" \
    --backend raft-engine-store
```

**输出**: 在当前工作目录中创建 `metadata_snapshot.metadata.fb` 文件。

## 导入操作

:::warning
**重要**: 在导入元数据之前，请确保目标存储后端的对应表中没有**任何数据**，否则可能会导致元数据损坏。

如果目标后端非空且**没有**传 `--force`，命令会打印一条警告并直接退出，不会恢复任何数据。此时退出码仍然是成功，所以必须查看命令输出，不能默认恢复已经执行。

`--force` 只是绕过非空检查，并不会先清空目标：恢复过程只写入 snapshot 中包含的 key，目标中其余已有的 key 会原样保留——这正是恢复后的集群会混入两代元数据的原因。建议恢复到空的 backend，之后重启整个集群并验证 catalog、table route 和 procedure。
:::

### 从 S3 云存储导入

从 S3 备份恢复元数据到 PostgreSQL 存储后端：

```bash
greptime cli meta snapshot restore \
    --store-addrs 'password=password dbname=postgres user=postgres host=localhost port=5432' \
    --backend postgres-store \
    --s3 \
    --s3-bucket your-bucket-name \
    --s3-region ap-southeast-1 \
    --s3-access-key-id <your-s3-access-key-id> \
    --s3-secret-access-key <your-s3-secret-access-key>
```

### 从本地文件导入

#### 导入到 PostgreSQL 后端

从本地备份文件恢复元数据到 PostgreSQL：

```bash
greptime cli meta snapshot restore \
    --store-addrs 'password=password dbname=postgres user=postgres host=localhost port=5432' \
    --backend postgres-store
```

#### 导入到 MySQL 后端

从本地备份文件恢复元数据到 MySQL:

```bash
greptime cli meta snapshot restore \
    --store-addrs 'mysql://user:password@127.0.0.1:3306/database' \
    --backend mysql-store
```

#### 导入到 etcd 后端

从本地备份文件恢复元数据到 etcd：

```bash
greptime cli meta snapshot restore \
    --store-addrs 127.0.0.1:2379 \
    --backend etcd-store
```

#### 导入到 RaftEngine 后端

从本地备份文件恢复元数据到 RaftEngine：

```bash
greptime cli meta snapshot restore \
    --store-addrs "raftengine:///path/to/metadata" \
    --backend raft-engine-store
```
