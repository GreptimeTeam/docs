---
keywords: [索引, 倒排索引, 跳数索引, 全文索引, 查询性能]
description: 了解 GreptimeDB 支持的各类索引，包括倒排索引、跳数索引和全文索引，以及如何合理使用这些索引来提升查询效率。
---

# 数据索引

GreptimeDB 提供了多种索引机制来提升查询性能。作为数据库中的核心组件，索引通过建立高效的数据检索路径，显著优化了数据的查询操作。

## 概述

在 GreptimeDB 中，索引是在表创建时定义的，其设计目的是针对不同的数据类型和查询模式来优化查询性能。目前支持的索引类型包括：

- 倒排索引（Inverted Index）
- 跳数索引（Skipping Index）
- 全文索引（Fulltext Index）

需要说明的是，本章节重点讨论数据值索引。虽然主键（PRIMARY KEY）和 TIME INDEX 也在某种程度上具有索引的特性，但不在本章讨论范围内。

## 索引类型

### 倒排索引

倒排索引主要用于优化 Tag 列的查询效率。它通过在唯一值和对应数据行之间建立映射关系，实现对特定标签值的快速定位。

Tag 列不会被自动建立倒排索引，
你需要考虑以下使用场景手动为 Tag 列建立倒排索引：
- 基于标签值的数据查询
- 字符串列的过滤操作
- Tag 列的精确查询

示例：
```sql
CREATE TABLE monitoring_data (
    host STRING INVERTED INDEX,
    region STRING PRIMARY KEY INVERTED INDEX,
    cpu_usage DOUBLE,
    `timestamp` TIMESTAMP TIME INDEX,
);
```

需要注意的是，当标签值的组合数（即倒排索引覆盖的列的笛卡尔积）非常大时，倒排索引可能会带来较高的维护成本，导致内存占用增加和索引体积膨胀。这种情况下，建议考虑使用跳数索引作为替代方案。

### 跳数索引

跳数索引是专为列式存储系统（如 GreptimeDB）优化设计的索引类型。它通过维护数据块内值域范围的元数据，使查询引擎能够在进行范围查询时快速跳过不相关的数据块。与其他索引相比，跳数索引的存储开销相对较小。

**适用场景：**
- 数据分布稀疏的场景，例如日志中的 MAC 地址
- 在大规模数据集中查询出现频率较低的值

示例：
```sql
CREATE TABLE sensor_data (
    domain STRING PRIMARY KEY,
    device_id STRING SKIPPING INDEX,
    temperature DOUBLE,
    `timestamp` TIMESTAMP TIME INDEX,
);
```

跳数索引支持 `WITH` 选项：
* `type`: 索引类型，目前仅支持 `BLOOM` 类型。
* `granularity`: （适用于 `BLOOM` 类型）每个过滤器覆盖的数据块大小。粒度越小，过滤效果越好，但索引大小会增加。默认为 `10240`。
* `false_positive_rate`: （适用于 `BLOOM` 类型）错误识别块的概率。该值越低，准确性越高（过滤效果越好），但索引大小会增加。该值为介于 `0` 和 `1` 之间的浮点数。默认为 `0.01`。

例如：

```sql
CREATE TABLE sensor_data (
    domain STRING PRIMARY KEY,
    device_id STRING SKIPPING INDEX WITH(type='BLOOM', granularity=1024, false_positive_rate=0.01),
    temperature DOUBLE,
    `timestamp` TIMESTAMP TIME INDEX,
);
```

然而，跳数索引无法处理复杂的过滤条件，并且其过滤性能通常不如倒排索引或全文索引。

### 全文索引

全文索引专门用于优化字符串列的文本搜索操作。它支持基于词的匹配和文本搜索功能，能够实现对文本内容的高效检索。你可以使用灵活的关键词、短语或模式匹配来查询文本数据。

**适用场景：**
- 文本内容搜索
- 模式匹配查询
- 大规模文本过滤

示例：
```sql
CREATE TABLE logs (
    message STRING FULLTEXT INDEX,
    `level` STRING PRIMARY KEY,
    `timestamp` TIMESTAMP TIME INDEX,
);
```

#### 配置选项

在创建或修改全文索引时，您可以使用 `FULLTEXT INDEX WITH` 指定以下选项：

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

#### 后端选择

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

#### 性能对比

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

#### 配置示例

**创建带全文索引的表**

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

**修改现有表**

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

## 修改索引

你可以随时通过`ALTER TABLE`语句来更改列的索引类型，阅读[文档](/reference/sql/alter#alter-table)以获取更多信息。

## 最佳实践

1. 根据实际的数据特征和查询模式选择合适的索引类型
2. 只为频繁出现在 WHERE 子句中的列创建索引
3. 在查询性能、写入性能和资源消耗之间寻找平衡
4. 定期监控索引使用情况并持续优化索引策略

## 性能考虑

索引虽然能够显著提升查询性能，但也会带来一定开销：

- 需要额外的存储空间维护索引结构
- 索引维护会影响数据刷新和压缩性能
- 索引缓存会占用系统内存

建议根据具体应用场景和性能需求，合理规划索引策略。
