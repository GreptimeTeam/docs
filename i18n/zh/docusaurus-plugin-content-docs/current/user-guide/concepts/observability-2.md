---
keywords: [observability 2.0, 宽事件, 统一可观测性, 三支柱, 高基数, AI agent]
description: 解释 Observability 2.0 范式以及 GreptimeDB 如何被设计为宽事件的原生数据库。
---

# Observability 2.0

Observability 2.0 是可观测性领域从"三支柱"（metrics、logs、traces）向统一数据模型的演进。核心思路是：不再为每种信号维护独立系统，而是用高基数的宽事件（wide events）作为单一数据源，支持事后分析，而非依赖预聚合。

这个术语本身有争议，但背后的问题是真实的：metrics、logs、traces 之间的壁垒，让排障和分析变得越来越痛苦。

## 三支柱的局限

可观测性长期依赖 metrics、logs、traces 三大支柱，也催生了大量优秀工具（包括 [OpenTelemetry](/user-guide/ingest-data/for-observability/opentelemetry.md)）。但随着系统复杂度增长，三支柱架构的问题越来越明显：

1. **数据孤岛**：metrics、logs、traces 分开存储，互不关联。一个错误率飙升的告警，要手动在三个系统间切换才能定位到对应的日志和链路——这个过程既慢又容易遗漏。

2. **粒度和成本两难**：传统 metrics 靠预聚合压缩数据量。但为了保留排障所需的细节，团队不得不创建百万级时间序列，各系统还有大量冗余元数据，成本反而比省下的更高。

3. **日志的结构化困境**：日志天然包含结构化信息，但从非结构化文本中提取价值需要大量的解析、索引和计算。

在 AI agent 和微服务场景下，这些问题更加突出——高维、半结构化数据已经是常态。

## 宽事件：统一数据模型

Observability 2.0 用**宽事件（wide events）**来解决这些问题。宽事件是一条上下文丰富、高维度、高基数的记录，在单个事件中捕获完整的应用状态。

### 什么是宽事件？

不预计算 metrics，不预处理日志，直接保存原始的高保真事件数据。比如一个 POST 请求的宽事件可能包含：

- 用户信息和订阅数据
- 带参数的数据库查询
- 缓存操作
- HTTP headers
- 总计：单条记录 2KB+ 的上下文

```json
{
  "method": "POST",
  "path": "/articles",
  "service": "articles",
  "outcome": "ok",
  "status_code": 201,
  "duration": 268,
  "user": {
    "id": "fdc4ddd4-8b30-4ee9-83aa-abd2e59e9603",
    "subscription": { "plan": "free", "trial": true }
  },
  "db": {
    "query": "INSERT INTO articles (...)",
    "parameters": { "$1": "f8d4d21c-..." }
  },
  "cache": { "operation": "write", "key": "..." },
  "headers": { "user-agent": "...", "cf-connecting-ip": "..." }
}
```

### Metrics、Logs、Traces 只是投影

宽事件的关键洞察：metrics、logs、traces 不是三种独立的数据类型，而是同一组底层事件的不同投影：

- **Metrics**：`SELECT COUNT(*) GROUP BY status, date_bin('1m', timestamp)` — 聚合投影
- **Logs**：`SELECT message, timestamp WHERE message @@ 'error'` — 文本投影
- **Traces**：`SELECT span_id, duration WHERE trace_id = '...'` — 关系投影

有了原始宽事件，任何 metrics、日志查询、trace 视图都可以事后从同一份数据派生出来——不需要预聚合，不需要改代码。

## AI Agent 为什么需要宽事件

AI agent 的非确定性行为给可观测性带来了全新的挑战。传统应用有可预测的代码路径，但 agent 是动态决策的——选工具、多步推理、根据上下文调整响应。调试"agent 为什么这么做"需要保留完整的执行状态：prompt、推理链、工具调用参数、memory 状态、质量评分——全部在一条可查询的记录里。

三支柱架构在这里完全不适用：prompt 塞进日志会丢失结构，工具调用硬套进 trace 对动态行为太僵硬，token 用量做成 metrics 会丢失调试所需的上下文。AI agent 天然产生高基数（百万级独立 session）、高维度（每次执行几十个字段）、上下文丰富的事件——这恰恰是宽事件要解决的问题。

这不是"AI 时代的可观测性"这种营销话术，而是技术上的必然：非确定性系统需要细粒度、结构化、可追溯的分析能力。

## GreptimeDB 的 Observability 2.0 支撑

GreptimeDB 的[架构](/user-guide/concepts/architecture.md)天然适配 Observability 2.0。列式引擎高效压缩宽事件（生产环境实测比 Loki 节省 50%、比 Elasticsearch 节省约 90% 存储），[原生对象存储](/user-guide/concepts/storage-location.md)（S3、Azure Blob、GCS）让存储成本随数据量线性增长而非指数增长。以下是和宽事件最相关的核心能力。

### 统一的 Tag + Timestamp + Field 模型

所有可观测数据——metrics、logs、traces——在 GreptimeDB 中共享同一套 [schema 模型](/user-guide/concepts/data-model.md)：
- **Tag**：实体标识（pod_name、service、region、trace_id、session_id）
- **Timestamp**：时间戳
- **Field**：多维度值（message、duration、status_code、prompt、response）

一个模型统一三种信号，在单条 SQL 里就能做跨信号关联。

### SQL + PromQL 跨信号关联

用一条 [SQL](/user-guide/query-data/sql.md) 同时查 metrics 异常、日志模式和 trace 延迟：

```sql
SELECT
  date_bin('1m', timestamp) AS minute,
  COUNT(CASE WHEN status >= 500 THEN 1 END) AS errors,
  AVG(duration) AS avg_latency
FROM access_logs
WHERE timestamp >= NOW() - INTERVAL '1 hour'
  AND message @@ 'timeout'
GROUP BY date_bin('1m', timestamp);
```

不用在系统间切换，所有信号在同一个数据库里。同时支持 [PromQL](/user-guide/query-data/promql.md)，现有 Grafana 仪表板可以直接复用。

### Flow 引擎：从宽事件实时派生 Metrics

GreptimeDB 的 [Flow 引擎](/user-guide/flow-computation/overview.md)直接从原始事件实时计算 metrics，不需要额外的预处理管道：

```sql
CREATE FLOW http_status_count
SINK TO status_metrics
AS
SELECT
  status,
  COUNT(*) AS count,
  date_bin('1m', timestamp) AS time_window
FROM access_logs
GROUP BY status, time_window;
```

同一份宽事件数据，既能驱动预聚合仪表板，也能支持 ad-hoc 的探索式查询。

## 生产验证

宽事件不是概念，已经在大规模生产环境中得到验证：

- **得物（Poizon）**：宽事件的早期生产级落地。Flow 引擎 + 多级持续聚合，P99 延迟从秒级降到毫秒级。[详情 →](https://greptime.cn/blogs/2025-05-06-poizon-observability-greptimedb-monitoring-use-case)

- **OB Cloud**：170+ 可用区、日处理数十亿条日志，从 Loki 迁移到 GreptimeDB。查询性能提升 10 倍，TCO 降低 30%。[详情 →](https://greptime.cn/blogs/2025-08-07-beyond-loki-greptimedb-log-scenario-performance-report)

- **Traces 存储**：替换 Elasticsearch 作为 Jaeger 后端。存储成本降低 45 倍，冷数据查询快 3 倍，支撑每天 400B 行全量采集。[详情 →](https://greptime.cn/blogs/2025-04-24-elasticsearch-greptimedb-comparison-performance)

## 开始使用

迁移到 Observability 2.0 不需要一步到位。从任意一个支柱切入——[Logs](/user-guide/logs/overview.md)、[Metrics](/user-guide/ingest-data/for-observability/prometheus.md)、[Traces](/user-guide/traces/overview.md)——然后逐步扩展。GreptimeDB 开箱支持 [PromQL](/user-guide/query-data/promql.md)、[Jaeger](/user-guide/query-data/jaeger.md)、[OpenTelemetry](/user-guide/ingest-data/for-observability/opentelemetry.md)、[Grafana](/user-guide/integrations/grafana.md)，现有仪表板和告警直接可用。详细迁移路径参见[为什么选择 GreptimeDB](./why-greptimedb.md)。

## 延伸阅读

- [什么是可观测性 2.0？什么是可观测性 2.0 原生数据库？](https://greptime.cn/blogs/2025-04-24-observability2.0-greptimedb.html) — 完整愿景和技术深入
- [让 Observability 更简单 —— GreptimeDB 统一存储架构](https://greptime.cn/blogs/2024-12-24-observability) — GreptimeDB 统一模型的设计哲学
- [Agent 可观测性：旧剧本能否应对新游戏？](https://greptime.cn/blogs/2025-12-11-agent-observability) — AI agent 为什么需要宽事件
- [得物可观测平台架构升级：基于 GreptimeDB 的全新监控体系实践](https://greptime.cn/blogs/2025-05-06-poizon-greptimedb-observability) — 生产级验证
- [超越 Loki！性能报告](https://greptime.cn/blogs/2025-08-07-beyond-loki-greptimedb-log-scenario-performance-report) — Logs 迁移
- [还在用 Elasticsearch？你已经 Out 了！](https://greptime.cn/blogs/2025-04-17-elasticsearch-greptimedb-comparison) — Traces 迁移
