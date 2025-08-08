---
keywords: [Trigger, Alert, GreptimeDB Enterprise, Reference]
description: This reference provides detailed information about the GreptimeDB Trigger.
---

# Syntax

## Show Triggers

Show all triggers:

```sql
SHOW TRIGGERS;
```

Show triggers by `like` pattern:

```sql
SHOW TRIGGERS LIKE '<pattern>';
```

For example:

```sql
SHOW TRIGGERS LIKE 'load%';
```

Show triggers by `where` condition:

```sql
SHOW TRIGGERS WHERE <condition>;
```

For example:

```sql
SHOW TRIGGERS WHERE name = 'load1_monitor';
```


## Drop Trigger

To delete a trigger, use the following `DROP TRIGGER` clause:

```sql
DROP TRIGGER [IF EXISTS] <trigger-name>;
```

For example:

```sql
DROP TRIGGER IF EXISTS load1_monitor;
```
