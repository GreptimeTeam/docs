---
keywords: [FAQ, 常见问题, 故障排查, 部署, 迁移, 数据模型, 集成]
description: GreptimeDB 常见问题解答，涵盖数据模型、集成、部署运维和版本差异。
---

# 常见问题

:::tip 想了解基础信息？
- GreptimeDB 是什么 / 适用场景 → [为什么选择 GreptimeDB](/user-guide/concepts/why-greptimedb.md)
- 性能基准测试 → [功能特性](/user-guide/concepts/features-that-you-concern.md#性能对比其他方案怎么样)
- Metrics、Logs、Traces 支持 → [功能特性](/user-guide/concepts/features-that-you-concern.md#greptimedb-如何处理-metricslogs-和-traces)
- 高基数处理 → [功能特性](/user-guide/concepts/features-that-you-concern.md#如何解决高基数问题)
- 数据模型 → [数据模型](/user-guide/concepts/data-model.md)
:::

## 通用问题

### 哪里可以找到开箱即用的 Demo？

可以看 [demo-scene](https://github.com/GreptimeTeam/demo-scene) 仓库，里面有覆盖常见场景（metrics、logs、IoT 等）的端到端示例，本地用 Docker Compose 即可运行。

### GreptimeDB 的性能表现如何？

GreptimeDB 针对 metrics、logs、traces 场景优化，写入吞吐高、查询延迟低、存储成本低。以下是已发布的基准测试报告：

- [GreptimeDB vs. InfluxDB](https://greptime.cn/blogs/2024-08-08-report)
- [GreptimeDB vs. TimescaleDB](https://greptime.cn/blogs/2025-12-09-greptimedb-vs-timescaledb-benchmark)
- [GreptimeDB vs. Grafana Mimir](https://greptime.cn/blogs/2024-08-01-grafana)
- [GreptimeDB vs. ClickHouse vs. Elasticsearch（日志基准测试）](https://greptime.cn/blogs/2025-03-07-greptimedb-log-benchmark)
- [GreptimeDB vs. SQLite](https://greptime.cn/blogs/2024-08-30-sqlite)
- [GreptimeDB vs. Loki](https://greptime.cn/blogs/2025-08-07-beyond-loki-greptimedb-log-scenario-performance-report.html)
- [JSONBench 10 亿条冷查询 #1](https://greptime.cn/blogs/2025-03-18-json-benchmark-greptimedb)

架构层面的对比参见[对比表格](/user-guide/concepts/why-greptimedb.md#greptimedb-对比)。

### GreptimeDB 的设计权衡有哪些？

GreptimeDB 针对可观测性和时序工作负载做了专门优化，与通用 OLTP 数据库有不同的取舍：

- **不支持 ACID 事务**：优先保证高吞吐写入，而非事务一致性。
- **支持删除，但不适合高频删除场景**：GreptimeDB 支持[数据删除](/user-guide/manage-data/overview.md#删除数据)和[基于 TTL 的自动过期](/user-guide/manage-data/overview.md#使用-ttl-策略保留数据)，但不适合需要频繁细粒度删除的场景——可观测性数据本身就是追加为主的。
- **支持 Join，但暂时不是优化重点**：GreptimeDB 支持 SQL Join，但查询引擎主要针对时序数据的过滤-聚合模式优化。简单 Join（如关联查询、metrics 与 logs 的交叉分析）可以正常使用。
- **面向时序数据**：针对 IoT、metrics、logs、traces 优化，而非通用 OLTP。

### GreptimeDB 和 InfluxDB 有什么区别？

主要区别：

- **开源策略**：GreptimeDB 的整个分布式系统完全开源。
- **架构**：基于 Region 的分片设计，针对可观测性工作负载优化。
- **查询语言**：SQL + PromQL vs. InfluxQL + SQL。
- **统一模型**：在一个系统中原生支持 metrics、logs 和 traces。
- **存储**：可插拔引擎，针对不同场景做专项优化。
- **云原生**：原生支持 Kubernetes，计算存储分离（参见 [Kubernetes 部署指南](/user-guide/deployments-administration/deploy-on-kubernetes/overview.md)）。

详细对比参见 [GreptimeDB vs InfluxDB](https://greptime.cn/compare/influxdb)。更多产品对比（如 vs. ClickHouse、Loki 等）可在[官网](https://greptime.cn)的对比菜单中找到。

## 数据模型与 Schema

### Tag 列和 Field 列有什么区别？

GreptimeDB 使用三种语义列类型：**Tag**、**Timestamp** 和 **Field**。

- **Tag** 列用于标识时间序列。具有相同 Tag 值的行属于同一条时间序列。Tag 列默认加入主键索引，查询过滤快。在 SQL 中通过 `PRIMARY KEY` 声明。
- **Field** 列存储实际测量值（数值、字符串等）。Field 列默认不建索引，但可以按需添加[索引](/user-guide/manage-data/data-index.md)。
- **Timestamp** 是时间索引，每张表必须有且仅有一个。

例如，在 `system_metrics` 表中，`host` 和 `idc` 是 Tag，`cpu_util` 和 `memory_util` 是 Field，`ts` 是 Timestamp。

详细说明和示例参见[数据模型](/user-guide/concepts/data-model.md)和[表设计指南](/user-guide/deployments-administration/performance-tuning/design-table.md)。

### GreptimeDB 支持无 Schema 写入吗？

支持。通过 gRPC、InfluxDB Line Protocol、OpenTSDB、Prometheus Remote Write、OpenTelemetry、Loki 或 Elasticsearch 兼容 API 写入时，GreptimeDB 会在首次写入时自动创建表和列，无需手动定义 Schema。

详见[自动 Schema 生成](/user-guide/ingest-data/overview.md#自动生成表结构)。

### 使用自动建表时，如何指定默认的表选项（TTL、append mode 等）？

有三种方式为[自动创建](/user-guide/ingest-data/overview.md#自动生成表结构)的表设置 `ttl`、`append_mode`、`merge_mode`、`skip_wal`、`sst_format` 等表选项：

1. **写入时通过 HTTP Header 指定**：在请求中添加 `x-greptime-hints` 头传递表选项，例如 `x-greptime-hints: ttl=7d, append_mode=true`，表在自动创建时会应用这些选项。详见 [HTTP Hints](/user-guide/protocols/http.md#hints)。

2. **建表后通过 ALTER TABLE 修改**：部分选项支持在建表后修改，包括 `ttl`、`append_mode`、`compaction.*` 和 `sst_format`：
   ```sql
   ALTER TABLE my_table SET 'ttl' = '7d';
   ALTER TABLE my_table SET 'append_mode' = 'true';
   ```
   注意 `merge_mode` 和 `skip_wal` 不支持建表后修改，必须在建表时指定。所有支持的选项和约束参见 [ALTER TABLE](/reference/sql/alter.md#修改表的参数)。

3. **设置数据库级别的默认选项**：创建或修改数据库时指定默认选项，后续自动创建的表会继承这些值：
   ```sql
   CREATE DATABASE my_db WITH (ttl = '7d', append_mode = 'true');
   -- 或
   ALTER DATABASE my_db SET 'ttl' = '7d';
   ```
   其中 `ttl` 和 `compaction.*` 选项具有持续效果——没有单独设置的表会一直继承数据库的值。其他选项（`append_mode`、`merge_mode`、`skip_wal`、`sst_format`）仅作为新建表的默认值。所有可用选项参见 [CREATE DATABASE](/reference/sql/create.md#create-database)。

### 如何自定义 InfluxDB / Prometheus 协议写入时的默认列名？

通过无 Schema 协议写入时，GreptimeDB 会为自动生成的列加上 `greptime_` 前缀。时间戳列在所有无 Schema 协议中默认命名为 `greptime_timestamp`。值列 `greptime_value` 仅用于单值协议（如 Prometheus Remote Write、OpenTelemetry Metrics），因为每条时间序列只有一个数值。多字段协议（如 InfluxDB Line Protocol）直接使用传入数据的字段名，只有时间戳列会使用默认前缀。

要修改前缀，在 `standalone.toml` 或 `frontend.toml` 中设置 `default_column_prefix`：

```toml
# 去掉 "greptime_" 前缀，列名变为 "value" 和 "timestamp"
default_column_prefix = ""

# 或使用自定义前缀，列名变为 "my_value" 和 "my_timestamp"
# default_column_prefix = "my"
```

不设置时默认使用 `greptime_` 前缀。该选项是顶层配置项，修改后需要重启生效。

### 建表后能修改列的数据类型吗？

可以。使用 `ALTER TABLE ... MODIFY COLUMN` 修改 Field 列的数据类型：

```sql
ALTER TABLE monitor MODIFY COLUMN load_15 STRING;
```

目标列必须是 Field 列（不能是 Tag 或时间索引），且必须可为空（nullable），这样类型转换失败时返回 `NULL` 而非报错。

完整的 `ALTER TABLE` 语法参见 [SQL 参考](/reference/sql/alter.md)。

### GreptimeDB 如何处理迟到数据和乱序数据？

GreptimeDB 接受任意时间戳的写入，没有写入时间窗口或顺序要求。迟到和乱序数据正常写入后立即可查。存储引擎的 [Compaction](/user-guide/deployments-administration/manage-data/compaction.md)会在后台自动排序和合并数据。

对于 Append Only 表（常用于日志），行不会被去重，迟到数据只是新增行。对于有主键的表，Tag + Timestamp 组合相同的行遵循[更新语义](/user-guide/manage-data/overview.md#更新数据)。

## 集成与迁移

### GreptimeDB 支持哪些协议、工具和 SDK？

**写入协议**：[OpenTelemetry (OTLP)](/user-guide/ingest-data/for-observability/opentelemetry.md)、[Prometheus Remote Write](/user-guide/ingest-data/for-observability/prometheus.md)、[InfluxDB Line Protocol](/user-guide/ingest-data/for-iot/influxdb-line-protocol.md)、[Loki](/user-guide/ingest-data/for-observability/loki.md)、[Elasticsearch](/user-guide/ingest-data/for-observability/elasticsearch.md)、[MySQL](/user-guide/protocols/mysql.md)、[PostgreSQL](/user-guide/protocols/postgresql.md)、[gRPC](/user-guide/protocols/grpc.md)——参见[协议概述](/user-guide/protocols/overview.md)。

**查询语言**：[SQL](/user-guide/query-data/sql.md)、[PromQL](/user-guide/query-data/promql.md)。

**可视化**：[Grafana](/user-guide/integrations/grafana.md)（官方插件 + MySQL/PostgreSQL 数据源），以及任何支持 MySQL 或 PostgreSQL 协议的工具。

**数据管道**：Vector、Fluent Bit、Telegraf、Kafka——参见[集成概述](/user-guide/integrations/overview.md)。

**SDK**：
- [Go](https://github.com/GreptimeTeam/greptimedb-ingester-go)
- [Java](https://github.com/GreptimeTeam/greptimedb-ingester-java)
- [Rust](https://github.com/GreptimeTeam/greptimedb-ingester-rust)
- [Erlang](https://github.com/GreptimeTeam/greptimedb-ingester-erl)
- [.NET](https://github.com/GreptimeTeam/greptimedb-ingester-dotnet)
- 其他语言（Python、Ruby、Node.js 等）：可以使用任何 OpenTelemetry SDK、InfluxDB 客户端库或 MySQL/PostgreSQL 驱动，GreptimeDB 均兼容。

### 如何选择合适的写入协议？

GreptimeDB 支持多种写入协议，吞吐性能差异很大。以下数据来自本地测试环境（100 万时间序列，batch size 1,000）——**请关注相对比例而非绝对数值**，实际吞吐取决于硬件和负载：

| 协议 | 相对吞吐 |
| --- | --- |
| gRPC Bulk (Arrow Flight) | 最高（约 55 倍 SQL） |
| gRPC Stream | 约 40 倍 SQL |
| gRPC SDK (Unary) | 约 33 倍 SQL |
| OTLP Logs | 约 29 倍 SQL |
| InfluxDB Line Protocol | 约 27 倍 SQL |
| MySQL INSERT | 约 2 倍 PostgreSQL |
| PostgreSQL INSERT | 基线 |

**选择建议：**

- **通用场景**：gRPC SDK——简洁易用且性能好，支持无 Schema 写入。
- **批量导入**（数据迁移、回填）：gRPC Bulk——吞吐最高，需要预先建表。
- **持续流式写入**（IoT、监控采集器）：gRPC Stream——长连接上持续高吞吐。
- **生态集成**：InfluxDB Line Protocol（兼容 Telegraf）或 OTLP（兼容 OpenTelemetry）——吞吐不错且工具生态丰富。
- **开发调试**：SQL 协议（MySQL / PostgreSQL）——吞吐较低但方便排查。

完整的基准测试细节和方法参见[写入协议基准测试](https://greptime.cn/blogs/2026-03-24-ingestion-protocol-benchmark)博客。

### 如何将 Grafana 连接到 GreptimeDB？

GreptimeDB 支持三种 Grafana 数据源接入方式：

- **[GreptimeDB 插件](/user-guide/integrations/grafana.md#greptimedb-数据源插件)**：官方插件，支持 SQL 和 PromQL 查询。
- **[Prometheus 数据源](/user-guide/integrations/grafana.md#prometheus-数据源)**：通过 GreptimeDB 的 Prometheus 兼容端点使用 PromQL 仪表板。
- **[MySQL 数据源](/user-guide/integrations/grafana.md#mysql-数据源)**：通过 GreptimeDB 的 MySQL 协议端点接入。

详细配置参见 [Grafana 集成指南](/user-guide/integrations/grafana.md)。

### 如何从其他数据库迁移到 GreptimeDB？

GreptimeDB 提供以下迁移指南：

- **从 InfluxDB 迁移**：Line Protocol 和数据迁移
- **从 Prometheus 迁移**：Remote Write 和历史数据迁移
- **从 ClickHouse 迁移**：表结构和数据迁移
- **从 MySQL/PostgreSQL 迁移**：基于 SQL 的迁移

详细说明参见[迁移概述](/user-guide/migrate-to-greptimedb/overview.md)。

## 部署与运维

### 有哪些部署方式？

**集群部署**（生产环境）：
- 至少 3 个节点保证高可用
- 三个组件：metasrv、frontend、datanode
- 组件可以合并部署或独立部署
- 参见[容量规划指南](/user-guide/deployments-administration/capacity-plan.md)

**单机部署**（开发 / 边缘 / IoT）：
- 单个二进制文件，所有组件集成在一个进程中
- 支持 Linux、macOS、Android ARM64、Raspberry Pi
- 参见[安装指南](/getting-started/installation/overview.md)

**存储后端**：S3、GCS、Azure Blob（推荐生产）；本地磁盘（开发测试或者中小规模）。元数据：集群模式使用推荐 RDS 或 etcd，单机模式本地存储。

完整介绍参见[部署与管理概述](/user-guide/deployments-administration/overview.md)。

### Metasrv 的元数据存储后端应该选哪个？

GreptimeDB 的 metasrv 组件支持 etcd、MySQL 和 PostgreSQL 作为元数据存储后端。

生产环境下，**推荐使用 PostgreSQL 或 MySQL（包括云 RDS 服务）**——大多数团队对关系型数据库有更丰富的运维经验、监控方案和容灾策略。

**etcd 仍然完全受支持并持续维护**，并非被废弃。如果你的团队在 etcd 运维方面有丰富经验和成熟工具链，etcd 也是完全可行的选择。

最终取决于团队的技术栈和已有基础设施。各后端的配置方式参见[元数据存储配置](/user-guide/deployments-administration/manage-metadata/configuration.md)。

### 如何管理 GreptimeDB？

GreptimeDB 使用**标准 SQL 作为管理接口**。你可以通过 SQL 完成[表的基本操作如建表删表](/user-guide/deployments-administration/manage-data/basic-table-operations.md)、[修改 Schema](/reference/sql/alter.md)、设置 [TTL 策略](/user-guide/manage-data/overview.md#使用-ttl-策略保留数据)、配置[索引](/user-guide/manage-data/data-index.md)等操作，不用写配置文件，也不用调专有 API。

节点级别的配置参见[配置指南](/user-guide/deployments-administration/configuration.md)。

### 如何升级 GreptimeDB？

参见[升级指南](/user-guide/deployments-administration/upgrade.md)，包含升级步骤、兼容性说明和不兼容变更。

### 如何备份和恢复数据？

GreptimeDB 提供数据导出和导入工具，支持全库备份与恢复，包括仅导出 Schema 和 S3 导出。

参见[数据导出与导入](/user-guide/deployments-administration/disaster-recovery/back-up-&-restore-data.md)。

### 能否在单机模式和集群模式之间迁移数据？

可以。使用 [`COPY TO`](/reference/sql/copy.md) 从单机模式导出表数据，再用 [`COPY FROM`](/reference/sql/copy.md) 导入到集群（反过来也一样）。数据以 Parquet 格式导出，可以存放在本地或对象存储（S3、GCS）中。

### WAL 目录越来越大，正常吗？

WAL（Write-Ahead Log）空间在数据刷写到持久存储后会循环复用。如果 WAL 目录看起来很大，通常是因为数据尚未刷写，或者 WAL 保留设置需要调整。WAL 是临时空间，评估存储用量时只看数据目录（`data`）就行。

WAL 配置参见[配置指南](/user-guide/deployments-administration/configuration.md)。

### GreptimeDB 的扩展能力如何？

- 表和列的数量没有严格限制，性能主要取决于主键设计而非表数量。
- Region 内数据自动按时间组织。
- 通过 `PARTITION` 子句手动分片——参见[表分片指南](/user-guide/deployments-administration/manage-data/table-sharding.md)。
- 多层缓存（写入缓存 + LRU 读缓存）优化性能。
- 对象存储后端（S3/GCS/Azure Blob）提供几乎无限的存储容量。
- 分布式查询执行，支持 MPP 处理大规模数据集。

### 数据如何分布？

- 建表时通过 `PARTITION` 子句手动分区——参见[表分片指南](/user-guide/deployments-administration/manage-data/table-sharding.md)。
- Region 内按时间自动组织。
- 支持手动 Region 迁移进行负载均衡——参见 [Region 迁移指南](/user-guide/deployments-administration/manage-data/region-migration.md)。
- 自动 Region 故障转移保障容灾——参见 [Region 故障转移](/user-guide/deployments-administration/manage-data/region-failover.md)。

### 有哪些灾备方案？

GreptimeDB 提供多种灾备策略：

- **单机灾备**：远程 WAL + 对象存储，RPO=0，RTO 分钟级。
- **Region 故障转移**：单个 Region 自动切换，停机时间极短。
- **双活容灾**（企业版）：双节点间同步复制请求。
- **跨区域单集群**：横跨三个区域，零 RPO，区域级容错。
- **备份与恢复**：定期数据备份，RPO 取决于备份频率。

参见[灾备方案概述](/user-guide/deployments-administration/disaster-recovery/overview.md)。

### 如何监控和排查问题？

GreptimeDB 暴露 Prometheus 兼容的监控指标，并提供健康检查端点。监控配置和故障排查指南参见[监控概述](/user-guide/deployments-administration/monitoring/overview.md)。

## 开源版 vs 企业版 vs 云服务

### 各版本有什么区别？

- **开源版**：完整的分布式系统、多协议支持、基础认证。
- **企业版**：在开源版基础上增加 CBO 查询优化、双活容灾、自动扩缩容和索引、RBAC/LDAP 集成、7×24 技术支持。
- **GreptimeCloud**：全托管方案，为生产工作负载提供资源和性能保障、可预测的定价、SLA 保障。

详细功能对比参见[价格与功能](https://greptime.cn/pricing#differences)。

### GreptimeDB Dashboard 有没有鉴权功能？

开源版 [GreptimeDB Dashboard](/getting-started/installation/greptimedb-dashboard.md) 本身不包含鉴权功能。如需限制访问，你可以：

- 在 Dashboard 前面放一个反向代理（如 Nginx、Caddy），配置 HTTP Basic Auth 或其他认证机制。
- 将 Dashboard 托管在你的内部 HTTP 服务后面，结合组织内部的认证体系。

**GreptimeDB 企业版**提供内置鉴权和访问管理的管理控制台。

### 有哪些安全功能？

**开源版**：
- 用户名/密码认证
- 用户读写权限控制
- TLS/SSL 连接加密

**企业版 / 云服务**：
- 基于角色的访问控制（RBAC）
- LDAP 支持
- 团队管理和 API 密钥
- 静态数据加密
- 合规审计日志
