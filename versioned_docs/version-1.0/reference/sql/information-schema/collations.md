---
keywords: [collations, character sets, SQL information schema, collation details, collation management]
description: Provides information about the collations available in the SQL information schema, including details on how to use and manage them.
---

# COLLATIONS

The `COLLATIONS` provides information about collations for each character set.

```sql
USE INFORMATION_SCHEMA;

SELECT * FROM COLLATIONS;
```

The output is as follows:

```sql
+----------------+--------------------+------+------------+-------------+---------+
| collation_name | character_set_name | id   | is_default | is_compiled | sortlen |
+----------------+--------------------+------+------------+-------------+---------+
| utf8_bin       | utf8               |    1 | Yes        | Yes         |       1 |
+----------------+--------------------+------+------------+-------------+---------+
```

The table has these columns:

* `collation_name`: the collation name.
* `character_set_name`: the name of the character set.
* `id`: the collation ID.
* `is_default`: Whether this collation is the default collation of the character set it belongs to.
* `is_compiled`: Whether the character set is compiled into the system.
* `sortlen`:  the minimum amount of memory required to sort strings expressed in the character set.