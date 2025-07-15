---
keywords: [升级 GreptimeDB, Metasrv 运维模式]
description: 在 Kubernetes 上升级 GreptimeDB 的步骤，包括直接升级和不使用 GreptimeDB Operator 升级集群的方式。
---

# 升级

## 直接升级

单独升级 GreptimeDB 企业版的镜像非常简单，只需要在 helm chart 中修改 `tag` 后重启即可。

## 不使用 GreptimeDB Operator 升级集群

**在不使用 GreptimeDB Operator 升级集群时，在操作各组件之前（例如，滚动升级 Datanode 节点），必须手动开启 Metasrv 的运维模式。升级完成后，需等待所有组件状态恢复健康，再关闭 Metasrv 的运维模式。**在开启 Metasrv 运维模式后，集群中的 Auto Balancing（如启用）以及 Region Failover（如启用）机制将暂停触发，直至运维模式关闭。

运维模式的开启和关闭可通过 Metasrv 的 HTTP 接口完成，接口地址格式如下：`http://{METASRV}:{RPC_PORT}/admin/maintenance?enable=true`。请注意，**该接口是监听在 Metasrv 的 `RPC_PORT` 端口上，默认端口为 `3002`**。

### 开启 Metasrv 运维模式

:::danger
调用运维模式接口后，请务必检查接口返回的 HTTP 状态码为 200，并确认响应内容符合预期。如果出现异常或接口行为不符合预期，请谨慎操作，并避免继续执行集群升级等高风险操作。
:::

```bash
curl -X POST 'localhost:3002/admin/maintenance?enable=true'
```

预期输出：

```json
{"enabled":true}
```

### 关闭 Metasrv 运维模式

:::danger
在关闭运维模式之前，必须确认**所有组件均已恢复至正常状态**。
:::

```bash
curl -X POST 'localhost:3002/admin/maintenance?enable=true'
```

预期输出：

```json
{"enabled":false}
```

## 查询 Metasrv 当前是否开启运维模式

```bash
curl -X GET localhost:3002/admin/maintenance
```

预期输出：

```json
{"enabled":false}
```

