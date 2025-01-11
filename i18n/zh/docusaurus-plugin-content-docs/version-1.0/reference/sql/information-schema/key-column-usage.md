---
keywords: [键约束, KEY_COLUMN_USAGE 表, 时间索引键, 外键约束, 列位置]
description: KEY_COLUMN_USAGE 表描述列的键约束，例如时间索引键的约束。
---

# KEY_COLUMN_USAGE

`KEY_COLUMN_USAGE` 表描述列的键约束，例如时间索引键的约束。

```sql
USE INFORMATION_SCHEMA;
DESC KEY_COLUMN_USAGE;
```

结果如下：

```sql
+-------------------------------+--------+------+------+---------+---------------+
| Column                        | Type   | Key  | Null | Default | Semantic Type |
+-------------------------------+--------+------+------+---------+---------------+
| constraint_catalog            | String |      | NO   |         | FIELD         |
| constraint_schema             | String |      | NO   |         | FIELD         |
| constraint_name               | String |      | NO   |         | FIELD         |
| table_catalog                 | String |      | NO   |         | FIELD         |
| real_table_catalog            | String |      | NO   |         | FIELD         |
| table_schema                  | String |      | NO   |         | FIELD         |
| table_name                    | String |      | NO   |         | FIELD         |
| column_name                   | String |      | NO   |         | FIELD         |
| ordinal_position              | UInt32 |      | NO   |         | FIELD         |
| position_in_unique_constraint | UInt32 |      | YES  |         | FIELD         |
| referenced_table_schema       | String |      | YES  |         | FIELD         |
| referenced_table_name         | String |      | YES  |         | FIELD         |
| referenced_column_name        | String |      | YES  |         | FIELD         |
+-------------------------------+--------+------+------+---------+---------------+
```

```sql
SELECT * FROM key_column_usage WHERE table_schema='public' and table_name='monitor'\G
```

```sql
*************************** 1. row ***************************
           constraint_catalog: def
            constraint_schema: public
              constraint_name: TIME INDEX
                table_catalog: def
           real_table_catalog: greptime
                 table_schema: public
                   table_name: monitor
                  column_name: ts
             ordinal_position: 1
position_in_unique_constraint: NULL
      referenced_table_schema: NULL
        referenced_table_name: NULL
       referenced_column_name: NULL
*************************** 2. row ***************************
           constraint_catalog: def
            constraint_schema: public
              constraint_name: PRIMARY
                table_catalog: def
           real_table_catalog: greptime
                 table_schema: public
                   table_name: monitor
                  column_name: host
             ordinal_position: 1
position_in_unique_constraint: NULL
      referenced_table_schema: NULL
        referenced_table_name: NULL
       referenced_column_name: NULL
2 rows in set (0.02 sec)
```

`KEY_COLUMN_USAGE` 表中列的描述如下：

- `constraint_catalog`：约束所属的目录名称。该值始终为 `def`。
- `constraint_schema`：约束所属的数据库名称。
- `constraint_name`：约束的名称。
- `table_catalog`：表所属目录的名称。该值始终为 `def`。
- `real_table_catalog`：表所属目录的真实名称。该值始终为 `greptime`。
- `table_schema`：表所属的数据库名称。
- `table_name`：具有约束的表的名称。
- `column_name`：具有约束的列的名称。
- `ordinal_position`：列在约束中的位置，而不是在表中的位置。位置编号从 `1` 开始。
- `position_in_unique_constraint`：唯一约束和主键约束为空。对于外键约束，此列是引用表键的位置。
- `referenced_table_schema`：约束引用的数据库名称。目前在 GreptimeDB 中，除外键约束外，所有约束中此列的值均为 `NULL`。
- `referenced_table_name`：约束引用的表名称。目前在 GreptimeDB 中，除外键约束外，所有约束中此列的值均为 `NULL`。
- `referenced_column_name`：约束引用的列名称。目前在 GreptimeDB 中，除外键约束外，所有约束中此列的值均为 `NULL`。

