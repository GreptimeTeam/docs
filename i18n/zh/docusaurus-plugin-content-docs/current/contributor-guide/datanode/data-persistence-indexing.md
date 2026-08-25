---
keywords: [数据持久化, 索引机制, SST 文件, 倒排索引]
description: 介绍了 GreptimeDB 的数据持久化和索引机制，包括 SST 文件格式、数据持久化过程和倒排索引的实现。
---

# 数据持久化与索引

Mito 将 memtable 中的数据 flush 到本地文件系统或对象存储，SST 文件使用 [Apache Parquet][1] 作为数据格式。

## SST 文件格式

Parquet 是一种列式文件格式，其层级结构决定 Mito 扫描时可以读取、缓存或裁剪的单元。

Parquet 按 row group、column chunk 和 page 组织数据。每个 row group 为每一列保存一个 column chunk，每个 column chunk 再包含一个或多个 page。Page 是 column chunk 内最小的编码 I/O 单元。

Column chunk 使投影扫描只读取查询需要的列。

同一列的 page 也适合使用字典编码、run-length encoding（RLE）等方式压缩。

<img src="/parquet-file-format.png" alt="Parquet file format" width="500"/>

## 数据持久化

`region_engine.mito.global_write_buffer_size` 设置一个 Datanode 上所有 Mito memtable 共享的内存阈值。内存使用达到阈值后，write-buffer manager 选择 memtable，并通过 `src/mito2/src/flush.rs` 调度 SST flush。


## SST 文件中的索引数据

Parquet 为 row group 和 page 保存列统计信息。Mito 将兼容的查询谓词转换为 Parquet pruning predicate，利用 min/max 和 null 统计信息跳过不可能匹配的 row group。


## 索引文件

Mito 将 SST 对应的索引 artifact 保存在带版本的 [Puffin][3] 文件中，Region manifest 记录当前生效的索引版本。发布或重建索引时，不能让 manifest 引用尚未完整写入的 artifact。

`src/mito2/src/sst/index/` 负责将倒排索引、基于 bloom filter 的 skipping index、全文索引及 feature-gated vector index 接入 SST 读写。可复用的索引格式位于 `src/index/src/`，companion file 由 `puffin_manager.rs` 管理。


## 倒排索引

倒排索引按列把编码后的列值映射到包含该值的 SST 数据段。应用谓词后得到候选 segment ID；正常扫描仍会对候选数据段中的行执行完整谓词。

![Inverted index searching](/inverted-index-searching.png)

上图中的查询使用倒排索引找出 `job` 等于 `apiserver`、`handler` 匹配正则表达式 `.*users` 且 `status` 匹配正则表达式 `4...` 的候选数据段。Mito 扫描这些数据段，并对数据行应用完整查询谓词。

### 倒排索引格式

![Inverted index format](/inverted-index-format.png)

每个列索引包含一个 FST（Finite State Transducer）和多个 bitmap。FST 把编码后的列值映射到 bitmap 位置，并支持正则表达式匹配等查询。每个 bitmap 记录包含该值的数据段。


### 索引数据段

GreptimeDB 把 SST 文件分割成固定大小的索引数据段。匹配的 bitmap 会转换为 Parquet row selection，使 Mito 只读取候选行范围。

例如，每个数据段包含 1024 行且候选数据段 ID 为 `[0, 2]` 时，Mito 只扫描第 0–1023 行和第 2048–3071 行，不需要读取 SST 中的全部数据行。

引擎选项 `index.inverted_index.segment_row_count` 控制目标 segment 大小，默认值为 `1024`。较小的 segment 可以提高裁剪精度，但会增加索引大小和构建成本。


## 统一数据访问层：OpenDAL

`object-store` crate 基于 [OpenDAL][2] 封装本地文件系统和对象存储。Mito 通过 `src/mito2/src/access_layer.rs` 执行 SST 与索引 I/O；存储引擎代码不应绕过该边界增加 backend-specific 路径。修改配置的 backend 不会迁移已有数据。

[1]: https://parquet.apache.org
[2]: https://opendal.apache.org/
[3]: https://iceberg.apache.org/puffin-spec
