---
keywords: [SQL COMMENT 语句, COMMENT ON TABLE, COMMENT ON COLUMN, COMMENT ON FLOW, SQL 语法, SQL 示例]
description: COMMENT 语句用于在 GreptimeDB 中为表、列和流添加或删除注释，包括语法和示例。
---

# COMMENT

`COMMENT` 语句用于为表、列和流添加或删除注释。注释提供的描述可以帮助记录数据库对象的用途和使用方法。

## COMMENT ON TABLE

`COMMENT ON TABLE` 用于为表添加或删除注释。

### 语法

```sql
COMMENT ON TABLE table_name IS { 'comment' | NULL }
```

- `table_name`: 要添加注释的表名。
- `'comment'`: 包含注释文本的字符串。
- `NULL`: 删除表的现有注释。

### 示例

为表添加注释：

```sql
COMMENT ON TABLE system_metrics IS 'System monitoring metrics collected every minute';
```

删除表的注释：

```sql
COMMENT ON TABLE system_metrics IS NULL;
```

使用 `SHOW CREATE TABLE` 查看表注释：

```sql
SHOW CREATE TABLE system_metrics;
```

也可以通过查询 `INFORMATION_SCHEMA.TABLES` 表的 `table_comment` 列来查看注释。

## COMMENT ON COLUMN

`COMMENT ON COLUMN` 用于为表的特定列添加或删除注释。

### 语法

```sql
COMMENT ON COLUMN table_name.column_name IS { 'comment' | NULL }
```

- `table_name`: 包含该列的表名。
- `column_name`: 要添加注释的列名。
- `'comment'`: 包含注释文本的字符串。
- `NULL`: 删除列的现有注释。

### 示例

为列添加注释：

```sql
COMMENT ON COLUMN system_metrics.cpu_usage IS 'CPU usage percentage (0-100)';
```

为多个列添加注释：

```sql
COMMENT ON COLUMN system_metrics.memory_usage IS 'Memory usage in bytes';
COMMENT ON COLUMN system_metrics.disk_usage IS 'Disk usage percentage';
```

删除列的注释：

```sql
COMMENT ON COLUMN system_metrics.cpu_usage IS NULL;
```

使用 `SHOW CREATE TABLE` 查看列注释：

```sql
SHOW CREATE TABLE system_metrics;
```

也可以通过查询 `INFORMATION_SCHEMA.COLUMNS` 表的 `column_comment` 列来查看列注释。

## COMMENT ON FLOW

`COMMENT ON FLOW` 用于为流添加或删除注释。

### 语法

```sql
COMMENT ON FLOW flow_name IS { 'comment' | NULL }
```

- `flow_name`: 要添加注释的流名称。
- `'comment'`: 包含注释文本的字符串。
- `NULL`: 删除流的现有注释。

### 示例

为流添加注释：

```sql
COMMENT ON FLOW temperature_monitoring IS 'Monitors temperature sensors and alerts on high values';
```

删除流的注释：

```sql
COMMENT ON FLOW temperature_monitoring IS NULL;
```

使用 `SHOW CREATE FLOW` 查看流注释：

```sql
SHOW CREATE FLOW temperature_monitoring;
```

也可以通过查询 `INFORMATION_SCHEMA.FLOWS` 表的 `comment` 列来查看流注释。

## 注意事项

- 注释作为元数据存储，不会影响表、列或流的行为或性能。
- 可以通过发出新的 `COMMENT ON` 语句来更新注释。
- 将注释设置为 `NULL` 会删除现有注释，如果注释不存在也不会产生错误。
- 注释对于记录数据库对象的用途特别有用，特别是在协作环境中。
