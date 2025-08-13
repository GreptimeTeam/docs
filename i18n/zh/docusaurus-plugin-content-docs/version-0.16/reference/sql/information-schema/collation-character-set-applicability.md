---
keywords: [COLLATION_CHARACTER_SET_APPLICABILITY 表, 排序规则, 字符集, SQL 查询, 数据库适用性]
description: 介绍了 GreptimeDB 中排序规则与字符集的适用性，包括如何在 SQL 查询中使用这些规则和字符集。
---

# COLLATION_CHARACTER_SET_APPLICABILITY

`COLLATION_CHARACTER_SET_APPLICABILITY` 表示了每个排序规则适用的字符集。

```sql
USE INFORMATION_SCHEMA;

SELECT * FROM COLLATION_CHARACTER_SET_APPLICABILITY;
```

结果如下：

```sql
+----------------+--------------------+
| collation_name | character_set_name |
+----------------+--------------------+
| utf8_bin       | utf8               |
+----------------+--------------------+
```

结果中的列：

* `collation_name`：排序规则名称。
* `character_set_name`：与排序规则关联的字符集名称。
