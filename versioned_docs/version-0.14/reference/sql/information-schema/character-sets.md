---
keywords: [character sets, SQL information schema, character set details, character set management, available character sets]
description: Provides details on the character sets available in the SQL information schema, including how to use and manage different character sets.
---

# CHARACTER_SETS

The `CHARACTER_SETS` provides the available character sets that GreptimeDB supports.

```sql
USE INFORMATION_SCHEMA;

SELECT * FROM CHARACTER_SETS;
```

The output is as follows:

```sql
+--------------------+----------------------+---------------+--------+
| character_set_name | default_collate_name | description   | maxlen |
+--------------------+----------------------+---------------+--------+
| utf8               | utf8_bin             | UTF-8 Unicode |      4 |
+--------------------+----------------------+---------------+--------+
```

The columns in the output:

* `character_set_name`: the name of the character set.
* `default_collate_name`: the default collation name of the character set.
* `description`: the description of the character set.
* `MAXLEN`: the maximum number of bytes required to store one character.