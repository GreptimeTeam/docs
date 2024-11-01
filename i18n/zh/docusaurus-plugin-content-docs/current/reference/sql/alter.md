# ALTER

`ALTER` 可以用来修改表的设置或者表中的数据：

* 添加/删除/修改列
* 重命名表

## Syntax

```sql
ALTER TABLE [db.]table
   [ADD COLUMN name type [options] 
    | DROP COLUMN name
    | MODIFY COLUMN name type
    | RENAME name
    | SET <option_name>=<option_value> [, ...]
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

### 修改列类型

修改列的数据类型

```sql
ALTER TABLE monitor MODIFY COLUMN load_15 STRING;
```

被修改的的列不能是 tag 列（primary key）或 time index 列，同时该列必须允许空值 `NULL` 存在来保证数据能够安全地进行转换（转换失败时返回 `NULL`）。

### 修改表的参数

`ALTER TABLE` 语句也可以用来更改表的选项。
当前支持修改以下表选项：
- `ttl`: 表数据的保留时间

```sql
ALTER TABLE monitor SET 'ttl'='1d';
```

### 重命名表

```sql
ALTER TABLE monitor RENAME monitor_new;
```

该命令只是重命名表，不会修改表中的数据。
