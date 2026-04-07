---
keywords: [核心概念, 数据库, 时序表, 数据类型, 索引, 视图, Flow]
description: 介绍 GreptimeDB 的核心概念，包括数据库、时序表、数据类型、索引、视图和 Flow 等。
---

# 核心概念

为了理解 GreptimeDB 如何管理和服务其数据，你需要了解这些 GreptimeDB 的构建模块。

## 数据库

类似于关系型数据库中的数据库，数据库是数据容器的最小单元，数据可以在这个单元中被管理和计算。
你可以利用数据库来实现数据隔离，形成类似租户的效果。

## Time-Series Table

GreptimeDB 将时序表设计为数据存储的基本单位。
其类似于传统关系型数据库中的表，但需要一个时间戳列（我们称之为 `TIME INDEX`—— **时间索引**），并且该表持有一组共享一个共同 schema 的数据。

表是行和列的集合：

* 行：表中水平方向的值的集合。
* 列：表中垂直方向的值的集合，GreptimeDB 将列分为时间索引 Time Index、标签 Tag 和字段 Field。

你使用 SQL `CREATE TABLE` 创建表，或者使用[自动生成表结构](/user-guide/ingest-data/overview.md#自动生成表结构)功能通过输入的数据结构自动创建表。在分布式部署中，一个表可以被分割成多个分区，其位于不同的数据节点上。

关于时序表的数据模型的更多信息，请参考[数据模型](./data-model.md)。

## Table Engine

表引擎（也称为存储引擎）决定了数据在数据库中的存储、管理和处理方式。每种引擎提供不同的功能特性、性能表现和权衡取舍。GreptimeDB 提供了 `mito` 和 `metric` 引擎，有关更多信息，请参阅[表引擎](/reference/about-greptimedb-engines.md)。

## Table Region

分布式表的每个分区被称为一个区域。一个区域可能包含一个连续数据的序列，这取决于分区算法，区域信息由 Metasrv 管理。这对发送写入和查询的用户来说是完全透明的。

## 数据类型

GreptimeDB 中的数据是强类型的，当创建表时，Auto-schema 功能提供了一些灵活性。当表被创建后，同一列的数据必须共享共同的数据类型。

在[数据类型](/reference/sql/data-types.md)中找到所有支持的数据类型。

## 索引

索引是一种性能调优方法，可以加快数据的更快地检索速度。
GreptimeDB 提供多种类型的[索引](/user-guide/manage-data/data-index.md)来加速查询。

## View

从 SQL 查询结果集派生的虚拟表。它像真实表一样包含行和列，但它本身不存储任何数据。
每次查询视图时，都会从底层表中动态检索视图中显示的数据。

## Flow

GreptimeDB 中的 Flow 是指[持续聚合](/user-guide/flow-computation/overview.md)过程，该过程根据传入数据持续更新和聚合数据。
