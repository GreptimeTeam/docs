---
keywords: [容量规划, CPU 需求, 内存需求, 存储需求, 数据保留策略, 硬件成本, 资源分配, 性能优化]
description: 提供 GreptimeDB 的 CPU、内存和存储需求的一般建议，帮助用户根据工作负载进行容量规划。
---

# 容量规划

本指南提供了关于 GreptimeDB 的 CPU、内存和存储需求的一般建议。

GreptimeDB 具备超轻量级的启动基准，
这使数据库能以最少的服务器资源启动。
然而当为生产环境配置服务器容量时，
以下关键因素需要被考虑：

- 每秒处理的数据点数
- 每秒查询请求
- 数据量
- 数据保留策略
- 硬件成本

要监控 GreptimeDB 的各种指标，请参阅[监控](/user-guide/deployments-administration/monitoring/overview.md)。

## CPU

一般来说，大量并发查询、处理大量数据或执行其他计算密集型操作的应用需要更多的 CPU 核数。

以下是一些关于 CPU 资源使用的建议，
但实际使用的 CPU 核数取决于你实际的工作负载。

你可以考虑将 30% 的 CPU 资源用于数据写入，
剩余 70% 用于查询和分析。

一般推荐 CPU 到内存的比例为 1:4（例如，8 核 32 GB），
如果你的主要工作负载是数据写入且查询请求较少，
1:2 的比例（8 核 16 GB）也是可以接受的。

## 内存

一般来说，内存越大，查询速度越快。
对于基本工作负载，建议至少有 8 GB 的内存，对于更高级的工作负载，建议至少有 32 GB 的内存。

## 存储空间

GreptimeDB 具有高效的数据压缩机制，可将原始数据大小减少到其初始大小的约 1/8 到 1/10。
这使得 GreptimeDB 以更小的空间存储大量数据。

数据可以存储在本地文件系统或云存储中，例如 AWS S3。
有关存储选项的更多信息，
请参阅[存储配置](/user-guide/deployments-administration/configuration.md#存储选项)文档。

由于云存储在存储管理方面的简单性，强烈推荐使用云存储进行数据存储。
使用云存储时，本地存储空间只需要大约 200GB 用于查询相关的缓存和 Write-Ahead Log (WAL)。

无论你选择云存储还是本地存储，
建议设置[保留策略](/user-guide/concepts/features-that-you-concern.md#我可以为不同的表或指标设置-ttl-或保留策略吗)以有效管理存储成本。

## 举例

假设你的数据库每秒处理约 200 个简单查询请求（QPS），每秒处理约 300k 数据点的写入请求，使用云存储存储数据。

在这种写入和查询速率下，
以下是你可能分配资源的示例：

- CPU：8 核
- 内存：32 GB
- 存储空间：200 GB

这样的分配旨在优化性能，
确保数据写入和查询处理的平稳进行，而不会导致系统过载。
然而，请记住这些只是建议，
实际需求可能会根据特定的工作负载特征和性能期望而有所不同。
