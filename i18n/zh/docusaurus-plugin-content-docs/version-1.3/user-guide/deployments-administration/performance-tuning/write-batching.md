---
keywords: [GreptimeDB, 写入批量处理, 写入协议, 配置, frontend, standalone]
description: 在 GreptimeDB standalone 或 frontend 配置文件中配置服务端写入批量处理。
---

# 服务端写入批量处理

GreptimeDB 可以在将写入刷写到存储之前进行批量处理。请在 standalone 或 frontend 配置文件中配置。写入批量处理默认关闭。

`[pending_rows_batcher]` 对写入普通表的请求进行批量处理。`[pending_rows_batcher.logical_table]` 对使用 metric engine 逻辑表的 Prometheus Remote Write 和 Prometheus 兼容格式的 OTLP 指标进行批量处理。

## 普通表批量处理

要为普通表启用批量处理，请配置至少一个协议和非零刷写间隔：

```toml
[pending_rows_batcher]
protocols = ["influxdb"]
pending_rows_flush_interval = "500ms"
```

此批量写入器支持 `influxdb`、`opentsdb`、`otlp`、`logs`、`loki`、`splunk`、`elasticsearch`、`http_sql`、`mysql`、`postgres` 和 `prom`。

未启用 metric engine 时，Prometheus Remote Write 使用此批量写入器。OTLP 日志、追踪和未使用 metric engine 的 OTLP 指标也使用它。MySQL 和 PostgreSQL 对符合条件的 `INSERT` 使用它。它不支持流式 Flow 源表。

## Metric engine 逻辑表批量处理

此批量写入器仅支持 `prom` 和 `otlp`。启用 metric engine 后，它处理 Prometheus Remote Write 和 Prometheus 兼容格式的 OTLP 指标：

```toml
[prom_store]
with_metric_engine = true

[pending_rows_batcher.logical_table]
protocols = ["prom"]
pending_rows_flush_interval = "500ms"
```

日志、追踪和使用旧写入格式的 OTLP 指标不使用此批量写入器。它的配置独立于 `[pending_rows_batcher]`。省略的字段使用该配置节的默认值，不会继承父配置节的值。

配置空 `protocols` 数组或 `0s` 间隔会禁用逻辑表批量处理，且不会回退到旧配置。

:::note
为保持兼容性，仅当省略 `[pending_rows_batcher.logical_table]` 且 `[pending_rows_batcher]` 未启用 `prom` 时，GreptimeDB 才使用现有的 `[prom_store]` 批量写入配置。
:::

## 配置项

两个批量写入器使用以下配置项，且默认值相互独立。

| 配置项 | 默认值 | 描述 |
| --- | --- | --- |
| `protocols` | `[]` | 使用批量写入器的协议。空数组会禁用批量处理。逻辑表批量写入器仅支持 `prom` 和 `otlp`。 |
| `pending_rows_flush_interval` | `"0s"` | 待处理批次的刷写间隔。从开始累积该批次时计时。需设为非零时长以启用批量处理。 |
| `max_batch_rows` | `100000` | 触发刷写的累计行数阈值。请参阅[批次刷写条件](#批次刷写条件)。 |
| `max_concurrent_flushes` | `256` | 最大并发刷写操作数。 |
| `worker_channel_capacity` | `65536` | 每个表 worker 最多可排队的提交数。 |
| `max_inflight_requests` | `3000` | 等待批次完成的最大原始写入请求数。 |
| `flow_notification_queue_capacity` | `1024` | 最大排队 Flow 通知数。该值必须大于 `0`。 |

## 批次刷写条件

满足以下任一条件时，GreptimeDB 会刷写批次：

- 从开始累积该批次时计时，达到 `pending_rows_flush_interval`；
- GreptimeDB 追加一笔完整的传入写入请求后，批次行数达到 `max_batch_rows`。

`max_batch_rows` 不是批次大小的硬性限制。GreptimeDB 不会为了满足该值而拆分传入的写入请求。

## 请求确认和 HTTP 超时

默认情况下，GreptimeDB 在将批次写入存储后返回响应。将 `PENDING_ROWS_BATCH_SYNC` 设为 `false` 后，GreptimeDB 接受请求进行批量处理后即返回响应。此后发生的存储错误无法返回给客户端。同步模式下，单连接写入和 `INSERT SELECT` 可能需要等待一次刷写。

同步模式下，GreptimeDB 会将非零的 `http.timeout` 与 `[pending_rows_batcher]` 和 `[pending_rows_batcher.logical_table]` 中当前启用的最大刷写间隔比较。如果超时不大于该间隔加 1 秒，GreptimeDB 会将其提高到该值。此规则适用于 Prometheus Remote Write、启用 metric engine 的 Prometheus 兼容格式 OTLP 指标和写入普通表的 HTTP 请求。MySQL 和 PostgreSQL 的批量写入不会调整 HTTP 超时。将 `http.timeout = "0s"` 设为可禁用 HTTP 超时。
