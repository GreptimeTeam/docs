---
keywords: [本地文件访问, 沙盒, copy root, 迁移, COPY 语句, 外部表, 升级]
description: 迁移使用本地文件路径的 COPY 工作流和外部表，以适配本版本引入的本地文件系统沙盒访问限制。
---

# 迁移本地 SQL 文件访问

在单机部署模式下，SQL 对本地文件的访问受到沙盒限制；在分布式部署模式下，SQL 对本地文件的访问被完全禁止。

## 单机模式

默认沙盒目录为 `<storage.data_home>/copy`。`COPY` 语句和外部表 location 中的相对路径将在该目录下解析；绝对路径仅在其位于沙盒目录内时才被接受。

升级前，请先梳理所有使用沙盒目录以外本地路径的 `COPY` 工作流和外部表，然后选择以下迁移方案之一：

- 将文件移动到 `<storage.data_home>/copy` 目录下，并更新对应的 SQL 路径。
- 将 `storage.copy_root` 设置为一个包含这些文件的专用本地目录。
- 将文件迁移到 S3、OSS、GCS 或 AzBlob，并更新对应的 SQL 路径。

请勿将 `storage.copy_root` 设置为 `storage.data_home`，或设置为包含 GreptimeDB 数据、WAL、manifest 或配置文件的目录。GreptimeDB 会拒绝暴露其内部数据目录的 copy root 配置。

当 `storage.data_home` 为对象存储 URL 时，除非 `storage.copy_root` 显式指定了一个本地目录，否则 SQL 对本地文件的访问将被禁止。

## 分布式模式

分布式前端和数据节点进程会拒绝 `COPY TABLE`、`COPY QUERY`、`COPY DATABASE` 以及外部表中使用的本地路径。升级前，请将这些工作流和表迁移到 S3、OSS、GCS 或 AzBlob。
