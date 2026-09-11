---
keywords: [release notes, greptimedb enterprise]
description: GreptimeDB 企业版 26.05 系列发布说明，新功能包括定时 Compaction、Apache Iceberg 数据湖（早期预览）、多维度 Region 均衡以及更细粒度的访问控制等。
---

# GreptimeDB 企业版 26.05

## 26.05.1

我们很高兴地宣布 GreptimeDB 企业版 **26.05.1** 发布。这是 26.05 系列的一次更新，带来了多项重要的运维能力：定时 Compaction、Apache Iceberg 数据湖支持的早期预览、多维度 Region 均衡以及更细粒度的访问控制。此版本同时将底层的 GreptimeDB 引擎升级到 **v1.2**。

_本版本基于 GreptimeDB 开源引擎 v1.2 构建。_

### 特性亮点

#### 定时 Compaction（Compaction Cronjob）

Compaction 现在可以按照由 Metasrv 管理的调度计划定时执行，而不再只能按需手动触发。新的 compaction cronjob 会在所有 Region 中解析 compaction 目标，提交并跟踪任务，将状态持久化到 KV 存储中，并自动取消过期的仍在运行的任务。同时还提供了一组管理用的 HTTP 接口，方便运维人员查看和控制定时 compaction。这样一来，就可以按可预期的节奏维护存储健康状态，减少人工介入。

#### Apache Iceberg 数据湖（早期预览）

本版本引入了 Apache Iceberg 数据湖支持的**早期预览**，开始覆盖完整的表生命周期：

- 支持 Iceberg 表的 **repartition、truncate 和 drop**，并管理完整的表状态生命周期。
- 支持**批量写入（bulk ingestion）**和 region 编辑钩子，并提供远程 compaction 钩子，使 Iceberg 数据可以通过企业版的 compaction 管道进行压缩。
- Iceberg 表支持**直方图（histogram）数据类型**以及 **Metric 引擎物理表**。

#### 多维度 Region 均衡

Region 均衡不再只考虑写入负载。均衡器会记录每个 Region 的查询 CPU 速率历史，并以独立的准入规则评估读负载的稳定性，同时支持多维度的均衡状态。其效果是在读写混合负载以及计划内维护期间，Region 的分布更加稳定。

#### 更细粒度的访问控制

企业版 RBAC 新增了多项控制能力，授权更严格、更具表达力：

- 支持为自定义角色指定**具名权限动作（named permission actions）**。
- 支持**基于正则表达式的数据库 ACL**，并在创建数据库时自动为创建者授予该数据库的 ACL。
- 提供可选的**查询防护（query guard）**，可以对所有用户禁用 `DROP TABLE` / `DROP DATABASE`，防止误执行破坏性操作。

#### 表的 Soft Drop

`DROP TABLE` 可以配置为 **soft drop**（需显式开启）：表的数据将被保留，并可通过 `UNDROP TABLE` 恢复，而不是立即销毁。Soft-dropped 的表在被恢复（undrop）或清除（purge）之前，会持续占用存储空间。

#### 运维改进

- 面向企业版负载的、可配置的**查询 spill**。
- 按组件设置**最大 CPU** 的选项。
- 企业版 **Flight schema 默认对齐**，保证通信格式一致；Flight **批量写入支持自动建表**。
- 提供用于部署 GreptimeDB 及监控组件的 **Ansible playbook**。

#### 来自 GreptimeDB v1.2 引擎的更新

- **`JSON2`**——改进的 JSON 数据类型，为列式存储优化。
- 支持**带时间范围的手动 compaction**，与新的定时 compaction 互为补充。
- **生命周期事件记录**——为数据库/表/视图 DDL、Flow DDL、repartition、GC 和 WAL 清理记录结构化的事件过程，大幅提升集群操作的可观测性。可在企业版 Dashboard 界面中查看。
- **性能**：采用字典编码的 series key 提升查询性能；range 查询的输入投影裁剪；compaction picker 改为异步执行，不再阻塞 region worker。

### 重要缺陷修复

**企业版：**

- 批量写入现在会正确校验 `JSONB` 列的写入数据类型，避免写入非法数据。
- 修正了 v1.2 引擎上的 ingestion merge 批大小。
- 正确处理远程动态过滤的开关；规范了 region 均衡器稳定性相关的选项名。

**来自 GreptimeDB v1.2 引擎的修复：**

- `PromQL` 的 `or` 查询在操作数为空时不再返回错误结果。
- MySQL 协议现在对无法表示的时间戳**直接报错（fail closed）**，而不是静默地错误处理。
- Prometheus remote-write 超时现在是**可重试的**，提升了瞬时故障下数据写入的韧性。
- **索引构建可靠性**：异步索引构建以 schema generation 进行隔离，并按条件发布，修复了索引构建与 schema 变更并发执行时可能出现的竞争问题。
- 升级时**保持对旧版 WAL 选项的兼容**，已有配置可以继续工作。

### 安全更新

- **独立的 HTTP API 服务端口**——HTTP API 现在运行在专用端口上，将 API 流量与其他服务流量隔离。
- **SQL 本地文件系统访问沙箱化**——SQL 执行被沙箱化，无法再读取本地文件系统，封堵了本地文件访问漏洞。
- `quinn-proto`: 0.11.14 → 0.11.16 _（依赖更新）_
