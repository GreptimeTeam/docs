# ALTER

`ALTER` 可以用来修改表的设置或者表中的数据：

* 添加/删除列
* 重命名表

## Syntax

```sql
ALTER TABLE [db.]table
   [ADD COLUMN name type [options] 
    | DROP COLUMN name
    | RENAME name
   ]
```

## 示例

### 增加列

在表中增加新列：

```sql
ALTER TABLE monitor ADD COLUMN load_15 double;
```

列的定义和 [CREATE](./create.md) 中的定义方式一样。

我们可以设置新列的位置。比如放在第一位：

```sql
ALTER TABLE monitor ADD COLUMN load_15 double FIRST;
```

或者放在某个已有列之后：

```sql
ALTER TABLE monitor ADD COLUMN load_15 double AFTER memory;
```

增加一个带默认值的 Tag 列（加入 Primary key 约束）：
```sql
ALTER TABLE monitor ADD COLUMN app STRING DEFAULT 'shop' PRIMARY KEY;
```


### 移除列

从表中移除列：

```sql
ALTER TABLE monitor DROP COLUMN load_15;
```

后续的所有查询立刻不能获取到被移除的列。

### 重命名表

```sql
ALTER TABLE monitor RENAME monitor_new;
```

该命令只是重命名表，不会修改表中的数据。
