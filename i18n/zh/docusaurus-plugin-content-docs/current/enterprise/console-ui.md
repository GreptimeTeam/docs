---
keywords: [企业版, 管理控制台, 仪表板, 集群管理, 数据管理, 监控, UI]
description: GreptimeDB 企业版管理控制台提供集群状态、区域管理、数据管理和监控等功能的可视化界面。
---

# 管理控制台 UI

GreptimeDB 企业版管理控制台是标准 GreptimeDB 仪表板的增强版本，为企业用户提供更全面的集群可观测性与运维能力。


## 集群概览

**Overview** 页面展示集群整体运行状态和资源使用情况。

- **Service Overview**：CPU、内存、存储使用率；数据摄取速率；各协议请求速率。
- **Storage Overview**：数据库数、表数、区域数；Manifest、WAL、Index 文件大小。
- **Cluster**：节点类型；节点运行状态与资源使用率。

![Overview](/enterprise-console-overview.png)

## 运维操作

**Region Management** 提供区域级别的运维能力。

- **Datanodes 视角**：查看各数据节点及区域详情，包括 Region ID、所属表、存储大小、WAL/Manifest/Index 占用、行数。
- **Tables 视角**：按表查看区域分布，支持展开查看 Region 信息。
- **区域维护**：支持 Flush 与 Compact。
- **区域迁移**：将 Region 从一个节点迁移到另一个节点，支持超时配置和实时迁移状态展示。

![Region Management - Datanodes](/enterprise-console-region-datanodes.png)

![Region Management - Tables](/enterprise-console-region-tables.png)

## 数据管理

**Data Management** 页面提供 SQL 查询、数据摄取、日志查询和链路追踪等功能。  
这些功能与开源版 Dashboard 和 Cloud Dashboard 保持一致，此处不再展开说明。

## 监控功能

**Monitoring** 页面提供全方位的指标与日志监控。

### 指标监控（Metrics）

提供多个分组的监控指标，包括 Overview、Ingestion、Queries、Resources、Frontend Requests、Frontend to Datanode、Mito Engine、OpenDAL、Metasrv 和 Flownode，覆盖集群运行状态、请求速率、延迟、资源使用等关键数据。

![Metrics](/enterprise-console-monitor-metrics.png)

### 实例日志搜索（Instance Logs）

支持按角色、实例、日志级别、时间范围和关键词筛选集群日志，结果可导出为 JSON。

![Instance Logs](/enterprise-console-instance-logs.png)

### 慢查询分析（Slow Query）

展示执行时间较长的 SQL/PromQL 查询，支持查看耗时、语句详情，并可使用 **Explain Query** 分析执行计划。

![Slow Query](/enterprise-console-slow-query.png)
