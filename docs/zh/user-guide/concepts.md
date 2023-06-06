# 相关概念

## 基础架构

![architecture](../public/architecture-2.png)

为了形成一个强大的数据库集群，并控制其复杂性，GreptimeDB 架构中有三个主要组成部分：Meta，Frontend 和 Datanodes。

- [**Meta**](../developer-guide/meta/overview.md) 控制着 GreptimeDB 集群的核心命令。在典型的部署结构中，至少需要三个节点才能建立一个可靠的 *Meta* 小集群。*Meta* 管理着数据库和表的信息，包括数据如何在集群中传递、请求的转发地址等。它还负责监测 `Datanode` 的可用性和性能，以确保路由表的最新状态和有效性。

- [**Frontend**](../developer-guide/frontend/overview.md) 作为无状态的组件，可以根据需求进行伸缩扩容。它负责接收请求并鉴权，将多种协议转化为 GreptimeDB 集群的内部协议，并根据 *Meta* 中的信息将请求转发到相应的 *Datanode*。

- [**Datanode**](../developer-guide/datanode/overview.md) 负责 GreptimeDB 集群中表和数据的存储，接收并执行从 *Frontend* 发来的读写请求。对本地开发来说，单实例的 *Datanode* 部署也可以当作 GreptimeDB 的单机模式来用。

## Objects

要了解 GreptimeDB 如何管理和服务其数据，你需要了解
这些概念。

### `Database`

类似于关系型数据库中的 *Database*，是业务数据集的最小单元。数据在这里可以被管理和计算。

### Table

GreptimeDB 中的 `Table` 与传统关系型数据库中的表相似，只是
它需要一个时间戳列。它可以通过 SQL 命令 `CREATE TABLE` 手动创建，也可以在写入数据时被自动创建。GreptimeDB 可以从写入的数据中推断表结构并自动创建 `Table`。
在分布式部署中，表可以被分区，每一个字数据集中会有不同的 `datanode`。

### Table region

分布式表的分区被称为 `region`。根据分区的算法，一个 `region` 会包含相应的连续数据序列。`region` 的信息被 `Meta` 模块管理，用户在发送请求时无需关心分区信息，`Meta` 会自动将请求转发到对应的分区。

### 数据类型

GreptimeDB 是强类型的数据库。[自动生成表结构](./write-data.md#automatic-schema-generation)功能也为创建 `Table` 提供了灵活性。创建 `Table` 成功后，同一列的数据必须使用相同的数据类型。

在[数据类型文档](../reference/data-types.md)中找到所有支持的数据类型。

## 阅读更多

从我们的博客文章中获取 GreptimeDB 路线图和架构设计：

* [专为实时而生 — GreptimeDB 现已在 GitHub 正式开源
](https://greptime.com/blogs/2022-11-15-this-time-for-real)
* [GreptimeDB 架构内幕：基于分布式、云原生原则设计，实现时序处理及分析融合](https://greptime.com/blogs/2022-12-08-GreptimeDB-internal-design)
* [GreptimeDB 存储引擎设计内幕：针对时序场景，检索压缩更智能](https://greptime.com/blogs/2022-12-21-storage-engine-design)
