---
keywords: [数据持久化, 索引机制, SST 文件, 倒排索引]
description: 介绍了 GreptimeDB 的数据持久化和索引机制，包括 SST 文件格式、数据持久化过程和倒排索引的实现。
---

# 数据持久化与索引

与其他 LSM-tree 存储引擎类似，GreptimeDB 将 memtable 中的数据持久化到本地文件系统或对象存储，并使用 [Apache Parquet][1] 作为持久化文件格式。

## SST 文件格式

Parquet 是一种提供快速数据查询的开源列式存储格式，已经被许多项目采用，例如 Delta Lake。

Parquet 按 row group、column chunk 和 page 组织数据。每个 row group 为每一列保存一个 column chunk，每个 column chunk 再包含一个或多个 page。Page 是编码和压缩单元，读取指定列时则以 column chunk 为 I/O 单元。

首先，数据按列聚集，这使得文件扫描更加高效，特别是当查询只涉及少数列时，这在分析系统中非常常见。

其次，同一列中的值通常比较相似，有利于字典编码和 Run-Length Encoding（RLE）等压缩技术发挥作用。

下面这张来自 Apache Parquet 规范的图进一步展示了物理文件布局：column chunk 按 row group 写入，文件元数据及其长度则保存在 footer 中。

<img src="/parquet-file-layout.gif" alt="Apache Parquet 文件布局" width="601"/>

*来源：Apache Parquet [FileLayout.gif](https://github.com/apache/parquet-format/blob/master/doc/images/FileLayout.gif)。Copyright 2014 The Apache Software Foundation，依据 [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) 使用。*

## 数据持久化

GreptimeDB 提供了 `region_engine.mito.global_write_buffer_size` 的配置项来设置全局的 Memtable 大小阈值。当数据库所有 MemTable 中的数据量之和达到阈值时将自动触发持久化操作，将 MemTable 的数据 flush 到 SST 文件中。


## SST 文件中的索引数据

Parquet 在每个 column chunk 的元数据中保存 row group 级列统计信息，例如最小值、最大值和 null 数量。Page 元数据和可选的 column index 可以提供粒度更细的统计信息。

![查询 name 列时，Parquet 列统计信息排除了一个 row group，并将另一个保留为待读取对象。](/parquet-row-group-statistics.zh.svg)

例如，查询 `name` 等于 `Emily` 的行时，可以跳过 row group 0，因为其中 `name` 的最大值是 `Charlie`，无需读取该 row group。


## 索引文件

当一个 SST 存在已配置且适用的索引输出时，GreptimeDB 将这些索引写入与该 SST 关联的 Puffin 文件。没有适用索引的 SST 不需要生成 Puffin 文件。

Puffin 是索引 Blob 及其元数据的容器，使不同索引结构可以共用一个文件。

![Puffin](/puffin.png)

GreptimeDB 会将多种索引结构作为 Blob 存储在 Puffin 文件中，包括倒排索引、跳数索引（基于 bloom filter）和全文索引。倒排索引是最早支持的索引结构，下面将详细介绍。


## 倒排索引

在 v0.7 版本中，GreptimeDB 引入了倒排索引（Inverted Index）来加速查询。

倒排索引是全文搜索中常见的索引结构，它将文档中的每个单词映射到包含该单词的文档列表。GreptimeDB 将这项搜索引擎技术用于时序数据索引。

搜索引擎和时间序列数据库虽然运行在不同的领域，但是应用的倒排索引技术背后的原理是相似的。这种相似性需要一些概念上的调整：
1. 单词：在 GreptimeDB 中，指时间线的列值。
2. 文档：在 GreptimeDB 中，指包含多个时间线的数据段。

倒排索引的引入，使得 GreptimeDB 可以跳过不符合查询条件的数据段，从而提高扫描效率。

![Inverted index searching](/inverted-index-searching.png)

上述查询使用倒排索引定位 `job` 等于 `apiserver`、`handler` 匹配 `.*users` 且 `status` 匹配 `4..` 的数据段。Mito 只扫描这些数据段，再应用剩余过滤条件。

### 倒排索引格式

![倒排索引 Blob 先保存各列索引，再保存 footer 元数据；每个列索引包含 null bitmap、posting bitmap 和 FST。](/inverted-index-blob-layout.zh.svg)

GreptimeDB 按列构建倒排索引。每个列索引包含一个 null bitmap、多个 posting bitmap 和一个 FST。Blob footer 记录定位和解码各列索引所需的 offset、size 和元数据。

FST（Finite State Transducer）允许 GreptimeDB 以紧凑的格式存储列值到 Bitmap 位置的映射，并且提供了优秀的搜索性能和支持复杂搜索（例如正则表达式匹配）；Bitmap 则维护了数据段 ID 列表，每个位表示一个数据段。


### 索引数据段

GreptimeDB 把一个 SST 文件分割成多个索引数据段，每个数据段包含相同行数的数据。这种分段的目的是通过只扫描符合查询条件的数据段来优化查询性能。

例如，当数据段的行数为 1024，如果查询条件应用倒排索引后，得到的数据段列表为 `[0, 2]`，那么只需扫描 SST 文件中的第 0 和第 2 个数据段（即第 0 行到第 1023 行和第 2048 行到第 3071 行）即可。

数据段的行数由引擎选项 `index.inverted_index.segment_row_count` 控制，默认为 `1024`。较小的值意味着更精确的索引，往往会得到更好的查询性能，但会增加索引存储成本。通过调整该选项，可以在存储成本和查询性能之间进行权衡。


## 统一数据访问层：OpenDAL

GreptimeDB 使用 [OpenDAL][2] 为本地文件系统和对象存储提供统一访问层。修改配置的存储 backend 不会迁移已有数据。

[1]: https://parquet.apache.org
[2]: https://github.com/datafuselabs/opendal
[3]: https://iceberg.apache.org/puffin-spec
