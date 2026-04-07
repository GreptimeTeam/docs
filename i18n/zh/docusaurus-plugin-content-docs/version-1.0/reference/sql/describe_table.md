---
keywords: [SQL DESCRIBE TABLE 语句, 表结构描述, 列信息, 数据库表, SQL 示例]
description: DESCRIBE TABLE 用于描述数据库中表的结构，包括列名、类型、主键、是否为空、默认值和语义类型。
---

# DESCRIBE TABLE

`DESCRIBE [TABLE] [db.]table` 描述了 `db` 或当前使用的数据库中的表结构。

## 示例

描述表 `monitor`:

```sql
DESCRIBE TABLE monitor;
```

或者

```sql
DESCRIBE monitor;
```

```sql
```sql
+--------+----------------------+------+------+---------------------+---------------+
| Column | Type                 | Key  | Null | Default             | Semantic Type |
+--------+----------------------+------+------+---------------------+---------------+
| host   | String               | PRI  | YES  |                     | TAG           |
| ts     | TimestampMillisecond | PRI  | NO   | current_timestamp() | TIMESTAMP     |
| cpu    | Float64              |      | YES  | 0                   | FIELD         |
| memory | Float64              |      | YES  |                     | FIELD         |
+--------+----------------------+------+------+---------------------+---------------+
4 rows in set (0.00 sec)
```

结果中展示相应的表结构：

* `Column`: 列名
* `Type`: 列类型
* `Key`: `PRI` 表示该列在 `PRIMARY KEY` 约束里。
* `Null`: `YES` 表示可以为空，否则为 `NO`
* `Default`: 列的默认值
* `Semantic Type`：该列的语义类型，对应数据模型中的 `TAG`、`FIELD` 或 `TIMESTAMP`。
