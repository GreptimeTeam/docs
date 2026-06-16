---
keywords: [Region 信息, Region 元数据, manifest 版本, Region 状态, SST 格式]
description: REGION_INFO 表提供 Region 的运行时和 manifest 元数据，包括角色和状态、序列号、manifest 版本、Region 选项、SST 格式以及节点归属。
---

# REGION_INFO

`REGION_INFO` 表提供 Region 的运行时和 manifest 元数据。你可以使用该表查看 Region 的角色和状态、是否可写、序列号、manifest 版本、Region 选项、SST 格式以及上报该 Region 的 Datanode。

```sql
USE INFORMATION_SCHEMA;
DESC REGION_INFO;
```

输出如下：

```sql
+------------------------+---------+-----+------+---------+---------------+
| Column                 | Type    | Key | Null | Default | Semantic Type |
+------------------------+---------+-----+------+---------+---------------+
| region_id              | UInt64  |     | NO   |         | FIELD         |
| table_id               | UInt32  |     | NO   |         | FIELD         |
| region_number          | UInt32  |     | NO   |         | FIELD         |
| region_group           | UInt8   |     | NO   |         | FIELD         |
| region_sequence        | UInt32  |     | NO   |         | FIELD         |
| state                  | String  |     | NO   |         | FIELD         |
| role                   | String  |     | NO   |         | FIELD         |
| writable               | Boolean |     | NO   |         | FIELD         |
| committed_sequence     | UInt64  |     | NO   |         | FIELD         |
| flushed_sequence       | UInt64  |     | YES  |         | FIELD         |
| manifest_version       | UInt64  |     | NO   |         | FIELD         |
| compaction_time_window | String  |     | YES  |         | FIELD         |
| region_options         | String  |     | NO   |         | FIELD         |
| sst_format             | String  |     | NO   |         | FIELD         |
| node_id                | UInt64  |     | YES  |         | FIELD         |
+------------------------+---------+-----+------+---------+---------------+
```

`REGION_INFO` 表中的字段描述如下：

- `region_id`: Region 的 ID。
- `table_id`: Region 所属表的 ID。
- `region_number`: Region 在表中的编号。
- `region_group`: Region ID 中编码的 Region 分组。
- `region_sequence`: Region 在分组内的序列号。
- `state`: Region 完整的运行时角色和状态。可能的值包括 `Follower`、`Leader(Writable)`、`Leader(Staging)`、`Leader(EnteringStaging)`、`Leader(Altering)`、`Leader(Dropping)`、`Leader(Truncating)`、`Leader(Editing)` 和 `Leader(Downgrading)`。
- `role`: Region 的粗粒度角色，可以是 `Leader` 或 `Follower`。
- `writable`: Region 是否接受写入。
- `committed_sequence`: Region 已提交的序列号。
- `flushed_sequence`: 已持久化到 SST 的最新序列号。如果尚未 flush，值为 `NULL`。
- `manifest_version`: Region 的 manifest 版本。
- `compaction_time_window`: Region 的可读 compaction 时间窗口。
- `region_options`: 以 JSON 编码的 Region 选项。
- `sst_format`: Region 使用的 SST 格式，例如 `primary_key` 或 `flat`。
- `node_id`: 上报该行的 Datanode ID。当该行不是由 Datanode 上报时，值可以为 `NULL`。

按如下方式查询某张表的 Region 运行时和 manifest 信息：

```sql
SELECT
  i.region_id,
  i.state,
  i.role,
  i.writable,
  i.committed_sequence,
  i.flushed_sequence,
  i.manifest_version,
  i.compaction_time_window,
  i.region_options,
  i.sst_format,
  i.node_id
FROM REGION_INFO i
WHERE i.region_id IN (
  SELECT region_id FROM REGION_PEERS WHERE table_name = 'system_metrics'
)
ORDER BY i.region_id;
```


按如下方式查询 Leader 与 Follower 之间最大的 manifest 版本差：

```sql
SELECT
  MAX(
    CAST(l.manifest_version AS INT64) - CAST(f.manifest_version AS INT64)
  ) AS max_manifest_version_diff
FROM REGION_INFO l
JOIN REGION_INFO f ON l.region_id = f.region_id
WHERE l.role = 'Leader' AND f.role = 'Follower';
```

如果需要找出 manifest 版本差最大的 Region 和 Datanode 组合，可以使用如下查询：

```sql
SELECT
  l.region_id,
  l.node_id AS leader_node_id,
  f.node_id AS follower_node_id,
  l.manifest_version AS leader_manifest_version,
  f.manifest_version AS follower_manifest_version,
  CAST(l.manifest_version AS INT64) - CAST(f.manifest_version AS INT64)
    AS manifest_version_diff
FROM REGION_INFO l
JOIN REGION_INFO f ON l.region_id = f.region_id
WHERE l.role = 'Leader' AND f.role = 'Follower'
ORDER BY manifest_version_diff DESC
LIMIT 1;
```
