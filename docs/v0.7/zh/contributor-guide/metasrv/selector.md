# Selector

## 介绍

什么是 `Selector`？顾名思义，它允许用户从给定的 `namespace` 和 `context` 中选择 `Item`s。有一个相关的 `trait`，也叫做 `Selector`，其定义可以在[这里][0]找到。

[0]: https://github.com/GreptimeTeam/greptimedb/blob/main/src/meta-srv/src/selector.rs

在 `Metasrv` 中存在一个特定的场景。当 `Frontend` 向 `Metasrv` 发送建表请求时，`Metasrv` 会创建一个路由表（表的创建细节不在这里赘述）。在创建路由表时，`Metasrv` 需要选择适当的 `Datanode`s，这时候就需要用到 `Selector`。

## Selector 类型

目前，在 `Metasrv` 中有两种类型的 `Selector` 可用：`LeasebasedSelector` 和 `LoadBasedSelector`。

### LeasebasedSelector [不推荐]

`LeasebasedSelector` 只是 `Selector` 的一个简单实现，但并不推荐。

它会对可用的 `Datanode`s 进行随机排序，然后返回列表。

### LoadBasedSelector

`LoadBasedSelector` 是 `Selector` 的另一种实现。

它根据负载对可用的 `Datanode`s 进行排序，然后返回一个已排序的 `Datanode` 列表。

## 配置

在启动 `Metasrv` 服务时，您可以配置 `Selector`，默认值是 `LoadBasedSelector`。

例如：

```shell
cargo run -- metasrv start --selector load_based
```

```shell
cargo run -- metasrv start --selector lease_based
```
