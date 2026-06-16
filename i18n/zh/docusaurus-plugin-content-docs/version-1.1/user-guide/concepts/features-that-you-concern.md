---
keywords: [特性, 日志, 事件, 链路追踪, 更新, 删除, TTL 策略, 压缩率, 高基数, 持续聚合, 云存储, 性能, 灾难恢复, 地理空间索引, JSON 支持]
description: 关于 GreptimeDB 特性的常见问题，包括如何处理 metrics、logs 和 traces，更新、删除、TTL、压缩、高基数、持续聚合、云存储、性能、灾难恢复等。
---

# 常见问题

## GreptimeDB 如何处理 metrics、logs 和 traces？

GreptimeDB 将所有可观测数据——metrics、logs、traces——作为带上下文的时间戳事件，统一存储在列式引擎中。用 SQL 查所有信号类型，用 PromQL 查 metrics，用 Flow 做持续聚合。

详见[日志用户指南](/user-guide/logs/overview.md)和[链路追踪用户指南](/user-guide/traces/overview.md)。

## 支持更新数据吗？

支持，参见[更新数据](/user-guide/manage-data/overview.md#更新数据)。

## 支持删除数据吗？

支持，参见[删除数据](/user-guide/ingest-data/overview.md#删除数据)。

## 可以按表设置 TTL 或保留策略吗？

可以，参见[使用 TTL 策略保留数据](/user-guide/manage-data/overview.md#使用-ttl-策略保留数据)。

## 压缩率是多少？

取决于数据特征。

GreptimeDB 用列式存储，根据列数据的统计分布自动选择最优压缩算法。未来还会提供 Rollup 功能，以损失精度为代价进一步压缩。

实际压缩率在 2 倍到数百倍之间，取决于数据特征和是否接受精度损失。

## 如何解决高基数问题？

GreptimeDB 通过多层手段解决高基数挑战：

**架构层面：**
- **分片**：数据和索引分布在多个 Region Server 上，单节点不会成为瓶颈。详见 [架构](./architecture.md)。

**存储层面：**
- **Flat Format（针对极端高基数）**：当 tag 是请求 ID、trace ID、用户 token 这类百万级唯一值时，传统时序数据库为每个序列分配独立 buffer，序列数一多就内存膨胀、性能下降。GreptimeDB 1.0+ 的 Flat Format 引入了 BulkMemtable 和多序列合并路径，消除 per-series 开销，高基数场景下**写入吞吐量提升 4 倍，查询快 10 倍**。详见 [Flat Format 详解](https://greptime.cn/blogs/2025-12-22-flat-format)。

**索引层面：**
- **灵活索引**：支持按需手工创建索引。可以为 tag 列和 field 列创建多种索引类型（倒排、全文、跳数），而不是自动为每列建索引。按需创建索引既能优化查询性能，又能降低索引开销。详见[索引文档](/user-guide/manage-data/data-index.md)。

**查询层面：**
- **MPP（大规模并行处理）**：查询引擎用向量化执行和分布式并行处理，高效处理高基数查询。

**结果：** GreptimeDB 不会遇到 Prometheus 那样的基数上限——在 Prometheus 中，高基数 label 会导致内存耗尽和查询超时。GreptimeDB 可以处理百万级序列，不需要架构层面的妥协。

## 支持持续聚合或降采样吗？

支持。GreptimeDB 从 0.8 版本开始提供 Flow 功能，用于持续聚合和降采样等场景。详见[用户指南](/user-guide/flow-computation/overview.md)。

## 可以把数据存到云上的对象存储吗？

可以。GreptimeDB 的数据访问层基于 [OpenDAL](https://github.com/apache/incubator-opendal)，支持主流对象存储服务。数据可以存到 AWS S3、Azure Blob Storage 等，参见[存储配置](/user-guide/deployments-administration/configuration.md#存储选项)。

## 性能对比其他方案怎么样？

[GreptimeDB 在 ClickHouse JSONBench 10 亿条冷查询中拿下第一！](https://greptime.cn/blogs/2025-03-18-json-benchmark-greptimedb)

性能测试报告：

* [GreptimeDB vs. InfluxDB](https://greptime.cn/blogs/2024-08-08-report)
* [GreptimeDB vs. TimescaleDB](https://greptime.cn/blogs/2025-12-09-greptimedb-vs-timescaledb-benchmark)
* [GreptimeDB vs. Grafana Mimir](https://greptime.cn/blogs/2024-08-01-grafana)
* [GreptimeDB vs. ClickHouse vs. Elasticsearch](https://greptime.cn/blogs/2025-03-07-greptimedb-log-benchmark)
* [GreptimeDB vs. SQLite](https://greptime.cn/blogs/2024-08-30-sqlite)

## 有灾难恢复方案吗？

有，参见[灾难恢复文档](/user-guide/deployments-administration/disaster-recovery/overview.md)。

## 支持地理空间索引吗？

支持，提供 Geohash、H3 和 S2 的[内置函数](/reference/sql/functions/geo.md)。

## 支持 JSON 数据吗？

支持，参见 [JSON 函数](/reference/sql/functions/overview.md#json-functions)。

## 更多问题？

包括部署选项、迁移指南、性能对比、最佳实践等，请访问[常见问题页面](/faq-and-others/faq.md)。
