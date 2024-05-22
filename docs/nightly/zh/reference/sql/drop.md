# DROP

## DROP DATABASE

`DROP DATABASE` 用于删除数据库，它删除数据库的目录项并删除包含数据的目录。
当你正在连接到目标数据库时无法执行该命令。
如果有其他人正在连接到目标数据库，需要使用下方描述的 `FORCE` 选项强制删除。

`DROP DATABASE` 无法撤消。请谨慎使用！

### 语法

```sql
DROP DATABASE [ IF EXISTS ] db_name [ [ WITH ] ( option [, ...] ) ]

where option can be:

    FORCE
```

- `IF EXISTS`: 如果数据库不存在，则不抛出错误。
- `db_name`: 要删除的数据库的名称。
- `FORCE`: 在删除数据库之前终止所有连接到目标数据库的会话。

### 示例

删除名为 `test` 的数据库：

```sql
DROP DATABASE test;
```

## DROP TABLE

`DROP TABLE` 从数据库中删除表，它将删除该表的表定义和所有表数据、索引、规则和约束。

`DROP TABLE` 无法撤消。请谨慎使用！

### 语法

```sql
DROP TABLE [ IF EXISTS ] table_name [, ...]
```

- `IF EXISTS`: 如果表不存在，则不抛出错误。
- `table_name`: 要删除的表的名称。

### 示例

删除表 `monitor` 和 `system_metrics`：
  
```sql
DROP TABLE monitor, system_metrics;
```
