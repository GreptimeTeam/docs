---
keywords: [监控关键指标, GreptimeDB 监控, GreptimeDB 关键指标, GreptimeDB 集群监控]
description: 监控 GreptimeDB 集群的关键指标，包括 CPU、内存、磁盘 I/O 和网络带宽的使用情况。
---

# 关键指标监控

监控的关键指标包括 CPU、内存、磁盘 I/O 和网络带宽的使用情况。

## 告警指标

告警系统各公司一般都有自己使用的，配置方法可能各不相同，因此本文档不列举具体的告警配置方式，只列出部分需要关注的指标，可以基于这些指标配置一个是否长时间（超过数分钟）处于不正常数值的告警。你可以根据实际情况设置告警的水位。

以下参考告警规则**并非内置**于 GreptimeDB，需要你在自己的告警系统中配置（例如 Prometheus 告警规则）。

| 指标 | 含义 | 参考规则 |
| --- | --- | --- |
| `sum(process_resident_memory_bytes{}) by (instance, pod)` | 进程的内存占用 | 占用率持续大于阈值 |
| `sum(rate(process_cpu_seconds_total{}[$__rate_interval]) * 1000) by (instance, pod)` | 进程的 CPU 暂用，CPU 显示的是 millicore | 利用率持续大于阈值 |
| `sum by(instance, pod) (greptime_mito_write_stall_total{instance=~"$datanode"})` | datanode 积压的写入请求数量 | 持续 n 分钟大于 0 |
| `sum(rate(greptime_table_operator_ingest_rows{instance=~"$frontend"}[$__rate_interval]))` | 当前每秒写入的行数 | 持续 n 分钟跌 0（或低于阈值） |
| `greptime_mito_compaction_failure_total` | compaction 失败 | 最近新增大于 0 |
| `greptime_mito_flush_failure_total` | flush 失败 | 最近新增大于 0 |
| `sum by (instance, pod, region_id) (rate(greptime_mito_region_query_cpu_time{instance=~"$frontend"}[$__rate_interval]))` | Region 维度查询 CPU 时间，单位为纳秒 | 启用 `logging.enable_per_region_metrics` 后用于分析读负载热点；该指标基数较高，不建议直接作为大范围告警指标 |
| `sum by (instance, pod, region_id) (rate(greptime_mito_region_query_scanned_bytes{instance=~"$frontend"}[$__rate_interval]))` | Region 维度查询扫描字节数 | 启用 `logging.enable_per_region_metrics` 后用于分析读负载热点；该指标基数较高，不建议直接作为大范围告警指标 |
| `sum by(instance, pod, path, method, code) (rate(greptime_servers_http_requests_elapsed_count{path!~"/health\|/metrics"}[$__rate_interval]))` | HTTP 请求数和返回的响应码 | 响应码 200 的请求数量持续 n 分钟低于阈值或者响应码非 200 的请求数量持续 n 分钟大于正常阈值 |
| `sum by (instance, pod) (rate(greptime_mito_write_rows_total{instance=~"$datanode"}[$__rate_interval]))` | 存储引擎写入行数 | 持续 n 分钟低于正常阈值 |
| `up{job="greptimedb-instance"}` | 实例存活状态 | 等于 0 超过 1 分钟 |
| `sum by (instance) (changes(process_start_time_seconds[5m]))` | 实例重启 | 最近 5 分钟内大于 0 |
| `sum by (instance) (rate(greptime_servers_http_requests_elapsed_count{path=~"/v1/.*", code!~"2.."}[5m]))` | HTTP 非 2xx 响应 | 大于 0 超过 5 分钟 |
| `histogram_quantile(0.99, sum by (le, instance) (rate(greptime_servers_http_requests_elapsed_bucket{path=~"/v1/.*"}[5m])))` | HTTP 请求延迟 | p99 大于 5s 超过 5 分钟 |
| `histogram_quantile(0.99, sum by (le, instance) (rate(greptime_servers_grpc_requests_elapsed_bucket[5m])))` | gRPC 请求延迟 | p99 大于 5s 超过 5 分钟 |
| `sum by (instance) (greptime_mito_write_stalling_count)` | 写入停滞 | 大于 0 超过 5 分钟 |
| `sum by (instance) (increase(greptime_datanode_region_request_fail_count[5m]))` | datanode region 请求失败 | 最近 5 分钟内大于 0 |
| `sum by (instance) (increase(greptime_datanode_region_failed_insert_count[5m]))` | datanode region 插入失败 | 最近 5 分钟内大于 0 |
| `sum by (instance) (increase(greptime_meta_region_migration_fail[5m]))` | metasrv region 迁移失败 | 最近 5 分钟内大于 0 |
| `sum by (instance) (increase(greptime_meta_reconciliation_procedure_error[5m]))` | metasrv 协调错误 | 最近 5 分钟内大于 0 |
| `sum by (instance) (increase(greptime_flow_batching_error_count[5m]))` | Flow 引擎错误 | 最近 5 分钟内大于 0 |
| `sum by (instance) (increase(greptime_flow_errors[5m]))` | 旧版流式 Flow 引擎错误 | 最近 5 分钟内大于 0 |
| `sum by (instance) (increase(greptime_trigger_evaluate_failure_count[5m]))` | Trigger 求值失败 | 最近 5 分钟内大于 0 |
| `sum by (instance) (increase(greptime_trigger_send_alert_failure_count[5m]))` | Trigger 告警发送失败 | 最近 5 分钟内大于 0 |
| `sum by (instance) (increase(greptime_trigger_save_alert_record_failure_count[5m]))` | Trigger 告警记录保存失败 | 最近 5 分钟内大于 0 |
| `sum by (instance) (increase(greptime_pending_rows_flush_failures[5m]) + increase(greptime_pending_rows_flush_dropped_rows[5m]))` | 缓冲数据丢失 | 最近 5 分钟内大于 0 |
| `sum by (instance) (greptime_prom_store_pending_rows)` | Prometheus remote-write 批处理缓冲区大小 | 接近 `max_batch_rows`（默认 100000）超过 5 分钟 |

Pod 维度还建议配置磁盘告警，当磁盘水位超过某个阈值后进行告警。
此外，也可以根据运维[关键日志](key-logs.md)中所列举的错误日志中的关键字监控以下事件：

- Region 续租失败
- Region failover
