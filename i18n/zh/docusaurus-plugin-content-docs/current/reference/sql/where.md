---
keywords: [WHERE 子句, SQL 过滤, 逻辑运算符, 数字比较, 列表查找]
description: 介绍了 `WHERE` 子句的用法，包括逻辑运算符、数字比较和列表查找的示例。
---

# WHERE

`WHERE` 子句允许通过指定条件过滤数据。

## Syntax

```sql
SELECT *
FROM table_name
WHERE condition;
```

如果有 `WHERE` 子句，则它必须为布尔类型的表达式，这通常是带有比较和逻辑运算符的表达式。此表达式计算结果为 false 的行将会从进一步的转换或结果中排除。

## 示例

### 逻辑运算符

支持 `AND`、`OR` 作为逻辑运算符，并可以使用括号（）组合条件。

```sql
SELECT * FROM system_metrics
WHERE idc = 'idc0' AND (host = 'host1' OR host = 'host2');
```

### 数字

支持 `=`, `!=`, `>`, `>=`, `<`, `<=` 作为比较运算符。

```sql
SELECT * FROM system_metrics WHERE cpu_util = 20.0;
SELECT * FROM system_metrics WHERE cpu_util != 20.0;
SELECT * FROM system_metrics WHERE cpu_util > 20.0;
SELECT * FROM system_metrics WHERE cpu_util >= 20.0;
SELECT * FROM system_metrics WHERE cpu_util < 20.0;
SELECT * FROM system_metrics WHERE cpu_util <= 20.0;
```

### List 查找

List 子元素的匹配或不匹配。

### List 匹配

```sql
SELECT * FROM system_metrics WHERE idc IN ('idc_a', 'idc_b');
```

### List 不匹配

```sql
SELECT * FROM system_metrics WHERE idc NOT IN ('idc_a', 'idc_b');
```

### 字符串

对于字符串列，我们可以使用 `LIKE` 运算符在列中搜索指定的模式。 有两个通配符经常与 LIKE 运算符一起使用：
* 百分号 `%` 代表零个、一个或多个字符
* 下划线 `_` 代表单个字符

选择 `host` 列以字母 "a" 开头的所有记录：
```sql
SELECT * FROM system_metrics WHERE host LIKE 'a%';
```

从 `go_info` 表中选择 instance 列匹配模式 `'localhost:____'` 的所有记录，这意味着 `'localhost:'` 后面跟着恰好四个字符：

```sql
SELECT * FROM go_info
WHERE instance LIKE 'localhost:____';
```

有关在日志中搜索关键字，请阅读[查询日志](/user-guide/logs/query-logs.md)。