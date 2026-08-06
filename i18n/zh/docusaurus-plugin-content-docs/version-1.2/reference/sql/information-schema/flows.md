---
keywords: [Flow 任务信息, FLOWS 表, 任务定义, 过期时间, 源表 id]
description: FLOWS 表提供 Flow 任务的相关信息。
---

# FLOWS
`Flows` 表提供了 Flow 任务的相关信息。

```sql
DESC TABLE INFORMATION_SCHEMA.FLOWS;
```

```sql
      Column      |  Type  | Key | Null | Default | Semantic Type 
------------------+--------+-----+------+---------+---------------
 flow_name        | String |     | NO   |         | FIELD
 flow_id          | UInt32 |     | NO   |         | FIELD
 table_catalog    | String |     | NO   |         | FIELD
 flow_definition  | String |     | NO   |         | FIELD
 comment          | String |     | YES  |         | FIELD
 expire_after     | Int64  |     | YES  |         | FIELD
 source_table_ids | String |     | YES  |         | FIELD
 sink_table_name  | String |     | NO   |         | FIELD
 flownode_ids     | String |     | YES  |         | FIELD
 options          | String |     | YES  |         | FIELD
(10 rows)
```

表中的列：

* `flow_name`: Flow 任务的名称。
* `flow_id`: Flow 任务的 id。
* `table_catalog`: 该 Flow 所属的目录，命名为 `table_catalog` 以保持与 `INFORMATION_SCHEMA` 标准一致。
* `flow_definition`: Flow 任务的定义，是用于创建 Flow 任务的 SQL 语句。
* `comment`: Flow 任务的注释。
* `expire_after`: Flow 任务的过期时间。
* `source_table_ids`: Flow 任务的源表 id。
* `sink_table_name`: Flow 任务的目标表名称。
* `flownode_ids`: Flow 任务使用的 flownode id。
* `options`: Flow 任务的其他额外选项。