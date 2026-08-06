---
keywords: [flows, flow task, flow definition, source table IDs, sink table name]
description: Provides the flow task information, including flow name, ID, definition, source table IDs, sink table name, and other details.
---

# FLOWS
The `Flows` table provides the flow task information.

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

The columns in table:

* `flow_name`: the flow task's name.
* `flow_id`: the flow task's id.
* `table_catalog`: the catalog this flow belongs to, named as `table_catalog` to keep consistent with the `INFORMATION_SCHEMA` standard.
* `flow_definition`: the flow task's definition. It's the SQL statement used to create the flow task.
* `comment`: the comment of the flow task.
* `expire_after`: the expire time of the flow task.
* `source_table_ids`: the source table ids of the flow task.
* `sink_table_name`: the sink table name of the flow task.
* `flownode_ids`: the flownode ids used by the flow task.
* `options`: extra options of the flow task.