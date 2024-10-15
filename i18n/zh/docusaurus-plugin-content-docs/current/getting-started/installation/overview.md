# 概述

## 安装

根据以下说明安装 GreptimeDB：

- [GreptimeDB 单机模式](greptimedb-standalone.md)
- [GreptimeDB 分布式集群](greptimedb-cluster.md)

## 检查数据库状态

启动 GreptimeDB 后，你可以检查其状态以确保其正常运行。

```shell

curl http://localhost:4000/status

```

如果 GreptimeDB 实例正常运行，你将看到类似下面的响应：

```json

{
  "source_time": "2024-09-06T04:13:23Z",
  "commit": "506dc20765f892b3d7ad77af841f6bbf7c1a3892",
  "branch": "",
  "rustc_version": "rustc 1.80.0-nightly (72fdf913c 2024-06-05)",
  "hostname": "7189d0233448",
  "version": "0.9.3"
}

```

## 下一步

- [快速入门](./quick-start.md)：使用 MySQL 或 PostgreSQL 客户端在 GreptimeDB 中写入和查询数据。
