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

## 升级到 v1.3 的路径

### 从 v1.2 到 v1.3

如果你当前运行的是 v1.2，可以直接升级到 v1.3。升级前，请先查看
[从 v1.2 升级到 v1.3](#从-v12-升级到-v13)，并完成
[升级检查清单](#升级检查清单)中的相关检查。

### 从 v1.1 或更早版本到 v1.3

如果你要从 v1.1 或更早版本升级到 v1.3，请先查看[升级到 v1.2 的路径](#升级到-v12-的路径)，
再处理 [v1.3 的破坏性变更](#从-v12-升级到-v13)。

## 升级到 v1.2 的路径

### 从 v1.0 或 v1.1 到 v1.2

如果你当前运行的是 v1.0 或 v1.1，可以直接升级到 v1.2。升级前，请先查看
[从 v1.0 或 v1.1 升级到 v1.2](#从-v10-或-v11-升级到-v12)，并完成
[升级检查清单](#升级检查清单)中的相关检查。
如果当前版本是 v1.0，还需查看 [v1.1 的 Metric Engine 变更](/1.1/user-guide/deployments-administration/upgrade/#v11-的-metric-engine-变更)。

### 从 v0.17 或更早版本到 v1.2

如果你要从 v0.17 或更早版本升级到 v1.2，请先查看下方适用的 v1.0 升级路径，
再处理 [v1.2 的破坏性变更](#从-v10-或-v11-升级到-v12)。

如果使用 Metric Engine，还需查看 [v1.0 的压缩建议](/1.0/user-guide/deployments-administration/upgrade/#v10-的-metric-engine-压缩变更)
和 [v1.1 的 Metric Engine 变更](/1.1/user-guide/deployments-administration/upgrade/#v11-的-metric-engine-变更)。

## 升级到 v1.0 的路径

### 从 v0.16 到 v1.0

如果你当前运行的是 v0.16，可以直接升级到 v1.0。请参见[从 v0.16 升级到 v1.0](#从-v016-升级到-v10) 了解所有相关的破坏性变更。

### 从 v0.17 到 v1.0

如果你当前运行的是 v0.17，可以直接升级到 v1.0。请参见[从 v0.17 升级到 v1.0](#从-v017-升级到-v10) 了解破坏性变更。

### 从更早版本升级

**重要提示：** 本指南仅涵盖从 v0.16 及更高版本的升级。

如果你运行的版本早于 v0.16，必须先按照当前版本的升级文档升级到 v0.16。成功升级到 v0.16 后，再使用本指南升级到 v1.0。

## 各版本的破坏性变更

### 从 v1.2 升级到 v1.3

#### 集群升级和回滚顺序

整个滚动升级期间保持 Metasrv [维护模式](/user-guide/deployments-administration/maintenance/maintenance-mode.md)开启，全部组件升级完成后再关闭。v1.3 的 Batch GC 使用 packed 协议，不支持向旧协议回退；维护模式可防止它在 Metasrv 与 Datanode 版本混用时运行。

先升级全部 Datanode，再升级 Frontend。回滚时先回滚 Frontend，再回滚 Datanode；通过 Operator 管理的回滚也需要遵循此顺序。
v1.3 Frontend 的写入重试依赖 Datanode 返回逐条写入结果，与旧 Datanode 混用时可能重放已成功的写入，导致 append-mode 表出现重复行。v1.3 的 PromQL 执行计划也会使用旧 Datanode 不支持的函数。

#### 查询和客户端兼容性

| 变化 | 升级前检查 |
| --- | --- |
| MySQL 文本协议将时间戳的小数秒截断到微秒；存储的纳秒值不变。 | 需要完整纳秒精度的客户端应在 SQL 中显式转换为字符串或整数。 |
| 未指定步长的 PromQL 子查询使用固定的 1 分钟步长。 | 需要其他步长时显式使用 `[range:step]`。 |
| PromQL 范围查询拒绝 range-vector 根表达式。 | 改用瞬时查询，或先将 range vector 归约为 instant vector。 |
| 整数输入的 `median`、`approx_median` 和 `approx_percentile_cont` 返回浮点数；精确中位数对偶数个输入插值。 | 检查视图、Flow 输出表及其他固定 schema 消费方的类型。 |
| `REPLACE(s, '', replacement)` 返回原字符串；struct `unnest` 自动生成的列名发生变化。 | 检查空匹配字符串的用法，并为展开列指定别名。 |
| PostgreSQL 结果元数据返回 `REGCLASS`、`REGTYPE` 等 OID 别名。 | 检查客户端对结果类型的处理。 |
| `json_get*` 和 JSON2 字段访问遇到非法 JSONPath 时返回错误。 | 根路径可使用 `$` 或空字符串；替换 `.`、`$.` 等非法路径。`json_path_match` 对非法路径仍返回 NULL。 |
| SQL 表达式深度超过 `128` 时规划失败。 | 简化深度嵌套的生成式查询。 |

#### 写入请求和 JSON2

Prometheus Remote Read、Remote Write 和 Loki protobuf/Snappy push 请求的解压后正文超过 512 MiB 时返回 HTTP 400。该解压限制不适用于 Loki JSON push 路径。
配置 `max_in_flight_write_bytes` 后，HTTP 准入还会计入解码后的正文和超出 `Content-Length` 的流式数据；配额不足时返回 HTTP 429 或 gRPC `RESOURCE_EXHAUSTED`。
压缩的 gRPC 请求在解码前按 `max_recv_message_size` 预留配额。按解压后的大小调整客户端批次和服务端配额。

JSON2 type hint 不再接受 `nullable` 和 `default`。指定类型的字段均可为 NULL，缺失值返回 NULL。
支持的类型为 `STRING`、`BIGINT`、`BIGINT UNSIGNED`、`DOUBLE`、`BOOLEAN`，以及别名 `INT64`、`UINT64`、`FLOAT64`。移除旧选项，并替换不受支持的类型。
JSON2 使用 flat SST；CREATE 和 ALTER 拒绝不兼容的 SST 格式。

#### Flow 镜像写入限制

Flow 镜像写入的待处理预算为 1,000,000 行，发往不同 Flownode 的副本分别计数。
达到预算时，普通表写入仍可能成功，但对应的 Flow 镜像批次会被丢弃，造成 Flow 输出缺失。
instant-TTL 写入在向 Datanode 发送前被拒绝；单批超过预算时，需要拆分批次。
监控 `greptime_table_operator_mirror_pending_rows` 和 `greptime_operator_dist_mirror_dropped_rows`。

#### 配置和索引

- Mito 的默认 `auto_flush_interval` 从 `30m` 改为 `10m`。显式配置的全局值和表级值保持不变。
- 移除旧的 native histogram 实验开关；这些开关会被忽略，包括设为 `false` 的情况。将 `prom_validation_mode` 从 `[http]` 移到 `[prom_store]`，保留原值。旧位置的配置会被忽略，回退到默认值 `strict`；原来使用 `lossy` 或 `unchecked` 的写入可能因此被拒绝。
- 流式查询分析默认启用，旧配置项 `experimental_enable_explain_analyze_stream` 被忽略，可移除。
- 重复的 region engine 配置会导致启动失败；每种引擎只保留一份配置。
- 通过 compaction 或 `ADMIN BUILD_INDEX` 重建旧 fulltext bloom 索引。数据仍可读取，但旧索引在重建前不参与剪枝。回滚后，v2 索引同样退回扫描。Tantivy 的 `matches_term` 使用全表扫描，`matches()` 行为不变。

#### UDDSketch 状态兼容性

`uddsketch_state` 和 `uddsketch_merge` 生成新的二进制格式。v1.3 可读取旧状态，v1.2.1 无法读取新状态。
需要回滚时保留升级前的状态数据，并避免将新生成的状态传给旧版本读取端。

#### VRL 默认禁用主机访问

**影响：** 使用受限 VRL 函数或参数的 pipeline

从 v1.3.0 起，`pipeline.allow_vrl_host_access` 默认值为 `false`。
使用受限函数或参数的现有 pipeline 在升级后首次从存储加载时会编译失败，
导致使用这些 pipeline 的写入请求失败。

**需要的操作：**

- 检查现有 pipeline 是否使用了[受限的 VRL 函数或参数](/reference/pipeline/pipeline-config.md#vrl-host-access)。
- 在升级前移除受限调用或参数。如果所有 pipeline 作者都可信，也可以在所有
  Frontend 或单机服务的 `[pipeline]` 配置中设置 `allow_vrl_host_access = true`，
  并重启相关服务。
- 在正式升级前，使用目标版本和计划采用的服务端配置，通过
  `POST /v1/pipelines/_dryrun` 验证受影响的 pipeline。

#### 扫描内存计量变更

升级到 v1.3 后，即使配置没有修改，查询也可能因达到内存限制而失败。
升级前请检查以下设置：

| 现有配置 | 变化及建议操作 |
| --- | --- |
| 未配置 `scan_memory_limit` | 默认值从 `unlimited` 改为可用内存的 `25%`，并遵循容器内存限制。如需继续禁用扫描内存限制，请显式设为 `"unlimited"`。 |
| 已配置非零 `scan_memory_limit` | 新增的 `scan_memory_mode` 默认为 `basic`。如需继续统计扫描产生的批次，请使用 `extended`，并测试现有限制是否足够。 |
| `scan_memory_on_exhausted = "wait"` 或 `"wait(<duration>)"` | 查询会立即失败，不再等待内存。请改为 `"fail"`，并检查应用的错误处理逻辑。 |

`extended` 不会完全恢复旧行为：相同的限制可能导致以前能够成功的查询失败。
同时检查 `query.memory_pool_size`，因为查询现在可能更容易达到这一限制。
将 `scan_memory_limit` 设为 `0` 或 `"unlimited"` 仍然只会禁用扫描内存限制，
不会禁用查询内存限制或文件数量检查。

正式升级前，请按预期并发量测试典型查询，并检查使用
`greptime_mito_scan_memory_usage_bytes` 的告警。该指标不代表进程总内存。
配置详情见[扫描内存计量](/user-guide/deployments-administration/configuration.md#扫描内存计量)。

### 从 v1.0 或 v1.1 升级到 v1.2

#### 移除 PromQL `holt_winters`

**影响：** PromQL 查询解析

`holt_winters` 这个名字已被移除。它只是为向后兼容保留的别名，函数本身没有变化，
仍然可以通过 `double_exponential_smoothing` 使用 —— 这个名字在 v1.2 之前就已经
支持。

**需要的操作：**

- 在仪表盘、录制规则、告警规则和 API 调用方中搜索 `holt_winters(`
- 把每处调用改名为 `double_exponential_smoothing(...)`，参数和结果完全一致：

  ```promql
  # v1.2 之前
  holt_winters(prom_series[10s], 0.5, 0.1)

  # v1.2 及之后
  double_exponential_smoothing(prom_series[10s], 0.5, 0.1)
  ```

- 修改后在预发环境重新执行这些查询

#### 拒绝 `fill`、`fill_left` 和 `fill_right` PromQL 修饰符

**影响：** 为避免错误查询计划而收紧 PromQL 兼容性

v1.2 升级了 PromQL 解析器，二元运算符修饰符 `fill`、`fill_left` 和 `fill_right`
因此首次在语法上变得合法，例如 `metric_a + fill(0) metric_b`。GreptimeDB 并未
实现它们所需的 outer join 语义，因此会直接拒绝这类用法（无论是直接使用还是嵌套
使用），而不是把它们当作普通的 inner join 来规划。

更早的版本根本无法解析这些修饰符，所以 v1.2 之前能正常工作的查询都不受影响。
这也与 SQL 的 `RANGE ... FILL` 子句无关，后者没有变化。

**需要的操作：**

- 在 PromQL 表达式中搜索 `fill(`、`fill_left(` 和 `fill_right(`
- 重写受影响的查询，使其不再依赖这些修饰符

#### Pipeline 整数缩窄现在遵循 `on_failure`

**影响：** Pipeline 类型转换正确性

当 pipeline 把整型输入或数字字符串转换为无法容纳该值的声明整型时，该值不再按
模运算回绕，而是遵循该转换的 `on_failure` 策略。此前 `-1` 写入 `uint8` 会存成
`255`，`256` 写入 `int8` 会存成 `0`。

这适用于 `int8`、`int16`、`int32`、`uint8`、`uint16` 和 `uint32`，也适用于写入
`int64` 和 `uint64` 时的跨符号转换。本次发布中，浮点数转整数的行为保持不变。

**需要的操作：**

- 检查会写入窄整数类型字段的 pipeline，以及可能把负值写入无符号类型的 pipeline
- 如果这些 pipeline 依赖了回绕行为，请在升级前扩大目标类型，或显式配置
  `on_failure` 策略
- 使用 `POST /v1/pipelines/_dryrun` 或有代表性的预发数据，验证边界值现在会
  产生预期的错误、默认值或 null 结果

#### 本地 SQL 文件访问现在受沙箱限制

**影响：** 读写本地文件的 `COPY` 与外部表工作流

单机部署现在会把本地 SQL 文件路径解析到 `storage.copy_root`
（默认 `<data_home>/copy`）之内；分布式部署则完全拒绝本地文件 SQL 访问。

**需要的操作：**

- 识别引用本地路径的 `COPY` 语句和外部表
- 如果你使用单机部署，请将这些文件移动到沙箱目录下，或把
  `storage.copy_root` 指向专用目录，或将工作流迁移到对象存储
- 如果你运行的是分布式服务，请在升级前把本地文件工作流迁移到 S3、OSS、
  GCS 或 AzBlob
- 详细迁移步骤请参见[迁移本地 SQL 文件访问](/user-guide/deployments-administration/migrate-local-sql-file-access.md)

#### 移除 `sparse_primary_key_encoding` 配置

**影响：** Metric engine 配置清理

GreptimeDB 现在始终为 metric 表使用稀疏主键编码，`sparse_primary_key_encoding`
选项已被移除。配置文件中若仍保留该项，不会导致启动失败，该项会被忽略。

**需要的操作：**

- 从配置文件、Helm values 和自动化模板的 `[region_engine.metric]` 块中移除
  `sparse_primary_key_encoding`。如果更早的
  `experimental_sparse_primary_key_encoding` 还在，也一并删掉。
- 如果你之前设置过 `sparse_primary_key_encoding = false`，请注意 v1.2
  已经不再提供关闭该行为的选项
- 使用清理后的配置在预发环境重启一次，确认部署已不再依赖这些被移除的设置

### 从 v1.0.x 升级到 v1.1.4

#### OSS 凭证优先级

**影响：** 升级后访问 OSS 时使用的 RAM 角色可能发生变化。

从 v1.0.x 升级到 v1.1.4 后，OSS 会优先获取 ECS RAM Role 凭证，再获取 OIDC 凭证。
如果两者均可用，但 ECS 角色缺少所需的 OSS 权限，建表或写入可能返回 `403 PermissionDenied`。

**操作要求：**

如果需要使用 OIDC 角色，在 GreptimeDB 进程环境中设置
`ALIBABA_CLOUD_ECS_METADATA_DISABLED=true`，并重启相关实例。
凭证获取顺序请参见[阿里云 OSS 凭证](/user-guide/deployments-administration/configuration.md#阿里云-oss-凭证)。

### 从 v0.17 升级到 v1.0

如果使用 Metric Engine 表，从 v0.17 升级到 v1.0 或更高版本前，请查看
[压缩建议](/1.0/user-guide/deployments-administration/upgrade/#v10-的-metric-engine-压缩变更)。

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
  [[region_engine]]
  [region_engine.metric]
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

在升级到目标版本之前，请完成以下检查清单：

### 升级前

- [ ] 如果使用 OSS，检查[凭证优先级](#oss-凭证优先级)，并按需禁用 ECS metadata
- [ ] 查看与你的升级路径相关的所有破坏性变更
- [ ] **备份所有数据和配置**
- [ ] 如果升级到 v1.2，搜索 PromQL 资产中的 `holt_winters(`、`fill(`、`fill_left(` 和 `fill_right(`
- [ ] 如果升级到 v1.2，识别引用本地文件路径的 `COPY` 工作流和外部表
- [ ] 如果升级到 v1.2，检查会把值缩窄到 `int8`/`int16`/`int32`/`uint8`/`uint16`/`uint32` 的 pipeline，以及会把负值写入无符号类型的 pipeline
- [ ] 如果升级到 v1.3，检查 pipeline 是否使用了[受限的 VRL 函数或参数](/reference/pipeline/pipeline-config.md#vrl-host-access)
- [ ] 识别使用有序集聚合函数的查询（如果从 v0.16 或更早版本升级）
- [ ] 识别使用 `greptime_identity` 处理 JSON 数据的 pipeline
- [ ] 检查是否使用了已废弃的 Jaeger HTTP header（如果从 v0.17 或更早版本升级）
- [ ] 如果使用 Metric Engine，检查指标表
- [ ] 如果从 v0.17 升级到 v1.0 或更高版本，参考 [Metric Engine 压缩建议](/1.0/user-guide/deployments-administration/upgrade/#v10-的-metric-engine-压缩变更)选择时间窗口，并决定是否在升级前执行 SWCS
- [ ] 如果从早于 v1.1 的版本升级到 v1.1 或更高版本，查看 [v1.1 的 Metric Engine 变更](/1.1/user-guide/deployments-administration/upgrade/#v11-的-metric-engine-变更)

### 配置更新

- [ ] 更新配置文件（移除已废弃的缓存设置）
- [ ] 如果升级到 v1.0，按需更新 metric engine 配置（`sparse_primary_key_encoding`）
- [ ] 如果升级到 v1.2，移除已被忽略的 `sparse_primary_key_encoding` 和 `experimental_sparse_primary_key_encoding` 覆盖项
- [ ] 如果升级到 v1.3，按照[扫描内存计量变更](#扫描内存计量变更)检查 `scan_memory_limit`、`scan_memory_mode` 和 `scan_memory_on_exhausted`
- [ ] 更新 pipeline 配置（移除 `flatten_json_object`，如需要添加 `max_nested_levels`）
- [ ] 如果升级到 v1.2 且为单机部署，在默认沙箱路径不适用时设置 `storage.copy_root`

### 代码更新

- [ ] 如果升级到 v1.2，把 PromQL 中的 `holt_winters(...)` 调用改名为 `double_exponential_smoothing(...)`
- [ ] 如果升级到 v1.2，重写使用 `fill`、`fill_left` 或 `fill_right` 的 PromQL 查询
- [ ] 如果升级到 v1.2，更新依赖整数回绕的 pipeline，并在需要时显式设置 `on_failure` 策略
- [ ] 更新使用有序集聚合的 SQL 查询以使用 `WITHIN GROUP (ORDER BY ...)`
- [ ] 更新使用 `---` 注释的 SQL 脚本改用 `--`
- [ ] 更新访问嵌套 JSON 字段的查询以使用点号表示法
- [ ] 如存在，移除 Jaeger header 配置

### 测试与部署

- [ ] 在非生产环境中测试升级
- [ ] 如果从 v0.17 升级到 v1.0 或更高版本，使用历史 SST 测试，并监控内存用量、压缩进度和查询错误
- [ ] 如果升级到 v1.2，使用触发整数边界的代表性 pipeline 输入进行 dry-run，并验证 `on_failure` 结果是否符合预期
- [ ] 如果升级到 v1.2，在预发环境验证更新后的 PromQL 查询
- [ ] 如果升级到 v1.2，在把本地文件工作流迁移到沙箱或对象存储后验证 `COPY` 和外部表行为
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
