---
keywords: [INFORMATION_SCHEMA, recycle_bin, soft drop, dropped tables, undrop table]
description: Describes the RECYCLE_BIN table in INFORMATION_SCHEMA.
---

# RECYCLE_BIN

The `RECYCLE_BIN` table lists soft-dropped tables that are still eligible for restore.

```sql
USE INFORMATION_SCHEMA;
DESC RECYCLE_BIN;
```

The output is as follows:

```sql
+-----------------------+----------------------+-----+------+---------+---------------+
| Column                | Type                 | Key | Null | Default | Semantic Type |
+-----------------------+----------------------+-----+------+---------+---------------+
| object_id             | UInt64               |     | NO   |         | FIELD         |
| object_type           | String               |     | NO   |         | FIELD         |
| original_object_name  | String               |     | NO   |         | FIELD         |
| original_catalog_name | String               |     | NO   |         | FIELD         |
| original_schema_name  | String               |     | NO   |         | FIELD         |
| dropped_at            | TimestampMillisecond |     | YES  |         | FIELD         |
| dropped_by            | String               |     | YES  |         | FIELD         |
| retention_expires_at  | TimestampMillisecond |     | YES  |         | FIELD         |
| purge_status          | String               |     | NO   |         | FIELD         |
| restorable            | Boolean              |     | NO   |         | FIELD         |
| restored_at           | TimestampMillisecond |     | YES  |         | FIELD         |
| restored_by           | String               |     | YES  |         | FIELD         |
+-----------------------+----------------------+-----+------+---------+---------------+
```

Query dropped tables:

```sql
SELECT object_id,
       object_type,
       original_catalog_name,
       original_schema_name,
       original_object_name,
       dropped_at,
       retention_expires_at,
       purge_status,
       restorable
FROM information_schema.recycle_bin
WHERE original_schema_name = 'public';
```

The description of columns in the `RECYCLE_BIN` table is as follows:

- `object_id`: The ID of the dropped object. For tables, this is the original table ID.
- `object_type`: The type of the dropped object. The current value is `TABLE`.
- `original_object_name`: The original table name.
- `original_catalog_name`: The original catalog name.
- `original_schema_name`: The original database name.
- `dropped_at`: The timestamp when the table was soft-dropped. It can be `NULL` for legacy tombstones without lifecycle markers.
- `dropped_by`: The user that dropped the table. This field is reserved and is currently `NULL`.
- `retention_expires_at`: The fixed timestamp when the table becomes eligible for automatic purge. It can be `NULL` for legacy tombstones without lifecycle markers.
- `purge_status`: The purge status of the dropped object. Rows visible in the recycle bin use `ACTIVE`; tables already being purged are hidden.
- `restorable`: Whether the dropped object is eligible for `UNDROP TABLE`. Rows visible in the recycle bin are restorable.
- `restored_at`: The timestamp when the object was restored. This field is reserved and is currently `NULL` because restored objects no longer appear in the recycle bin.
- `restored_by`: The user that restored the object. This field is reserved and is currently `NULL`.

`information_schema.tables` only lists live tables. Use `information_schema.recycle_bin` to find soft-dropped tables and then restore them with `UNDROP TABLE` or permanently remove them with `ADMIN purge_table()`.
