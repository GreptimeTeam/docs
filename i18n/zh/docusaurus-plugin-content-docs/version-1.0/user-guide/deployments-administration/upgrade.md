---
keywords: [GreptimeDB 升级, 版本升级示例]
description: 介绍如何将 GreptimeDB 升级到最新版本，包括一些不兼容的变更和升级具体步骤。
---

# 版本升级

## 概览

本指南提供 GreptimeDB 的升级说明，包括每个版本的兼容性信息和破坏性变更。升级前，请确保查看与你的升级路径相关的破坏性变更。

完整的版本历史和功能新增，请参见[发行说明](/release-notes/)。

## 升级到 v1.0 的路径

### 从 v0.16 升级到 v1.0

如果你当前运行的是 v0.16，可以直接升级到 v1.0。请参见[从 v0.16 升级到 v1.0](#从-v016-升级到-v10) 了解所有相关的破坏性变更。

### 从 v0.17 升级到 v1.0

如果你当前运行的是 v0.17，可以直接升级到 v1.0。请参见[从 v0.17 升级到 v1.0](#从-v017-升级到-v10) 了解破坏性变更。

### 从更早版本升级

**重要提示：** 本指南仅涵盖从 v0.16 及更高版本的升级。

如果你运行的版本早于 v0.16，必须先按照当前版本的升级文档升级到 v0.16。成功升级到 v0.16 后，再使用本指南升级到 v1.0。

## 各版本的破坏性变更

### 从 v0.17 升级到 v1.0

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
