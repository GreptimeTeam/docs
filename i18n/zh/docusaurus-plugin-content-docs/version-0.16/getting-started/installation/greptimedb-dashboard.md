---
keywords: [控制台, 数据可视化, 查询语言, SQL 查询, PromQL 查询]
description: 介绍 GreptimeDB 控制台的功能和使用方法，包括数据可视化和多种查询语言的支持。
---

# GreptimeDB 控制台

数据可视化在时间序列数据分析时发挥着关键作用。为了帮助用户充分利用 GreptimeDB 的各种功能，GreptimeDB 提供了一个简单的[控制台](https://github.com/GreptimeTeam/dashboard)。

自 GreptimeDB v0.2.0 版本以来，控制台已经默认嵌入到 GreptimeDB 的 binary 文件中。在启动 [GreptimeDB 单机版](greptimedb-standalone.md)或[分布式集群](greptimedb-cluster.md)后，可以通过 URL `http://localhost:4000/dashboard` 访问控制台。控制台支持多种查询语言，包括 [SQL 查询](/user-guide/query-data/sql.md)和 [PromQL 查询](/user-guide/query-data/promql.md)。

我们提供不同种类的图表，可以根据不同的场景进行选择。当用户有足够的数据时，图表的内容将更加丰富。

![line](/dashboard-line.png)
![scatter](/dashboard-scatter.png)

我们将持续开发和迭代这个开源项目，并计划将时间序列数据应用于监测、分析和其他相关领域的扩展。
