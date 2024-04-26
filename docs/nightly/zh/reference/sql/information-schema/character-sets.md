# CHARACTER_SETS

`CHARACTER_SETS` 提供了 GreptimeDB 支持的可用字符集。

```sql
USE INFORMATION_SCHEMA;

SELECT * FROM CHARACTER_SETS;
```

结果如下：

```sql
+--------------------+----------------------+---------------+--------+
| character_set_name | default_collate_name | description   | maxlen |
+--------------------+----------------------+---------------+--------+
| utf8               | utf8_bin             | UTF-8 Unicode |      4 |
+--------------------+----------------------+---------------+--------+
```

结果中的列：

* `character_set_name`：字符集的名称。
* `default_collate_name`：字符集的默认排序规则名称。
* `description`：字符集的描述。
* `MAXLEN`：存储一个字符所需的最大字节数。
