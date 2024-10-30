# PROCEDURE_INFO

`PROCEDURE_INFO` 表提供了各种 Procedure 的详细信息。


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

- `procedure`: Procedure 的 ID。
- `procedure_type`: Procedure 的类型。
- `start_time`: Procedure 开始的时间戳。
- `end_time`: Procedure 结束的时间戳。
- `status`: Procedure 当前的状态。
- `lock_keys`: Procedure 锁定的键。