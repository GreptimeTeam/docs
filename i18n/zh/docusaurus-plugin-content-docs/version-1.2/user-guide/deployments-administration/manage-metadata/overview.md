---
keywords: [元数据存储, Metasrv, etcd, MySQL, PostgreSQL, RDS, 集群]
description: GreptimeDB 集群可用的元数据后端——etcd、MySQL 和 PostgreSQL——以及开发和生产环境分别该选哪个。
---

# 元数据存储

GreptimeDB 集群把元数据存放在外部系统中，由 Metasrv 组件读写。支持以下后端：

- **[etcd](https://etcd.io/)**——分布式键值存储，运维开销小。
- **[MySQL](https://www.mysql.com/) 和 [PostgreSQL](https://www.postgresql.org/)**——关系型数据库，具备 ACID 事务、复制和成熟的备份工具链。主流云平台都提供对应的托管服务（RDS）。

<AnchorAlias id="推荐方案" />
<AnchorAlias id="最佳实践" />

## 如何选择

开发和测试环境用 etcd，运行成本最低。

生产环境建议使用云厂商的托管关系型数据库。托管服务覆盖了高可用、自动备份和日常维护，而这几项正是自建元数据存储的主要运维成本。

无论使用哪种后端，元数据存储都独立于 GreptimeDB 自身的数据链路，需要单独安排备份和健康监控。

<AnchorAlias id="后续步骤" />

## 下一步

- [配置](/user-guide/deployments-administration/manage-metadata/configuration.md)——让 Metasrv 指向某个后端。
- [管理 etcd](/user-guide/deployments-administration/manage-metadata/manage-etcd.md)——在开发和测试环境中运行 etcd。
