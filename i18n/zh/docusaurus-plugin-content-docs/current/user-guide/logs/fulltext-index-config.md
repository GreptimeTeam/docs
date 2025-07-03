---
keywords: [全文索引, tantivy, bloom, 分析器, 大小写敏感, 配置]
description: GreptimeDB 全文索引配置的完整指南，包括后端选择和其他配置选项。
---

# 全文索引配置

本文档提供了 GreptimeDB 全文索引配置的完整指南，包括后端选择和其他配置选项。

## 概述

GreptimeDB 提供全文索引功能以加速文本搜索操作。您可以在创建或修改表时配置全文索引，并提供各种选项以针对不同用例进行优化。有关 GreptimeDB 中不同类型索引（包括倒排索引和跳数索引）的概述，请参考[数据索引](/user-guide/manage-data/data-index)指南。

## 配置选项

在创建或修改全文索引时，您可以使用 `FULLTEXT INDEX WITH` 指定以下选项：

### 基本选项

- `analyzer`：设置全文索引的语言分析器
  - 支持的值：`English`、`Chinese`
  - 默认值：`English`
  - 注意：由于中文文本分词的复杂性，中文分析器构建索引需要的时间显著更长。建议仅在中文文本搜索是主要需求时使用。

- `case_sensitive`：决定全文索引是否区分大小写
  - 支持的值：`true`、`false`
  - 默认值：`false`
  - 注意：设置为 `true` 可能会略微提高区分大小写查询的性能，但会降低不区分大小写查询的性能。此设置不会影响 `matches_term` 查询的结果。

- `backend`：设置全文索引的后端实现
  - 支持的值：`bloom`、`tantivy`
  - 默认值：`bloom`

- `granularity`:（适用于 `bloom` 后端）每个过滤器覆盖的数据块大小。粒度越小，过滤效果越好，但索引大小会增加。
  - 支持的值：正整数
  - 默认值：`10240`

- `false_positive_rate`:（适用于 `bloom` 后端）错误识别块的概率。该值越低，准确性越高（过滤效果越好），但索引大小会增加。该值为介于 `0` 和 `1` 之间的浮点数。
  - 支持的值：介于 `0` 和 `1` 之间的浮点数
  - 默认值：`0.01`

### 后端选择

GreptimeDB 提供两种全文索引后端用于高效日志搜索：

1. **Bloom 后端**
   - 最适合：通用日志搜索
   - 特点：
     - 使用 Bloom 过滤器进行高效过滤
     - 存储开销较低
     - 在不同查询模式下性能稳定
   - 限制：
     - 对于高选择性查询稍慢
   - 存储成本示例：
     - 原始数据：约 10GB
     - Bloom 索引：约 1GB

2. **Tantivy 后端**
   - 最适合：高选择性查询（如 TraceID 等唯一值）
   - 特点：
     - 使用倒排索引实现快速精确匹配
     - 对高选择性查询性能优异
   - 限制：
     - 存储开销较高（接近原始数据大小）
     - 对低选择性查询性能较慢
   - 存储成本示例：
     - 原始数据：约 10GB
     - Tantivy 索引：约 10GB

### 性能对比

下表显示了不同查询方法之间的性能对比（以 Bloom 为基准）：

| 查询类型 | 高选择性（如 TraceID） | 低选择性（如 "HTTP"） |
|------------|----------------------------------|--------------------------------|
| LIKE       | 慢 50 倍                      | 1 倍                            |
| Tantivy    | 快 5 倍                       | 慢 5 倍                     |
| Bloom      | 1 倍（基准）                   | 1 倍（基准）                 |

主要观察结果：
- 对于高选择性查询（如唯一值），Tantivy 提供最佳性能
- 对于低选择性查询，Bloom 提供更稳定的性能
- Bloom 在存储方面比 Tantivy 有明显优势（测试案例中为 1GB vs 10GB）

## 配置示例

### 创建带全文索引的表

```sql
-- 使用 Bloom 后端（大多数情况推荐）
CREATE TABLE logs (
    timestamp TIMESTAMP(9) TIME INDEX,
    message STRING FULLTEXT INDEX WITH (
        backend = 'bloom',
        analyzer = 'English',
        case_sensitive = 'false'
    )
);

-- 使用 Tantivy 后端（用于高选择性查询）
CREATE TABLE logs (
    timestamp TIMESTAMP(9) TIME INDEX,
    message STRING FULLTEXT INDEX WITH (
        backend = 'tantivy',
        analyzer = 'English',
        case_sensitive = 'false'
    )
);
```

### 修改现有表

```sql
-- 在现有列上启用全文索引
ALTER TABLE monitor 
MODIFY COLUMN load_15 
SET FULLTEXT INDEX WITH (
    analyzer = 'English',
    case_sensitive = 'false',
    backend = 'bloom'
);

-- 更改全文索引配置
ALTER TABLE logs
MODIFY COLUMN message
SET FULLTEXT INDEX WITH (
    analyzer = 'English',
    case_sensitive = 'false',
    backend = 'tantivy'
);
```
