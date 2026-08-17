---
keywords: [索引, 倒排索引, 跳数索引, 全文索引, 查询性能]
description: 了解 GreptimeDB 的倒排索引、跳数索引和全文索引分别适用于哪些查询，以及如何配置。
---

# 数据索引

GreptimeDB 针对不同的 predicate 和数据分布提供了多种二级索引。

## 概述

索引既可以在建表时定义，也可以之后通过 `ALTER TABLE` 修改。GreptimeDB 支持：

- 倒排索引（Inverted Index）
- 跳数索引（Skipping Index）
- 全文索引（Fulltext Index）

本页只介绍列值上的索引，不包括主键和 time index。

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
    `region` STRING PRIMARY KEY INVERTED INDEX,
    cpu_usage DOUBLE,
    `timestamp` TIMESTAMP TIME INDEX,
);
```

需要注意的是，当列的基数非常大时，倒排索引可能会带来较高的维护成本，导致内存占用增加和索引体积膨胀。这种情况下，建议考虑使用跳数索引作为替代方案。

<AnchorAlias id="skipping-index" />

### 跳数索引

跳数索引为每组数据行保存一个 Bloom filter。对于受支持的 predicate，如果过滤器能够确认目标值不存在，GreptimeDB 就可以跳过该数据组。Bloom filter 可能产生 false positive，因此未被跳过的数据仍需执行普通 predicate 计算。

**适用场景：**
- 数据分布稀疏的场景，例如日志中的 MAC 地址
- 在大规模数据集中查询出现频率较低的值

示例：
```sql
CREATE TABLE sensor_data (
    `domain` STRING PRIMARY KEY,
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
    `domain` STRING PRIMARY KEY,
    device_id STRING SKIPPING INDEX WITH(type='BLOOM', granularity=1024, false_positive_rate=0.01),
    temperature DOUBLE,
    `timestamp` TIMESTAMP TIME INDEX,
);
```

跳数索引只适用于能够转换为 membership test 的 predicate。可以使用 [`EXPLAIN ANALYZE`](/reference/sql/explain.md) 检查重要查询是否进行了索引裁剪。

### 全文索引

全文索引会对 `STRING` 列分词，使 `matches_term` 和 `@@` predicate 能够跳过不可能包含目标 term 的数据。查询语义见[全文检索](/user-guide/logs/fulltext-search.md)。

**适用场景：**
- 文本内容搜索
- 模式匹配查询
- 大规模文本过滤

示例：
```sql
CREATE TABLE logs (
    `message` STRING FULLTEXT INDEX,
    `level` STRING PRIMARY KEY,
    `timestamp` TIMESTAMP TIME INDEX,
);
```

#### 配置选项

在创建或修改全文索引时，您可以使用 `FULLTEXT INDEX WITH` 指定以下选项：

- `analyzer`：设置全文索引的语言分析器
  - 支持的值：`English`、`Chinese`
  - 默认值：`English`

- `case_sensitive`：决定全文索引是否区分大小写
  - 支持的值：`true`、`false`
  - 默认值：`false`
  - 设为 `false` 时，index analyzer 会将 token 规范化为小写。

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

GreptimeDB 提供两种全文索引后端：

- `bloom` 按 segment 保存 token Bloom filter。它可能读取 false-positive segment，索引大小和裁剪精度取决于 `granularity` 和 `false_positive_rate`。
- `tantivy` 保存能够直接定位匹配 document 的 term index。它通常比 `bloom` 使用更多索引存储和构建资源。

具体哪种后端更快，取决于 term 频率、查询结构、segment 布局和 cache。在大规模部署前，应使用有代表性的数据对两种后端进行测试。

#### 配置示例

**创建带全文索引的表**

```sql
-- 使用 Bloom 后端
CREATE TABLE logs_bloom (
    timestamp TIMESTAMP(9) TIME INDEX,
    `message` STRING FULLTEXT INDEX WITH (
        backend = 'bloom',
        analyzer = 'English',
        case_sensitive = 'false'
    )
);

-- 使用 Tantivy 后端
CREATE TABLE logs_tantivy (
    timestamp TIMESTAMP(9) TIME INDEX,
    `message` STRING FULLTEXT INDEX WITH (
        backend = 'tantivy',
        analyzer = 'English',
        case_sensitive = 'false'
    )
);
```

**修改现有表**

```sql
-- 在现有列上启用全文索引
ALTER TABLE logs
MODIFY COLUMN message
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
