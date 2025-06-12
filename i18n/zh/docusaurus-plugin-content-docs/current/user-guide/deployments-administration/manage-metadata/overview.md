---
 keywords: [GreptimeDB, 元数据存储, etcd, MySQL, PostgreSQL, 配置]
 description: GreptimeDB 元数据存储选项概述，包括 etcd、MySQL 和 PostgreSQL，以及生产环境部署建议。
---

# 概述

GreptimeDB 集群 Metasrv 组件需要一个元数据存储来保存元数据。GreptimeDB 提供了灵活的元数据存储选项，包括 [etcd](https://etcd.io/)、[MySQL](https://www.mysql.com/) 和 [PostgreSQL](https://www.postgresql.org/)。每种选项都针对不同的部署场景设计，在可扩展性、可靠性和运维开销之间取得平衡。

- [etcd](https://etcd.io/)：一个轻量级的分布式键值存储，非常适合元数据管理。其简单性和易于设置的特点使其成为开发和测试环境的绝佳选择。
- [MySQL](https://www.mysql.com/) 和 [PostgreSQL](https://www.postgresql.org/)：企业级关系型数据库，提供强大的元数据存储能力。它们提供包括 ACID 事务、复制和全面的备份解决方案在内的基本功能，使其成为生产环境的理想选择。这两种数据库在各大云平台上都广泛提供托管数据库服务（RDS）。

## 推荐方案

对于测试和开发环境，[etcd](https://etcd.io/) 提供了一个轻量级且简单的元数据存储解决方案。

**对于生产环境部署，我们强烈建议使用云服务商提供的关系型数据库服务（RDS）作为元数据存储。** 这种方式具有以下优势：

- 托管服务内置高可用性和灾难恢复能力
- 自动化的备份和维护
- 专业的监控和支持
- 相比自托管解决方案，降低了运维复杂度
- 与其他云服务无缝集成

## 最佳实践

- 为元数据存储实施定期备份计划
- 建立全面的存储健康状态和性能指标监控
- 制定清晰的灾难恢复流程
- 记录元数据存储配置和维护程序

## 后续步骤
- 要配置元数据存储后端，请参阅[配置](/user-guide/deployments-administration/manage-metadata/configuration.md)。
- 要为测试和开发环境设置 etcd，请参阅[管理 etcd](/user-guide/deployments-administration/manage-metadata/manage-etcd.md)。