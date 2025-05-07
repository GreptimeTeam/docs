---
keywords: [Trace, OpenTelemetry, Jaeger, Grafana]
description: 介绍从 Trace 数据中衍生其他数据的机制
---

# 扩展 Trace 数据

:::warning

本章内容目前仍处于实验阶段，在未来的版本中可能会有所调整。

:::

本章主要介绍如何从 Trace 数据中生成衍生数据。

## 从 Trace 生成聚合指标数据

每个 Span 中都包含 `duration_nano` 字段代表其处理时间，在这个例子里，我们将创建
[Flow](/user-guide/flow-computation/overview.md) 任务来生成延迟的指标数据。

这里我们使用 OpenTelemetry Django 埋点数据作为源数据，不过因为使用的都是通用字段，
所以并不影响例子的解读。

### 创建 Sink 表

首先，我们创建一个 Flow 中的物化视图，Sink 表。对于延迟数据，我们使用
[uddsketch](https://arxiv.org/abs/2004.08604) 结构来快速生成特定百分为的延迟数据。

```sql
CREATE TABLE "django_http_request_latency" (
    "span_name" STRING NULL,
    "latency_sketch" BINARY,
    "time_window" TIMESTAMP time index,
    PRIMARY KEY ("span_name")
);
```

表中包含三个关键列：

- `span_name`: Span 的名称或类型
- `latency_sketch`: uddsketch 数据
- `time_window`: 时间窗口

### 创建 Flow

下一步我们创建用于计算 uddsketch 数据的 Flow 任务。该任务以 30s 为时间窗口。这里
例子里我们过滤了 `scope_name` 字段，在实际的场景里这是可选的。

```sql
CREATE FLOW django_http_request_latency_flow
SINK TO django_http_request_latency
EXPIRE AFTER '30m'
COMMENT 'Aggregate latency using uddsketch'
AS
SELECT
    span_name,
    uddsketch_state(128, 0.01, "duration_nano") AS "latency_sketch",
    date_bin('30 seconds'::INTERVAL, "timestamp") as "time_window",
FROM web_trace_demo
WHERE
    scope_name = 'opentelemetry.instrumentation.django'
GROUP BY
    span_name,
    time_window;
```

### 查询指标

当 Trace 数据写入进来时，sink 表中将有数据生成。我们可以用 SQL 语句来查询 p90 分
为的延迟：

```sql
SELECT
    span_name,
    time_window,
    uddsketch_calc(0.90, "latency_sketch") AS p90
FROM
    django_http_request_latency
ORDER BY
    time_window DESC
LIMIT 100;
```
