# GREPTIME_REGION_PEERS

`GREPTIME_REGION_PEERS` 表显示了 GreptimeDB 中单个 Region 节点的详细信息，例如它是 learner 还是 leader。

:::tip 注意
该表在 [GreptimeCloud](https://greptime.cloud/) 中不可用。
:::

```sql
USE INFORMATION_SCHEMA;
DESC GREPTIME_REGION_PEERS;
```

结果如下：

```sql
+--------------+--------+------+------+---------+---------------+
| Column       | Type   | Key  | Null | Default | Semantic Type |
+--------------+--------+------+------+---------+---------------+
| region_id    | UInt64 |      | NO   |         | FIELD         |
| peer_id      | UInt64 |      | YES  |         | FIELD         |
| peer_addr    | String |      | YES  |         | FIELD         |
| is_leader    | String |      | YES  |         | FIELD         |
| status       | String |      | YES  |         | FIELD         |
| down_seconds | Int64  |      | YES  |         | FIELD         |
+--------------+--------+------+------+---------+---------------+
6 rows in set (0.00 sec)
```

`GREPTIME_REGION_PEERS` 表中的字段描述如下：

- `region_id`：Region 的 ID。
- `peer_id`：Region peer 的 ID。
- `peer_addr`：peer 的地址。
- `is_leader`：peer 是否为 leader。
- `status`：peer 的状态，`ALIVE` 或 `DOWNGRADED`。
  - `ALIVE`：peer 在线。
  - `DOWNGRADED`：Region peer 不可用（例如，已崩溃、网络断开），或者计划将 Region peer 迁移到另一个 peer。
- `down_seconds`：离线时长，单位为秒。
