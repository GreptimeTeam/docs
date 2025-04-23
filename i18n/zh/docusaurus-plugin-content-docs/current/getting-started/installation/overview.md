---
keywords: [安装, 数据库健康检查, 单机模式, 分布式集群, 快速入门]
description: 介绍如何安装 GreptimeDB 以及启动后检查数据库健康状态的方法。
---

# 安装

根据以下说明安装 GreptimeDB：

- [GreptimeDB 单机模式](greptimedb-standalone.md)
- [GreptimeDB 分布式集群](greptimedb-cluster.md)

## 检查数据库健康状态

启动 GreptimeDB 后，你可以检查其状态以确保其正常运行。

```shell

curl http://localhost:4000/health

```

如果 GreptimeDB 实例正常运行，你将看到下面的响应：

```json
{}
```

## 下一步

- [快速入门](/getting-started/quick-start.md)：使用 MySQL 或 PostgreSQL 客户端在 GreptimeDB 中写入和查询数据。
