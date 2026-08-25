---
keywords: [Selector, Metasrv, Datanode, Region 放置, 负载均衡]
description: 介绍 Metasrv 的 Region 放置 Selector 及其配置名称。
---

# Selector

## 介绍

建表时，Metasrv 需要为各 Region 选择 Datanode。[`Selector` trait](https://github.com/GreptimeTeam/greptimedb/blob/main/src/meta-srv/src/selector.rs) 接收所需 peer 数量和 selection context，再根据当前租约及统计信息返回候选 Datanode。

<AnchorAlias id="selector-type" />

## Selector 类型

Metasrv 提供三种 Selector 实现：

### LeaseBasedSelector

`LeaseBasedSelector` 从租约有效的 Datanode 中随机选择，不使用 Region 数量为候选节点排序。

### LoadBasedSelector

`LoadBasedSelector` 使用 Datanode 上的 Region 数量表示负载，优先选择 Region 较少的节点。

### RoundRobinSelector [默认选项]

`RoundRobinSelector` 依次轮询可用 Datanode，是默认的 Selector。

## 配置

启动 Metasrv 时可以指定 Selector。可用名称如下：

- `lease_based` 或 `LeaseBased`
- `load_based` 或 `LoadBased`
- `round_robin` 或 `RoundRobin`

例如：

```shell
cargo run -- metasrv start --selector round_robin
```
