---
keywords: [数据类型转换, CAST 语句, SQL CAST, 类型转换, 数据类型, SQL 语法]
description: CAST 用于将一个数据类型的表达式转换为另一个数据类型。
---

# CAST

`CAST` 用于将一个数据类型的表达式转换为另一个数据类型。

## Syntax

```sql
CAST (expression AS data_type)
```

## 参数

- expression: 需要类型转换的表达式。
- data_type: 需要被转换为的数据类型。

# 示例

将字符串转换为 `INT` 类型：

 ```sql
 SELECT CAST('123' AS INT) ;
 ```

```sql
+-------------+
| Utf8("123") |
+-------------+
|         123 |
+-------------+
```
