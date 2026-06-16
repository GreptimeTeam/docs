---
keywords: [SQL REPLACE 语句, SQL 语法, SQL 示例, 插入记录, SQL 数据操作]
description: 描述在 GreptimeDB 中使用 SQL REPLACE 语句向表中添加记录的方法，包括语法和插入单条及多条记录的示例。
---

# REPLACE

`REPLACE` 语句用于向表中插入新记录。在 GreptimeDB 中，这个语句与 `INSERT` 语句完全相同。更多详情请参考 [`INSERT`](/reference/sql/insert.md)。

## `REPLACE INTO` 语句

### 语法

REPLACE INTO 语句的语法如下：

```sql
REPLACE INTO table_name (column1, column2, column3, ...)
VALUES (value1, value2, value3, ...);
```

### 示例

以下是使用 `REPLACE INTO` 语句向名为 `system_metrics` 的表中插入一条记录的示例：

```sql
REPLACE INTO system_metrics (host, idc, cpu_util, memory_util, disk_util, ts)
VALUES
    ("host1", "idc_b", 50.0, 66.7, 40.6, 1667446797462);
```

以下是使用 `REPLACE INTO` 语句向 `system_metrics` 表中插入多条记录的示例：

```sql
REPLACE INTO system_metrics (host, idc, cpu_util, memory_util, disk_util, ts)
VALUES
    ("host1", "idc_a", 11.8, 10.3, 10.3, 1667446797460),
    ("host2", "idc_a", 80.1, 70.3, 90.0, 1667446797461),
    ("host1", "idc_c", 50.1, 66.8, 40.8, 1667446797463);
```
