---
keywords: [SQL INSERT 语句, 插入数据, 多条记录插入, 默认值插入, 二进制数据插入, 特殊数值插入]
description: INSERT 用于将一条或多条记录插入到 GreptimeDB 中的表中，支持指定列名和使用默认值。
---

# INSERT

`INSERT` 用于将一条或多条记录插入到 GreptimeDB 中的表中。

## `INSERT INTO` Statement

### Syntax

`INSERT INTO` 语法如下：

```sql
INSERT INTO table_name (column1, column2, column3, ...)
VALUES (value1, value2, value3, ...);
```

在上述语法中，`table_name` 是要插入数据的表名，`column1`、`column2`、`column3` 等是表中的列名。
如果你想要插入数据到指定的列中，可以在 `INSERT INTO` 语句中指定列名。
如果你不指定列名，数据将会插入到表中的所有列中。

`VALUES` 关键字后面跟着的是一个值列表，这个值列表的顺序必须和 `INSERT INTO` 语句中的列顺序一致。

VALUES 值支持以下数据类型：

- `DEFAULT` 关键字指定该列的默认值。
这在你不想在插入记录时显式指定某些列的值时非常有用。
它允许使用表 schema 中定义的列默认值来替代需要显示指定的值。
如果该列没有定义默认值，将会使用数据库的默认值（通常是 NULL）。
- 使用十六进制字面值插入二进制字面值。
- 使用 `{Value}::{Type}` 语法将特殊的数值 `Infinity`、`-Infinity` 和 `NaN` 转换为指定的数值类型。

### 示例

#### 插入数据

使用 `INSERT INTO` 语句将一条记录插入到名为 `system_metrics` 的表中：

```sql
INSERT INTO system_metrics (host, idc, cpu_util, memory_util, disk_util, ts)
VALUES
    ("host1", "idc_b", 50.0, 66.7, 40.6, 1667446797462);
```

上述语句将一条记录插入到 `system_metrics` 表中，该记录的 host 为 "host1"，idc 为 "idc_b"，cpu_util 为 50.0，memory_util 为 66.7，

你还可以使用 `INSERT INTO` 语句一次向表中插入多条记录，例如向 `system_metrics` 表中插入多条记录：

```sql
INSERT INTO system_metrics (host, idc, cpu_util, memory_util, disk_util, ts)
VALUES
    ("host1", "idc_a", 11.8, 10.3, 10.3, 1667446797460),
    ("host2", "idc_a", 80.1, 70.3, 90.0, 1667446797461),
    ("host1", "idc_c", 50.1, 66.8, 40.8, 1667446797463);
```

此语句将三条记录插入到 `system_metrics` 表中，每列都有指定的值。

#### 使用默认值插入数据

下面的 SQL 语句使用 `DEFAULT` 关键字为 `cpu_util` 列插入默认值：

```sql
INSERT INTO system_metrics (host, idc, cpu_util, memory_util, disk_util, ts)
VALUES ("host1", "idc_a", DEFAULT, 10.3, 10.3, 1667446797460);
```

#### 插入二进制数据

当我们想要插入二进制数据时，其列的数据类型为 `blob` 或 `bytea`：

```sql
CREATE TABLE test(b BLOB, ts TIMESTAMP TIME INDEX);
```

推荐使用预编译语句，例如 JDBC：

```java
  PreparedStatement pstmt = conn.prepareStatement("insert into test values(?,?)");
  pstmt.setBytes(1, "hello".getBytes());
  pstmt.setInt(2, 1687867163);
  pstmt.addBatch();
  ......
  pstmt.executeBatch();
```

如果我们想要插入字面值的二进制数据，可以使用十六进制字面值：

```sql
INSERT INTO test VALUES(X'9fad5e9eefdfb449', 1687867163);
-- or --
INSERT INTO test VALUES(0x9fad5e9eefdfb449', 1687867163);
```

#### 插入特殊数字值

使用 `{Value}::{Type}` 将特殊的数值 `Infinity`、`-Infinity` 和 `NaN` 转换为指定的数值类型：

```sql
INSERT INTO system_metrics (host, idc, cpu_util, memory_util, disk_util, ts)
VALUES ("host1", "idc_a", 66.6, 'NaN'::double, 'Infinity'::double, 1667446797460);
```

## `INSERT INTO SELECT` Statement

`INSERT INTO SELECT` 语句用于将一张表中的数据复制到另一张表中。

### Syntax

`INSERT INTO SELECT` 的语法如下：

```sql
INSERT INTO table2 (column1, column2, ...)
SELECT column1, column2, ...
FROM table1;
```

在上述语法中，`table1` 是你想要从中复制数据的源表，`table2` 是你想要将数据插入的目标表。
`table1` 和 `table2` 需要有用于复制数据的拥有同样名称和数据类型的列。
`SELECT` 语句从源表中选择要插入的列。
如果在`INSERT INTO`语句中没有指定列名，那么数据将被插入到目标表的所有列中。

当你想要从一个表中复制数据到另一个表时，`INSERT INTO SELECT` 语句非常有用。例如归档或备份数据时，比起备份整个数据库并恢复，这种方式更加高效。

### 示例

```sql
INSERT INTO system_metrics2 (host, idc, cpu_util, memory_util, disk_util, ts)
SELECT host, idc, cpu_util, memory_util, disk_util, ts
FROM system_metrics;
```
