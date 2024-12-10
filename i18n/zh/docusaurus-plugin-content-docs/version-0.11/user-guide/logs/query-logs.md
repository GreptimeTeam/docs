---
description: 介绍如何使用 GreptimeDB 提供的查询语言进行日志数据的搜索和分析，包括使用 MATCHES 函数进行全文搜索和配置全文索引。
---

# 查询日志

本文档介绍如何使用 GreptimeDB 提供的查询语言进行日志数据的搜索和分析。

## 查询概述

在 GreptimeDB 中，您可以通过 SQL 语句进行灵活的数据查询。本节将介绍如何使用特定的搜索函数和查询语句来优化您的日志查询。

## 使用 `MATCHES` 函数进行全文搜索

在 SQL 语句中，可以使用 `MATCHES` 函数来执行全文搜索，这对于日志分析尤其有用。`MATCHES` 函数支持对 `String` 类型的列进行全文搜索。以下是一个典型的使用示例：

```sql
SELECT * FROM logs WHERE MATCHES(message, 'error OR fail');
```

`MATCHES` 是一个专门用于全文搜索的函数，它接受两个参数：

- `column_name`：要进行全文搜索的列，该列包含文本数据，列的数据类型必须是 `String`。必须为此列建立[全文索引](#全文索引加速搜索)以优化查询。
- `search_query`：一个字符串，包含要搜索的关键词和操作符，详情请看下文中的[查询语句类型](#查询语句类型)。

## 查询语句类型

### 简单词项 (Simple Term)

简单的搜索词如下：

```sql
SELECT * FROM logs WHERE MATCHES(message, 'Barack Obama');
```

上述 `MATCHES` 中参数 `search_query` 的值 `Barack Obama` 将被视为 `Barack` 和 `Obama` 两个独立的词项，这意味着该查询将匹配包含 `Barack` 或 `Obama` 的所有行，等价于使用 `OR`：

```sql
SELECT * FROM logs WHERE MATCHES(message, 'Barack OR Obama');
```

### 否定词项 (Negative Term)

通过在词项前加上 `-` 符号，可以排除包含某些词的行。例如，查询包含 `apple` 但不包含 `fruit` 的行：

```sql
SELECT * FROM logs WHERE MATCHES(message, 'apple -fruit');
```

### 必需词项 (Must Term)

通过在词项前加上 `+` 符号，可以指定必须出现在搜索结果中的词项。例如，查询同时包含 `apple` 和 `fruit` 的行：

```sql
SELECT * FROM logs WHERE MATCHES(message, '+apple +fruit');
```

### 布尔操作符 (Boolean Operators)

布尔操作符能够指定搜索的条件逻辑。例如，`AND` 运算符要求搜索结果中同时包含多个词项，而 `OR` 运算符则要求结果中至少包含一个词项。在查询中，`AND` 运算符优先于 `OR` 运算符。因此，表达式 `a AND b OR c` 被解释为 `(a AND b) OR c`。例如：

```sql
SELECT * FROM logs WHERE MATCHES(message, 'a AND b OR c');
```

这意味着查询将匹配同时包含 `a` 和 `b` 的行，或者包含 `c` 的行。等价于：

```sql
SELECT * FROM logs WHERE MATCHES(message, '(+a +b) c');
```

### 短语词项 (Phrase Term)

使用引号 `" "` 包围的短语将作为整体进行匹配。例如，只匹配 `Barack` 后紧跟 `Obama` 的行：

```sql
SELECT * FROM logs WHERE MATCHES(message, '"Barack Obama"');
```

如果需要在短语中包含引号，可以使用反斜杠 `\` 进行转义：

```sql
SELECT * FROM logs WHERE MATCHES(message, '"He said \"hello\""');
```

## 全文索引加速搜索

全文索引是全文搜索的关键配置，尤其是在需要处理大量数据的搜索查询场景中。没有全文索引，搜索操作可能会非常缓慢，影响整体的查询性能和用户体验。您可以在创建表时直接通过 SQL 配置全文索引，或者通过 Pipeline 配置，确保搜索操作能够高效执行，即使是在数据量极大的情况下也能保持良好的性能。

### 通过 SQL 配置全文索引

您可以通过在列定义中指定 `FULLTEXT` 选项为某列创建全文索索引。下面是一个在 `message` 列上创建带有全文索引的表的示例：

```sql
CREATE TABLE `logs` (
  `message` STRING FULLTEXT,
  `time` TIMESTAMP TIME INDEX,
) WITH (
  append_mode = 'true'
);
```

更多详情，请参见[`FULLTEXT` 列选项](/reference/sql/create.md#fulltext-列选项)。

### 通过 Pipeline 配置全文索引

在 Pipeline 的配置中，可以[指定某列使用全文索引](./pipeline-config.md#index-字段)。以下是一个配置示例，其中 `message` 列被设置为全文索引：

```yaml
processors:
  - date:
      field: time
      formats:
        - "%Y-%m-%d %H:%M:%S%.3f"
      ignore_missing: true

transform:
  - field: message
    type: string
    index: fulltext
  - field: time
    type: time
    index: timestamp
```

#### 查看表结构

在数据写入后，可以通过 SQL 命令查看表结构，确认 `message` 列已经被设置为全文索引：

```sql
SHOW CREATE TABLE logs\G
*************************** 1. row ***************************
       Table: logs
Create Table: CREATE TABLE IF NOT EXISTS `logs` (
  `message` STRING NULL FULLTEXT WITH(analyzer = 'English', case_sensitive = 'false'),
  `time` TIMESTAMP(9) NOT NULL,
  TIME INDEX (`time`),
)

ENGINE=mito
WITH(
  append_mode = 'true'
)
```
