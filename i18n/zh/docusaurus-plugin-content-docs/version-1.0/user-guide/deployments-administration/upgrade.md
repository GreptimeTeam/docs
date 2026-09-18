---
keywords: [GreptimeDB 升级, 版本升级示例]
description: 介绍如何将 GreptimeDB 升级到最新版本，包括一些不兼容的变更和升级具体步骤。
---

# 版本升级

## 概览

本指南提供 GreptimeDB 的升级说明，包括每个版本的兼容性信息和破坏性变更。升级前，请确保查看与你的升级路径相关的破坏性变更。

升级时，请查看当前版本之后、直到目标版本为止的各版本变更。查看中间版本的变更
不代表必须逐个安装这些版本；实际升级步骤请遵循下方支持的升级路径。

完整的版本历史和功能新增，请参见[发行说明](/release-notes/)。

## 升级到 v1.0 的路径

### 从 v0.16 到 v1.0

如果你当前运行的是 v0.16，可以直接升级到 v1.0。请参见[从 v0.16 升级到 v1.0](#从-v016-升级到-v10) 了解所有相关的破坏性变更。

### 从 v0.17 到 v1.0

如果你当前运行的是 v0.17，可以直接升级到 v1.0。请参见[从 v0.17 升级到 v1.0](#从-v017-升级到-v10) 了解破坏性变更。

### 从更早版本升级

**重要提示：** 本指南仅涵盖从 v0.16 及更高版本的升级。

如果你运行的版本早于 v0.16，必须先按照当前版本的升级文档升级到 v0.16。成功升级到 v0.16 后，再使用本指南升级到 v1.0。

## 各版本的破坏性变更

### v1.0 的 Metric Engine 压缩变更

#### 检查 Metric Engine 的压缩配置

从 v0.17 升级到 v1.0 或更高版本时，请检查 Metric Engine 物理表的压缩时间窗口。
从 v1.0 开始，如果没有显式设置，就会使用一天（`1d`）的窗口。这个默认值有助于查询较长
时间范围的数据，但从较小的窗口切换过来，可能触发历史文件的重新压缩，增加内存用量。
这并不是每次重启时重新推断窗口大小。

在运行 v1.0 或更高版本的实例上（包括预发环境的数据副本），可以通过
[`information_schema.ssts_manifest`](/reference/sql/information-schema/ssts-manifest.md)
查看物理表的文件。请将下面示例中的数据库名和表名替换为实际值：

```sql
SELECT s.region_id, s.table_id, s.file_id, s.level, s.file_size,
       s.index_file_size, s.num_rows, s.min_ts, s.max_ts
FROM information_schema.ssts_manifest s
JOIN information_schema.tables t ON s.table_id = t.table_id
WHERE t.table_schema = 'public'
  AND t.table_name = 'greptime_physical_table'
ORDER BY s.region_id, s.max_ts;
```

也可以按 Region 汇总文件大小和数量，大小的单位为字节：

```sql
SELECT s.region_id, COUNT(*) AS file_count,
       SUM(s.file_size) AS total_bytes,
       AVG(s.file_size) AS avg_file_bytes,
       MAX(s.file_size) AS max_file_bytes
FROM information_schema.ssts_manifest s
JOIN information_schema.tables t ON s.table_id = t.table_id
WHERE t.table_schema = 'public'
  AND t.table_name = 'greptime_physical_table'
GROUP BY s.region_id;
```

结合文件的时间范围，查看候选窗口内有多少文件、总数据量有多大。较大的窗口有助于
长时间范围的查询，但也可能让一次压缩涉及更多文件。请根据现有文件和可用内存选择
窗口，并在升级生产环境前用历史数据进行测试。`1h` 是一个可选值，并非所有场景都需要使用。

#### 保留原来的压缩时间窗口

如果想保留原来的窗口，请在**升级前**查看物理表数据 Region 的 manifest。
Metric Engine 的 checkpoint 路径如下，相对于配置的存储根目录：

```text
data/<catalog>/<schema>/<table_id>/<table_id>_<region_sequence:010>/data/manifest/<version:020>.checkpoint
```

目录后缀是补齐到 10 位的 Region 序号，不是完整的 Region ID。checkpoint 文件名
使用补齐到 20 位的 manifest 版本号。例如，表 ID 为 `1024`、Region 序号为 `0`、
checkpoint 版本号为 `7` 时，路径为：

```text
data/greptime/public/1024/1024_0000000000/data/manifest/00000000000000000007.checkpoint
```

读取同一 manifest 目录下的 `_last_checkpoint`，找到 checkpoint 版本号。
下载对应文件，查看 `checkpoint.compaction_time_window`：

```shell
jq -r '.checkpoint.compaction_time_window' 00000000000000000007.checkpoint
```

checkpoint 只是一个快照，还应检查后续 manifest 记录是否更新了
`compaction_time_window`。如果该字段缺失或为 null，就无法从中确定要保留的窗口。

请检查每个物理数据 Region。如果各 Region 的窗口不同，可以根据 SST 分布选择一个
表级窗口。在升级前，显式设置物理表的窗口。例如，要保留一小时的窗口：

```sql
ALTER TABLE public.greptime_physical_table
SET 'compaction.twcs.time_window' = '1h';
```

请替换为实际的表名和时间窗口。通过 manifest 查看原值，通过 `ALTER TABLE` 修改配置。

#### 升级前压缩 Metric Engine 表

如果 Metric Engine 物理表中有较多相互重叠的 SST 文件，或文件跨越较长的时间范围，
建议在升级到 v1.0 或更高版本前，先在 v0.17 上执行
[SWCS 压缩](/user-guide/deployments-administration/manage-data/compaction.md#严格窗口压缩策略swcs和手动压缩)。
它会按选定的时间窗口重新组织历史文件，有助于减少查询需要读取的文件数量。

例如，在 v0.17 上按一小时窗口压缩物理表：

```sql
ADMIN COMPACT_TABLE('public.greptime_physical_table', 'swcs', '3600');
```

请替换为实际的表名和窗口大小。第三个参数的单位是秒；v0.17 不支持较新版本的
`window=...,parallelism=...` 写法。请对物理表执行此操作，而不是逻辑表。

SWCS 可能为不同窗口多次读取同一个文件，占用较多内存和 I/O。请在实例资源充足时
执行，观察压缩进度，并等它完成后再升级。如果希望升级后继续使用同样的窗口，
仍需显式设置 `compaction.twcs.time_window`。在 v0.17 上压缩生成的文件也不包含
较新版本压缩内存限制所需的元数据。

#### 处理大文件和压缩内存问题

`experimental_compaction_memory_limit` 依赖文件元数据，而 v0.17 生成的 SST
不包含这些信息。即使已经升级，它也无法可靠地估算这些旧文件的压缩内存用量。
只要历史文件仍然存在，就不能仅依靠此配置来避免压缩时内存不足。

如果合并数百 MB 大小的文件时发生 OOM，可以尝试调小压缩输出文件的大小，例如设为
`128MB`。建议将该值设为大于 `50MB`，避免产生过多小文件：

```sql
ALTER TABLE public.greptime_physical_table
SET 'compaction.twcs.max_output_file_size' = '128MB';
```

这个配置控制压缩生成的文件大小，不会立即拆分已有文件，也不限制合并文件所需的内存。

如果查询报错 `Too many files to read concurrently`，可以考虑通过
[手动 SWCS 压缩](/user-guide/deployments-administration/manage-data/compaction.md#严格窗口压缩策略swcs和手动压缩)
重新组织文件。在 v1.0 或更高版本上，以下语句使用一小时的窗口，并将并行度设为一：

```sql
ADMIN COMPACT_TABLE('public.greptime_physical_table', 'swcs', 'window=3600,parallelism=1');
```

SWCS 会增加压缩工作量，同一个输入文件也可能因跨越多个窗口而被多次读取。
请先用实际数据测试，并为它留出足够的内存和执行时间。

更多背景可参考 [issue #9172 中维护者的回复](https://github.com/GreptimeTeam/greptimedb/issues/9172#issuecomment-5693460752)。

### 从 v0.17 升级到 v1.0

如果使用 Metric Engine 表，从 v0.17 升级到 v1.0 或更高版本前，请查看
[压缩建议](#v10-的-metric-engine-压缩变更)。

#### 移除 Jaeger HTTP Header

**影响：** HTTP header 废弃

HTTP header `x-greptime-jaeger-time-range-for-operations` 已被废弃并移除。

**需要的操作：**

- 如果你在 Jaeger 数据源或代理中配置了此 header，请从配置中移除
- 此 header 将不再有任何效果

#### Metric Engine 默认启用稀疏主键编码

**影响：** 默认配置变更，带来性能提升

Metric Engine 现在默认启用**稀疏主键编码**，以提高指标场景的存储效率和查询性能。

**配置变更：**

- **新的默认值：** `sparse_primary_key_encoding = true`
- **已废弃：** `experimental_sparse_primary_key_encoding`（请使用 `sparse_primary_key_encoding` 代替）

**需要的操作：**

- 此变更不会导致数据格式兼容性问题
- 所有指标表将默认自动使用稀疏编码
- 如果想继续使用旧的编码方法，请显式设置：
  ```toml
  [metric_engine]
  sparse_primary_key_encoding = false
  ```

#### `greptime_identity` Pipeline JSON 行为变更

**影响：** JSON 处理逻辑变更

`greptime_identity` pipeline 中的 JSON 处理逻辑发生了重大变化：

**新行为：**

- 嵌套的 JSON 对象会自动展平为使用点号分隔的独立列（例如 `object.a`、`object.b`）
- 数组存储为 JSON 字符串而不是 JSON 对象
- `flatten_json_object` 参数已被移除
- 新的 `max_nested_levels` 参数控制展平深度（默认：10 层）
- 当超过深度限制时，剩余的嵌套结构将序列化为 JSON 字符串

**需要的操作：**

1. 检查使用 `greptime_identity` 的 pipeline 配置
2. 移除已废弃的 `flatten_json_object` 参数的任何使用
3. 调整引用嵌套 JSON 字段的查询以使用新的点号表示法
4. 如果有深层嵌套的 JSON（>10 层），考虑适当设置 `max_nested_levels`

**示例：**

v0.17 之前：

```json
{ "user": { "name": "Alice", "age": 30 } }
```

存储为单个 JSON 列。

v1.0 之后：

```
user.name = "Alice"
user.age = 30
```

存储为独立的列。

#### Metric Engine TSID 生成算法变更

**影响：** 时间序列 ID 生成优化，对查询有影响

TSID（时间序列 ID）生成算法已通过将 `mur3::Hasher128` 替换为高性能的 `fxhash::FxHasher` 进行优化，包括针对没有 NULL 标签的序列的快速路径。

**性能提升：**

- 常规场景：快 5-6 倍
- 包含 NULL 标签的场景：快约 2.5 倍

**破坏性变更影响：**

这是一个**破坏性变更**，影响时间序列识别：

- **升级前（时间 < t）：** 数据使用旧算法生成 TSID
- **升级后（时间 > t）：** 数据使用新算法生成 TSID

**查询行为：**

- 时间范围**跨越升级时间 `t`** 的查询可能在时间 `t` 附近出现轻微的时间序列匹配差异
- 时间范围**不包含 `t`** 的查询不受影响

**需要的操作：**

选择以下升级策略之一：

1. **直接升级（推荐给大多数用户）：**
   - 接受升级时间附近的轻微查询差异
   - 适用于可以接受升级时间附近近似结果的场景

2. **导出-升级-导入（零容忍场景）：**
   - 如果无法接受任何差异，使用此完全兼容的升级方法：
     1. 升级前导出所有数据
     2. 升级到 v1.0
     3. 将数据导入回新版本
   - 参考[备份与恢复文档](/user-guide/deployments-administration/disaster-recovery/back-up-&-restore-data/)

### 从 v0.16 升级到 v1.0

如果你从 v0.16 升级，需要查看：

1. **从 v0.17 到 v1.0 的所有破坏性变更**（如上所列）
2. **v0.17.0 的破坏性变更**（如下所列）

这确保你了解 v0.16 和 v1.0 之间发生的所有变更。

### v0.17.0 破坏性变更

#### 有序集聚合函数

**影响：** SQL 语法变更

有序集聚合函数现在需要 `WITHIN GROUP (ORDER BY …)` 子句。

**之前：**

```sql
SELECT approx_percentile_cont(latency, 0.95) FROM metrics;
```

**之后：**

```sql
SELECT approx_percentile_cont(0.95) WITHIN GROUP (ORDER BY latency) FROM metrics;
```

**需要的操作：** 更新所有使用有序集聚合函数（`approx_percentile_cont`、`approx_percentile_cont_weight` 等）的查询，包含 `WITHIN GROUP (ORDER BY …)` 子句。

#### MySQL 协议注释样式

**影响：** 注释语法严格性

MySQL 协议中不再允许不正确的注释样式。注释必须以 `--` 开头，而不是 `---`。

**之前：**

```sql
--- 这是一个注释
SELECT * FROM table;
```

**之后：**

```sql
-- 这是一个注释
SELECT * FROM table;
```

**需要的操作：** 更新任何使用 `---` 样式注释的 SQL 脚本或查询，改用标准的 `--` 格式。

## v1.0 的其他变更（非破坏性）

### v1.0.0-beta.3

#### 缓存配置改进

缓存架构已重构以获得更好的性能：

**新配置：**

- `region_engine.mito.manifest_cache_size`（默认：256MB）- 专用的 manifest 文件缓存

**移除的配置：**

- `storage.cache_path`
- `storage.enable_read_cache`
- `storage.cache_capacity`

**需要的操作：** 更新配置文件以使用新的 `manifest_cache_size` 设置，并移除已废弃的存储缓存选项。

### v1.0.0-beta.2

#### 改进的数据库兼容性

- 数值类型别名与 PostgreSQL 和 MySQL 标准对齐
- 更好的 PostgreSQL 扩展查询支持
- 改进的 MySQL 二进制协议处理

**需要的操作：** 测试你的应用程序以确保与改进后的行为兼容。

## 将升级对业务带来的影响最小化

在升级 GreptimeDB 之前，请全面备份数据以防止潜在的数据丢失。此备份作为升级过程中出现任何问题时的安全保障。

### 最佳实践

#### 滚动升级

在 Kubernetes 上采用[滚动升级](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/)策略逐步更替 GreptimeDB 实例。该方案通过新旧实例渐进式替换，在确保服务持续可用的前提下实现零停机升级。

#### 自动重试

建议在客户端配置具备指数退避特性的自动重试策略，可有效规避升级过程中的瞬时服务不可用问题。

#### 暂停写操作

对于允许短暂维护的业务场景，可在升级窗口期暂时停止写入操作，此方案能最大限度保障数据一致性。

#### 双写

实施新旧版本双写机制，待新版本验证通过后逐步切换流量。该方案既能确保数据一致性校验，又可实现读流量灰度迁移。

## 升级检查清单

在升级到 v1.0 之前，请完成以下检查清单：

### 升级前

- [ ] 查看与你的升级路径相关的所有破坏性变更
- [ ] **备份所有数据和配置**
- [ ] 识别使用有序集聚合函数的查询（如果从 v0.16 或更早版本升级）
- [ ] 识别使用 `greptime_identity` 处理 JSON 数据的 pipeline
- [ ] 检查是否使用了已废弃的 Jaeger HTTP header（如果从 v0.17 或更早版本升级）
- [ ] 如果使用 Metric Engine，检查指标表
- [ ] 如果从 v0.17 升级到 v1.0 或更高版本，参考 [Metric Engine 压缩建议](#v10-的-metric-engine-压缩变更)选择时间窗口，并决定是否在升级前执行 SWCS

### 配置更新

- [ ] 更新配置文件（移除已废弃的缓存设置）
- [ ] 如需要，更新 metric engine 配置（`sparse_primary_key_encoding`）
- [ ] 更新 pipeline 配置（移除 `flatten_json_object`，如需要添加 `max_nested_levels`）

### 代码更新

- [ ] 更新使用有序集聚合的 SQL 查询以使用 `WITHIN GROUP (ORDER BY ...)`
- [ ] 更新使用 `---` 注释的 SQL 脚本改用 `--`
- [ ] 更新访问嵌套 JSON 字段的查询以使用点号表示法
- [ ] 如存在，移除 Jaeger header 配置

### 测试与部署

- [ ] 在非生产环境中测试升级
- [ ] 如果从 v0.17 升级到 v1.0 或更高版本，使用历史 SST 测试，并监控内存用量、压缩进度和查询错误
- [ ] 验证查询结果，特别是：
  - 有序集聚合函数
  - 嵌套 JSON 数据访问
  - 指标查询（如果受 TSID 变更影响）
- [ ] 规划滚动升级或维护窗口
- [ ] 准备回滚计划以防出现问题
- [ ] 升级后监控系统行为

### Metric Engine 用户的特别考虑

如果由于 TSID 算法变更无法接受升级时间附近的查询差异：

- [ ] 规划导出-升级-导入流程
- [ ] 为数据导出和导入分配充足时间
- [ ] 参考[备份与恢复文档](/user-guide/deployments-administration/disaster-recovery/back-up-&-restore-data/)
