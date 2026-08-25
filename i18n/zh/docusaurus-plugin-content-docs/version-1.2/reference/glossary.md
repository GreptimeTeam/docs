---
keywords: [云原生, 可观测, 开源, 时序数据库, 车联网, 物联网, 日志, 指标, 事件, Rust]
description: 本文档解释 GreptimeDB 在可观测数据、存储、查询和运维中的常用术语。
---

# Glossary（术语表）

本文档解释 GreptimeDB 在可观测数据、存储、查询和运维中的常用术语。

> 注：该排名顺序按照英文词汇首字母正序排列。

---

## A

### Anomaly Detection (异常检测)
识别数据点、事件或观测值显著偏离常态的过程。在时序数据场景中，异常检测可辅助发现可能表征关键事件的非常规模式。

### Append Only Table (Append Only 表)
保留每次写入的数据行、不支持按行更新和删除的表类型。它不执行去重，常用于不可变的 logs 和事件数据。

---

## C

### Cardinality (基数)
衡量数据库元素唯一性的指标，如数据列中唯一值的数量。高基数场景（尤其在时序数据中）将显著提升存储复杂度与资源需求。

### Cloud-Native Design (云原生架构)
利用云基础设施和服务完成部署、扩容和恢复的架构方式。GreptimeDB 可以在边缘以 Standalone 运行，也可以部署为分布式集群。

### Columnar Storage (列式存储)
按列而非按行组织数据的存储方式。查询可以只读取需要的列，类型和分布相近的值也可以放在一起压缩。

---

## D

### Datanode (数据节点)
GreptimeDB 分布式架构中负责数据存储和处理的核心组件。Datanode 处理数据摄入、存储管理、本地数据查询执行，并维护包含实际表数据的 region。可在集群中部署多个 datanode 以提供水平可扩展性、容错能力和分布式数据处理能力。

### Decoupled Compute and Storage Architecture (存算分离架构)
分别管理计算资源和持久化数据存储的架构。在使用共享对象存储的 GreptimeDB 分布式部署中，增减 Datanode 不需要在节点间搬迁所有持久化数据文件。

---

## E

### Edge Database (边缘数据库)
部署在网络边缘侧（临近数据源或终端用户）的数据库系统，通过降低数据传输延迟实现实时数据处理。

### Edge Deployment (边缘部署)
在接近数据源的位置运行系统，以减少网络延迟和带宽消耗。满足资源要求的边缘设备可以运行 GreptimeDB Standalone。

### Event Management (事件管理)
对 logs、alerts 和状态变化等事件进行采集、组织和分析的过程。

---

## F

### Field (字段)
用于保存测量值、日志内容、trace 属性和其他值的列语义。Field 列不参与主键。

### Flow Engine (Flow 引擎)
GreptimeDB 针对持续写入源表的数据行执行连续计算的引擎。计算结果会物化到 sink table。聚合和 TQL workload 使用 batching mode；原始的 streaming mode 已经废弃，不推荐新 workload 使用。

### Frontend (前端节点)
GreptimeDB 分布式架构中的查询处理层，作为客户端连接的入口点。Frontend 节点处理 SQL 解析、查询规划、分布式查询协调和结果聚合。它们将查询路由到适当的 datanode，管理客户端会话，并为各种数据库接口（包括 MySQL、PostgreSQL 和 GreptimeDB 原生协议）提供协议兼容性。

---

## G

### GreptimeCloud
GreptimeDB 的全托管数据库服务，提供托管的 GreptimeDB 实例，并负责部署、扩缩容、升级和监控。

---

## I

### IoT Cloud (物联网云平台)
专为物联网应用设计的云计算平台，提供海量设备数据存储、处理与连接管理能力。

### IoT Database (物联网数据库)
针对物联网传感器高频时序数据优化的数据库系统。GreptimeDB 可高效处理物联网设备产生的大规模时序数据，提供弹性扩展能力。

### IoT Observability (物联网可观测性)
通过指标、日志与事件数据对物联网设备及系统进行监控、分析与洞察的能力，确保物联网生态的可靠运行。

### Interoperability (协议互操作性)
系统通过兼容接口交换数据的能力。GreptimeDB 支持 SQL 接口，以及 InfluxDB、OpenTelemetry、Prometheus、Elasticsearch 和 Loki 的部分 API；每一层兼容接口都有各自的范围。

---

## J

### JSON2
[`JSON2`](/user-guide/logs/json2.md) 是面向 logs 和其他半结构化数据的 Beta 列类型。它以结构化列式形式保存 JSON 子路径，支持点号路径、`json_get` 和可选的 type hint。目前 JSON2 只能用于 append-only 表。

---

## L

### Log Aggregation (日志聚合)
对一组日志执行计算以生成单个摘要统计数据，以供分析和故障排除，例如 SUM，COUNT 等。

### Logical and Physical Tables (逻辑表与物理表)
Logical table 是用户创建和查询的表，physical table 是内部实际保存数据的表。Mito Engine 通常为 logical table 使用独立的物理存储；Metric Engine 可以把多张 logical metrics table 映射到共享的 physical table。共享 physical table 不会合并各张逻辑表的 schema 和查询接口。

### Log Management (日志管理)
涵盖日志采集、存储、分析与可视化的全生命周期管理方案，是保障系统性能与安全的重要基础。

### LSM-Tree (日志结构合并树)
GreptimeDB 存储引擎采用的数据结构，通过先将数据写入日志再定期合并为有序结构来优化写入性能。该设计特别适合高写入吞吐量的时序工作负载。

---

## M

### Memory Leak (内存泄漏)
程序未能正确释放闲置内存导致的软件缺陷，长期运行可能引发系统性能下降或崩溃。

### Metasrv (元数据服务)
GreptimeDB 分布式架构中的元数据管理服务，维护集群状态、表结构和 region 分布信息。Metasrv 协调集群操作，管理表的创建和修改，处理 region 分配和迁移，确保集群范围内的元数据一致性。它作为集群管理的中央控制平面，是所有元数据操作的权威数据源。

### Metric Engine (指标引擎)
GreptimeDB 中针对 metrics 数据设计的存储引擎，适用于可观测 workload 中常见的大量小表。Metric Engine 使用合成的宽 physical table 保存多张 logical table 的数据，以复用列和 metadata、降低存储开销并改善列式压缩。Metric Engine 基于 Mito Engine 构建。

### Mito Engine (Mito 引擎)
GreptimeDB 的默认存储引擎。Mito 采用 LSM-Tree 设计，包含 WAL、memtable、不可变 SST 文件和 compaction。它支持本地存储和对象存储，并可使用本地 cache 加速远端数据访问。

---

## O

### Observability (可观测性)
通过系统外部输出推断内部状态的能力。Metrics、logs、traces 和事件为监控与调试提供依据。

### OpenTelemetry
用于采集和导出 metrics、logs 与 traces 的开源框架，提供 API、SDK 和协议。GreptimeDB 通过 OTLP/HTTP 接收这些信号。

---

## P

### Pipeline (数据管道)
GreptimeDB 中用于实时处理传入数据的强大解析和转换机制。Pipeline 由可配置的处理器组成，用于预处理原始数据；分发器用于将数据路由到不同管道；以及转换规则用于数据类型转换和表结构定义。支持多种输入格式和数据源（包括日志、Prometheus 指标和其他可观测性数据），提供广泛的处理能力，包括时间戳解析、正则匹配、字段提取和数据类型转换，实现可观测性数据的结构化存储和高效查询。

### Primary Key (主键)
由一列或多列 Tag 组成，用于标识一组时间序列或记录。对于开启去重的表，主键与时间索引共同标识按 merge mode 合并的数据行。它不是通用关系数据库中的唯一约束：append-only 表可以不设置主键，也可以把主键和时间戳重复的写入保留为不同数据行。

### PromQL (Prometheus 查询语言)
专为 Prometheus 设计的时序数据查询语言。GreptimeDB 支持 PromQL 且兼容性接近 100%，支持用户执行复杂的时序数据分析操作并使用现有的 Prometheus 仪表盘和告警规则。

---

## R

### Read Replica (读副本)
GreptimeDB 企业版中的功能，通过创建额外的只读数据实例来提升查询性能和可扩展性。读副本将读取工作负载分布到多个实例上，减少主数据库的负载同时提供更快的查询响应。该功能支持数据访问点的地理分布，提升读取操作的高可用性，并在企业环境中实现读密集型工作负载的高效扩展。

### Region (区域)
GreptimeDB 架构中数据分布的基本单元。Region 包含表数据的子集，可分布在集群的不同节点上。每个 Region 管理自己的存储、索引和查询处理，实现水平扩展和容错能力。

### Repartition (重分区)
通过合并已有分区并按新规则拆分分区来调整建表后的分区边界的过程。重分区用于更好地匹配当前数据分布、缓解热点，并减少冷小分区。

### Rust
提供静态内存安全保证的系统编程语言。GreptimeDB 使用 Rust 实现。

---

## S

### Scalability (弹性扩展)
通过增加现有节点资源或增加节点来承载更多数据和 workload 的能力。扩容仍需要合理规划分区、cache、查询并发和负载分布。

### SQL
用于定义、管理和查询关系数据的标准语言。GreptimeDB 支持使用 SQL 查询 metrics、logs、traces 和事件数据。

### Stream Processing (流式处理)
对到达的数据流进行连续实时处理的技术。GreptimeDB 的 Flow Engine 通过 batching mode 提供持续聚合能力；其原始的 streaming mode 已经废弃，不推荐新 workload 使用。

---

## T

### Table Engine (表引擎)
决定表数据如何写入、组织、compaction 和读取的组件。Mito Engine 是用于一般时间索引表的引擎；Metric Engine 基于 Mito Engine，针对大量 logical metrics table 做优化。

### Table Sharding (表分片)
将一张大表拆分为多个更小分区的技术。在 GreptimeDB 中，表分片有助于将负载分散到多个 region 上，并提升热点表或大表的吞吐能力。

### Tag (标签)
GreptimeDB 数据模型中用于唯一标识时序数据的列类型。具有相同 Tag 值的行属于同一个时间序列，使 Tag 成为组织和查询可观测性数据的关键。Tag 通常用于存储元数据，如主机名、服务名或设备 ID，并在表架构中指定为 PRIMARY KEY 列。

### Time Index (时间索引)
GreptimeDB 表中的特殊时间戳列，作为时序数据的主要时间维度。每个 GreptimeDB 表都需要一个 Time Index 列来按时间顺序组织数据，实现基于时间的查询，支持高效的时序操作，如降采样和时间窗口聚合。

### Time Series Database (时序数据库)
专为时间戳索引数据设计的数据库类型。GreptimeDB 的可观测数据模型支持 metrics、logs、traces 和事件数据，时序 workload 是其中一类。

### Trigger (触发器)
GreptimeDB Enterprise 中按配置周期执行 SQL 规则的功能。条件匹配时，Trigger 通过 webhook 发送通知，并支持 Alertmanager 兼容的 labels 和 annotations。

---

## U

### Unified Analysis (统一分析)
使用共同查询工具分析多种信号的方式。GreptimeDB 支持用 SQL 查询 metrics、logs、traces 和事件表，并用 PromQL 查询 metrics。

### Unified Observability (统一可观测性)
一种通过共同的数据模型概念、存储基础和查询工具处理 metrics、logs、traces 与事件数据的数据库架构。GreptimeDB 对这些信号采用共同的 Tag、Timestamp、Field 语义，同时允许它们使用不同的表。宽事件是这套基础模型支持的一种可选做法。

---

## V

### Vector Processing (向量化处理)
批量处理一组值、而不是逐值处理的查询执行方式。GreptimeDB 查询引擎采用向量化执行，并可在支持的操作中使用 SIMD 指令。

### Vehicle Data Collection (车载数据采集)
对车辆传感器读数、GPS 定位信息等数据进行采集的标准化流程，是现代车联网生态的核心组成部分。

### Vehicle-Cloud Integrated TSDB (车云协同时序数据库)
专为车联网设计的时序数据库系统，支持车载终端与云端系统的协同工作，实现车联网数据的高效存储与实时分析。

---

## W

### WAL (预写日志)
GreptimeDB 用于确保数据持久性和一致性的日志机制。WAL 在数据变更应用到主存储之前记录所有变更，在系统故障时实现数据恢复。GreptimeDB 支持灵活的 WAL 选项，包括本地磁盘存储或 Kafka 等分布式服务。

### Wide Events (宽事件)
用较多字段描述一次操作或业务事件的结构化遥测记录。宽事件可以包含用户 ID、session ID、trace ID、业务属性和请求元数据等高基数值。它通常与 Observability 2.0 思路相关，但不替代原生 metrics、logs 或 traces。GreptimeDB 可以把宽事件作为时间戳数据，与这些信号一同存储。

---
