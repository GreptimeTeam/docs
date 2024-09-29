# 关键特性

## GreptimeDB 支持处理日志或事件吗？

是的，从 v0.9.0 版本开始，GreptimeDB 将所有时间序列视为具有时间戳的上下文事件，从而统一了指标、日志和事件的处理。它支持使用 SQL、PromQL 进行指标和事件分析，并支持通过持续聚合进行流式处理。

请阅读[日志处理使用指南](/user-guide/logs/overview.md)。

## GreptimeDB 支持更新数据吗？

支持，请参考[更新数据](/user-guide/manage-data/overview.md#更新数据)获取更多信息。

## GreptimeDB 支持删除数据吗？

支持，请参考[删除数据](/user-guide/ingest-data/overview.md#删除数据)获取更多信息。

## 我可以为不同的表或指标设置 TTL 或保留策略吗？

当然。请参考[使用 TTL 策略保留数据](/user-guide/manage-data/overview.md#使用-ttl-策略保留数据)。

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

从 0.8 版本开始，GreptimeDB 添加了一个名为 `Flow` 的新功能，用于持续聚合和降采样等场景。请阅读[用户指南](/user-guide/continuous-aggregation/overview.md)获取更多信息。

## 我可以在云的对象存储中存储数据吗？

可以，GreptimeDB 的数据访问层基于 [OpenDAL](https://github.com/apache/incubator-opendal)，它支持大多数类型的对象存储服务。
数据可以存储在如 AWS S3 或 Azure Blob Storage 等性价比高的云存储服务中，请参考这里的存储[配置指南](./../deployments/configuration.md#storage-options)。

GreptimeDB 还提供一个完全托管的云服务 [GreptimeCloud](https://greptime.cn/product/cloud) 来帮助您管理云中的数据。

## GreptimeDB 对比其他存储或时序数据库的性能如何？

请阅读以下性能报告：

* [GreptimeDB vs. InfluxDB](https://greptime.cn/blogs/2024-08-08-report)
* [GreptimeDB vs. Grafana Mimir](https://greptime.cn/blogs/2024-08-01-grafana)
* [GreptimeDB vs. ClickHouse vs. ElasticSearch](https://greptime.cn/blogs/2024-08-21-report)
* [GreptimeDB vs. SQLite](https://greptime.cn/blogs/2024-08-30-sqlite)

## GreptimeDB 有灾难恢复解决方案吗？

有的，请参阅[灾难恢复文档](/user-guide/administration/disaster-recovery/overview.md)。
