---
keywords: [COLLATIONS 表, 排序规则, 字符集, SQL 查询, 数据库排序]
description: 介绍了 GreptimeDB 中字符集的排序规则，包括排序规则的定义、使用方法和相关的 SQL 查询示例。
---

# COLLATIONS

`COLLATIONS` 提供了每个字符集的排序规则信息。

```sql
USE INFORMATION_SCHEMA;

SELECT * FROM COLLATIONS;
```

结果如下：

```sql
+----------------+--------------------+------+------------+-------------+---------+
| collation_name | character_set_name | id   | is_default | is_compiled | sortlen |
+----------------+--------------------+------+------------+-------------+---------+
| utf8_bin       | utf8               |    1 | Yes        | Yes         |       1 |
+----------------+--------------------+------+------------+-------------+---------+
```

表中有这些列：

* `collation_name`：排序规则名称。
* `character_set_name`：字符集名称。
* `id`：排序规则 ID。
* `is_default`：是否为字符集的默认排序规则。
* `is_compiled`：字符集是否已编译到系统中。
* `sortlen`：以字符集表示的字符串排序所需的最小内存量。
