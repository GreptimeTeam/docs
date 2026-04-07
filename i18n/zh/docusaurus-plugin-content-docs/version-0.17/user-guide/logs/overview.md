---
keywords: [log service, quick start, pipeline configuration, manage pipelines, query logs]
description: GreptimeDB 日志管理功能的综合指南，包括日志收集架构、Pipeline 处理、与 Vector 和 Kafka 等流行的日志收集器的集成以及使用全文搜索的高级查询。
---

# 日志

GreptimeDB 提供了专为满足现代可观测需求而设计的日志管理解决方案，
它可以和主流日志收集器无缝集成，
提供了灵活的使用 pipeline 转换日志的功能
和包括全文搜索的查询功能。

核心功能点包括：

- **统一存储**：将日志与指标和 Trace 数据一起存储在单个数据库中
- **Pipeline 处理数据**：使用可自定义的 pipeline 转换和丰富原始日志，支持多种日志收集器和格式
- **高级查询**：基于 SQL 的分析，并具有全文搜索功能
- **实时数据处理**：实时处理和查询日志以进行监控和警报

## 日志收集流程

![log-collection-flow](/log-collection-flow.drawio.svg)

上图展示了日志收集的整体架构，
它包括四阶段流程：日志源、日志收集器、Pipeline 处理和在存储到 GreptimeDB 中。

### 日志源

日志源是基础设施中产生日志数据的基础层。
GreptimeDB 支持从各种源写入数据以满足全面的可观测性需求：

- **应用程序**：来自微服务架构、Web 应用程序、移动应用程序和自定义软件组件的应用程序级日志
- **IoT 设备**：来自物联网生态系统的设备日志、传感器事件日志和运行状态日志
- **基础设施**：云平台日志、容器编排日志（Kubernetes、Docker）、负载均衡器日志以及网络基础设施组件日志
- **系统组件**：操作系统日志、内核事件、系统守护进程日志以及硬件监控日志
- **自定义源**：特定于你环境或应用程序的任何其他日志源

### 日志收集器

日志收集器负责高效地从各种源收集日志数据并转发到存储后端。
GreptimeDB 可以与行业标准的日志收集器无缝集成，
包括 Vector、Fluent Bit、Apache Kafka、OpenTelemetry Collector 等。

GreptimeDB 作为这些收集器的 sink 后端，
提供强大的数据写入能力。
在写入过程中，GreptimeDB 的 pipeline 系统能够实时转换和丰富日志数据，
确保在存储前获得最佳的结构和质量。

### Pipeline 处理

GreptimeDB 的 pipeline 机制将原始日志转换为结构化、可查询的数据：

- **解析**：从非结构化日志消息中提取结构化数据
- **转换**：使用额外的上下文和元数据丰富日志
- **索引**：配置必要的索引以提升查询性能，例如全文索引、时间索引等

### 存储日志到 GreptimeDB

通过 pipeline 处理后，日志存储在 GreptimeDB 中，支持灵活的分析和可视化：

- **SQL 查询**：使用熟悉的 SQL 语法分析日志数据
- **基于时间的分析**：利用时间序列功能进行时间分析
- **全文搜索**：在日志消息中执行高级文本搜索
- **实时分析**：实时查询日志进行监控和告警

## 快速开始

你可以使用内置的 `greptime_identity` pipeline 快速开始日志写入。更多信息请参考[快速开始](./quick-start.md)指南。

## 集成到日志收集器

GreptimeDB 与各种日志收集器无缝集成，提供全面的日志记录解决方案。集成过程包括以下关键步骤：

1. **选择合适的日志收集器**：根据你的基础设施要求、数据源和性能需求选择收集器
2. **分析输出格式**：了解你选择的收集器产生的日志格式和结构
3. **配置 Pipeline**：在 GreptimeDB 中创建和配置 pipeline 来解析、转换和丰富传入的日志数据
4. **存储和查询**：在 GreptimeDB 中高效存储处理后的日志，用于实时分析和监控

要成功将你的日志收集器与 GreptimeDB 集成，你需要：
- 首先了解 pipeline 在 GreptimeDB 中的工作方式
- 然后在你的日志收集器中配置 sink 设置，将数据发送到 GreptimeDB

请参考以下指南获取将 GreptimeDB 集成到日志收集器的详细说明：

- [Vector](/user-guide/ingest-data/for-observability/vector.md#using-greptimedb_logs-sink-recommended)
- [Kafka](/user-guide/ingest-data/for-observability/kafka.md#logs)
- [Fluent Bit](/user-guide/ingest-data/for-observability/fluent-bit.md#http)
- [OpenTelemetry Collector](/user-guide/ingest-data/for-observability/otel-collector.md)
- [Loki](/user-guide/ingest-data/for-observability/loki.md#using-pipeline-with-loki-push-api)

## 了解更多关于 Pipeline 的信息

- [使用自定义 Pipeline](./use-custom-pipelines.md)：解释如何创建和使用自定义 pipeline 进行日志写入。
- [管理 Pipeline](./manage-pipelines.md)：解释如何创建和删除 pipeline。

## 查询日志

- [全文搜索](./fulltext-search.md)：使用 GreptimeDB 查询语言有效搜索和分析日志数据的指南。

## 参考

- [内置 Pipeline](/reference/pipeline/built-in-pipelines.md)：GreptimeDB 为日志写入提供的内置 pipeline 详细信息。
- [写入日志的 API](/reference/pipeline/write-log-api.md)：描述向 GreptimeDB 写入日志的 HTTP API。
- [Pipeline 配置](/reference/pipeline/pipeline-config.md)：提供 GreptimeDB 中 pipeline 各项具体配置的信息。

