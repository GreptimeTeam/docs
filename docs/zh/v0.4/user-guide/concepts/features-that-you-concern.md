# 关键特性

## GreptimeDB 支持更新吗？

支持。更新可以通过插入操作有效地执行。如果主键和时间索引具有相同的列值，旧数据将被新数据替换。GreptimeDB 中的主键与时间索引相当于其他 TSDB 中的时间线的概念。

更新的性能与插入相同，但过多的更新可能会损害查询性能。

## GreptimeDB 支持删除吗？

支持。它可以通过主键有效地删除数据，但是过多的删除也可能会损害查询性能。

使用其他查询条件（非主键匹配）删除数据并不是一种高效的操作，因为它需要两个步骤：查询数据，然后通过主键删除它。

## 我可以为不同的表或指标设置 TTL 或保留策略吗？

当然，你可以在创建表时为每个表设置 TTL：

```sql
CREATE TABLE IF NOT EXISTS temperatures(
  ts TIMESTAMP TIME INDEX,
  temperature DOUBLE DEFAULT 10,
) engine=mito with(ttl='7d', regions=10);
```

在上述 SQL 中 `temperatures` 表的 TTL 被设置为 7 天。如果你想为所有表设置全局TTL，你可以在配置文件中配置它：

```toml
[storage]
global_ttl = "7d"
```

你可以在[这里](/zh/v0.4/reference/sql/create)参考表创建语句的 TTL 选项。

## GreptimeDB 的压缩率是多少？

答案是视情况而定。

GreptimeDB 使用列式存储布局，并通过最佳算法压缩时间序列数据，并且它会根据列数据的统计和分布选择最合适的压缩算法。GreptimeDB 还将提供可以更紧凑地压缩数据但会失去精度的 Rollup 功能。

因此，GreptimeDB 的数据压缩率可能在 2 倍到几百倍之间，这取决于你的数据特性以及你是否可以接受精度损失。

## GreptimeDB 如何解决高基数问题？

GreptimeDB 通过以下方式解决这个问题：

- **分片**：它将数据和索引分布在不同的 Region 服务器之间。阅读GreptimeDB 的[架构](./architecture.md)。
- **智能索引**：它不强制为每个标签创建倒排索引，而是根据标签列的特性和负载类型选择合适的索引类型并自动构建，更多信息可以参考这篇[博客](https://greptime.com/blogs/2022-12-21-storage-engine-design#smart-indexing)。
- **MPP**: 除了索引之外，查询引擎还会利用向量化执行和分布式并行执行等技术来加速查询。

## GreptimeDB 支持连续聚合或降采样吗？

不支持，但我们有计划支持它。

## 我可以在云的对象存储中存储数据吗？

可以，GreptimeDB 的数据访问层基于 [OpenDAL](https://github.com/apache/incubator-opendal)，它支持大多数类型的对象存储服务。
数据可以存储在如 AWS S3 或 Azure Blob Storage 等性价比高的云存储服务中，请参考这里的存储[配置指南](./../operations/configuration.md#storage-options)。

GreptimeDB 还提供一个完全托管的云服务 [GreptimeCloud](https://greptime.cn/product/cloud) 来帮助您管理云中的数据。
