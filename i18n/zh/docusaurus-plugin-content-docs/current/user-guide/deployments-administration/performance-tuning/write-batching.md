---
keywords: [GreptimeDB, 写入批量处理, 写入协议, 配置, frontend, standalone]
description: 在 GreptimeDB standalone 或 frontend 配置文件中配置写入批量处理。
---

# 写入批量处理

你可以在 standalone 或 frontend 配置文件中配置写入批量处理。它会在将写入刷写到存储之前进行批量处理。写入批量处理默认关闭。

`[pending_rows_batcher]` 对写入普通表的请求进行批量处理。`[pending_rows_batcher.logical_table]` 对使用 metric engine 逻辑表的 Prometheus Remote Write 和 Prometheus 兼容格式的 OTLP 指标进行批量处理。

## 配置普通表批量写入

要为普通表启用批量处理，请配置至少一个协议和非零刷写间隔：

```toml
[pending_rows_batcher]
protocols = ["influxdb"]
pending_rows_flush_interval = "500ms"
```

普通表批量处理支持 `influxdb`、`opentsdb`、`otlp`、`logs`、`loki`、`splunk`、`elasticsearch`、`http_sql`、`mysql`、`postgres` 和 `prom`。

未启用 metric engine 时，Prometheus Remote Write 使用此批量写入器。OTLP 日志、追踪和未使用 metric engine 的 OTLP 指标也使用它。MySQL 和 PostgreSQL 对符合条件的 `INSERT` 使用它。它不支持流式 Flow 源表。

## 配置 metric engine 逻辑表批量处理

只有 `prom` 和 `otlp` 支持 metric engine 逻辑表批量处理。启用 metric engine 后，此批量写入器处理 Prometheus Remote Write 和 Prometheus 兼容格式的 OTLP 指标：

```toml
[prom_store]
with_metric_engine = true

[pending_rows_batcher.logical_table]
protocols = ["prom"]
pending_rows_flush_interval = "500ms"
```

日志、追踪和使用旧写入格式的 OTLP 指标不使用此批量写入器。它的配置独立于 `[pending_rows_batcher]`。省略的字段使用自身的默认值，不会继承父配置节的值。

省略此配置节时，GreptimeDB 使用 `[prom_store]` 中旧的 Prometheus 批量写入配置，但不会启用 OTLP 指标批量处理。配置空 `protocols` 数组或 `0s` 间隔会禁用逻辑表批量处理，且不会回退到旧配置。

## 批次刷写条件

满足以下任一条件时，GreptimeDB 会刷写批次：

- 从第一笔待处理写入请求开始计时，达到 `pending_rows_flush_interval`；
- GreptimeDB 追加一笔完整的传入写入请求后，批次行数达到 `max_batch_rows`。

`max_batch_rows` 不限制批次大小。GreptimeDB 不会为了满足该值而拆分传入的写入请求。

## 请求确认和 HTTP 超时

默认情况下，GreptimeDB 在将批次写入存储后返回响应。将 `PENDING_ROWS_BATCH_SYNC` 设为 `false` 后，GreptimeDB 接受请求进行批量处理后即返回响应。此后发生的存储错误无法返回给客户端。同步模式下，单连接写入和 `INSERT SELECT` 可能需要等待一次刷写。

同步模式下，如果非零的 `http.timeout` 不大于当前启用的刷写间隔加 1 秒，GreptimeDB 会将其提高到该值。它使用 `pending_rows_batcher.pending_rows_flush_interval` 和 `pending_rows_batcher.logical_table.pending_rows_flush_interval` 中当前启用的较大值。此规则适用于 Prometheus Remote Write、使用 metric engine 的 OTLP 指标和写入普通表的 HTTP 请求。MySQL 和 PostgreSQL 的批量写入不会调整 HTTP 超时。将 `http.timeout = "0s"` 设为可禁用 HTTP 超时。

有关所有批量处理选项和默认值，请参阅 [Configuration Reference](https://github.com/GreptimeTeam/greptimedb/blob/VAR::greptimedbVersion/config/config.md)。
