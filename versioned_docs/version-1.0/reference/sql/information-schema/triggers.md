---
keywords: [triggers, trigger task, trigger definition]
description: Provides metadata about triggers, including name, ID, SQL definition, interval, labels, annotations, and related configurations.
---

# Triggers

:::tip NOTE

This feature is only available in the GreptimeDB Enterprise database.

:::

The `TRIGGERS` table provides metadata information about all triggers.

```sql
DESC TABLE INFORMATION_SCHEMA.TRIGGERS;
```

```sql
+-----------------+--------+------+------+---------+---------------+
| Column          | Type   | Key  | Null | Default | Semantic Type |
+-----------------+--------+------+------+---------+---------------+
| trigger_name    | String |      | NO   |         | FIELD         |
| trigger_id      | UInt64 |      | NO   |         | FIELD         |
| raw_sql         | String |      | NO   |         | FIELD         |
| interval        | UInt64 |      | NO   |         | FIELD         |
| labels          | Json   |      | YES  |         | FIELD         |
| annotations     | Json   |      | YES  |         | FIELD         |
| for             | UInt64 |      | YES  |         | FIELD         |
| keep_firing_for | UInt64 |      | YES  |         | FIELD         |
| channels        | Json   |      | YES  |         | FIELD         |
| flownode_id     | UInt64 |      | YES  |         | FIELD         |
+-----------------+--------+------+------+---------+---------------+
```

The columns in table:
* `trigger_name`: the name of the trigger.
* `trigger_id`: the id of the trigger.
* `raw_sql`: the SQL query executed periodically by the trigger.
* `interval`: the execution interval of the trigger, in seconds.
* `labels`: static key-value pairs defined through the `LABELS` clause.
* `annotations`: static key-value pairs defined through the `ANNOTATIONS` clause.
* `for`: how long an alert must remain active before it fires, in seconds.
* `keep_firing_for`: how long an alert instance should remain in the `Firing`
    state after it first enters that state, in seconds.
* `channels`: the notification channels used by the trigger.
* `flownode_id`: the id of the flownode responsible for executing the trigger.
