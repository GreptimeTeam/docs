---
keywords: [collation applicability, character sets, SQL information schema, collation management, collation details]
description: Describes the applicability of collation character sets within the SQL information schema, detailing how they can be applied and managed.
---

# COLLATION_CHARACTER_SET_APPLICABILITY

The `COLLATION_CHARACTER_SET_APPLICABILITY` table indicates what character set is applicable for what collation.

```sql
USE INFORMATION_SCHEMA;

SELECT * FROM COLLATION_CHARACTER_SET_APPLICABILITY;
```

The output is as follows:

```sql
+----------------+--------------------+
| collation_name | character_set_name |
+----------------+--------------------+
| utf8_bin       | utf8               |
+----------------+--------------------+
```

The output has these columns:

* `collation_name`:  the collation name.
* `character_set_name`:  the name of the character set with which the collation is associated.
