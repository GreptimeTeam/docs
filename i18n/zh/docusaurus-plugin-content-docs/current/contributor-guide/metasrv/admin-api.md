---
keywords: [Admin API, 健康检查, leader 查询, 心跳检测, 维护模式]
description: 面向维护者的 Metasrv Admin API router 及状态修改端点参考。
---

# Admin API

Axum router 在 `src/meta-srv/src/service/admin.rs` 中组装，并挂载到 Metasrv HTTP server 的 `/admin` 路径下。默认 HTTP 端口为 `4000`。

Router 本身不增加认证层。部分端点会改变集群行为，部署时必须通过网络策略保护该端口。增加路由时应显式指定 HTTP method，分离读取与修改 handler，并在 `src/meta-srv/src/service/admin/` 中添加 handler-level 测试。

## /health HTTP 端点

`GET /admin/health` 在 HTTP service 正常运行时返回 `OK`，但不能证明当前节点是 Leader，也不能证明外部依赖可用。Handler 位于 `health.rs`。

## /leader HTTP 端点

`GET /admin/leader` 通过已配置的 election backend 读取当前 Metasrv Leader 地址。Handler 位于 `leader.rs`。

## /heartbeat HTTP 端点

`GET /admin/heartbeat` 返回 Datanode 心跳记录，可通过 `addr` query parameter 按 Datanode 地址过滤。`GET /admin/heartbeat/help` 展示支持的查询形式。Handler 位于 `heartbeat.rs`，并通过 `MetaPeerClient` 读取数据。

## /maintenance HTTP 端点

维护模式会禁用部分自动集群管理操作，面向用户的行为参见[集群维护模式](/user-guide/deployments-administration/maintenance/maintenance-mode.md)。Router 提供：

- `GET /admin/maintenance` 或 `GET /admin/maintenance/status`：查询维护模式状态。
- `POST /admin/maintenance/enable`：启用维护模式。
- `POST /admin/maintenance/disable`：禁用维护模式。

实现位于 `maintenance.rs`，通过 `RuntimeSwitchManager` 修改状态。

## /procedure-manager HTTP 端点

这些路由用于暂停或恢复 Procedure Manager 调度，面向用户的行为参见[防止元数据变更](/user-guide/deployments-administration/maintenance/prevent-metadata-changes.md)。Router 提供：

- `GET /admin/procedure-manager/status`：查询 Procedure Manager 状态。
- `POST /admin/procedure-manager/pause`：暂停 Procedure Manager。
- `POST /admin/procedure-manager/resume`：恢复 Procedure Manager。

实现位于 `procedure.rs`，同样通过 `RuntimeSwitchManager` 修改状态。

## 其他内部端点

Router 还提供以下维护端点：

- `GET /admin/node-lease` 返回当前 Datanode 租约记录。
- `GET /admin/recovery/status` 和 `POST /admin/recovery/{enable,disable}` 查询或修改 recovery mode。
- `GET /admin/sequence/table/next-id` 读取下一个 Table ID，但不执行分配。
- `POST /admin/sequence/table/set-next-id` 修改 allocator 的下一个 Table ID。未启用 recovery mode 时，handler 会拒绝该操作。

Recovery 和 sequence 路由会改变集群状态，只能用于受控的修复流程。修改或调用前必须阅读对应 handler 和测试；本文不提供通用恢复流程。
