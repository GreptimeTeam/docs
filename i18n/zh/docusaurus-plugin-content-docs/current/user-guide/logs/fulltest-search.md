---
keywords: [日志查询, GreptimeDB 查询语言, matches_term, 模式匹配, 查询语句示例]
description: 详细介绍如何利用 GreptimeDB 的查询语言对日志数据进行高效搜索和分析，包括使用 matches_term 函数进行精确匹配。
---

# 全文搜索

本文档详细介绍如何利用 GreptimeDB 的查询语言对日志数据进行高效搜索和分析。

GreptimeDB 支持通过 SQL 语句灵活查询数据。本节将介绍特定的搜索功能和查询语句，帮助你提升日志查询效率。

## 使用 `matches_term` 函数进行精确匹配

在 SQL 查询中，你可以使用 `matches_term` 函数执行精确的词语/短语匹配，这在日志分析中尤其实用。`matches_term` 函数支持对 `String` 类型列进行精确匹配。你也可以使用 `@@` 操作符作为 `matches_term` 的简写形式。下面是一个典型示例：

```sql
-- 使用 matches_term 函数
SELECT * FROM logs WHERE matches_term(message, 'error') OR matches_term(message, 'fail');

-- 使用 @@ 操作符（matches_term 的简写形式）
SELECT * FROM logs WHERE message @@ 'error' OR message @@ 'fail';
```

`matches_term` 函数专门用于精确匹配，使用方式如下：

- `text`：需要进行匹配的文本列，该列应包含 `String` 类型的文本数据。
- `term`：要匹配的词语或短语，遵循以下规则：
  - 区分大小写
  - 匹配项必须由非字母数字字符（包括空格、标点符号等）或文本开头/结尾界定
  - 支持完整词语匹配和短语匹配

## 查询语句示例

### 简单词语匹配

`matches_term` 函数执行精确词语匹配，这意味着它只会匹配由非字母数字字符或文本开头/结尾界定的完整词语。这对于在日志中查找特定的错误消息或状态码特别有用。

```sql
-- 使用 matches_term 函数
SELECT * FROM logs WHERE matches_term(message, 'error');

-- 使用 @@ 操作符
SELECT * FROM logs WHERE message @@ 'error';
```

此查询将返回所有 `message` 列中包含完整词语 "error" 的记录。该函数确保你不会得到部分匹配或词语内的匹配。

匹配和不匹配的示例：
- ✅ "An error occurred!" - 匹配，因为 "error" 是一个完整词语
- ✅ "Critical error: system failure" - 匹配，因为 "error" 由空格和冒号界定
- ✅ "error-prone" - 匹配，因为 "error" 由连字符界定
- ❌ "errors" - 不匹配，因为 "error" 是更大词语的一部分
- ❌ "error123" - 不匹配，因为 "error" 后面跟着数字
- ❌ "errorLogs" - 不匹配，因为 "error" 是驼峰命名词语的一部分

### 多关键词搜索

你可以使用 `OR` 运算符组合多个 `matches_term` 条件来搜索包含多个关键词中任意一个的日志。当你想要查找可能包含不同错误变体或不同类型问题的日志时，这很有用。

```sql
-- 使用 matches_term 函数
SELECT * FROM logs WHERE matches_term(message, 'critical') OR matches_term(message, 'error');

-- 使用 @@ 操作符
SELECT * FROM logs WHERE message @@ 'critical' OR message @@ 'error';
```

此查询将查找包含完整词语 "critical" 或 "error" 的日志。每个词语都是独立匹配的，结果包括匹配任一条件的日志。

匹配和不匹配的示例：
- ✅ "critical error: system failure" - 匹配两个词语
- ✅ "An error occurred!" - 匹配 "error"
- ✅ "critical failure detected" - 匹配 "critical"
- ❌ "errors" - 不匹配，因为 "error" 是更大词语的一部分
- ❌ "critical_errors" - 不匹配，因为词语是更大词语的一部分

### 排除条件搜索

你可以使用 `NOT` 运算符与 `matches_term` 结合来从搜索结果中排除某些词语。当你想要查找包含一个词语但不包含另一个词语的日志时，这很有用。

```sql
-- 使用 matches_term 函数
SELECT * FROM logs WHERE matches_term(message, 'error') AND NOT matches_term(message, 'critical');

-- 使用 @@ 操作符
SELECT * FROM logs WHERE message @@ 'error' AND NOT message @@ 'critical';
```

此查询将查找包含词语 "error" 但不包含词语 "critical" 的日志。这对于过滤掉某些类型的错误或专注于特定的错误类别特别有用。

匹配和不匹配的示例：
- ✅ "An error occurred!" - 匹配，因为它包含 "error" 但不包含 "critical"
- ❌ "critical error: system failure" - 不匹配，因为它包含两个词语
- ❌ "critical failure detected" - 不匹配，因为它包含 "critical"

### 多条件必要搜索

你可以使用 `AND` 运算符要求日志消息中必须存在多个词语。这对于查找包含特定词语组合的日志很有用。

```sql
-- 使用 matches_term 函数
SELECT * FROM logs WHERE matches_term(message, 'critical') AND matches_term(message, 'error');

-- 使用 @@ 操作符
SELECT * FROM logs WHERE message @@ 'critical' AND message @@ 'error';
```

此查询将查找同时包含完整词语 "critical" 和 "error" 的日志。两个条件都必须满足，日志才会包含在结果中。

匹配和不匹配的示例：
- ✅ "critical error: system failure" - 匹配，因为它包含两个词语
- ❌ "An error occurred!" - 不匹配，因为它只包含 "error"
- ❌ "critical failure detected" - 不匹配，因为它只包含 "critical"

### 短语匹配

`matches_term` 函数也可以匹配精确的短语，包括带空格的短语。这对于查找包含多个词语的特定错误消息或状态更新很有用。

```sql
-- 使用 matches_term 函数
SELECT * FROM logs WHERE matches_term(message, 'system failure');

-- 使用 @@ 操作符
SELECT * FROM logs WHERE message @@ 'system failure';
```

此查询将查找包含精确短语 "system failure" 的日志。整个短语必须完全匹配，包括词语之间的空格。

匹配和不匹配的示例：
- ✅ "Alert: system failure detected" - 匹配，因为短语被正确界定
- ✅ "system failure!" - 匹配，因为短语被正确界定
- ❌ "system-failure" - 不匹配，因为词语由连字符而不是空格分隔
- ❌ "system failure2023" - 不匹配，因为短语后面跟着数字

### 不区分大小写匹配

虽然 `matches_term` 默认区分大小写，但你可以通过在匹配前将文本转换为小写来实现不区分大小写的匹配。

```sql
-- 使用 matches_term 函数
SELECT * FROM logs WHERE matches_term(lower(message), 'warning');

-- 使用 @@ 操作符
SELECT * FROM logs WHERE lower(message) @@ 'warning';
```

此查询将查找包含词语 "warning" 的日志，无论其大小写如何。`lower()` 函数在匹配前将整个消息转换为小写。

匹配和不匹配的示例：
- ✅ "Warning: high temperature" - 匹配，因为大小写转换后匹配
- ✅ "WARNING: system overload" - 匹配，因为大小写转换后匹配
- ❌ "warned" - 不匹配，因为它是不同的词语
- ❌ "warnings" - 不匹配，因为它是不同的词语
