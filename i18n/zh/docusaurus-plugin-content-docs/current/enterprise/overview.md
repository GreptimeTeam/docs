---
keywords: [企业版, 时序数据库, BYOC, 全托管云, 边云一体]
description: GreptimeDB Enterprise 是为企业设计的时序数据库解决方案，提供了 BYOC、全托管云、边云一体等部署方式，并包含高级功能如双活互备的 DR 解决方案、LDAP 身份验证和审计日志。
---

# 企业版

GreptimeDB Enterprise 是专为满足企业特定需求而设计的强大时序数据库解决方案。
除了开源版 GreptimeDB 中提供的所有功能外，
Enterprise 版还提供更多增强功能，帮助企业优化数据效率并显著降低成本，使企业能够使用时序数据做出更智能、更快速的决策。

解决方案包括：

- **将数据库部署在你的云中 - Bring Your Own Cloud（BYOC**: 利用你自己的云基础设施来托管 GreptimeDB，提供广泛的定制和灵活性以满足你的业务需求。此服务包括对你的云资源的全面管理和强大的安全措施，以保护你的基础设施。
- **全托管的独立云**: Greptime 团队提供完全托管的专用云环境，确保最佳性能、增强的安全性和卓越的可靠性，以满足你的企业需求。
- **[边云一体解决方案](https://greptime.com/product/carcloud)**: 用于管理从边缘设备到云的时序数据，实现整个基础设施的实时分析和洞察的全面解决方案。
- 针对物联网 (IoT)、可观测等行业的特定解决方案。

## 功能介绍

GreptimeDB Enterprise 支持开源版中的所有功能，
你可以阅读[用户指南](/user-guide/overview.md)文档以获取开源版的所有功能详情。
有关开源版和企业版之间的功能对比，请参考官网的[价格页面](https://greptime.cn/pricing)或[联系我们](https://greptime.cn/contactus)。

GreptimeDB Enterprise 包括以下高级功能，
详情描述在本章节的文档中：

- [基于双活互备的 DR 解决方案](./deployments-administration/disaster-recovery/overview.md)：通过高级灾难恢复解决方案确保服务不中断和数据保护。
- [部署 GreptimeDB](./deployments-administration/overview.md)：设置认证信息及其他关键配置后，将 GreptimeDB 部署在 Kubernetes 上并监控关键指标。
- [审计日志](./deployments-administration/monitoring/audit-logging.md)：记录数据库用户行为的日志。
- [自动分区平衡](./autopilot/region-balancer.md)：通过分区监控和迁移在 datanode 之间自动平衡负载。
- Elasticsearch 查询兼容性：在 Kibana 中以 GreptimeDB 作为后端。
- Greptime 企业版管理控制台：加强版本的管理界面，提供更多的集群管理和监控功能。
- [读副本](./read-replica.md)：专门运行复杂的查询操作的 datanode，避免影响实时写入。
- [Trigger](./trigger.md)：定时查询和检测预配置的规则，可触发外部 webhook，兼容 Prometheus AlertManager。
- Flow 的可靠性功能。

## 发布说明

- [25.05](./release-notes/release-25_05.md)
- [24.11](./release-notes/release-24_11.md)
