---
keywords: [procedure info, procedure ID, procedure type, status]
description: Provides detailed information about various procedures, including procedure ID, type, start and end time, status, and locked keys.
---

# PROCEDURE_INFO
The `PROCEDURE_INFO` table provides detailed information about various procedures.

:::tip NOTE
This table is not available on [GreptimeCloud](https://greptime.cloud/).
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

Fields in the `PROCEDURE_INFO` table are described as follows:

- `procedure_id`: The ID of the Procedure.
- `procedure_type`: The type of the Procedure.
- `start_time`: Timestamp indicating when the procedure started.
- `end_time`: Timestamp indicating when the procedure ended.
- `status`: Current status of the procedure.
- `lock_keys`: Keys locked by the procedure, if any.