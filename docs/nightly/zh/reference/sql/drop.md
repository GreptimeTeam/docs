# DROP

## DROP TABLE

`DROP TABLE` 从数据库中删除表，它将删除该表的表定义和所有表数据、索引、规则和约束。

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
