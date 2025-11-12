---
keywords: [企业版, 集群, 读副本, 管理, region, follower]
description: 在 GreptimeDB 企业版中管理读副本的概览、关键概念与操作指南。
---

# 管理读副本

本文介绍如何在 GreptimeDB 企业版中管理读副本，包括在表与 Region 级别添加/移除读副本、使用 `SHOW REGION` 查看副本分布，以及放置约束与性能最佳实践建议。

## 为表添加读副本

添加读副本只需一条 SQL：

```sql
ADMIN ADD_TABLE_FOLLOWER(<table_name>)
```

每个 Region 的 Follower 节点会基于 Datanode 的工作负载类型进行分配。**为获得最佳性能，强烈建议先[配置 Datanode 分组](/enterprise/deployments-administration/deploy-on-kubernetes/configure-datanode-groups.md)，将读与写工作负载分别放置在不同的 Datanode 组中。**

该函数的参数：

- `table_name`：需要添加读副本的表名。

示例步骤：

先启动一个包含 3 个 Datanode 的企业集群，然后建表：

```sql
CREATE TABLE foo (
  ts TIMESTAMP TIME INDEX,
  i INT PRIMARY KEY,
  s STRING,
) PARTITION ON COLUMNS ('i') (
  i <= 0,
  i > 0,
);
```

使用 `SHOW REGION` 查看当前 Region 分布：

```sql
SHOW REGION FROM foo;

+-------+---------------+------+--------+
| Table | Region        | Peer | Leader |
+-------+---------------+------+--------+
| foo   | 4398046511104 |    0 | Yes    |
| foo   | 4398046511105 |    1 | Yes    |
+-------+---------------+------+--------+
```

上述结果表明在 Datanode `0` 与 `1` 上各有一个写副本 Region。

接着添加读副本：

```sql
ADMIN ADD_TABLE_FOLLOWER('foo');
```

再次查看 Region 分布：

```sql
SHOW REGION FROM foo;

+-------+---------------+------------+--------+
| Table | Region        | Peer       | Leader |
+-------+---------------+------------+--------+
| foo   | 4398046511104 |          0 | Yes    |
| foo   | 4398046511104 | 4294967296 | No     |
| foo   | 4398046511105 |          1 | Yes    |
| foo   | 4398046511105 | 4294967297 | No     |
+-------+---------------+------------+--------+
```

现在可以看到读副本已经分配到 Peer `4294967296` 与 `4294967297` 上。

## 从表移除读副本

移除读副本同样只需一条 SQL：

```sql
ADMIN REMOVE_TABLE_FOLLOWER(<table_name>)
```

该函数参数：

- `table_name`：要移除读副本的表名。

该命令会从每个 Region 中移除**最近添加的**一个读副本。

示例，执行前：

```sql
SHOW REGION FROM foo;
+-------+---------------+------------+--------+
| Table | Region        | Peer       | Leader |
+-------+---------------+------------+--------+
| foo   | 4398046511104 |          0 | Yes    |
| foo   | 4398046511104 | 4294967296 | No     |
| foo   | 4398046511104 | 4294967297 | No     |
| foo   | 4398046511105 |          1 | Yes    |
| foo   | 4398046511105 | 4294967296 | No     |
| foo   | 4398046511105 | 4294967297 | No     |
+-------+---------------+------------+--------+
```

此时 Region `4398046511104` 与 `4398046511105` 各有两个读副本在 `4294967296`、`4294967297` 节点上。

执行：

```sql
ADMIN REMOVE_TABLE_FOLLOWER('foo');
+------------------------------------+
| ADMIN REMOVE_TABLE_FOLLOWER('foo') |
+------------------------------------+
|                                  0 |
+------------------------------------+
```

每个 Region 最近添加的读副本被移除：

- Region `4398046511104`：移除了 `4294967297` 节点上的读副本
- Region `4398046511105`：移除了 `4294967296` 节点上的读副本

结果：

```sql
SHOW REGION FROM foo;
+-------+---------------+------------+--------+
| Table | Region        | Peer       | Leader |
+-------+---------------+------------+--------+
| foo   | 4398046511104 |          0 | Yes    |
| foo   | 4398046511104 | 4294967296 | No     |
| foo   | 4398046511105 |          1 | Yes    |
| foo   | 4398046511105 | 4294967297 | No     |
+-------+---------------+------------+--------+
```

## 为 Region 添加读副本

```sql
ADMIN ADD_REGION_FOLLOWER(<region_id>, <datanode_id>)
```

参数说明：

- `region_id`：需要添加读副本的 Region ID。
- `datanode_id`：要承载该读副本的 Datanode ID。

同一 Datanode 上不能同时承载同一 Region 的写副本与读副本；且每个 Datanode 对同一 Region 仅能承载一个读副本。

示例：

```sql
-- 在 Datanode 2 上为 Region 4398046511104 添加一个读副本
ADMIN ADD_REGION_FOLLOWER(4398046511104, 2);
```

若目标 Datanode 已存在该 Region 的读副本，或该 Datanode 已存在该 Region 的写副本，则命令会被拒绝。

## 从 Region 移除读副本

```sql
ADMIN REMOVE_REGION_FOLLOWER(<region_id>, <datanode_id>)
```

参数说明：

- `region_id`：需要移除读副本的 Region ID。
- `datanode_id`：要移除的读副本所在的 Datanode ID。

示例：

```sql
-- 从 Datanode 2 上移除 Region 4398046511104 的读副本
ADMIN REMOVE_REGION_FOLLOWER(4398046511104, 2);
```

## 下一步

* [从读副本查询](/enterprise/read-replicas/query-read-replicas.md)


