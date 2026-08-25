---
keywords: [greptimedb 引擎, Mito 引擎, Metric 引擎, File 引擎, 表引擎]
description: GreptimeDB 中所有表引擎的概述。
---

# GreptimeDB 表引擎

## 概述

GreptimeDB 提供三种存储模型不同的表引擎：Mito、Metric 和 File。

### Mito 引擎

Mito 是 `CREATE TABLE` 的默认表引擎，并针对时序工作负载进行了优化。它采用 [LSM-tree][1] 设计，包含预写日志（WAL）、Memtable、不可变 SST 文件和时间窗口压缩。该设计支持高吞吐写入，同时保持查询性能。

Mito 可以将 SST 文件存储在本地存储、S3、GCS 或 Azure Blob Storage 中，无需额外的存储插件。SST 文件位于远端时，Mito 可以使用分层本地缓存降低对象存储的访问延迟和成本。

[1]: https://en.wikipedia.org/wiki/Log-structured_merge-tree

### Metric 引擎

Metric 引擎针对会创建大量相似列小型逻辑表的指标工作负载进行了优化，包括包含数千张 Prometheus 指标表的监控部署。

多个逻辑表共享宽物理表，因此引擎可以复用列和元数据，而不必为每个逻辑表创建独立的物理存储。该设计可以降低存储和元数据开销、改善列式压缩，并提高指标查询效率。物理表由 Mito 存储。

### File 引擎

File 引擎用于存储通过 `CREATE EXTERNAL TABLE` 创建的表。它可以读取本地存储或对象存储中的 CSV、JSON、Parquet 和 ORC 文件，无需导入或转换数据。File 引擎的表是只读的，并使用 GreptimeDB 查询引擎处理外部文件。

## 引擎选择指南

### 何时使用各种引擎

- **Mito 引擎**：用于需要持久存储，并兼顾写入吞吐、查询性能和存储效率的大多数时序工作负载。`CREATE TABLE` 省略 `ENGINE` 子句时默认使用 Mito。

- **Metric 引擎**：用于包含大量相似列逻辑表的指标工作负载。共享物理存储可以降低存储开销，并改善压缩和查询性能。

- **File 引擎**：用于探索或查询受支持的外部文件，无需将文件数据导入常规表。它适用于一次性分析以及查询现有数据管道生成的文件。

### 在 SQL 中指定引擎类型

创建常规表时，通过 [`CREATE TABLE`](/reference/sql/create.md#create-table) 的 `ENGINE` 子句选择 Mito 或 Metric。[`CREATE EXTERNAL TABLE`](/reference/sql/create.md#create-external-table) 使用 File 引擎，并通过 `WITH` 子句指定文件位置和格式。
