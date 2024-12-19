---
keywords: [Procedure 信息, PROCEDURE_INFO表, Procedure 类型, 时间戳, 锁定键]
description: PROCEDURE_INFO 表提供各种 Procedure 的详细信息。
---

# PROCEDURE_INFO

`PROCEDURE_INFO` 表提供了各种 Procedure 的详细信息。
:::tip NOTE
该表在 [GreptimeCloud](https://greptime.cloud/) 中不可用。
:::

```sql
DESC TABLE INFORMATION_SCHEMA.PROCEDURE_INFO;
```

```sql
+----------------+----------------------+------+------+---------+---------------+
| Column         | Type                 | Key  | Null | Default | Semantic Type |
+----------------+----------------------+------+------+---------+---------------+
| procedure_id   | String               |      | NO   |         | FIELD         |
| procedure_type | String               |      | NO   |         | FIELD         |
| start_time     | TimestampMillisecond |      | YES  |         | FIELD         |
| end_time       | TimestampMillisecond |      | YES  |         | FIELD         |
| status         | String               |      | NO   |         | FIELD         |
| lock_keys      | String               |      | YES  |         | FIELD         |
+----------------+----------------------+------+------+---------+---------------+
```

`PROCEDURE_INFO` 表中的字段描述如下：

- `procedure_id`: Procedure 的 ID。
- `procedure_type`: Procedure 的类型。
- `start_time`: Procedure 开始的时间戳。
- `end_time`: Procedure 结束的时间戳。
- `status`: Procedure 当前的状态。
- `lock_keys`: Procedure 锁定的键。