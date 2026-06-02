---
keywords: [region info, region runtime, region manifest, committed sequence, flushed sequence]
description: Provides detailed region runtime and manifest metadata for inspection and debugging.
---

# REGION_INFO

The `REGION_INFO` table provides detailed runtime and manifest metadata for regions, useful for inspection and debugging.

```sql
USE INFORMATION_SCHEMA;
DESC REGION_INFO;
```

The output is as follows:

```sql
+------------------------+---------+------+------+---------+---------------+
| Column                 | Type    | Key  | Null | Default | Semantic Type |
+------------------------+---------+------+------+---------+---------------+
| region_id              | UInt64  |      | NO   |         | FIELD         |
| table_id               | UInt32  |      | NO   |         | FIELD         |
| region_number          | UInt32  |      | NO   |         | FIELD         |
| region_group           | UInt8   |      | NO   |         | FIELD         |
| region_sequence        | UInt32  |      | NO   |         | FIELD         |
| state                  | String  |      | NO   |         | FIELD         |
| role                   | String  |      | NO   |         | FIELD         |
| writable               | Boolean |      | NO   |         | FIELD         |
| committed_sequence     | UInt64  |      | NO   |         | FIELD         |
| flushed_sequence       | UInt64  |      | YES  |         | FIELD         |
| manifest_version       | UInt64  |      | NO   |         | FIELD         |
| compaction_time_window | String  |      | YES  |         | FIELD         |
| region_options         | String  |      | NO   |         | FIELD         |
| sst_format             | String  |      | NO   |         | FIELD         |
| node_id                | UInt64  |      | YES  |         | FIELD         |
+------------------------+---------+------+------+---------+---------------+
```

Fields in the `REGION_INFO` table are described as follows:

- `region_id`: The ID of the region.
- `table_id`: The ID of the table.
- `region_number`: The region number inside the table.
- `region_group`: The region group.
- `region_sequence`: The region sequence inside the group.
- `state`: The detailed runtime role/state label, such as `Leader(Writable)` or `Follower`.
- `role`: The coarse region role, such as `Leader` or `Follower`.
- `writable`: Whether the region accepts writes.
- `committed_sequence`: The committed sequence of the region.
- `flushed_sequence`: The latest sequence that has been persisted into SST files.
- `manifest_version`: The manifest version of the region.
- `compaction_time_window`: The human-readable compaction time window.
- `region_options`: Region options encoded as JSON.
- `sst_format`: The SST format used by the region.
- `node_id`: The datanode ID reporting this row.

Retrieve region info for a specific table as follows:

```sql
SELECT r.*
FROM REGION_INFO r
LEFT JOIN REGION_PEERS p ON r.region_id = p.region_id
WHERE p.table_name = 'region_info_case';
```
