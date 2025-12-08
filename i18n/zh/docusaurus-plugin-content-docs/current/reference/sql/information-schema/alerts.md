---
keywords: [alerts, alert instance, trigger, alerting rules]
description: 提供由 Trigger 生成的告警实例信息，包括标签、时间戳、状态等详情。
---

# Alerts

`ALERTS` 表用于展示由 Trigger 生成的所有告警实例的信息。

```sql
DESC TABLE INFORMATION_SCHEMA.ALERTS;
```

```sql
+--------------+---------------------+------+------+---------+---------------+
| Column       | Type                | Key  | Null | Default | Semantic Type |
+--------------+---------------------+------+------+---------+---------------+
| trigger_id   | UInt64              |      | NO   |         | FIELD         |
| trigger_name | String              |      | NO   |         | FIELD         |
| labels       | Json                |      | NO   |         | FIELD         |
| annotations  | Json                |      | YES  |         | FIELD         |
| status       | String              |      | NO   |         | FIELD         |
| active_at    | TimestampNanosecond |      | NO   |         | FIELD         |
| fired_at     | TimestampNanosecond |      | YES  |         | FIELD         |
| resolved_at  | TimestampNanosecond |      | YES  |         | FIELD         |
| last_sent_at | TimestampNanosecond |      | YES  |         | FIELD         |
+--------------+---------------------+------+------+---------+---------------+
```

表中的列：

表字段说明

* `trigger_id`：生成该告警实例的 Trigger 的 id。
* `trigger_name`：生成该告警实例的 Trigger 的名称。
* `labels`：与告警实例关联的标签（key-value）集合。标签集合用于唯一标识一个告警
    实例。
* `annotations`：与告警实例关联的注解（key-value）集合。
* `status`：当前告警实例的状态。
* `active_at`：告警实例变为活跃的时间戳。
* `fired_at`：告警实例首次进入 `Firing` 状态的时间戳。
* `resolved_at`：告警实例被解决的时间戳。
* `last_sent_at`：最近一次发送通知的时间戳。
