# ALTER

`ALTER` 可以用来修改数据库的设置，表的设置或表的元数据，包括：

* 修改数据库选项
* 添加/删除/修改列
* 重命名表
* 修改表选项

## ALTER DATABASE


`ALTER DATABASE` 语句可以用来修改数据库的选项。

### 语法

```sql
ALTER TABLE [db.]table
   [ADD COLUMN name type [options] 
    | DROP COLUMN name
    | MODIFY COLUMN name type
    | MODIFY COLUMN name SET FULLTEXT [WITH <options>]
    | RENAME name
    | SET <option_name>=<option_value> [, ...]
    | UNSET <option_name>[, ...]
   ]
```

当前支持修改以下数据库选项：
- `ttl`: 数据库中数据的默认保留时间。

### 示例

#### 修改数据库中数据的默认保留时间

修改数据库中数据的默认保留时间为 1 天：

```sql
ALTER DATABASE db SET 'ttl'='1d';
```

取消数据库中数据的默认保留时间设置：

```sql
ALTER DATABASE db UNSET 'ttl';
```

## ALTER TABLE

## 语法

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

### 示例

#### 增加列

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


#### 移除列

从表中移除列：

```sql
ALTER TABLE monitor DROP COLUMN load_15;
```

后续的所有查询立刻不能获取到被移除的列。

#### 修改列类型

修改列的数据类型

```sql
ALTER TABLE monitor MODIFY COLUMN load_15 STRING;
```

被修改的的列不能是 tag 列（primary key）或 time index 列，同时该列必须允许空值 `NULL` 存在来保证数据能够安全地进行转换（转换失败时返回 `NULL`）。

#### 修改表的参数

`ALTER TABLE` 语句也可以用来更改表的选项。
当前支持修改以下表选项：
- `ttl`: 表数据的保留时间。
- `compaction.twcs.time_window`: TWCS compaction 策略的时间窗口。
- `compaction.twcs.max_output_file_size`: TWCS compaction 策略的最大允许输出文件大小。
- `compaction.twcs.max_active_window_runs`: TWCS compaction 策略的活跃窗口中最多允许的有序组数量。
- `compaction.twcs.max_inactive_window_runs`: TWCS compaction 策略的非活跃窗口中最多允许的有序组数量。
- `compaction.twcs.max_active_window_files`: TWCS compaction 策略的活跃窗口中最多允许的文件数量。
- `compaction.twcs.max_inactive_window_files`: TWCS compaction 策略的非活跃窗口中最多允许的文件数量。


```sql
ALTER TABLE monitor SET 'ttl'='1d';

ALTER TABLE monitor SET 'compaction.twcs.time_window'='2h';

ALTER TABLE monitor SET 'compaction.twcs.max_output_file_size'='500MB';

ALTER TABLE monitor SET 'compaction.twcs.max_inactive_window_files'='2';

ALTER TABLE monitor SET 'compaction.twcs.max_active_window_files'='2';

ALTER TABLE monitor SET 'compaction.twcs.max_active_window_runs'='6';

ALTER TABLE monitor SET 'compaction.twcs.max_inactive_window_runs'='6';
```

#### 移除设置过的表参数

```sql
ALTER TABLE monitor UNSET 'ttl';
```

#### 修改列全文索引选项

启用列的全文索引：

```sql
ALTER TABLE monitor MODIFY COLUMN load_15 SET FULLTEXT WITH (analyzer = 'Chinese', case_sensitive = 'false');
```

在启用列的全文索引时，可以使用 `FULLTEXT WITH` 可以指定以下选项：

- `analyzer`：设置全文索引的分析器语言，支持 `English` 和 `Chinese`。默认为 `English`。
- `case_sensitive`：设置全文索引是否区分大小写，支持 `true` 和 `false`。默认为 `false`。

与 `CREATE TABLE` 一样，可以不带 `WITH` 选项，全部使用默认值。

#### 关闭列的全文索引

```sql
ALTER TABLE monitor MODIFY COLUMN load_15 UNSET FULLTEXT;
```

修改列的全文索引选项时，列的数据类型必须是字符串类型。

当列的全文索引未开启过时，可以启用全文索引，并设置 `analyzer` 和 `case_sensitive` 选项；当列的全文索引选项已经启用时，可以关闭全文索引，**但不能修改选项**。

#### 重命名表

```sql
ALTER TABLE monitor RENAME monitor_new;
```

该命令只是重命名表，不会修改表中的数据。
