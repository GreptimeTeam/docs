---
keywords: [系统表, greptime private, pipelines, 慢查询]
description: greptime_private 数据库中系统表的概述。
---

# Greptime Private

GreptimeDB 将一些重要的内部信息以系统表的形式存储在 `greptime_private` 数据库中。与普通表类似，系统表也会持久化存储。用户可以通过系统表获取关键的系统配置和统计信息。

## 表

| 表名                                | 描述                                                     |
| ----------------------------------- | -------------------------------------------------------- |
| [`slow_queries`](./slow_queries.md) | 包含 GreptimeDB 的慢查询信息，包括查询语句、执行时间等。 |
