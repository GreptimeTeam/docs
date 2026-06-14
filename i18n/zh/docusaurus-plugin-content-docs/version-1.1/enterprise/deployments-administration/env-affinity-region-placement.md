---
keywords: [enterprise, metasrv, datanode, region placement, env affinity selector, availability zone]
description: 配置企业版 env affinity selector，将新建表的 Region 放置到与接收 DDL 请求的 frontend 处于相同环境的 datanode 上。
---

# 配置基于环境亲和性的 Region Placement

Env affinity selector 是企业版专属的 Metasrv 插件，用于将新建表的 Region 放置到与接收 DDL 请求的 frontend 处于相同环境的 datanode 上。该功能的主要目的是避免意外的跨可用区或跨地域流量，从而减少额外延迟和非预期的网络传输成本。当 frontend 和 datanode 跨可用区、地域或其他故障域部署，并且你希望建表时的 Region 放置尽量靠近请求入口时，可以使用该功能。

:::tip NOTE
此功能仅适用于企业版。请勿使用开源镜像启用此功能。如果你想使用此功能，请联系[我们](https://greptime.cn/contactus)。
:::

## 工作原理

启用 `env_affinity_selector` 后，Metasrv 会包装已配置的 datanode selector：

1. Metasrv 从 DDL 请求的 selector 上下文中读取 origin frontend。
2. Metasrv 从该 frontend 的 heartbeat 信息中读取配置的亲和性环境变量。
3. Metasrv 将候选 datanode 过滤为环境变量值匹配的 datanode。
4. Metasrv 将匹配 datanode 中的最终选择委托给顶层 `selector` 选项配置的基础 selector。

例如，如果一个 `CREATE TABLE` 请求到达的 frontend 在 heartbeat 中上报了 `REGION=us-east` 和 `AZ=az-a`，Metasrv 会先将候选 datanode 过滤为上报相同 `REGION` 和 `AZ` 的 datanode，然后应用已配置的基础 selector（例如 `load_based`）来选择最终的 datanode。

不携带 origin frontend selector 上下文的请求会绕过 env affinity selector，直接使用基础 selector。这样可以保持非 DDL selector 路径的现有行为不变。

## 配置 heartbeat 环境变量

Frontend 和 datanode 进程必须在 heartbeat 信息中上报相同的亲和性 key。请为 frontend 和 datanode 配置顶层选项 `heartbeat_env_vars`：

```toml
heartbeat_env_vars = ["REGION", "AZ"]
```

每个进程启动时还必须设置对应的环境变量：

```shell
REGION=us-east
AZ=az-a
```

:::warning
不要在 `heartbeat_env_vars` 中包含敏感变量。被选择的变量值会通过 heartbeat 消息发送到 Metasrv，并存储在 Metasrv 的节点信息中。
:::

关于 heartbeat 配置，请参阅 [Heartbeat 配置](/user-guide/deployments-administration/configuration.md#心跳配置)。

## 配置 Metasrv

在 Metasrv 的企业版插件配置中启用 `env_affinity_selector`：

```toml
# 基础 datanode selector。Env affinity 会先过滤候选节点，然后使用
# 该 selector 从匹配的 datanode 中做最终选择。
selector = "load_based"

[[plugins]]
[plugins.env_affinity_selector]
enable = true

# origin frontend 和候选 datanode 必须匹配的环境变量名。
# 默认值为 ["AZ"]。
affinity_keys = ["REGION", "AZ"]

# 可选。默认值为 "origin_frontend_addr"，通常不需要修改。
# origin_frontend_addr_extension_key = "origin_frontend_addr"

# 控制 env affinity 无法应用或同环境 datanode 候选数量不足时的行为。
# 可选值为 "error" 和 "base_selector"。默认值为 "error"。
fallback_selector = "base_selector"
```

顶层 `selector` 选项仍然用于选择基础 datanode selector。支持的基础 selector 包括 `round_robin`、`lease_based` 和 `load_based`。Env affinity 不会替代基础 selector，而是在基础 selector 做最终选择之前先约束候选 datanode 的范围。

## Fallback 行为

使用 `fallback_selector` 控制 Metasrv 在 env affinity 无法应用时的行为。

| 值 | 行为 |
| --- | --- |
| `error` | 当亲和性上下文无效或同环境 datanode 候选数量不足时返回错误。这是默认值，可防止 Region 被放置到匹配环境之外。 |
| `base_selector` | 记录 warning，并回退到顶层 `selector` 选项配置的基础 selector。回退选择可以选择任何被基础 selector 接受的 datanode。 |

无效的亲和性上下文包括：

- Origin frontend 不活跃。
- Frontend heartbeat 缺少一个或多个配置的 `affinity_keys`。
- `affinity_keys` 为空。

同环境候选数量不足包括：

- 没有 datanode 与 origin frontend 的环境匹配。
- Selector 需要多个 datanode，不允许重复选择，并且匹配的 datanode 数量少于所需数量。

旧的 `strict` 选项不再支持。仍然指定 `strict` 的配置会被拒绝。

## Kubernetes 示例

以下 Helm values 展示了一个跨两个可用区部署的集群。Frontend 和 datanode 通过 heartbeat extension 上报 `REGION` 和 `AZ`，Metasrv 启用 env affinity 放置。

```yaml
frontend:
  replicas: 2
  configData: |
    heartbeat_env_vars = ["REGION", "AZ"]
  podTemplate:
    main:
      env:
        - name: REGION
          value: us-east
        - name: AZ
          valueFrom:
            fieldRef:
              fieldPath: metadata.labels['topology.kubernetes.io/zone']

datanodeGroups:
  - name: az-a
    replicas: 3
    config: |
      heartbeat_env_vars = ["REGION", "AZ"]
    template:
      main:
        env:
          - name: REGION
            value: us-east
          - name: AZ
            value: az-a
  - name: az-b
    replicas: 3
    config: |
      heartbeat_env_vars = ["REGION", "AZ"]
    template:
      main:
        env:
          - name: REGION
            value: us-east
          - name: AZ
            value: az-b

meta:
  configData: |
    selector = "load_based"

    [[plugins]]
    [plugins.env_affinity_selector]
    enable = true
    affinity_keys = ["REGION", "AZ"]
    fallback_selector = "error"
```

应用配置后，可以分别通过不同环境中的 frontend 创建表，并使用 `SHOW REGION` 检查新 Region 的放置位置。更多信息请参阅 [SHOW 语句的扩展](/reference/sql/show.md#show-语句的扩展)。

## 最佳实践

- 使用稳定、低基数的 key，例如 `REGION`、`AZ` 或 `ZONE`。
- 在所有参与 DDL 放置的 frontend 和 datanode 上配置相同的 `heartbeat_env_vars`。
- 当需要严格放置时，从 `fallback_selector = "error"` 开始。
- 只有在可用性比保持在匹配环境内更重要时，才使用 `fallback_selector = "base_selector"`。
- 如果希望同时获得环境亲和性放置和匹配环境内的负载感知分布，可以使用 `load_based` 作为基础 selector。
