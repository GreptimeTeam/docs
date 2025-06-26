---
keywords: [GreptimeDB, GreptimeDB 集群, 维护, 暂停元数据变更]
description: 管理 GreptimeDB 暂停元数据变更的指南，用于安全执行元数据备份等操作。
---

# 防止元数据变更

要防止元数据变更，你可以暂停 procedure manager。此机制拒绝所有新 procedure（即新的元数据变更操作），同时允许现有 procedure 继续运行。
一旦启用，Metasrv 将拒绝以下 procedure 操作：

**DDL 操作:**
- 创建表
- 删除表
- 修改表
- 创建数据库
- 删除数据库
- 创建视图
- 创建流
- 删除流

**Region 调度操作:**
- Region Migration
- Region Failover (if enabled)
- Region 自动负载均衡 (if enabled)

你在启用暂停元数据变更功能后尝试执行这些操作时，可能会看到错误消息。对于 Region 调度操作，你可以启用 [集群维护模式](/user-guide/deployments-administration/maintenance/maintenance-mode.md) 来临时暂时它们。

## 管理 procedure manager
procedure manager 可以通过 Metasrv 的 HTTP 接口暂停和恢复：`http://{METASRV}:{RPC_PORT}/admin/procedure-manager/pause` 和 `http://{METASRV}:{RPC_PORT}/admin/procedure-manager/resume`。请注意，此接口监听 Metasrv 的 `RPC_PORT`，默认为 `3002`。

### 暂停 procedure manager

通过向 `/admin/procedure-manager/pause` 端点发送 POST 请求来暂停 procedure manager。

```bash
curl -X POST 'http://localhost:3002/admin/procedure-manager/pause'
```

预期输出：
```bash
{"status":"paused"}
```

### 恢复 procedure manager

通过向 `/admin/procedure-manager/resume` 端点发送 POST 请求来恢复 procedure manager。

```bash
curl -X POST 'http://localhost:3002/admin/procedure-manager/resume'
```

预期输出：
```bash
{"status":"running"}
```

### 检查 procedure manager 状态

通过向 `/admin/procedure-manager/status` 端点发送 GET 请求来检查 procedure manager 状态。

```bash
curl -X GET 'http://localhost:3002/admin/procedure-manager/status'
```

预期输出：
```bash
{"status":"running"}
```


