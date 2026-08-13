---
keywords: [核心概念, database, table, 时间索引, table engine, Region, 索引, View, Flow]
description: 定义 GreptimeDB 的 database、table、时间索引、table engine、Region、数据类型、索引、View 和 Flow。
---

# 核心概念

## 数据库

Database 是表和其他对象的命名空间，用于组织和管理数据，但本身不等于完整的租户隔离边界。

## Time-Series Table

GreptimeDB 的表使用关系 schema，并且有且仅有一个时间索引。列采用 Tag、Timestamp、Field 语义。时序表适合 metrics 和 IoT workload；logs、traces 和事件数据使用同一套表模型，但采用适合各自信号的 schema 和表选项。

表可以用 SQL 创建，也可以由支持的写入协议自动创建。分布式部署中，一张表可以拆成多个 Region，放置在不同的 Datanode 上。详见[数据模型](./data-model.md)。

## Table Engine

表引擎决定表数据如何写入、组织、compaction 和读取。主要引擎是：

- **Mito Engine**：用于一般的时间索引表，包括 logs、traces 和事件数据。
- **Metric Engine**：基于 Mito Engine，通过共享物理存储和 metadata，针对大量 Prometheus 风格的 metrics 表做优化。

表引擎与本地文件、Amazon S3、Google Cloud Storage 等 storage provider 是不同层次的抽象。详见[表引擎](/reference/about-greptimedb-engines.md)和[存储位置](./storage-location.md)。

<AnchorAlias id="table-region" />

## Region

Region 是表的物理分区，也是存储、调度和迁移的基本单位。Region 由 Datanode 承载，Metasrv 维护它的路由和放置 metadata。客户端通常通过 Frontend 访问表，不需要直接指定 Region。

## 数据类型

GreptimeDB 的列是强类型。自动生成 schema 可以创建表和添加兼容的列，但写入已有列的值必须符合该列类型，或能够转换为该类型。详见[数据类型](/reference/sql/data-types.md)。

## 索引

索引是可选的数据结构，用于加速特定查询。GreptimeDB 提供倒排索引、全文索引和 skipping index，三者在适用查询、存储开销和写入成本上各有取舍。详见[索引](/user-guide/manage-data/data-index.md)。

## View

View 是以虚拟表形式呈现的命名 SQL 查询。它保存查询定义，不物化查询结果；查询 View 时仍会读取底层表。

## Flow

Flow 是基于源表变化执行的持续计算。它持续更新结果，并将结果物化到 sink table；sink table 可以像其他表一样查询和管理。详见 [Flow 计算](/user-guide/flow-computation/overview.md)。
