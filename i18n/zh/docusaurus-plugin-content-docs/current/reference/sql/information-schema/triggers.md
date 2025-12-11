---
keywords: [triggers, trigger task, trigger definition]
description: 提供 Trigger 的元数据信息，包括名称、ID、SQL 定义、执行间隔、标签、注解以及相关配置。
---

# Triggers

:::tip 注意

本功能仅在 GreptimeDB 企业版中可用。

:::

`TRIGGERS` 表用于展示所有已创建 Trigger 的元数据信息。

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

表中的列：

* `trigger_name`：Trigger 的名称。
* `trigger_id`：Trigger 的唯一 ID。
* `raw_sql`：Trigger 周期性执行的 SQL 查询。
* `interval`：Trigger 的执行间隔（单位：秒）。
* `labels`：通过 `LABELS` 子句定义的静态标签（key-value）。
* `annotations`：通过 `ANNOTATIONS` 子句定义的静态注解（key-value）。
* `for`：告警条件需持续满足多长时间（秒）后，告警实例才会进入 `Firing` 状态。
* `keep_firing_for`：告警实例进入 `Firing` 状态后，即使条件不再满足，仍保持
    `Firing` 状态的时长（秒）。
* `channels`：Trigger 配置的通知 channel 列表。
* `flownode_id`：负责执行该 Trigger 的 FlowNode id。
