# 编写查询语句

本章节描述如何在 GreptimeDB 中编写连续聚合查询。
查询语句应该是一个带有聚合函数或非聚合函数（即 scalar 函数）的 `SELECT` 语句。

查询的语法如下：

```sql
SELECT AGGR_FUNCTION(column1, column2,..) FROM <source_table> GROUP BY TIME_WINDOW_FUNCTION();
```

`SELECT` 关键字后只允许两种表达式：
- 聚合函数：详细信息请参考 [表达式](./expression.md) 部分。
- 标量函数：如 `col`、`to_lowercase(col)`、`col + 1` 等。这部分与 GreptimeDB 中的普通 `SELECT` 子句相同。

查询应该有一个 `FROM` 子句来标识 source 表。由于不支持 join 子句，目前只能从单个表中聚合列。

`GROUP BY` 子句与普通查询中的工作方式相同。
它根据指定的列对数据进行分组。
`GROUP BY` 子句中使用的时间窗口函数 `hop()` 和 `tumble()` 在 [定义时间窗口](./define-time-window.md) 部分中有描述。
它们用于在聚合中定义时间窗口。
`GROUP BY` 中的其他表达式可以是 literal、列名或 scalar 表达式。

连续聚合查询不支持 `ORDER BY`、`LIMIT`、`OFFSET` 等其他操作。
