---
keywords: [Selector, Metasrv, Datanode, 路由表, 负载均衡]
description: 介绍 Metasrv 中的 Selector，包括其类型和配置方法。
---

# Selector

## 介绍

什么是 `Selector`？顾名思义，它允许用户从给定的 `namespace` 和 `context` 中选择 `Item`s。有一个相关的 `trait`，也叫做 `Selector`，其定义可以在[这里][0]找到。

[0]: https://github.com/GreptimeTeam/greptimedb/blob/main/src/meta-srv/src/selector.rs

在 `Metasrv` 中存在一个特定的场景。当 `Frontend` 向 `Metasrv` 发送建表请求时，`Metasrv` 会创建一个路由表（表的创建细节不在这里赘述）。在创建路由表时，`Metasrv` 需要选择适当的 `Datanode`s，这时候就需要用到 `Selector`。

## Selector 类型

`Metasrv` 目前提供以下几种类型的 `Selectors`:

### LeasebasedSelector

`LeasebasedSelector` 从所有可用的（也就是在租约期间内）`Datanode` 中随机选择，其特点是简单和快速。

### LoadBasedSelector

`LoadBasedSelector` 按照负载来选择，负载值则由每个 `Datanode` 上的 region 数量决定，较少的 region 表示较低的负载，`LoadBasedSelector` 优先选择低负载的 `Datanode`。

### RoundRobinSelector [默认选项]
`RoundRobinSelector` 以轮询的方式选择 `Datanode`。在大多数情况下，这是默认的且推荐的选项。如果你不确定选择哪个，通常它就是正确的选择。

## 配置

您可以在启动 `Metasrv` 服务时通过名称配置 `Selector`。

- LeasebasedSelector: `lease_based` 或 `LeaseBased`
- LoadBasedSelector: `load_based` 或 `LoadBased`
- RoundRobinSelector: `round_robin` 或 `RoundRobin`

例如：

```shell
cargo run -- metasrv start --selector round_robin
```

```shell
cargo run -- metasrv start --selector RoundRobin
```
