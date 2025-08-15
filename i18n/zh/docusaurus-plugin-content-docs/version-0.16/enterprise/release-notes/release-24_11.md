---
keywords: [Region Rebalance, 管理控制台, LDAP User Provider, 审计日志, 开源版改进]
description: GreptimeDB 企业版 24.11 版本介绍了 Region Rebalance、管理控制台、LDAP User Provider、审计日志等新特性，并基于开源版 v0.10 引入了多项改进。
---

# Release 24.11

我们很高兴向大家介绍 GreptimeDB 企业版的 24.11 版本。

## 特性亮点

### Region Rebalance

为了增强 GreptimeDB 的弹性，Region Rebalance 功能允许在数据节点之间灵活地重新分配
Region，无论是否由手动或动态触发。

这一前瞻性的措施带来了多个关键优势，包括均衡工作负载、优化资源利用，并确保在计划
维护期间无缝运行。

###  GreptimeDB 企业版管理控制台

我们带来了首个版本的 GreptimeDB 企业版管理控制台的用户界面。

此版本提供了一系列功能，包括：

- 慢查询分析与调试
- 详细的集群拓扑信息
- 实时查看集群指标和日志

### LDAP User Provider

将您自己的 LDAP 用户数据库与 GreptimeDB 企业版进行连接。我们实现了灵活的配置选项
支持，无论是简单的还是复杂的认证机制。

### 审计日志

提供日志以跟踪数据库中的查询操作，并记录以下信息：

- 查询类型：读取、写入、DDL 或其他
- 命令：SELECT、INSERT 等
- 对象类型：操作的目标对象，例如表、数据库等

### GreptimeDB 开源版特性

本版本基于 GreptimeDB 开源版 v0.10。开源基础引入了一些新功能：

- 向量数据类型支持用于相似性搜索
- 二级索引更新：用户现在可以在任何列上创建二级索引
- 添加了表选项以更新 TTL、压缩参数和全文索引设置
- JSON 数据类型和函数的支持
- Loki Remote Write 的早期支持
- 更多地理空间的通用函数（UDF）包括空间关系与测量、S2 索引等。

请参阅[这里](https://docs.greptime.com/release-notes/release-0-10-0)以获取完整的
变更日志。
