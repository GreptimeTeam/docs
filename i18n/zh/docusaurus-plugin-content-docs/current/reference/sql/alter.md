---
keywords: [修改数据库, 修改表, ALTER 语句, SQL ALTER, 数据库设置, 表设置]
description: ALTER 用于修改数据库的设置、表的设置或表的元数据。
---

# ALTER

`ALTER` 可以用来修改数据库的设置，表的设置或表的元数据，包括：

* 修改数据库选项
* 添加/删除/修改列
* 设置/取消列默认值
* 重命名表
* 修改表选项

## ALTER DATABASE


`ALTER DATABASE` 语句可以用来修改数据库的选项。

### 语法

```sql
ALTER DATABASE db
   [SET <option_name>=<option_value> [, ...]
    | UNSET <option_name> [, ...]
   ]
```

当前支持修改以下数据库选项：
- `ttl`: 数据库中数据的默认保留时间。过期的数据会被异步删除。
   - 如果之前未设置 ttl，通过 `ALTER` 设置新的 ttl 后，超过保留时间的数据将被删除。
   - 如果之前已设置过 ttl，通过 `ALTER` 修改 ttl 后，新的保留时间将立即生效，超过新保留时间的数据将被删除。
   - 如果之前已设置过 ttl，通过 `ALTER` 取消 ttl 设置后，新增的数据将不会被删除，但已被删除的数据无法恢复。

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
   [ADD COLUMN name1 type1 [options], ADD COLUMN name2 type2 [options], ...
    | DROP COLUMN name
    | MODIFY COLUMN name type
    | MODIFY COLUMN name SET DEFAULT value
    | MODIFY COLUMN name DROP DEFAULT
    | MODIFY COLUMN name SET FULLTEXT INDEX [WITH <options>]
    | MODIFY COLUMN name UNSET FULLTEXT INDEX
    | RENAME name
    | SET <option_name>=<option_value> [, ...]
   ]
```


### 增加列

在表中增加新列：

```sql
ALTER TABLE monitor ADD COLUMN load_15 double;
```

列的定义和 [CREATE](./create.md) 中的定义方式一样。

我们可以在表中同时增加多个列：

```sql
ALTER TABLE monitor ADD COLUMN disk_usage double, ADD COLUMN disk_free double;
```

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

### 设置列默认值

为现有列设置默认值：

```sql
ALTER TABLE monitor MODIFY COLUMN load_15 SET DEFAULT 0.0;
```

设置字符串默认值：

```sql
ALTER TABLE monitor MODIFY COLUMN `status` SET DEFAULT 'active';
```

默认值将在插入新行时使用，当该列没有显式提供值时。

移除列的默认值：

```sql
ALTER TABLE monitor MODIFY COLUMN load_15 DROP DEFAULT;
```

移除默认值后，新行插入时需要显式提供该列的值，或者如果该列允许的话将使用 `NULL`。

### 修改表的参数

`ALTER TABLE` 语句也可以用来更改表的选项。
当前支持修改以下表选项：
- `ttl`: 表数据的保留时间。
- `compaction.twcs.time_window`: TWCS compaction 策略的时间窗口，其值是一个[时间范围字符段](/reference/time-durations.md)。
- `compaction.twcs.max_output_file_size`: TWCS compaction 策略的最大允许输出文件大小。
- `compaction.twcs.trigger_file_num`: 某个窗口内触发 compaction 的最小文件数量阈值。


```sql
ALTER TABLE monitor SET 'ttl'='1d';

ALTER TABLE monitor SET 'compaction.twcs.time_window'='2h';

ALTER TABLE monitor SET 'compaction.twcs.max_output_file_size'='500MB';

ALTER TABLE monitor SET 'compaction.twcs.trigger_file_num'='8';
```

### 移除表参数

```sql
ALTER TABLE monitor UNSET 'ttl';
```

### 创建列的索引

在列上启用倒排索引：

```sql
ALTER TABLE monitor MODIFY COLUMN host SET INVERTED INDEX;
```

启用列的全文索引：

```sql
ALTER TABLE monitor MODIFY COLUMN load_15 SET FULLTEXT INDEX WITH (analyzer = 'English', case_sensitive = 'false', backend = 'bloom');
```

在启用列的全文索引时，可以使用 `FULLTEXT INDEX WITH` 指定以下选项：

- `analyzer`：设置全文索引的分析器语言。支持的值为 `English` 和 `Chinese`。默认为 `English`。
- `case_sensitive`：设置全文索引是否区分大小写。支持的值为 `true` 和 `false`。默认为 `false`。
- `backend`：设置全文索引的后端实现。支持的值为 `bloom` 和 `tantivy`。默认为 `bloom`。
- `granularity`：（适用于 `bloom` 后端）每个过滤器覆盖的数据块大小。粒度越小，过滤效果越好，但索引大小会增加。默认为 `10240`。
- `false_positive_rate`：（适用于 `bloom` 后端）错误识别块的概率。该值越低，准确性越高（过滤效果越好），但索引大小会增加。该值为介于 `0` 和 `1` 之间的浮点数。默认为 `0.01`。

更多关于全文索引配置和性能对比的信息，请参考[全文索引配置指南](/user-guide/logs/fulltext-index-config.md)。

与 `CREATE TABLE` 一样，可以不带 `WITH` 选项，全部使用默认值。

启用列上的跳数索引：
```sql
ALTER TABLE monitor MODIFY COLUMN host SET SKIPPING INDEX WITH(granularity = 1024, type = 'BLOOM');
```

跳数索引的有效选项包括：
* `type`: 索引类型，目前仅支持 `BLOOM` 即布隆过滤器。
* `granularity`: （适用于 `BLOOM` 类型）每个过滤器覆盖的数据块大小。粒度越小，过滤效果越好，但索引大小会增加。默认为 `10240`。
* `false_positive_rate`: （适用于 `BLOOM` 类型）错误识别块的概率。该值越低，准确性越高（过滤效果越好），但索引大小会增加。该值为介于 `0` 和 `1` 之间的浮点数。默认为 `0.01`。

### 移除列的索引

语法如下：

```sql
ALTER TABLE [table] MODIFY COLUMN [column] UNSET [INVERTED | SKIPPING | FULLTEXT] INDEX;
```

例如，移除倒排索引：

```sql
ALTER TABLE monitor_pk MODIFY COLUMN host UNSET INVERTED INDEX;
```

移除跳数索引：

```sql
ALTER TABLE monitor_pk MODIFY COLUMN host UNSET SKIPPING INDEX;
```

移除全文索引：

```sql
ALTER TABLE monitor MODIFY COLUMN load_15 UNSET FULLTEXT INDEX;
```

修改列的全文索引选项时，列的数据类型必须是字符串类型。

当列的全文索引未开启过时，可以启用全文索引，并设置 `analyzer` 和 `case_sensitive` 选项；当列的全文索引选项已经启用时，可以关闭全文索引，**但不能修改选项，跳数索引也是如此**。

### 重命名表

```sql
ALTER TABLE monitor RENAME monitor_new;
```

该命令只是重命名表，不会修改表中的数据。
