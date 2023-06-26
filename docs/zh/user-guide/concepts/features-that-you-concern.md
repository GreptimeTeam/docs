# 值得关注的功能

## GreptimeDB 是否支持数据更新？

支持，用户可以通过插入的方式进行数据更新。如果主键有相同的列值，旧的数据将被新的取代。GreptimeDB 中的主键大多像其他 TSDB 中的系列。

数据更新的性能与插入相同，但是更新太多可能会损害查询性能。

## GreptimeDB 是否支持数据删除？

支持。GreptimeDB 可以有效地按主键删除数据，但也可能在其数量过多时损害查询性能。

使用其他查询方式删除数据并不十分有效，因为需要两个步骤：查询数据，然后按主键删除数据。

## 能否为不同的表或测量值设置 TTL 或保留策略？

当然，用户可以在创建每个表时为其设置 TTL：

```sql
CREATE TABLE IF NOT EXISTS temperatures(
  ts TIMESTAMP TIME INDEX,
  temperature DOUBLE DEFAULT 10,
) engine=mito with(ttl='7d', regions=10);
```

温度的 TTL 被设置为 7 天。如果用户想设置所有表格的全局 TTL，可以在配置文件中进行配置：

```toml
[storage]
global_ttl = "7d"
```

可以参考表创建语句的 TTL 选项。

## GreptimeDB 的压缩率是多少？

这取决于不同情况。GreptimeDB 使用列式存储布局，并通过一流的算法压缩时序数据。而且它将根据列数据的统计和分布选择最合适的压缩算法。GreptimeDB 提供卷积，可以更紧凑地压缩数据，但会一定程度上降低精度。

因此，GreptimeDB 的数据压缩率可能在 2 到 60 倍之间，这取决于用户的数据的特点以及是否能接受精度损失。

## GreptimeDB 如何解决高 cardinality 的问题？

GreptimeDB 通过以下方式解决了这个问题：

- **Sharding**：它将数据和索引分布在不同的区域服务器之间。像了解更多可以阅读 GreptimeDB 的[架构](./architecture.md)文档。
- **Smart Indexing**：它不强制为每个标签创建倒置索引，而是根据标签列的统计数据和查询工作量来选择合适的索引类型。在这篇[博客](https://greptime.com/blogs/2022-12-21-storage-engine-design#smart-indexing)中有更详细的介绍。
- **MPP**：当查询引擎没有找到或选择索引时，它将使用矢量化执行查询引擎来执行并行和分布式查询。

## GreptimeDB 是否支持连续聚合或下采样？

暂不支持，我们将在未来支持这些功能。

## 可以将数据存储到云的对象存储中吗？

可以，GreptimeDB 的数据访问层是基于 [OpenDAL](https://github.com/apache/incubator-opendal) 的，它支持大多数种类的对象存储服务。数据可以存储在性价比高的云存储服务中，如 AWS S3 或 Azure Blob Storage，请参考[存储选项](../operations/configuration.md#storage-options)。

GreptimeDB 还提供了一个全托管的云服务 [GreptimeCloud](https://greptime.com/product/cloud) 来帮助用户管理云的数据。
