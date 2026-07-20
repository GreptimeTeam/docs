---
keywords: [INFORMATION_SCHEMA, recycle_bin, soft drop, dropped tables, undrop table]
description: 介绍 INFORMATION_SCHEMA 中的 RECYCLE_BIN 表。
---

# RECYCLE_BIN

`RECYCLE_BIN` 表列出仍可恢复的 soft-dropped table。

```sql
USE INFORMATION_SCHEMA;
DESC RECYCLE_BIN;
```

输出如下：

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

查询已删除表：

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

`RECYCLE_BIN` 表中的列说明如下：

- `object_id`: 已删除对象的 ID。对于表，该值是原始 table ID。
- `object_type`: 已删除对象类型。当前值为 `TABLE`。
- `original_object_name`: 原始表名。
- `original_catalog_name`: 原始 catalog 名称。
- `original_schema_name`: 原始数据库名称。
- `dropped_at`: 表被 soft-drop 的时间。对于没有 lifecycle marker 的旧 tombstone，该值可能为 `NULL`。
- `dropped_by`: 删除表的用户。该字段为预留字段，当前为 `NULL`。
- `retention_expires_at`: 表可被自动 purge 的固定时间。对于没有 lifecycle marker 的旧 tombstone，该值可能为 `NULL`。
- `purge_status`: 已删除对象的 purge 状态。Recycle bin 中可见的行使用 `ACTIVE`；已经进入 purge 流程的表会被隐藏。
- `restorable`: 已删除对象是否可通过 `UNDROP TABLE` 恢复。Recycle bin 中可见的行均可恢复。
- `restored_at`: 对象恢复时间。该字段为预留字段，当前为 `NULL`，因为已恢复对象不会继续出现在 recycle bin 中。
- `restored_by`: 恢复对象的用户。该字段为预留字段，当前为 `NULL`。

`information_schema.tables` 只列出 live tables。请使用 `information_schema.recycle_bin` 查找 soft-dropped table，并通过 `UNDROP TABLE` 恢复，或通过 `ADMIN purge_table()` 永久删除。
