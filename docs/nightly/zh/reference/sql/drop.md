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

`DROP TABLE` 从数据库中删除表，它将删除该表的表定义和所有表数据、索引、规则和约束。

:::danger 危险操作

`DROP TABLE` 无法撤消。请谨慎使用！

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
