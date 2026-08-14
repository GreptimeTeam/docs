---
keywords: [特性, metrics, logs, traces, 更新, 删除, TTL, 压缩, 高基数, Flow, 对象存储, 灾备, 地理计算, JSON]
description: 回答 GreptimeDB 数据语义、存储、性能、灾备、地理计算和 JSON 支持等常见技术问题。
---

# 常见问题

## GreptimeDB 如何处理 metrics、logs 和 traces？

GreptimeDB 用同一个列式引擎处理 metrics、logs 和 traces，并采用共同的 Tag、Timestamp、Field 列语义。三类信号可以使用不同的物理表、schema、索引、TTL 和写入方式。

所有信号都可以使用 SQL 查询，metrics 还可以使用 PromQL，traces 还提供单独的 Jaeger 兼容查询接口。Flow 可以持续计算源表数据，并把聚合结果物化到 sink table。详见[数据模型](./data-model.md)、[日志](/user-guide/logs/overview.md)和 [traces](/user-guide/traces/overview.md)。

## 支持更新数据吗？

部分支持。对于开启去重的表，写入主键和时间索引相同的数据时，Field 会按表的 `merge_mode` 合并。主键和时间索引用来标识数据行，不能原地修改。

通过 SQL 建表时，默认的 `last_row` 保留最后一行；`last_non_null` 分别保留每个 Field 最后写入的非空值。自动建表可能采用写入协议自己的默认配置。去重只在同一个 Region 内生效。GreptimeDB 允许使用表中的任意列分区，但对于去重表，建议从主键中选择分区列，让主键相同的数据始终落入同一个 Region，从而正确完成去重和合并。详见[表分片](/user-guide/deployments-administration/manage-data/table-sharding.md#分区)。

Append-only 表关闭去重，同一主键和时间戳的写入会新增数据行，不会形成更新。详见[更新数据](/user-guide/manage-data/overview.md#更新数据)和 [`merge_mode`](/reference/sql/create.md#创建带有-merge-模式的表)。

## 支持删除数据吗？

支持，但表本身需要允许删除。可以用 SQL 删除匹配的数据、清空表，或通过 TTL 自动过期。Append-only 表不支持按行删除。详见[删除数据](/user-guide/manage-data/overview.md#删除数据)。

## 可以按表设置 TTL 或保留策略吗？

可以。TTL 可以设置在 database 或 table 层级，table 自己的设置优先。详见[使用 TTL 策略保留数据](/user-guide/manage-data/overview.md#使用-ttl-策略保留数据)。

## 压缩率是多少？

没有适用于所有数据的固定压缩率。结果取决于表结构宽度、数值分布、主键基数、重复度、SST 格式、索引和具体负载。索引可以加快过滤，但也会增加存储和写入开销。应使用实际数据和留存设置测量，而不是套用一个通用倍数。

一份公开的 Edge benchmark 提供了有明确条件的量级参考：在 Qualcomm SA8155P 上写入 1000 万行 TSBS 数据后，GreptimeDB Edge 占用 87 MB，SQLite 占用 1,686 MB。这个结果只适用于当时测试的 Edge 版本、schema 和配置，不是 GreptimeDB 部署的通用压缩率。详见 [GreptimeDB Edge 与 SQLite 对比报告](https://greptime.cn/blogs/2024-08-30-sqlite)。

表结构和索引的取舍参见[表设计指南](/user-guide/deployments-administration/performance-tuning/design-table.md)和[索引](/user-guide/manage-data/data-index.md)。

## 如何解决高基数问题？

高基数始终有成本：不同主键值越多，metadata、索引、内存和查询的开销都可能增加。GreptimeDB 提供以下控制手段：

- `flat` SST 格式减少按序列维护的开销，是新表的默认格式，适合高基数主键。[Flat Format 工程文章](https://greptime.cn/blogs/2025-12-22-flat-format)介绍了 memtable 和 merge path 的设计，并给出了 benchmark 条件。
- 可以按查询选择性和存储成本配置倒排索引、全文索引或 skipping index，通常不需要为每一列建索引。
- 不需要更新和删除的不可变记录可以使用 append-only 表，省去去重计算。
- 集群可以通过表分区把 Region 分布到不同 Datanode，但分区方式和负载分布仍需要合理设计。
- 只有确实用于分组、去重或过滤的标识，才适合放进主键。

不存在对所有 schema 和部署都成立的统一基数上限。评估时要同时测试预期序列数、写入速率、查询条件和留存周期。详见 [`sst_format`](/reference/sql/create.md#创建指定-sst-格式的表)、[索引](/user-guide/manage-data/data-index.md)和[表设计指南](/user-guide/deployments-administration/performance-tuning/design-table.md)。

## 支持持续聚合或降采样吗？

支持。[Flow](/user-guide/flow-computation/overview.md)会在新数据行写入源表时持续计算，并把结果物化到 sink table。它可以用于固定窗口聚合和降采样，源数据则按自己的 TTL 保留。

## 可以把数据存到云上的对象存储吗？

可以。持久化数据文件可以存入 Amazon S3、Google Cloud Storage、Azure Blob Storage、阿里云 OSS 和支持的 S3 兼容服务。对象存储与 WAL、metadata、本地 cache 的职责不同，需要分别考虑持久性和恢复。详见[存储位置](./storage-location.md)和[存储选项](/user-guide/deployments-administration/configuration.md#storage-options)。

## 性能对比其他方案怎么样？

性能取决于具体负载、表结构、索引、留存周期、硬件、对象存储、cache、并发和查询形态。阅读 benchmark 时要同时检查测试条件，并用自己的预期负载验证。

已发布的报告包括：

- [GreptimeDB vs. InfluxDB](https://greptime.cn/blogs/2024-08-08-report)
- [GreptimeDB vs. TimescaleDB](https://greptime.cn/blogs/2025-12-09-greptimedb-vs-timescaledb-benchmark)
- [GreptimeDB vs. Grafana Mimir](https://greptime.cn/blogs/2024-08-01-grafana)
- [JSONBench：10 亿 JSON 文档](https://greptime.cn/blogs/2025-03-18-json-benchmark-greptimedb) — 记录第三方 benchmark 结果和复现方法
- [日志负载：GreptimeDB、ClickHouse 和 Elasticsearch](https://greptime.cn/blogs/2025-03-07-greptimedb-log-benchmark)
- [GreptimeDB vs. Loki](https://greptime.cn/blogs/2025-08-07-beyond-loki-greptimedb-log-scenario-performance-report.html)
- [Qualcomm SA8155P 上的 GreptimeDB Edge vs. SQLite](https://greptime.cn/blogs/2024-08-30-sqlite)

## 有灾难恢复方案吗？

GreptimeDB 提供构建恢复方案所需的组件，但仅使用对象存储并不等于具备完整灾备能力。持久化数据文件、WAL、Metasrv metadata、Region 放置与 failover、部署配置都会影响 RPO 和 RTO。

集群 failover 还依赖正确配置的拓扑和健康的替代 Datanode。对象存储策略之外，还要备份并验证 metadata 和 WAL 的恢复。详见[灾备](/user-guide/deployments-administration/disaster-recovery/overview.md)、[WAL 概述](/user-guide/deployments-administration/wal/overview.md)和[存储位置](./storage-location.md)。

<AnchorAlias id="支持地理空间索引吗" />

## 支持地理空间计算吗？

支持。GreptimeDB 提供处理 WKT、Geohash、H3、S2、空间关系、距离和面积的 SQL 函数。这些函数不会创建或隐含数据库级空间索引。详见[地理函数](/reference/sql/functions/geo.md)。

## 支持 JSON 数据吗？

GreptimeDB 提供两种 JSON 列类型：

- 实验性的 [`JSON`](/reference/sql/data-types.md#json-type-experimental) 类型用于存储通用 JSON 值，可以使用 [JSON 函数](/reference/sql/functions/json.md)读取和处理。
- [`JSON2`](/user-guide/logs/json2.md) 从 v1.2 开始提供，目前处于 Beta 阶段。它面向 logs 和其他半结构化数据，以结构化列式形式保存子路径，支持点号路径、`json_get` 和可选的 type hint。目前 JSON2 只能用于 append-only 表。

两种类型目前都不能为 JSON 子路径配置索引。如果某些稳定属性需要频繁过滤，并需要倒排索引、全文索引或 skipping index，应把它们存入有明确类型的普通列。详见[索引](/user-guide/manage-data/data-index.md)。

## 更多问题？

部署、迁移、运维和 schema 等问题参见完整的[常见问题](/faq-and-others/faq.md)。
