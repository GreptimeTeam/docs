---
keywords: [常见问题]
description: 关于 GreptimeDB 的常见问题解答。
---

# 常见问题

### GreptimeDB 的性能与其他解决方案相比如何？

GreptimeDB 已发布 v0.11 版本，其相关功能将在后续版本中持续改进优化。详细的 TSBS 性能测试结果可以[参考这里](https://github.com/GreptimeTeam/greptimedb/tree/main/docs/benchmarks/tsbs)。

### GreptimeDB 与 Loki 相比有什么区别？是否提供 Rust 绑定的库，能否支持 Traces 和 Logs？

GreptimeDB 现在仅支持日志（Log）数据类型，在 v0.10 版本中引入了对多个行业协议的兼容性。这些协议包括 Loki Remote Write、Vector 插件，以及全范围的 OTLP 数据类型（指标、追踪、日志）。

我们计划进一步优化日志引擎，着重提升查询性能和用户体验。未来的增强功能将包括（但不限于）扩展 GreptimeDB 日志查询 DSL 的功能，并实现与部分 Elasticsearch/Loki API 的兼容，为用户提供更高效、灵活的日志查询能力。

关于如何使用 GreptimeDB 处理日志的更多信息，您可以参考以下文档：
- [日志概述](https://docs.greptime.cn/user-guide/logs/overview)
- [OpenTelemetry 兼容性](https://docs.greptime.com/user-guide/ingest-data/for-observability/opentelemetry)
- [Loki 协议兼容性](/user-guide/ingest-data/for-observability/loki.md)
- [Vector 兼容性](https://docs.greptime.com/user-guide/ingest-data/for-observability/vector)

### 时序数据库的常见应用场景有哪些？

时序数据库的常见应用场景包括但不限于以下四种：
- 监控应用程序和基础设施；
- 存储和访问物联网数据；
- 处理自动驾驶汽车数据；
- 分析金融趋势。

### GreptimeDB 是否有 Go 驱动？

用户可以查看 [Go SDK](https://github.com/GreptimeTeam/greptimedb-ingester-go) 的具体信息。

### GreptimeDB 什么时候发布 GA（正式发布）版本？

我们预计在今年六月发布 GA 版本，具体计划参考：[GreptimeDB 2025 Roadmap 发布！](https://greptime.cn/blogs/2025-01-24-greptimedb-roadmap2025)

### GreptimeDB 是否有官方的 UI 界面用于查看集群状态、表列表和统计信息等？

是的，我们已经开源了 Dashboard 供用户查询和观测数据。

访问 [GitHub 仓库](https://github.com/GreptimeTeam/dashboard)查看详细信息。

### 在可观测领域，GreptimeDB 可以作为 Rust 版本的 Prometheus 替代品使用吗？

GreptimeDB 已原生支持 PromQL 且兼容性超 90%，可以满足大部分常见的使用需求。我们正在持续改进其功能，以使其与 VictoriaMetrics 相媲美。

### GreptimeDB 是否与 Grafana 兼容？

是的，GreptimeDB 与 Grafana 完全兼容。GreptimeDB 提供了官方的 Grafana 插件：[greptimedb-grafana-datasource](https://github.com/GreptimeTeam/greptimedb-grafana-datasource/)。

此外，GreptimeDB 还支持 MySQL 和 PostgreSQL 协议，因此用户可以使用 [MySQL 或 PG 的 Grafana 插件](https://grafana.com/docs/grafana/latest/datasources/mysql/)，将 GreptimeDB 配置为数据源，然后使用 SQL 查询数据。

我们还原生实现了 PromQL，能够配合 Grafana 一起使用。

### GreptimeDB 用于非时序数据库表时的性能如何？

GreptimeDB 支持 SQL 查询，也能够处理非时序数据，尤其在高并发和高吞吐量的数据写入场景下表现出色。然而，GreptimeDB 是针对特定领域（时序数据场景）开发的，它不支持事务，也无法高效地删除数据。

### GreptimeDB 是否有数据保留策略（Retention Policy）？

GreptimeDB 支持数据库级别和表级别的 TTL（Time To Live，存活时间）。默认情况下，表会继承其所属数据库的 TTL 设置；但是，如果表被赋予了特定的 TTL，则表级 TTL 会优先生效。

有关 TTL 的详细信息，请参考官方文档中的 [TTL 语法说明](https://docs.greptime.com/reference/sql/create)。

### “Greptime”这个名字来源于哪里？
“Greptime”由两个部分组成：`grep` 是 `*nix` 系统中最常用的命令行工具，用于搜索数据；而 time 则代表时序数据。因此，Greptime 寓意着帮助每个人在时序数据中查找/搜索有价值的信息。

### GreptimeDB 是否支持 Schemaless？

是的，GreptimeDB 是一个 Schemaless 的数据库，无需事先创建表。在使用 gRPC、InfluxDB Line Protocol、OpenTSDB 和 Prometheus Remote Write 协议写入数据时，会自动创建表和列。

### GreptimeDB 是否支持将表级数据导出到 S3？

是的，用户可以使用 `COPY TO` 命令将表级数据导出到 S3。

### Nightingale 是否可以直接与 GreptimeDB 集成？其兼容性如何？

目前，GreptimeDB 的兼容性工作主要集中在原生 PromQL 的实现上。未来，我们将继续增强与 MetricQL 扩展语法的兼容性。

### GreptimeDB 是否适用于大规模内部指标收集系统（类似于 Facebook 的 Gorilla 或 Google 的 Monarch）？对于偏好内存数据存储和高可用性场景，有无异步 WAL 或可选磁盘存储的计划？数据复制在无 WAL 的情况下如何处理？

GreptimeDB 支持异步 WAL（Write Ahead Log，预写日志），正在开发基于每张表的 WAL 开关功能，以便更灵活地控制日志写入。同时，GreptimeDB 正在构建分层存储机制，其中以内存缓存为起点的存储策略已在开发中。

在数据复制方面，写入到远程存储（如 S3）的数据会独立于 WAL 进行复制。有关分层存储的详细信息，可以参考 [Issue#2516](https://github.com/GreptimeTeam/greptimedb/issues/2516)。此外，基于 Apache Kafka 的远程 WAL 实现确保了集群模式下未刷盘数据的持久性。

### 如果想删除数据库，可以使用 `DROP DATABASE` 这个命令来实现吗？

是的，从 0.8 版本开始，`DROP DATABASE` 命令已经实现。您可以参考[官方文档了解具体用法](https://docs.greptime.com/reference/sql/drop#drop)。

### GreptimeDB 和其他基于 DataFusion 的时序数据库（如 InfluxDB）有什么主要区别？

GreptimeDB 与 InfluxDB 在一些技术上有相似之处，例如都使用了 DataFusion、Arrow、Parquet 并基于对象存储。但在以下几个方面有所不同：

- 开源策略：
    InfluxDB 只开放其单机版本，而 GreptimeDB 完全开源，包括其分布式集群版本；
    GreptimeDB 的架构可以运行在边缘设备（如 Android 系统）上。

- 分布式架构：
    我们的架构更接近 HBase 的 Region/RegionServer 设计；
    预写日志（WAL）基于 Kafka，同时也在探索基于 quorum 的实现方案。
    
- 混合负载与服务支持：
    GreptimeDB 聚焦于时序数据与分析型负载的结合，以提升资源效率和实时性能；
    提供商业化云服务 GreptimeCloud，方便用户快速上手。

- 存储引擎设计：
    可插拔存储引擎适配多种场景，特别是 Prometheus 的小表场景，GreptimeDB 提供专门的 Metrics 存储引擎。

- 查询语言支持：
    支持 PromQL（用于监控）、SQL（用于分析）以及 Python（用于复杂数据处理）；
    相比之下，InfluxDB 使用 InfluxQL 和 SQL。

GreptimeDB 是一个快速发展的开源项目，欢迎社区的反馈和贡献！了解更多细节可以访问我们的 [Blog](https://greptime.com/blogs/) 和 [Contributor Guide](https://docs.greptime.com/contributor-guide/overview/).

### 作为新手，我应该如何开始为 GreptimeDB 贡献代码？？

欢迎参与 GreptimeDB 的贡献！新手请阅读[贡献指南](https://github.com/GreptimeTeam/greptimedb/blob/main/CONTRIBUTING.md)。

除此之外，我们还挑选了一些[适合新手贡献的 PR（good first issues）](https://github.com/GreptimeTeam/greptimedb/issues?q=is%3Aopen+is%3Aissue+label%3A%22Good+first+issue%22)供您参考。

### GreptimeDB 是否支持类似于 InfluxDB 的非负微分方法（处理可重置的绝对计数器）？

是的，GreptimeDB 具有与 Prometheus 类似的功能，可有效处理计数器重置问题。例如，`reset()`、`rate()` 或 `delta()` 等函数可以自动检测和调整计数器重置。

但是以下几点需要注意：
- 不建议对计数器使用 `deriv()` 函数（此函数适用于 gauge 类型），可以先对计数器应用 `rate()`，然后使用 `deriv()`。
在计数器操作方面 PromQL 更适合，因为它源于 Prometheus 的生态；
- 我们也在探索将 PromQL 函数集成到 SQL 中，为用户提供更大的灵活性。如果您对这方面有兴趣，可参考我们的[文档](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/how-to/how-to-write-aggregate-function.md)。

### GreptimeDB 开源版本与云版本有哪些功能差异？

以下是主要区别：
- 基础功能：
   - 两个版本在基础功能上几乎相同，包括数据写入协议、SQL 能力和存储功能；
   - GreptimeCloud 提供了一些高级 SQL 功能和额外特性。

- 托管服务：
    - GreptimeCloud 支持多租户、数据加密和安全审计，以满足合规需求，这些功能在开源版本中不可用。

- 增强型控制台：
    - 云版本的仪表盘更加友好，独有的 Prometheus 工作台支持在线编辑 Prometheus 仪表盘和告警规则，支持 GitOps 集成。

如上所述，云版本提供了更多即用型功能，可帮助用户快速上手。

### 哪里可以找到有关本地部署和性能基准测试报告的相关文档？

用户可以查看我们的 [TSBS 基准测试结果](https://github.com/GreptimeTeam/greptimedb/tree/main/docs/benchmarks/tsbs)并查看相关的[部署文档](https://docs.greptime.com/getting-started/installation/overview)。

### 在 datanode 重启后，某些节点的 region 状态变为 `DOWNGRADED` 且表变为只读，该如何处理？是否可以自动重新激活？

根据用户的配置，metasrv 中的故障转移功能已禁用，这可能导致 region 被标记为 `DOWNGRADED`。此外，region 迁移过程也可能标记 region 为 `DOWNGRADED`。建议尝试运行 region 迁移程序，完成后请反馈具体情况以获得进一步帮助。

### 是否有将 GreptimeDB 编译为仅包含必要模块和功能的嵌入式独立二进制文件的参考指南？

我们提供适用于 Android ARM64 平台的预构建二进制文件，这些文件已在部分企业项目中成功应用。然而，这些二进制文件暂不支持裸机设备，因为 GreptimeDB 的一些核心组件依赖标准库。

### 是否有内置 SQL 命令（例如 compaction table t1）可用于手动进行数据压缩？

请参考[该文档](https://docs.greptime.com/reference/sql/admin)。

### GreptimeDB 是否可以用于存储日志？

可以，详细信息请参考[这里](https://docs.greptime.cn/user-guide/logs/overview)。

### 非主键字段的查询性能如何？是否可以设置倒排索引？与 Elasticsearch 相比，存储成本是否更低？

目前，非主键字段（或非标签字段）默认不支持倒排索引，也尚未提供 `CREATE INDEX` 语法。倒排索引功能将于后续版本中发布，并会加入全文索引支持。在没有索引的情况下，查询依赖于 MPP 的全表扫描。尽管有一定的并行处理能力，但其效率可能不够理想。

GreptimeDB 的存储成本更低。用户可以直接使用容器和对象存储，无需依赖磁盘，同时使用小型本地磁盘进行缓存和缓冲以提升性能。GreptimeDB 采用分层存储架构，更多详情请参阅我们的[架构](https://docs.greptime.com/user-guide/concepts/architecture)与[存储位置文档](https://docs.greptime.com/user-guide/concepts/storage-location)。

### Log-Structured Merge-Tree（LSM）引擎是否与 Kafka 的引擎模型类似？

从技术存储角度来看，它们确实有相似之处。然而，实际的数据格式有所不同：

GreptimeDB 采用 Parquet 格式进行读写；Kafka 使用其专有的 RecordBatch 格式。若需要对暂时存储在 Kafka 中的时序数据进行分析，必须先将数据写入 GreptimeDB。

此外，您可以用 EMQX（同样是消息队列）替代 Kafka。请参考 [EMQX 与 GreptimeDB 数据集成示例](https://github.com/GreptimeTeam/docs/pull/895)。将 Kafka 数据写入 GreptimeDB 的过程也非常相似。

如上所述，分析数据前需先将其写入 GreptimeDB，可通过提供的协议消费 Kafka 消息并将其写入 GreptimeDB。如果用户需要直接在 Kafka 中分析数据，可以考虑使用 [KSQL 项目](https://github.com/confluentinc/ksql)。不过，我们过去尝试 KSQL 时遇到了一些问题，如有疑问欢迎与我们联系。

我们也正在开发一个 Kafka 消费者组件，该组件将自动完成消费和写入的流程。

### 在 GreptimeDB 中，表和列的数量是否有限制？列数较多是否会影响读写性能？

通常情况下并没有严格的限制。在几百个表的场景下，主键列数量不多时对写入性能的影响是可以忽略的（性能以每秒写入点数而非行数衡量）。

同样，对于读取性能来说，如果查询只涉及部分列，内存和计算的开销也不会显著增加。

### 表是否可以基于时间戳动态按天分区？还是因为时间戳字段已经有索引而不需要这样做？

GreptimeDB 的数据是按时间戳顺序分布的，因此不需要额外按时间戳分片或分区。建议使用主键进行分片。

### 通常需要多少台服务器来搭建一个可靠的 GreptimeDB 集群？Frontend、Datanode 和 Metasrv 应如何部署？是否所有节点都需要运行这三个服务？

搭建 GreptimeDB 集群至少需要 3 台节点，每台节点运行 Metasrv、Frontend 和 Datanode 三个服务。然而，具体的节点数量取决于需要处理的数据规模。

并不需要在每个节点上同时部署所有服务。对于小型集群，可以单独使用 3 台节点运行 Metasrv，而 Frontend 和 Datanode 可以部署在其他等量节点上，每个容器运行两个进程。

更多部署建议请参考[容量规划文档](https://docs.greptime.com/user-guide/administration/capacity-plan)。

### 最新版本的 Flow Engine（预计算功能）是否支持 PromQL 语法进行计算？

目前 Flow Engine 暂不支持 PromQL 语法计算。我们会对该需求进行评估，从理论上看似乎是可行的。

### Metasrv 是否会支持 MySQL 或 PostgreSQL 作为存储后端？

最新版本的 GreptimeDB 已支持 PostgreSQL 作为 Metasrv 的存储后端。具体信息请参考[这里](https://docs.greptime.com/user-guide/deployments/configuration#metasrv-only-configuration)。

### 如何最佳地对成千上万台计算机中多个网卡的接口流量速率（每 30 秒取最大值）进行降采样，以便长期保存（如多年的数据）？

使用流表（Flow Table）是完成此任务的最佳工具。一个简单的流任务即可满足需求。流任务的输出会存储到普通表中，支持长期保存。

### GreptimeDB 是否支持动态的按天分区？

是的。时间序列数据的分区功能是默认开启的，无需额外配置。

### GreptimeDB 中对 DataFusion 的哪些部分进行了定制？

GreptimeDB 针对 DataFusion 的以下部分进行了定制：
- 支持 PromQL 查询
- 执行分布式查询
- 自定义 UDF（用户自定义函数）和 UDAF（用户自定义聚合函数）。

### 开源版本的 GreptimeDB 是否支持细粒度的访问控制？

开源版仅支持基础的用户名密码认证。企业版提供了细粒度的访问控制功能，例如 RBAC（基于角色的访问控制）。

### 以日期时间格式写入 `TIMESTAMP` 值会影响查询性能吗？

不会。以日期时间格式（如 yyyy-MM-dd HH:mm:ss）写入并不会影响查询性能。底层存储格式保持一致。

### 评估数据压缩时，是否只需考虑数据目录的大小，还是包括 WAL 目录的大小？

只需考虑数据目录的大小即可，WAL 目录会循环重用，因此不纳入数据压缩指标。

### 在集群模式下，如果创建表时未使用 `PARTITION`，数据是否会自动均衡到各个 Datanode 上？

当前版本中，未使用 `PARTITION` 的情况下，数据不会自动均衡到各 Datanode。实现区域分裂和自动均衡的功能计划在 v1.2 或 v1.3 版本中推出。