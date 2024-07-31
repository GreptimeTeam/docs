# 关键特性

## GreptimeDB 支持更新数据吗？

支持，请参考[更新数据](/user-guide/write-data/overview.md#更新数据)获取更多信息。

## GreptimeDB 支持删除数据吗？

支持，请参考[删除数据](/user-guide/write-data/overview.md#删除数据)获取更多信息。

## 我可以为不同的表或指标设置 TTL 或保留策略吗？

当然，你可以在创建表时为每个表设置 TTL：

```sql
CREATE TABLE IF NOT EXISTS temperatures(
  ts TIMESTAMP TIME INDEX,
  temperature DOUBLE DEFAULT 10,
) engine=mito with(ttl='7d', regions=10);
```

在上述 SQL 中 `temperatures` 表的 TTL 被设置为 7 天。

你可以在[这里](/reference/sql/create)参考表创建语句的 TTL 选项。

## GreptimeDB 的压缩率是多少？

答案是视情况而定。

GreptimeDB 使用列式存储布局，并通过最佳算法压缩时间序列数据，并且它会根据列数据的统计和分布选择最合适的压缩算法。GreptimeDB 还将提供可以更紧凑地压缩数据但会失去精度的 Rollup 功能。

因此，GreptimeDB 的数据压缩率可能在 2 倍到几百倍之间，这取决于你的数据特性以及你是否可以接受精度损失。

## GreptimeDB 如何解决高基数问题？

GreptimeDB 通过以下方式解决这个问题：

- **分片**：它将数据和索引分布在不同的 Region 服务器之间。阅读 GreptimeDB 的[架构](./architecture.md)。
- **智能索引**：它不强制为每个标签创建倒排索引，而是根据标签列的特性和负载类型选择合适的索引类型并自动构建，更多信息可以参考这篇[博客](https://greptime.com/blogs/2022-12-21-storage-engine-design#smart-indexing)。
- **MPP**: 除了索引之外，查询引擎还会利用向量化执行和分布式并行执行等技术来加速查询。

## GreptimeDB 支持持续聚合或降采样吗？

不支持，但是我们已经启动了一个项目 `GreptimeFlow` 正在研发，请查看 [tracking issue](https://github.com/GreptimeTeam/greptimedb/issues/3187)。

## 我可以在云的对象存储中存储数据吗？

可以，GreptimeDB 的数据访问层基于 [OpenDAL](https://github.com/apache/incubator-opendal)，它支持大多数类型的对象存储服务。
数据可以存储在如 AWS S3 或 Azure Blob Storage 等性价比高的云存储服务中，请参考这里的存储[配置指南](./../operations/configuration.md#storage-options)。

GreptimeDB 还提供一个完全托管的云服务 [GreptimeCloud](https://greptime.cn/product/cloud) 来帮助您管理云中的数据。
