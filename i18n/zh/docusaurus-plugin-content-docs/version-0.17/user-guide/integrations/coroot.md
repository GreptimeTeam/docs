---
keywords: [Coroot, APM, Observability, Prometheus, integration]
description: 将 GreptimeDB 与 Coroot 集成。
---

# Coroot

Coroot 是一个开源的 APM 和可观测性工具，
是 DataDog 和 NewRelic 的替代方案。
预定义的仪表板具备指标、日志、链路追踪、持续性能分析
和基于 SLO 的告警功能。

GreptimeDB 可以配置为 Coroot 中的 Prometheus 数据存储。
要将 GreptimeDB 集成到 Coroot 中，
需要在 Coroot 仪表板中导航到 Settings，
选择 Prometheus 配置，然后输入以下信息：

- Prometheus URL: `http{s}://<GreptimeDB_host>/v1/prometheus`
- 如果你在 GreptimeDB 上[启用了身份验证](/user-guide/deployments-administration/authentication/static.md)，请勾选 HTTP basic auth 并输入 GreptimeDB 用户名和密码。如果没有启用身份认证，保留未勾选状态即可。
- Remote Write URL: `http{s}://<GreptimeDB_host>/v1/prometheus/write?db=<db-name>`

## 示例配置

如果你的 GreptimeDB 被部署在 `localhost`，HTTP 服务端口为 `4000`，已启用身份验证，
并且使用默认数据库 `public`，
请使用以下配置：

- Prometheus URL: `http://localhost:4000/v1/prometheus`
- 启用 HTTP basic auth 选项并输入 GreptimeDB 用户名和密码
- Remote Write URL: `http://localhost:4000/v1/prometheus/write?db=public`

下图是 Coroot 的配置示例：

<p align="center">
  <img src="/coroot.jpg" alt="Coroot 配置示例" width="600"/>
</p>

配置保存成功后，
你就可以开始使用 Coroot 监控实例了。
下图展示了使用 GreptimeDB 作为数据源的 Coroot 仪表板示例：

![coroot-cpu](/coroot-cpu.png)


