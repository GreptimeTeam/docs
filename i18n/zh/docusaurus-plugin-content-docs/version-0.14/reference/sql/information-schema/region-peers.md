---
keywords: [Region 节点信息, REGION_PEERS 表, 节点状态, leader, learner]
description: REGION_PEERS 表显示 GreptimeDB 中单个 Region 节点的详细信息，例如它是 learner 还是 leader。
---

# REGION_PEERS

`REGION_PEERS` 表显示了 GreptimeDB 中单个 Region 节点的详细信息，例如它是 learner 还是 leader。

:::tip 注意
该表在 [GreptimeCloud](https://greptime.cloud/) 中不可用。
:::

```sql
USE INFORMATION_SCHEMA;
DESC REGION_PEERS;
```

结果如下：

```sql
+--------------+--------+------+------+---------+---------------+
| Column        | Type   | Key  | Null | Default | Semantic Type |
+---------------+--------+------+------+---------+---------------+
| table_catalog | String |      | NO   |         | FIELD         |
| table_schema  | String |      | NO   |         | FIELD         |
| table_name    | String |      | NO   |         | FIELD         |
| region_id     | UInt64 |      | NO   |         | FIELD         |
| peer_id       | UInt64 |      | YES  |         | FIELD         |
| peer_addr     | String |      | YES  |         | FIELD         |
| is_leader     | String |      | YES  |         | FIELD         |
| status        | String |      | YES  |         | FIELD         |
| down_seconds  | Int64  |      | YES  |         | FIELD         |
+---------------+--------+------+------+---------+---------------+
6 rows in set (0.00 sec)
```

`REGION_PEERS` 表中的字段描述如下：

- `table_catalog`：表所属的目录。
- `table_schema`：表所属的数据库。
- `table_name`：表的名称。
- `region_id`：Region 的 ID。
- `peer_id`：Region peer 的 ID。
- `peer_addr`：peer 的地址。
- `is_leader`：peer 是否为 leader。
- `status`：peer 的状态，`ALIVE` 或 `DOWNGRADED`。
  - `ALIVE`：peer 在线。
  - `DOWNGRADED`：Region peer 不可用（例如，已崩溃、网络断开），或者计划将 Region peer 迁移到另一个 peer。
- `down_seconds`：离线时长，单位为秒。
