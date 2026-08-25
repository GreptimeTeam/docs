---
keywords: [Selector, Metasrv, Datanode, 路由表, 负载均衡]
description: 介绍 Metasrv 中的 Selector，包括其类型和配置方法。
---

# Selector

## 介绍

建表时，Metasrv 使用 `Selector` 为各 Region 选择 Datanode。Selector 根据当前节点租约进行选择；部分实现还会使用 Region 统计信息。

<AnchorAlias id="selector-type" />

## Selector 类型

`Metasrv` 目前提供以下几种类型的 `Selectors`:

### LeaseBasedSelector

`LeaseBasedSelector` 从租约有效的 Datanode 中随机选择。

### LoadBasedSelector

`LoadBasedSelector` 按照负载来选择，负载值则由每个 `Datanode` 上的 region 数量决定，较少的 region 表示较低的负载，`LoadBasedSelector` 优先选择低负载的 `Datanode`。

### RoundRobinSelector [默认选项]
`RoundRobinSelector` 以轮询方式选择 Datanode，是默认选项。

## 配置

您可以在启动 `Metasrv` 服务时通过名称配置 `Selector`。

- LeaseBasedSelector: `lease_based` 或 `LeaseBased`
- LoadBasedSelector: `load_based` 或 `LoadBased`
- RoundRobinSelector: `round_robin` 或 `RoundRobin`

例如：

```shell
cargo run -- metasrv start --selector round_robin
```

```shell
cargo run -- metasrv start --selector RoundRobin
```
