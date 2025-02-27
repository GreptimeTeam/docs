---
keywords: [日志查询, GreptimeDB 查询语言, LIKE 运算符, 模式匹配, 查询语句示例]
description: 详细介绍如何利用 GreptimeDB 的查询语言对日志数据进行高效搜索和分析，包括使用 LIKE 运算符进行模式匹配。
---

# 日志查询

本文档详细介绍如何利用 GreptimeDB 的查询语言对日志数据进行高效搜索和分析。

## 概述

GreptimeDB 支持通过 SQL 语句灵活查询数据。本节将介绍特定的搜索功能和查询语句，帮助您提升日志查询效率。

## 使用 `LIKE` 运算符进行模式匹配

在 SQL 查询中，您可以使用 `LIKE` 运算符执行模式匹配，这在日志分析中尤其实用。`LIKE` 运算符支持对 `String` 类型列进行模式匹配。下面是一个典型示例：

```sql
SELECT * FROM logs WHERE message LIKE '%error%' OR message LIKE '%fail%';
```

`LIKE` 运算符专门用于模式匹配，使用方式如下：

- `column_name`：需要进行模式匹配的列，该列应包含 `String` 类型的文本数据。
- `pattern`：包含匹配模式的字符串，支持以下特殊通配符：
  - `%`：匹配零个或多个任意字符
  - `_`：精确匹配单个字符

## 查询语句示例

### 基础模式匹配

基础模式匹配可以查找特定的子字符串：

```sql
SELECT * FROM logs WHERE message LIKE '%Barack Obama%';
```

此查询将返回所有 `message` 列中包含 "Barack Obama" 字符串的记录。

### 多关键词搜索

若要查找包含 "Barack" 或 "Obama" 任一关键词的日志：

```sql
SELECT * FROM logs WHERE message LIKE '%Barack%' OR message LIKE '%Obama%';
```

### 排除条件搜索

如需查找包含 "apple" 但不包含 "fruit" 的记录，可结合使用 `LIKE` 和 `NOT LIKE`：

```sql
SELECT * FROM logs WHERE message LIKE '%apple%' AND message NOT LIKE '%fruit%';
```

### 多条件必要搜索

要查询同时包含 "apple" 和 "fruit" 的记录：

```sql
SELECT * FROM logs WHERE message LIKE '%apple%' AND message LIKE '%fruit%';
```

### 复杂模式匹配

你可以组合多个 `LIKE` 条件实现更复杂的搜索需求：

```sql
SELECT * FROM logs WHERE (message LIKE '%a%' AND message LIKE '%b%') OR message LIKE '%c%';
```

这将匹配同时包含 'a' 和 'b' 的记录，或者包含 'c' 的记录。
