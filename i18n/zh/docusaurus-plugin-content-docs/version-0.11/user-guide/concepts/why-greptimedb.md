---
keywords: [时序数据库, 云原生, 分布式, 高性能, 用户友好, 存算分离, PromQL, SQL, Python]
description: 介绍 GreptimeDB 的特点、设计原则和优势，包括统一指标、日志和事件，云原生设计，高性能和用户友好等。
---

# 为什么选择 GreptimeDB

GreptimeDB 是一个云原生、分布式和开源的时序数据库，旨在处理、存储和分析大量的指标、日志和事件数据（计划中还包括 Trace）。
它在处理涉及时序和实时分析的混合处理工作负载方面非常高效，同时为开发者提供了极佳的体验。

可以阅读博客文章《[This Time, for Real](https://greptime.com/blogs/2022-11-15-this-time-for-real)》和《[Unifying Logs and Metrics](https://greptime.com/blogs/2024-06-25-logs-and-metrics)》了解我们开发 GreptimeDB 的动机。
在这些文章中，我们深入探讨了 Greptime 高性能背后的原因以及一些突出的功能。

## 统一的指标、日志和事件

通过[时序表](./data-model.md)的模型设计、对 SQL 的原生支持以及存算分离架构带来的混合工作负载，
GreptimeDB 可以同时处理指标、日志和事件，
增强不同时间序列数据之间的关联分析，
并简化架构、部署成本和 API。

阅读 [SQL 示例](/user-guide/overview.md#sql-query-example) 了解详细信息。

## 可用性、可扩展性和弹性

从第一天起，GreptimeDB 就按照云原生数据库的原则设计，这意味着它能够充分利用云的优势。其一些好处包括：

1. 高可用的按需计算资源，目标是实现 99.999% 的可用性和正常运行时间，即每年大约只有五分钟十五秒的停机时间。
2. 弹性和可扩展性，允许开发者根据使用情况轻松扩展或缩减、添加或移动资源。
3. 高可靠性和容错性以防止数据丢失。系统的目标是实现 99.9999% 的可用性率。

这些功能共同确保 GreptimeDB 始终提供最佳的性能。
下面是关于如何实现这些功能的额外技术解释。

### 可弹性扩展的资源隔离

![存储/计算分离，计算/计算分离](/storage-compute-disaggregation-compute-compute-separation.png)

存储和计算资源是分离的，允许每个资源独立扩展、消耗和定价。
这不仅大大提高了计算资源的利用率，还适配了“按需付费”的定价模式，避免了资源未充分利用的浪费。

除了存储和计算隔离，不同的计算资源也被隔离，避免了因数据写入、实时查询以及数据压缩或降采样等任务产生的资源竞争，
从而实现高效率的大规模实时分析。

数据可以在多个应用程序之间共享而无需争用同一资源池，
这不仅大大提高了效率，
还可以根据需求提供无限的可扩展性。

### 灵活的架构支持多种部署策略

![GreptimeDB 的架构](/architecture-2.png)

通过灵活的架构设计原则，不同的模块和组件可以通过模块化和分层设计独立切换、组合或分离。
例如，我们可以将 Frontend、Datanode 和 Metasrc 模块合并为一个独立的二进制文件，也可以为每个表独立启用或禁用 WAL。

灵活的架构允许 GreptimeDB 满足从边缘到云的各种场景中的部署和使用需求，同时仍然使用同一套 API 和控制面板。
通过良好抽象的分层和封装隔离，GreptimeDB 的部署形式支持从嵌入式、独立、传统集群到云原生的各种环境。

## 优异的成本效益

GreptimeDB 利用流行的对象存储解决方案来存储大量的时序数据，例如 AWS S3 和 Azure Blob Storage，允许开发者只为使用的存储资源付费。

GreptimeDB 使用自适应压缩算法，根据数据的类型和基数来减少数据量，以满足时间和空间复杂性约束。
例如，对于字符串数据类型，当块的基数超过某个阈值时，GreptimeDB 使用字典压缩；
对于浮点数，GreptimeDB 采用 Chimp 算法，该算法通过分析实际的时间序列数据集来增强 Gorilla（Facebook 的内存 TSDB）的算法，
并提供比传统算法（如 zstd、Snappy 等）更高的压缩率和空间效率。

## 高性能

在性能优化方面，GreptimeDB 利用 LSM 树、数据分片和基于 Quorum 的 WAL 设计等不同技术来处理大量的时序数据写入时的工作负载。

GreptimeDB 的查询引擎强大且快速，得益于矢量化执行和分布式并行处理，并结合了索引功能。
为了提升数据修剪和过滤效率，GreptimeDB 构建了智能索引和大规模并行处理（MPP）架构。
该架构使用独立的索引文件记录统计信息，类似于 Apache Parquet 的行组元数据，同时还使用了内置指标记录不同查询的工作负载。
通过结合基于成本的优化（CBO）和开发者定义的提示，GreptimeDB 能够启发式地构建智能索引，从而进一步提升查询性能。

## 易于使用

### 易于部署和维护

为了简化部署和维护过程，GreptimeDB 提供了 [K8s operator](https://github.com/GreptimeTeam/greptimedb-operator)、[命令行工具](https://github.com/GreptimeTeam/gtctl)、嵌入式[仪表盘](https://github.com/GreptimeTeam/dashboard)和其他有用的工具，
使得开发者可以轻松配置和管理数据库。
请访问我们官网的 [GreptimeCloud](https://greptime.com) 了解更多信息。

### 易于集成

GreptimeDB 支持多种数据库连接协议，包括 MySQL、PostgreSQL、InfluxDB、OpenTSDB、Prometheus Remote Storage 和高性能 gRPC。
此外，还提供了多种编程语言的 SDK，如 Java、Go、Erlang 等。
我们还在不断与生态系统中的其他开源软件进行集成和连接，以增强开发者体验。
接下来将详细介绍三种流行的语言：PromQL、SQL 和 Python。

PromQL 是一种流行的查询语言，
允许开发者选择和聚合由 Prometheus 提供的实时时序数据。
它比 SQL 更简单，适用于使用 Grafana 进行可视化和创建告警规则。
GreptimeDB 原生支持 PromQL，查询引擎会将其转换为查询计划，对其进行优化和执行。

SQL 是一种高效的工具，
用于分析跨越较长时间跨度或涉及多个表（如 join）的数据。
此外，它在数据库管理方面也非常方便。

Python 在数据科学家和 AI 专家中非常流行。
GreptimeDB 允许直接在数据库中运行 Python 脚本。
开发者可以编写 UDF 和 DataFrame API，通过嵌入 Python 解释器来加速数据处理。

### 简单的数据模型与自动创建表

结合指标（Tag/Field/Timestamp）模型和关系数据模型（Table），
GreptimeDB 提供了一种称为时序表的新数据模型（见下图），以表格形式呈现数据，由行和列组成，指标的 Tag 和 Value 映射到列，并强制时间索引约束表示时间戳。

![时序表](/time-series-table.png)

然而，我们对 schema 的定义不是强制性的，而是更倾向于 MongoDB 等数据库的无 schema 方法。
表将在数据写入时动态自动创建，并自动添加新出现的列（Tag 和 Field）。

---
keywords: [时序数据库, 云原生, 分布式, 高性能, 用户友好, 存算分离, PromQL, SQL, Python]
description: 介绍 GreptimeDB 的特点、设计原则和优势，包括统一指标、日志和事件，云原生设计，高性能和用户友好等。
---

# 为什么选择 GreptimeDB

GreptimeDB 是一个云原生、分布式和开源的时序数据库，旨在处理、存储和分析大量的指标、日志和事件数据（计划中还包括 Trace）。
它在处理涉及时序和实时分析的混合处理工作负载方面非常高效，同时为开发者提供了极佳的体验。

可以阅读博客文章《[This Time, for Real](https://greptime.com/blogs/2022-11-15-this-time-for-real)》和《[Unifying Logs and Metrics](https://greptime.com/blogs/2024-06-25-logs-and-metrics)》了解我们开发 GreptimeDB 的动机。
在这些文章中，我们深入探讨了 Greptime 高性能背后的原因以及一些突出的功能。

## 统一的指标、日志和事件

通过[时序表](./data-model.md)的模型设计、对 SQL 的原生支持以及存算分离架构带来的混合工作负载，
GreptimeDB 可以同时处理指标、日志和事件，
增强不同时间序列数据之间的关联分析，
并简化架构、部署成本和 API。

阅读 [SQL 示例](/user-guide/overview.md#sql-query-example) 了解详细信息。

## 可用性、可扩展性和弹性

从第一天起，GreptimeDB 就按照云原生数据库的原则设计，这意味着它能够充分利用云的优势。其一些好处包括：

1. 高可用的按需计算资源，目标是实现 99.999% 的可用性和正常运行时间，即每年大约只有五分钟十五秒的停机时间。
2. 弹性和可扩展性，允许开发者根据使用情况轻松扩展或缩减、添加或移动资源。
3. 高可靠性和容错性以防止数据丢失。系统的目标是实现 99.9999% 的可用性率。

这些功能共同确保 GreptimeDB 始终提供最佳的性能。
下面是关于如何实现这些功能的额外技术解释。

### 可弹性扩展的资源隔离

![存储/计算分离，计算/计算分离](/storage-compute-disaggregation-compute-compute-separation.png)

存储和计算资源是分离的，允许每个资源独立扩展、消耗和定价。
这不仅大大提高了计算资源的利用率，还适配了“按需付费”的定价模式，避免了资源未充分利用的浪费。

除了存储和计算隔离，不同的计算资源也被隔离，避免了因数据写入、实时查询以及数据压缩或降采样等任务产生的资源竞争，
从而实现高效率的大规模实时分析。

数据可以在多个应用程序之间共享而无需争用同一资源池，
这不仅大大提高了效率，
还可以根据需求提供无限的可扩展性。

### 灵活的架构支持多种部署策略

![GreptimeDB 的架构](/architecture-2.png)

通过灵活的架构设计原则，不同的模块和组件可以通过模块化和分层设计独立切换、组合或分离。
例如，我们可以将 Frontend、Datanode 和 Metasrc 模块合并为一个独立的二进制文件，也可以为每个表独立启用或禁用 WAL。

灵活的架构允许 GreptimeDB 满足从边缘到云的各种场景中的部署和使用需求，同时仍然使用同一套 API 和控制面板。
通过良好抽象的分层和封装隔离，GreptimeDB 的部署形式支持从嵌入式、独立、传统集群到云原生的各种环境。

## 优异的成本效益

GreptimeDB 利用流行的对象存储解决方案来存储大量的时序数据，例如 AWS S3 和 Azure Blob Storage，允许开发者只为使用的存储资源付费。

GreptimeDB 使用自适应压缩算法，根据数据的类型和基数来减少数据量，以满足时间和空间复杂性约束。
例如，对于字符串数据类型，当块的基数超过某个阈值时，GreptimeDB 使用字典压缩；
对于浮点数，GreptimeDB 采用 Chimp 算法，该算法通过分析实际的时间序列数据集来增强 Gorilla（Facebook 的内存 TSDB）的算法，
并提供比传统算法（如 zstd、Snappy 等）更高的压缩率和空间效率。

## 高性能

在性能优化方面，GreptimeDB 利用 LSM 树、数据分片和基于 Quorum 的 WAL 设计等不同技术来处理大量的时序数据写入时的工作负载。

GreptimeDB 的查询引擎强大且快速，得益于矢量化执行和分布式并行处理，并结合了索引功能。
为了提升数据修剪和过滤效率，GreptimeDB 构建了智能索引和大规模并行处理（MPP）架构。
该架构使用独立的索引文件记录统计信息，类似于 Apache Parquet 的行组元数据，同时还使用了内置指标记录不同查询的工作负载。
通过结合基于成本的优化（CBO）和开发者定义的提示，GreptimeDB 能够启发式地构建智能索引，从而进一步提升查询性能。

## 易于使用

### 易于部署和维护

为了简化部署和维护过程，GreptimeDB 提供了 [K8s operator](https://github.com/GreptimeTeam/greptimedb-operator)、[命令行工具](https://github.com/GreptimeTeam/gtctl)、嵌入式[仪表盘](https://github.com/GreptimeTeam/dashboard)和其他有用的工具，
使得开发者可以轻松配置和管理数据库。
请访问我们官网的 [GreptimeCloud](https://greptime.com) 了解更多信息。

### 易于集成

GreptimeDB 支持多种数据库连接协议，包括 MySQL、PostgreSQL、InfluxDB、OpenTSDB、Prometheus Remote Storage 和高性能 gRPC。
此外，还提供了多种编程语言的 SDK，如 Java、Go、Erlang 等。
我们还在不断与生态系统中的其他开源软件进行集成和连接，以增强开发者体验。
接下来将详细介绍三种流行的语言：PromQL、SQL 和 Python。

PromQL 是一种流行的查询语言，
允许开发者选择和聚合由 Prometheus 提供的实时时序数据。
它比 SQL 更简单，适用于使用 Grafana 进行可视化和创建告警规则。
GreptimeDB 原生支持 PromQL，查询引擎会将其转换为查询计划，对其进行优化和执行。

SQL 是一种高效的工具，
用于分析跨越较长时间跨度或涉及多个表（如 join）的数据。
此外，它在数据库管理方面也非常方便。

Python 在数据科学家和 AI 专家中非常流行。
GreptimeDB 允许直接在数据库中运行 Python 脚本。
开发者可以编写 UDF 和 DataFrame API，通过嵌入 Python 解释器来加速数据处理。

### 简单的数据模型与自动创建表

结合指标（Tag/Field/Timestamp）模型和关系数据模型（Table），
GreptimeDB 提供了一种称为时序表的新数据模型（见下图），以表格形式呈现数据，由行和列组成，指标的 Tag 和 Value 映射到列，并强制时间索引约束表示时间戳。

![时序表](/time-series-table.png)

然而，我们对 schema 的定义不是强制性的，而是更倾向于 MongoDB 等数据库的无 schema 方法。
表将在数据写入时动态自动创建，并自动添加新出现的列（Tag 和 Field）。

