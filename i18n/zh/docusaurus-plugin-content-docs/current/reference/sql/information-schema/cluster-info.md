---
keywords: [CLUSTER_INFO 表, 集群信息, 节点信息, SQL查询, 数据库集群]
description: 提供了 GreptimeDB 集群信息的相关内容，包括集群状态、节点信息和相关的 SQL 查询示例。
---

# CLUSTER_INFO

`CLUSTER_INFO` 表提供了集群的节点拓扑信息。 


```sql
USE INFORMATION_SCHEMA;

DESC TABLE CLUSTER_INFO;
```

输出如下：

```sql
+--------------+----------------------+------+------+---------+---------------+
| Column       | Type                 | Key  | Null | Default | Semantic Type |
+--------------+----------------------+------+------+---------+---------------+
| peer_id      | Int64                |      | NO   |         | FIELD         |
| peer_type    | String               |      | NO   |         | FIELD         |
| peer_addr    | String               |      | YES  |         | FIELD         |
| cpus         | UInt32               |      | NO   |         | FIELD         |
| memory_bytes | UInt64               |      | NO   |         | FIELD         |
| version      | String               |      | NO   |         | FIELD         |
| git_commit   | String               |      | NO   |         | FIELD         |
| start_time   | TimestampMillisecond |      | YES  |         | FIELD         |
| uptime       | String               |      | YES  |         | FIELD         |
| active_time  | String               |      | YES  |         | FIELD         |
| node_status  | String               |      | YES  |         | FIELD         |
+--------------+----------------------+------+------+---------+---------------+
```


每个列的含义：

* `peer_id`: 节点的服务器 ID。对于 standalone 来讲，该字段总是为 `0`，对于集群模式下的 frontend 该字段总为 `-1`。因为在这两种情况下，该字段没有实际含义。
* `peer_type`: 节点类型，分布式集群里可能是 `METASRV`、`FRONTEND` 或者 `DATANODE`。单机模式显示为 `STANDALONE`。
* `peer_addr`: 节点的 gRPC 服务地址。对于单机部署，该字段总为空。
* `cpus`: 节点的 CPU 数量。
* `memory_bytes`: 节点的内存大小。
* `version`: 节点的版本号，形如 `0.7.2` 的字符串。
* `git_commit`: 节点编译的 git 版本号。
* `start_time`: 节点的启动时间。
* `uptime`: 节点的持续运行时间，形如 `24h 10m 59s 150ms` 的字符串。
* `active_time`: 距离节点上一次活跃（也就是发送心跳请求）过去的时间，形如 `24h 10m 59s 150ms` 的字符串。单机模式下该字段总为空。
* `node_status`: 节点的状态信息。

尝试查询下这张表：

```sql
SELECT * FROM CLUSTER_INFO;
```

一个单机模式的样例输出：

```sql
+---------+------------+-----------+------+--------------+---------+-----------+----------------------------+--------+-------------+-------------+
| peer_id | peer_type  | peer_addr | cpus | memory_bytes | version | git_commit| start_time                 | uptime | active_time | node_status |
+---------+------------+-----------+------+--------------+---------+-----------+----------------------------+--------+-------------+-------------+
| 0       | STANDALONE |           | 16   | 17179869184  | 0.7.2   | 86ab3d9   | 2024-04-30T06:40:02.074    | 18ms   |             | NULL        |
+---------+------------+-----------+------+--------------+---------+-----------+----------------------------+--------+-------------+-------------+
```

另一个输出来自一个分布式集群，它有三个 Datanode、一个 Frontend 和一个 Metasrv：

```sql
+---------+-----------+----------------+------+--------------+---------+-----------+----------------------------+----------+-------------+-------------------------------------------------------------------+
| peer_id | peer_type | peer_addr      | cpus | memory_bytes | version | git_commit| start_time                 | uptime   | active_time | node_status                                                       |
+---------+-----------+----------------+------+--------------+---------+-----------+----------------------------+----------+-------------+-------------------------------------------------------------------+
| 1       | DATANODE  | 127.0.0.1:4101 | 16   | 17179869184  | 0.7.2   | 86ab3d9   | 2024-04-30T06:40:04.791    | 4s 478ms | 1s 467ms    | {"workloads":["hybrid"],"leader_regions":46,"follower_regions":0} |
| 2       | DATANODE  | 127.0.0.1:4102 | 16   | 17179869184  | 0.7.2   | 86ab3d9   | 2024-04-30T06:40:06.098    | 3s 171ms | 162ms       | {"workloads":["hybrid"],"leader_regions":46,"follower_regions":0} |
| 3       | DATANODE  | 127.0.0.1:4103 | 16   | 17179869184  | 0.7.2   | 86ab3d9   | 2024-04-30T06:40:07.425    | 1s 844ms | 1s 839ms    | {"workloads":["hybrid"],"leader_regions":46,"follower_regions":0} |
| -1      | FRONTEND  | 127.0.0.1:4001 | 16   | 17179869184  | 0.7.2   | 86ab3d9   | 2024-04-30T06:40:08.815    | 454ms    | 47ms        | NULL                                                              |
| 0       | METASRV   | 127.0.0.1:3002 | 16   | 17179869184  | unknown | unknown   |                            |          |             | {"is_leader":true}                                                |
+---------+-----------+----------------+------+--------------+---------+-----------+----------------------------+----------+-------------+-------------------------------------------------------------------+
```


