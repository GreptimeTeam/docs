---
keywords: [key column usage, key constraints, time index key, primary key]
description: Describes the key constraints of the columns, such as the time index key constraint.
---

# KEY_COLUMN_USAGE

The `KEY_COLUMN_USAGE` table describes the key constraints of the columns, such as the time index key constraint.

```sql
USE INFORMATION_SCHEMA;
DESC KEY_COLUMN_USAGE;
```

The output is as follows:

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

The description of columns in the `KEY_COLUMN_USAGE` table is as follows:

- `constraint_catalog`: The name of the catalog to which the constraint belongs. The value is always `def`.
- `constraint_schema`: The name of the database to which the constraint belongs.
- `constraint_name`: The name of the constraint.
- `table_catalog`: The name of the catalog to which the table with the constraint belongs. The value is always `def`.
- `real_table_catalog`: The real name of the catalog to which the table with the constraint belongs. The value is always `greptime`.
- `table_schema`: The name of the database to which the table belongs.
- `table_name`: The name of the table with the constraint.
- `column_name`: The name of the column with the constraint.
- `ordinal_position`: The position of the column in the constraint, rather than in the table. The position number starts from `1`.
- `position_in_unique_constraint`: The unique constraint and the primary key constraint are empty. For foreign key constraints, this column is the position of the referenced table's key.
- `referenced_table_schema`: The name of the schema referenced by the constraint. Currently in GreptimeDB, the value of this column in all constraints is `NULL`, except for the foreign key constraint.
- `referenced_table_name`: The name of the table referenced by the constraint. Currently in GreptimeDB, the value of this column in all constraints is `NULL`, except for the foreign key constraint.
- `referenced_column_name`: The name of the column referenced by the constraint. Currently in TiDB, the value of this column in all constraints is `NULL`, except for the foreign key constraint.

