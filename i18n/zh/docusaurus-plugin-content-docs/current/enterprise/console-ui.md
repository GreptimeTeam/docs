---
keywords: [企业版, 管理控制台, 仪表板, 数据管理, 运维, 集群管理, 区域管理, 实例管理, 用户管理, 监控]
description: GreptimeDB 企业版管理控制台在开源 Dashboard 基础上提供 Operation 运维能力，涵盖集群可观测性、Region 管理、实例配置与用户管理。
---

# 管理控制台

GreptimeDB 企业版管理控制台在开源 [GreptimeDB 控制台](/getting-started/installation/greptimedb-dashboard.md) 基础上增加了企业版运维能力。侧边栏分为两组：

| 分组 | 范围 |
| --- | --- |
| **Data Management** | 查询、写入与管理数据 — 与开源版 Dashboard 功能一致 |
| **Operation** | 集群可观测性与治理 — 企业版专有 |

## Data Management

**Data Management** 涵盖查询、写入、pipeline、Flow 和 Visualization，与开源 Dashboard 功能一致。详见 [GreptimeDB 控制台](/getting-started/installation/greptimedb-dashboard.md)。

## Operation

**Operation** 提供企业版专有的集群可观测性与治理能力。

### Overview

**Overview** 页面展示集群整体运行状态和资源使用情况。

- 数据库、表、Region 数量；存储大小与写入速率。
- 集群 CPU、内存使用率及趋势。
- 按角色（Frontend、Datanode、Metasrv、Flownode）查看各节点资源。

![Overview](/entdashboard/overview.png)

### Metrics

**Metrics** 页面以单一内置监控视图展示集群运行指标，按 **Overview**、**Ingestion**、**Queries** 等分组组织。

- 按节点角色和时间范围筛选。
- 涵盖请求速率、延迟、存储与资源使用等指标。

![Metrics](/entdashboard/metrics.png)

### Instance Logs

**Instance Logs** 支持检索和分析 GreptimeDB 组件日志。

- 按角色、实例、日志级别、时间范围和关键词筛选。
- 支持导出结果以便进一步分析。

![Instance Logs](/entdashboard/logs.png)

### Slow Query

**Slow Query** 展示执行时间较长的 SQL 和 PromQL 查询。

- 查看耗时与完整查询语句。
- 使用 **Explain Query** 分析执行计划并优化性能。

![Slow Query](/entdashboard/slowquery.png)

### Region Management

**Region Management** 提供 Region 级别的运维能力。

- **By Datanode** 与 **By Table** 视角查看 Region 分布与详情。
- 支持 **Flush** 与 **Compact** 优化存储与性能。
- 支持 **Migrate** 将 Region 在节点间迁移，并跟踪进度。

![Region Management](/entdashboard/region.png)

### Instance Management

**Instance Management** 用于配置 GreptimeDB 集群连接。

- 设置 HTTP URL、Meta URL、默认数据库和时区。
- 配置 Kubernetes License Secret 与部署信息。
- 配置 GreptimeDB 与 Prometheus 监控端点。
- 支持 **Test Connection**、**Save** 和 **Update License**。

![Instance Management](/entdashboard/instancemanage.png)

### User Management

**User Management** 在控制台中管理用户账号与访问控制。

- 创建用户并分配权限（Read、Write、Read & Write、Custom、Admin）。
- 按表或模式配置表级 ACL。
- RBAC 与 ACL 详情见[内置用户管理](./user.md)。

![User Management](/entdashboard/usermanage.png)

### CPU and Memory Profiling

侧边栏提供 **Memory Profile** 与 **CPU Profile** 入口，用于对 GreptimeDB 组件做持续性能剖析。配置与使用见[持续性能剖析](./console-ui/continuous-profiling.md)。
