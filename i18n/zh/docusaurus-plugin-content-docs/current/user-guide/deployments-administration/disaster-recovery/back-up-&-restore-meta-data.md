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
    --s3-access-key <your-s3-access-key> \
    --s3-secret-key <your-s3-secret-key>
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

#### 从 etcd 后端导出

将元数据从 etcd 导出到本地目录：

```bash
greptime cli meta snapshot save \
    --store-addrs 127.0.0.1:2379 \
    --backend etcd-store
```

**输出**: 在当前工作目录中创建 `metadata_snapshot.metadata.fb` 文件。

## 导入操作

:::warning
**重要**: 在导入元数据之前，请确保目标存储后端的对应表中没有**任何数据**，否则可能会导致元数据损坏。

如果你需要导入到具有现有数据的后端，请使用 `--force` 标志绕过此安全检查。但是，请谨慎操作，因为这可能导致数据损坏。
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
    --s3-access-key <your-s3-access-key> \
    --s3-secret-key <your-s3-secret-key>
```

### 从本地文件导入

#### 导入到 PostgreSQL 后端

从本地备份文件恢复元数据到 PostgreSQL：

```bash
greptime cli meta snapshot restore \
    --store-addrs 'password=password dbname=postgres user=postgres host=localhost port=5432' \
    --backend postgres-store
```

#### 导入到 etcd 后端

从本地备份文件恢复元数据到 etcd：

```bash
greptime cli meta snapshot restore \
    --store-addrs 127.0.0.1:2379 \
    --backend etcd-store
```