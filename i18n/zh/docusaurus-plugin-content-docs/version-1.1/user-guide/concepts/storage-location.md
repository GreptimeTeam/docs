---
keywords: [存储架构, 本地存储, 对象存储, 存储后端, WAL, metadata, cache]
description: 介绍本地存储和对象存储部署，以及数据文件、WAL、metadata、cache 和按表选择存储后端的职责边界。
---

# 存储位置

GreptimeDB 可以把持久化数据文件放在本地文件系统或对象存储中。本地存储适合 standalone 部署；需要计算存储分离的分布式部署通常使用共享对象存储。

存储位置和 table engine 是两层不同的抽象。[Mito Engine 和 Metric Engine](/reference/about-greptimedb-engines.md)决定表数据如何组织和处理；本地文件系统、Amazon S3、Google Cloud Storage、Azure Blob Storage 等 storage provider 负责保存引擎生成的数据文件。Metric Engine 基于 Mito Engine，并复用其存储能力。

<AnchorAlias id="本地文件结构" />

## 本地存储与对象存储

使用本地存储时，持久化数据文件放在配置的 `data_home` 下。这种方式适合 standalone，但文件与所在主机绑定，备份和恢复方案需要覆盖该目录。

使用对象存储时，持久化数据文件放在配置的 bucket 或 container 中。Datanode 可以用本地磁盘做 cache，对象存储则是共享的持久化位置。这样可以分别调整计算和存储容量，但查询延迟与成本仍取决于 cache、网络、请求量和服务价格。

## 各类存储的职责

GreptimeDB 部署中包含几类不同的状态：

| 状态 | 职责 | 常见位置 | 持久性与恢复要求 |
| --- | --- | --- | --- |
| 持久化数据文件 | 表数据、SST 文件和持久化索引 | 本地文件系统或对象存储 | 本地文件需要备份；对象存储应根据恢复要求配置留存、版本控制和复制。 |
| WAL | 在写入形成持久化数据文件前记录已接收的数据 | 根据配置使用 Local WAL、Remote WAL 或 Noop WAL | 用于恢复已接收但尚未 flush 的写入。恢复能力取决于 WAL 模式；Noop WAL 不保留这部分数据。 |
| Metadata | Catalog、schema、表定义、Region 路由和 procedure 状态 | Standalone 使用本地 metadata；集群模式由 Metasrv 管理 | 恢复数据库状态时必须具备。应根据部署模式持久化、复制或备份。 |
| 本地 cache | 缓存对象存储数据和索引临时数据 | Datanode 或 standalone 的本地磁盘 | 可以从持久化数据重建，不属于数据持久性边界。 |
| 进程日志 | GreptimeDB 组件运行日志 | 本地日志目录或配置的日志采集系统 | 数据库恢复不依赖进程日志，可按运维和合规要求留存。 |

具体要求取决于部署方式。在确定 RPO 和 RTO 前，应结合下文的恢复文档评估。

<AnchorAlias id="云存储" />

## 对象存储与灾备

把持久化数据文件放入对象存储，不等于已经具备完整的灾备能力。恢复还取决于 WAL 模式、metadata 备份或复制、Region 状态、对象存储的版本与留存设置，以及部署配置。

规划恢复方案时，请同时阅读[灾备](/user-guide/deployments-administration/disaster-recovery/overview.md)和 [WAL 概述](/user-guide/deployments-administration/wal/overview.md)。使用 Noop WAL 会改变数据持久性边界，需要单独评估。

## 支持的存储后端

GreptimeDB 支持：

- 本地文件系统；
- Amazon S3 及 S3 兼容服务，包括 MinIO、DigitalOcean Spaces、腾讯云对象存储和百度对象存储；
- Google Cloud Storage；
- Azure Blob Storage；
- 阿里云 OSS。

完整配置项和当前支持列表参见[存储选项](/user-guide/deployments-administration/configuration.md#storage-options)。

<AnchorAlias id="多存储引擎支持" />

## 多个存储后端

管理员可以通过 `[[storage.providers]]` 配置多个存储后端。建表时，再通过 `storage` 表选项选择其中一个：

```sql
CREATE TABLE archive_events (
  ts TIMESTAMP TIME INDEX,
  payload STRING
) WITH (storage = 'archive_s3');
```

这个选项决定 table engine 把持久化文件存到哪里，不会切换 table engine。建表前需要先配置 provider name 和访问凭证。详见[创建自定义存储的表](/reference/sql/create.md#创建自定义存储的表)。
