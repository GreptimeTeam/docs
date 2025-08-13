---
keywords: [table constraints, SQL, database constraints, constraint properties, constraint types]
description: Describes which tables have constraints, including details about each constraint's catalog, schema, name, type, and enforcement status.
---

# TABLE_CONSTRAINTS

The `TABLE_CONSTRAINTS` table describes which tables have constraints.

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

The columns in the table:

* `CONSTRAINT_CATALOG`: The name of the catalog to which the constraint belongs. This value is always `def`.
* `CONSTRAINT_SCHEMA`: The name of the database to which the constraint belongs.
* `CONSTRAINT_NAME`: The name of the constraint, `TIME INDEX` or `PRIMARY`.
* `TABLE_NAME`: The name of the table.
* `CONSTRAINT_TYPE`: The type of the constraint. The value can be `TIME INDEX` or `PRIMARY KEY`. The `TIME INDEX` and `PRIMARY KEY` information is similar to the execution result of the `SHOW INDEX` statement.
* `enforced`:  Doesn't support `CHECK` constraints, the value is always` YES`.

```sql
select * from INFORMATION_SCHEMA.table_constraints WHERE table_name = 'monitor'\G;
```

The output:

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

