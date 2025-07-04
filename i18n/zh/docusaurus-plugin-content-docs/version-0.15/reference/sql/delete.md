---
keywords: [SQL DELETE 语句, 删除行数据, 数据删除, SQL 示例, 数据库操作]
description: DELETE 用于从表中删除行数据，满足条件的行会立刻被标记，后续查询无法获取这些行数据。
---

# DELETE

`DELETE` 用于从表中删除行数据。

## Syntax

```sql
DELETE FROM [db.]table WHERE expr
```

上述命令从表 `[db.]table` 中删除满足 `expr` 的行。被删除的行会立刻被标记，后续的查询立刻不能获取到这些行数据。

## 示例

例如，有一个带有主键 `host` 的表：

```sql
CREATE TABLE monitor ( host STRING, ts TIMESTAMP, cpu DOUBLE DEFAULT 0, memory DOUBLE, TIME INDEX (ts), PRIMARY KEY(host)) ;
```

删除 host 为 `host1` 以及时间戳为 `1655276557000` 的行：

```sql
DELETE FROM monitor WHERE host = 'host1' and ts = 1655276557000;
```
