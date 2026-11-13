---
keywords: [分区函数, iceberg_hash, 哈希分区, Murmur3, 分区规则, 哈希断点, SQL 函数]
description: 介绍用于构建哈希分区规则的 iceberg_hash 系列分区函数，包括 iceberg_hash、iceberg_hash_bounds、iceberg_hash_breakpoints 和 iceberg_hash_ranges_sql。
---

# 分区函数

GreptimeDB 可以按列的哈希值对表进行分区，即 `iceberg_hash` 分区规则，详见[哈希分区](/user-guide/deployments-administration/manage-data/table-sharding.md#哈希分区)。本页介绍的函数就是该哈希的 SQL 形式，用于查看某个值哈希后的结果、把哈希空间切分成若干桶，以及生成可直接粘贴进 `PARTITION ON COLUMNS` 的完整规则列表：

| 函数 | 用途 | 结果 |
| --- | --- | --- |
| [`iceberg_hash(value)`](#iceberg_hash) | 计算单个字符串或整数值的哈希 | `INT32` 哈希值，`NULL` 返回 `NULL` |
| [`iceberg_hash_bounds(n)`](#iceberg_hash_bounds) | 生成等宽 `n` 桶切分的断点 | 逗号分隔的 `INT32` 字面量 |
| [`iceberg_hash_breakpoints(v1, v2, ...)`](#iceberg_hash_breakpoints) | 计算给定常量值的哈希 | 排序并去重后的 `INT32` 字面量 |
| [`iceberg_hash_ranges_sql(column, n)`](#iceberg_hash_ranges_sql) | 生成 `n` 桶的完整分区规则列表 | 每行一条规则，可直接粘贴 |

这四个函数都是不可变的，只产生值或文本：它们都不会创建或修改分区。

:::note 可用版本
本页函数及 `iceberg_hash` 分区规则目前仅在 Nightly 版本中提供，不包含在 GreptimeDB v1.3.0 和 v1.3.1 中。
:::

## Iceberg 哈希

`iceberg_hash` 是 [Apache Iceberg 规范附录 B](https://iceberg.apache.org/spec/#appendix-b-32-bit-hash-requirements) 定义的 32 位 Murmur3 哈希（种子为 0）。字符串按其 UTF-8 字节哈希，整数按 8 字节小端 long 哈希，结果为 `INT32`。Trino 和 ClickHouse 的 `icebergHash` 实现的是同一种哈希，因此一行的分桶结果可以在 GreptimeDB 之外重新计算。

SQL 函数与分区规则规划器共用同一实现，因此 `SELECT iceberg_hash(...)` 的结果始终与行的实际路由方式一致。

### `iceberg_hash`

`iceberg_hash(value)` 返回单个值的哈希，类型为 `INT32`。值可以是 `STRING` 或有符号/无符号整数（`INT8` 到 `INT64`、`UINT8` 到 `UINT64`），与分区规则接受的取值域相同。`NULL` 哈希后仍为 `NULL`。

```sql
SELECT iceberg_hash('iceberg'), iceberg_hash(34), iceberg_hash(NULL);
```

```sql
+-------------------------------+-------------------------+--------------------+
| iceberg_hash(Utf8("iceberg")) | iceberg_hash(Int64(34)) | iceberg_hash(NULL) |
+-------------------------------+-------------------------+--------------------+
| 1210000089                    | 2017239379              |                    |
+-------------------------------+-------------------------+--------------------+
```

可以用它检查某个值落在哪个桶里，也可以在选择桶布局之前查看现有列的哈希分布。

### `iceberg_hash_bounds`

`iceberg_hash_bounds(n)` 返回将 `INT32` 哈希空间等宽切成 `n` 份所需的 `n - 1` 个断点，以逗号分隔的字符串表示。第 `i` 个断点为 `INT32_MIN + floor(i * 2^32 / n)`，因此每个桶覆盖的哈希空间宽度相同。当不同键值较多时，哈希通常能让键值均匀分布到各个桶中；但相同键值的行始终进入同一个桶，热点键值或大量重复值仍可能造成热点分区。

参数必须是 2 到 1024 之间的常量整数，任意整数宽度均可。

```sql
SELECT iceberg_hash_bounds(2), iceberg_hash_bounds(4);
```

```sql
+-------------------------------+-------------------------------+
| iceberg_hash_bounds(Int64(2)) | iceberg_hash_bounds(Int64(4)) |
+-------------------------------+-------------------------------+
| 0                             | -1073741824, 0, 1073741824    |
+-------------------------------+-------------------------------+
```

`iceberg_hash_bounds(2)` 返回 `0`，因为单个断点把哈希空间分成两半：哈希值小于 `0` 的值进入第一个桶，其余进入第二个桶。

### `iceberg_hash_breakpoints`

`iceberg_hash_breakpoints(v1, v2, ...)` 对给定的常量值计算哈希，排序并去重后以逗号分隔的字符串返回。用它可以根据已知的关键值（例如热点主机）来划分桶，而不是按等宽切分。

所有值必须是常量，且必须来自同一种哈希编码：全部是字符串，或全部是整数（整数宽度可以混用）。字符串和整数的哈希编码不同，混用会被拒绝。`NULL` 不是合法的断点——`NULL` 哈希永远不会匹配比较边界——同样会被拒绝；此外至少需要提供一个值。

```sql
SELECT iceberg_hash_breakpoints('iceberg', 'a', 'iceberg');
```

```sql
+---------------------------------------------------------------------+
| iceberg_hash_breakpoints(Utf8("iceberg"),Utf8("a"),Utf8("iceberg")) |
+---------------------------------------------------------------------+
| 1009084850, 1210000089                                              |
+---------------------------------------------------------------------+
```

重复的哈希值会被去除，因此输出中每个不同的哈希值只对应一个断点；如果不同输入值的哈希发生碰撞，它们会共用一个断点。

### `iceberg_hash_ranges_sql`

`iceberg_hash_ranges_sql(column, n)` 为 `column` 生成等宽 `n` 桶切分的完整规则列表，每行一条规则，可直接粘贴进 `PARTITION ON COLUMNS`。列名会按带引号的 SQL 标识符输出并转义内部引号，因此 `host-name`、`HOST`、`a b` 等不是简单小写标识符的名称也能原样往返。

第一个参数是字符串形式的原始列名；第二个参数是常量桶数，取值范围与 `iceberg_hash_bounds` 相同，为 `[2, 1024]`。

```sql
SELECT iceberg_hash_ranges_sql('host-name', 4);
```

```sql
+-----------------------------------------------------------------------------+
| iceberg_hash_ranges_sql(Utf8("host-name"),Int64(4))                         |
+-----------------------------------------------------------------------------+
| iceberg_hash("host-name") < -1073741824,                                    |
| iceberg_hash("host-name") >= -1073741824 AND iceberg_hash("host-name") < 0, |
| iceberg_hash("host-name") >= 0 AND iceberg_hash("host-name") < 1073741824,  |
| iceberg_hash("host-name") >= 1073741824                                     |
+-----------------------------------------------------------------------------+
```

## 构建哈希分区表

要创建按列哈希分区的表，先生成规则列表，再把它粘贴到表定义中：

```sql
SELECT iceberg_hash_ranges_sql('host', 4);
```

```sql
iceberg_hash("host") < -1073741824,
iceberg_hash("host") >= -1073741824 AND iceberg_hash("host") < 0,
iceberg_hash("host") >= 0 AND iceberg_hash("host") < 1073741824,
iceberg_hash("host") >= 1073741824
```

```sql
CREATE TABLE requests (
  host STRING,
  ts TIMESTAMP DEFAULT current_timestamp() TIME INDEX,
  PRIMARY KEY (host)
)
PARTITION ON COLUMNS (host) (
  iceberg_hash(host) < -1073741824,
  iceberg_hash(host) >= -1073741824 AND iceberg_hash(host) < 0,
  iceberg_hash(host) >= 0 AND iceberg_hash(host) < 1073741824,
  iceberg_hash(host) >= 1073741824
);
```

如果希望围绕特定值而不是等宽来划分桶，可以用 `iceberg_hash_breakpoints(...)` 计算这些值的哈希，再把每个返回的哈希值依次作为上界，并补充最后一条不设上界的规则。例如，上面输出的两个断点可以生成以下三条规则：

```sql
iceberg_hash(host) < 1009084850,
iceberg_hash(host) >= 1009084850 AND iceberg_hash(host) < 1210000089,
iceberg_hash(host) >= 1210000089
```

返回结果已按哈希值排序，编写规则时请保持该顺序。

:::tip 注意
`NULL` 哈希后仍为 `NULL`，永远不会匹配比较边界，因此被哈希列为 `NULL` 的行总是落入第一个分区（分区 `p0`）。
:::

:::warning 限制
- 只有 `STRING` 和整数列可以哈希；其他类型会在执行时报错，与分区规则中的行为一致。
- 对被哈希分区列的过滤条件不会裁剪 region。形如 `WHERE host = 'x'` 的查询会扫描所有哈希区间；只有其他列上的条件才会裁剪。
:::
