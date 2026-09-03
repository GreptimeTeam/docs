---
keywords: [observability 2.0, 宽事件, 统一可观测性, 三支柱, 高基数, AI agent]
description: 介绍 Observability 2.0 与宽事件、相关工程取舍，以及 GreptimeDB 如何支持这种可选做法。
---

# Observability 2.0

Observability 2.0 是业内对一种遥测数据思路的称呼，不是产品分类。它通常指保留宽事件，让使用者不必在采集数据时就预先确定所有分析问题。

GreptimeDB 的[数据模型](./data-model.md)同时支持原生 metrics、logs、traces 和宽事件。本页只讨论通常与 Observability 2.0 相关的宽事件做法。GreptimeDB 支持这种实践，但不要求用户采用；metrics、logs、traces 仍然是一等能力。

## 三支柱的局限

Metrics、logs、traces 仍然是有效的抽象。问题不在三类信号本身，而在它们经常被不同系统隔开：

1. **上下文分散**：信号分开存储和查询时，需要额外操作才能把告警、日志和 trace 对应起来。
2. **采集时就要确定问题**：预聚合 metrics 能高效回答已知问题，但无法找回没有记录的维度。
3. **结构丢失**：纯文本日志里往往包含有用字段，事后解析和索引的成本较高。

共同的 schema 概念、存储基础和查询工具可以减少这些边界。宽事件是保留更多上下文的一种做法，不是所有 metrics、logs、traces 的替代品。

## 宽事件

宽事件（wide event）是一条包含较多字段的结构化记录，用于描述一次操作或业务事件。它可以带有用户 ID、session ID、trace ID、请求属性等高基数字段。

### 什么是宽事件？

例如，一次 POST 请求对应的事件可以包含用户与订阅信息、数据库与缓存操作、HTTP 属性、执行结果和耗时：

```json
{
  "timestamp": "2026-08-12T08:15:30Z",
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
    "query": "INSERT INTO articles (...)"
  },
  "cache": { "operation": "write" },
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736"
}
```

只采集确实有用、适合留存的上下文。凭证、个人数据、查询参数、prompt 和请求正文可能需要在写入前过滤或脱敏。

<AnchorAlias id="metricslogstraces-只是投影" />
<AnchorAlias id="从上下文事件派生不同视图" />

### 从宽事件派生不同视图

在这种思路下，一条宽事件可以形成多种视图：

- 按状态和时间窗口聚合成 metric；
- 作为包含事件详情的日志检索；
- 通过 trace ID 和 span ID 展示为 trace 或 span。

这是一种分析模型，并不要求所有信号都从原始事件还原。固定聚合通常更适合原生 metrics；调用关系和延迟分析仍然适合标准 trace 数据。

<AnchorAlias id="ai-agent-为什么需要宽事件" />

## AI Agent 为什么需要细粒度上下文

观测 AI 应用时，往往需要关联模型请求、响应、工具调用、延迟、token 用量、评估结果和应用状态。如果 instrumentation 采集了这些内容，结构化事件可以把上下文保留下来，供后续查询。

代价也同样直接：prompt 和响应可能很大或包含敏感信息，session ID 会带来高基数，不完整的 instrumentation 只能得到不完整的上下文。字段、留存周期和脱敏规则应由实际分析需求决定。

[表语义层](./semantic-layer.md)可以说明每张表代表的内容，让 agent 和工具不必根据列名猜测 signal type、source 或 metric type。

<AnchorAlias id="greptimedb-的-observability-20-支撑" />

## GreptimeDB 如何支持宽事件

<AnchorAlias id="统一的-tag--timestamp--field-模型" />
<AnchorAlias id="sql--promql-跨信号关联" />
<AnchorAlias id="flow-引擎从宽事件实时派生-metrics" />
<AnchorAlias id="生产验证" />

GreptimeDB 使用普通的时间索引表保存宽事件。Pipeline、SQL 和 Flow 分别处理这条路径中的不同阶段：

| 阶段 | GreptimeDB 能力 | 作用 |
| --- | --- | --- |
| 按需处理写入数据 | [Pipeline](/user-guide/logs/use-custom-pipelines.md) | 在存储前解析、转换和补充日志。 |
| 存储与分析 | 时间索引表和 SQL | 保留宽事件，用于明细查询和事后分析。 |
| 派生数据 | [Flow](/user-guide/flow-computation/overview.md) | 持续聚合写入的数据行，生成单独的 metrics 表。 |

采用宽事件不要求原生 metrics、logs、traces 和原始事件共用一张表。它们可以使用不同的表、schema、留存策略和索引。

Pipeline 和 Flow 处理不同阶段。Pipeline 在写入时解析、转换和补充日志，输出结构化的多列数据；如果这些字段保留了一次操作或业务事件的上下文，每一行就可以作为宽事件。Flow 可以在这些事件行持续写入时进行聚合，生成供仪表板和告警使用的 metrics 表。

![Pipeline 可以在写入阶段处理日志，Flow 可以把持续写入的事件行聚合到派生 metrics 表。](/optional-pipeline-flow.zh.svg)

例如，Flow 可以从事件表派生状态指标：

```sql
CREATE FLOW http_status_count
SINK TO status_metrics
AS
SELECT
  status_code,
  COUNT(*) AS count,
  date_bin('1 minute'::INTERVAL, timestamp) AS time_window
FROM access_logs
GROUP BY status_code, time_window;
```

已存储的事件仍可用于详细的 SQL 分析，sink 表则高效支持固定的仪表板和告警。

## 工程取舍

宽事件做法把灵活性带来的成本放在了另外几个地方：

- **更宽的事件会增加数据量。** 更多字段和重复上下文会消耗写入带宽与存储空间，列式压缩也无法消除这部分成本。
- **高基数和长期留存会推高成本。** 只保留有用的维度，并分别设置原始数据与派生数据的留存周期。
- **完整上下文依赖 instrumentation 质量。** 标识缺失、schema 不一致或上下文传播不完整，无法靠数据库事后补齐。
- **固定聚合仍然适合原生 metrics。** Counter、gauge、histogram、recording rule、仪表板和告警通常不需要每个样本都有对应的原始事件。

Schema 管理、采样、脱敏和留存策略都是设计的一部分。宽事件应当覆盖排障所需的信息，而不是把应用能产生的字段全部写入。

<AnchorAlias id="开始使用" />

## 两种采用路径

### 保留原生信号，只统一存储和查询

继续沿用现有写入协议。指标可使用 PromQL 查询，所有信号均可使用 SQL 查询；链路数据还可通过 Jaeger 兼容接口查询。各类信号分别存入 GreptimeDB 的不同表，需要跨信号分析时，再通过共同标识和 SQL 关联。这条路径对 instrumentation 和仪表板的改动较小。

可以从 [Prometheus](/user-guide/ingest-data/for-observability/prometheus.md)、[日志](/user-guide/logs/overview.md)、[OpenTelemetry](/user-guide/ingest-data/for-observability/opentelemetry.md)或 [traces](/user-guide/traces/overview.md) 开始。

### 对需要完整上下文的业务引入原始事件

把选定的业务操作或 AI 工作流记录为结构化事件。如果上下文来自日志，可以用 [Pipeline](/user-guide/logs/use-custom-pipelines.md)在写入时提取字段并转换为结构化数据。事件表用于事后分析，再通过 [Flow](/user-guide/flow-computation/overview.md) 派生 metrics，供固定的仪表板和告警使用。这条路径能提供更多上下文，但数据量更大，对 schema 和留存管理的要求也更高。

两条路径可以同时使用。只有在额外上下文值得相应成本时，才需要引入原始事件。

## 延伸阅读

- [什么是可观测性 2.0？什么是可观测性 2.0 原生数据库？](https://greptime.cn/blogs/2025-04-24-observability2.0-greptimedb.html) — 对宽事件思路的早期介绍
- [让 Observability 更简单——GreptimeDB 统一存储架构](https://greptime.cn/blogs/2024-12-24-observability) — GreptimeDB 的统一存储模型
- [Agent 可观测性：旧瓶装新酒，还是需要新瓶？](https://greptime.cn/blogs/2025-12-11-agent-observability) — AI 应用调试需要的上下文
- [得物可观测平台架构升级：基于 GreptimeDB 的全新监控体系实践](https://greptime.cn/blogs/2025-05-06-poizon-greptimedb-observability) — 原始事件和持续聚合的生产实践
