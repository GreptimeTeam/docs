---
keywords: [GreptimeDB, 维护模式, metasrv, 集群管理, region 调度, 自动平衡, 故障转移, 升级, 维护]
description: 介绍如何管理 GreptimeDB 集群维护模式，以便在防止自动 region 调度和故障转移的同时安全地执行升级和维护等操作。
---

# 集群维护模式

集群维护模式是 GreptimeDB 中的一个安全特性，用于临时禁止集群的自动调度操作。

该模式在以下情况下特别有用：
- 集群升级
- 计划停机
- 任何可能暂时影响集群稳定性的操作


## 何时使用维护模式

### 使用 GreptimeDB Operator
如果你使用 GreptimeDB Operator 升级集群，你不需要手动启用维护模式。Operator 会自动处理。

### 不使用 GreptimeDB Operator
当不使用 GreptimeDB Operator 升级集群时，**在以下情况下必须手动启用 Metasrv 的维护模式**：
1. Datanode 节点滚动升级
2. Metasrv 节点升级
3. Frontend 节点升级
4. 任何可能暂时影响节点可用性的操作


## 维护模式的影响

当维护模式启用时：
- Region Balancer（如果启用）将暂停
- Region Failover（如果启用）将暂停
- 手动操作/迁移 Region 仍然可行
- 集群读、写服务正常工作
- 监控和指标收集继续运行

## 管理维护模式
维护模式可以通过 Metasrv 的 HTTP 接口启用和禁用：`http://{METASRV}:{RPC_PORT}/admin/maintenance?enable=true`。请注意，此接口监听 Metasrv 的 `RPC_PORT`，默认为 `3002`。

### 启用维护模式

通过发送 POST 请求到 `/admin/maintenance` 端点启用维护模式。更多详情，请参考 [Metasrv Admin API](/contributor-guide/metasrv/admin-api.md#maintenance-http-endpoint)。

```bash
curl -X POST 'http://localhost:3002/admin/maintenance?enable=true'
```

预期输出：
```bash
{"enabled":true}
```

如果遇到任何问题或意外行为，请不要继续进行维护操作。

### 禁用维护模式

在禁用维护模式之前：
1. 确保所有组件健康且正常运行
2. 验证所有节点是否正确加入集群

```bash
curl -X POST 'http://localhost:3002/admin/maintenance?enable=false'
```

预期输出：
```bash
{"enabled":false}
```

### 检查维护模式状态

通过发送 GET 请求到 `/admin/maintenance` 端点检查维护模式状态。更多详情，请参考 [Metasrv Admin API](/contributor-guide/metasrv/admin-api.md#maintenance-http-endpoint)。

```bash
curl -X GET http:://localhost:3002/admin/maintenance
```

预期输出：
```bash
{"enabled":false}
```

## 故障排除

### 常见问题

1. **无法启用维护模式**
   - 验证 Metasrv 是否正在运行且可访问
   - 检查你是否具有正确的权限
   - 确保 RPC 端口正确

### 最佳实践

1. 在操作前后始终验证维护模式状态
2. 准备好回滚计划
3. 监控集群健康状况
4. 记录所有维护期间进行的更改
