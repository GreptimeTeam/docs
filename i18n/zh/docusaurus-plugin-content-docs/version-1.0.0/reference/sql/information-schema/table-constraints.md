---
keywords: [表约束, TABLE_CONSTRAINTS 表, SQL 约束, 数据库约束, 约束类型, 约束描述]
description: TABLE_CONSTRAINTS 表描述了哪些表具有约束及相关信息。
---

# TABLE_CONSTRAINTS

`TABLE_CONSTRAINTS` 表描述了哪些表具有约束（constraint）以及相关信息。

```sql
DESC INFORMATION_SCHEMA.table_constraints;
```

```sql
+--------------------+--------+------+------+---------+---------------+
| Column             | Type   | Key  | Null | Default | Semantic Type |
+--------------------+--------+------+------+---------+---------------+
| constraint_catalog | String |      | NO   |         | FIELD         |
| constraint_schema  | String |      | NO   |         | FIELD         |
| constraint_name    | String |      | NO   |         | FIELD         |
| table_schema       | String |      | NO   |         | FIELD         |
| table_name         | String |      | NO   |         | FIELD         |
| constraint_type    | String |      | NO   |         | FIELD         |
| enforced           | String |      | NO   |         | FIELD         |
+--------------------+--------+------+------+---------+---------------+
```

表中的列：

* `CONSTRAINT_CATALOG`: 约束所属 catalog 的名称。此值始终为 `def`。
* `CONSTRAINT_SCHEMA`: 约束所属数据库的名称。
* `CONSTRAINT_NAME`: 约束的名称，可以是 `TIME INDEX` 或 `PRIMARY`。
* `TABLE_NAME`: 表的名称。
* `CONSTRAINT_TYPE`: 约束的类型。值可以是 `TIME INDEX` 或 `PRIMARY KEY`。`TIME INDEX` 和 `PRIMARY KEY` 信息类似于 `SHOW INDEX` 语句的执行结果。
* `enforced`: 不支持 `CHECK` 约束，此值始终为 `YES`。

```sql
select * from INFORMATION_SCHEMA.table_constraints WHERE table_name = 'monitor'\G;
```

输出结果：

```sql
*************************** 1. row ***************************
constraint_catalog: def
 constraint_schema: public
   constraint_name: TIME INDEX
      table_schema: public
        table_name: monitor
   constraint_type: TIME INDEX
          enforced: YES
*************************** 2. row ***************************
constraint_catalog: def
 constraint_schema: public
   constraint_name: PRIMARY
      table_schema: public
        table_name: monitor
   constraint_type: PRIMARY KEY
          enforced: YES
```
