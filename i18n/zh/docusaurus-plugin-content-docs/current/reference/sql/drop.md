---
keywords: [SQL DROP 语句, 删除数据库, 删除表, 删除视图, 删除流, SQL 示例]
description: DROP 用于删除数据库、表、流或视图，操作不可撤销，需谨慎使用。
---

# DROP

## DROP DATABASE

`DROP DATABASE` 用于删除数据库，它删除数据库的目录项并删除包含数据的目录。

:::danger 危险操作

`DROP DATABASE` 无法撤消。请谨慎使用！

:::

### 语法

```sql
DROP DATABASE [ IF EXISTS ] db_name
```

- `IF EXISTS`: 如果数据库不存在，则不抛出错误。
- `db_name`: 要删除的数据库的名称。

### 示例

删除名为 `test` 的数据库：

```sql
DROP DATABASE test;
```

## DROP TABLE

`DROP TABLE` 从数据库中删除表。默认情况下，它会删除该表的表定义和所有表数据、索引、规则和约束。如果在分布式集群中开启了 [soft-drop](/user-guide/deployments-administration/manage-data/soft-drop.md)，支持的表会进入 recycle bin，并且可以在 retention deadline 前恢复。

:::danger 危险操作

未开启 soft-drop 时，`DROP TABLE` 无法撤消。请谨慎使用！

:::

### 语法

```sql
DROP TABLE [ IF EXISTS ] table_name
```

- `IF EXISTS`: 如果表不存在，则不抛出错误。
- `table_name`: 要删除的表的名称。

### 示例

删除 `monitor` 表：
  
```sql
DROP TABLE monitor;
```

## UNDROP TABLE

`UNDROP TABLE` 用于从 recycle bin 中恢复 soft-dropped table。

### 语法

```sql
UNDROP TABLE table_name
```

- `table_name`: 要恢复的表名，可以是未限定、schema 限定或完整限定名称。

如果已经存在同名 live table，`UNDROP TABLE` 会失败。

### 示例

恢复当前数据库中的 `monitor` 表：

```sql
UNDROP TABLE monitor;
```

通过完整限定名恢复表：

```sql
UNDROP TABLE greptime.public.monitor;
```

## DROP FLOW

```sql
DROP FLOW [ IF EXISTS ] flow_name;
```

- `IF EXISTS`: 如果流不存在，则不抛出错误。
- `flow_name`: 要删除的流的名称。

```sql
DROP FLOW IF EXISTS test_flow;
```

```
Query OK, 0 rows affected (0.00 sec)
```

## DROP VIEW

```sql
DROP VIEW [ IF EXISTS ] view_name;
```

- `IF EXISTS`: 如果视图不存在，则不抛出错误。
- `view_name`: 要删除的视图的名称。

```sql
DROP VIEW IF EXISTS test_view;
```

```
Query OK, 0 rows affected (0.00 sec)
```

## DROP TRIGGER

请参考 [Trigger 语法](/reference/sql/trigger-syntax.md#drop-trigger)文档。
