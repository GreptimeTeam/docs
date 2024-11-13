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
    | MODIFY COLUMN name SET FULLTEXT [WITH <options>]
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

### 修改列全文索引选项

修改列的全文索引选项。

```sql
ALTER TABLE monitor MODIFY COLUMN load_15 SET FULLTEXT WITH (enable = 'true', analyzer = 'Chinese', case_sensitive = 'false');
```

使用 `FULLTEXT WITH` 可以指定以下选项：

- `enable`：设置全文索引是否启用，支持 `true` 和 `false`。默认为 `false`。
- `analyzer`：设置全文索引的分析器语言，支持 `English` 和 `Chinese`。默认为 `English`。
- `case_sensitive`：设置全文索引是否区分大小写，支持 `true` 和 `false`。默认为 `false`。

与 `CREATE TABLE` 一样，可以不带 `WITH` 选项，全部使用默认值。

修改列的全文索引选项时，列的数据类型必须是字符串类型。

当列的全文索引选项已经存在时，可以将 `enable` 设置为 `false` 来关闭全文索引，但不能修改其他选项；当列的全文索引选项不存在时，可以将 `enable` 设置为 `true` 来开启全文索引，并设置 `analyzer` 和 `case_sensitive` 选项。

### 重命名表

```sql
ALTER TABLE monitor RENAME monitor_new;
```

该命令只是重命名表，不会修改表中的数据。
