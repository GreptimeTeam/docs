---
keywords: [region info, region metadata, manifest version, region state, SST format]
description: Provides runtime and manifest metadata for regions, including role and state, sequence numbers, manifest version, region options, SST format, and node ownership.
---

# REGION_INFO

The `REGION_INFO` table provides runtime and manifest metadata for Regions. Use it to inspect a Region's role and state, writable status, sequence numbers, manifest version, Region options, SST format, and the Datanode that reports the Region.

```sql
USE INFORMATION_SCHEMA;
DESC REGION_INFO;
```

The output is as follows:

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

Fields in the `REGION_INFO` table are described as follows:

- `region_id`: The ID of the Region.
- `table_id`: The ID of the table that the Region belongs to.
- `region_number`: The Region number inside the table.
- `region_group`: The Region group encoded in the Region ID.
- `region_sequence`: The Region sequence inside the group.
- `state`: The full runtime role and state of the Region. Possible values include `Follower`, `Leader(Writable)`, `Leader(Staging)`, `Leader(EnteringStaging)`, `Leader(Altering)`, `Leader(Dropping)`, `Leader(Truncating)`, `Leader(Editing)`, and `Leader(Downgrading)`.
- `role`: The coarse Region role, `Leader` or `Follower`.
- `writable`: Whether the Region accepts writes.
- `committed_sequence`: The committed sequence of the Region.
- `flushed_sequence`: The latest sequence persisted into SSTs. The value is `NULL` if no sequence has been flushed.
- `manifest_version`: The manifest version of the Region.
- `compaction_time_window`: The human-readable compaction time window of the Region.
- `region_options`: The Region options encoded as JSON.
- `sst_format`: The SST format used by the Region, such as `primary_key` or `flat`.
- `node_id`: The ID of the Datanode that reports the row. The value can be `NULL` when the row is not reported by a Datanode.

Query a table's Region runtime and manifest information as follows:

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


Query the maximum manifest version difference between leaders and followers as follows:

```sql
SELECT
  MAX(
    CAST(l.manifest_version AS INT64) - CAST(f.manifest_version AS INT64)
  ) AS max_manifest_version_diff
FROM REGION_INFO l
JOIN REGION_INFO f ON l.region_id = f.region_id
WHERE l.role = 'Leader' AND f.role = 'Follower';
```

To find the Region and Datanode pair with the largest manifest version difference, use the following query:

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
