# GREPTIME_REGION_PEERS

The `GREPTIME_REGION_PEERS` table shows detailed information of a single Region node in GreptimeDB, such as whether it is a learner or leader.

:::tip NOTE
This table is not available on [GreptimeCloud](https://greptime.cloud/).
:::

```sql
USE INFORMATION_SCHEMA;
DESC GREPTIME_REGION_PEERS;
```

The output is as follows:

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

Fields in the `GREPTIME_REGION_PEERS` table are described as follows:

- `region_id`: The ID of the Region.
- `peer_id`: The ID of the Region peer.
- `peer_addr`: The address of the peer.
- `is_leader`: Whether the peer is the leader.
- `status`: The status of the peer, `ALIVE` or `DOWNGRADED`.
  - `ALIVE`: The peer is online.
  - `DOWNGRADED`: The Region peer is unavailable (e.g., crashed, network disconnected), or the Region peer was planned to migrate to another peer.
- `down_seconds`: The duration of being offline, in seconds.
