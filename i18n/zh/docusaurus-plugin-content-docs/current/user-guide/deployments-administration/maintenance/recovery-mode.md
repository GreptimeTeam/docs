---
keywords: [GreptimeDB, 恢复模式, metasrv, 集群管理, 数据恢复]
description: 介绍如何使用 GreptimeDB 集群恢复模式来解决 Datanode 启动失败问题，并从 region 数据丢失或损坏中恢复。
---

# 集群恢复模式

恢复模式是 GreptimeDB 中的一个安全特性，允许开发者手动恢复集群从失败状态。

## 何时使用恢复模式

恢复模式在 Datanode 启动失败时特别有用，通常是由于 "Empty region directory" 错误，这可能是由于：
- Datanode 数据损坏（缺少 Region 数据目录）
- 从元数据快照恢复集群

## 恢复模式管理

恢复模式可以通过 Metasrv 的 HTTP 接口启用和禁用：`http://{METASRV}:{HTTP_PORT}/admin/recovery/enable` 和 `http://{METASRV}:{HTTP_PORT}/admin/recovery/disable`。请注意，此接口监听 Metasrv 的 `HTTP_PORT`，默认为 `4000`。

### 启用恢复模式

通过发送 POST 请求到 `/admin/recovery/enable` 端点启用恢复模式。


```bash
curl -X POST 'http://localhost:4000/admin/recovery/enable'
```

预期输出：
```bash
{"enabled":true}
```

### 禁用恢复模式

通过发送 POST 请求到 `/admin/recovery/disable` 端点禁用恢复模式。

```bash
curl -X POST 'http://localhost:4000/admin/recovery/disable'
```

预期输出：
```bash
{"enabled":false}
```

### 检查恢复模式状态

通过发送 GET 请求到 `/admin/recovery/status` 端点检查恢复模式状态。

```bash
curl -X GET 'http://localhost:4000/admin/recovery/status'
```

预期输出：
```bash
{"enabled":false}
```