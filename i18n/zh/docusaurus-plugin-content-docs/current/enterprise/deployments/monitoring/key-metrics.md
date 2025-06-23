---
keywords: [监控关键指标, GreptimeDB 监控, GreptimeDB 关键指标, GreptimeDB 集群监控]
description: 监控 GreptimeDB 集群的关键指标，包括 CPU、内存、磁盘 I/O 和网络带宽的使用情况。
---

# 关键指标监控

监控的关键指标包括 CPU、内存、磁盘 I/O 和网络带宽的使用情况。

## 配置监控

为了避免存储系统的复杂性，我们推荐使用 Standalone 模式的 GreptimeDB 来保存集群的日志和指标数据用于监控。
- 部署一个 Standalone 版本的 GreptimeDB（可使用部署 Standalone 的 [Helm Chart](https://github.com/GreptimeTeam/helm-charts/tree/main/charts/greptimedb-standalone)）；
- 配置 Prometheus 的 Remote Write 将数据写入 GreptimeDB 中；
- 将 GreptimeDB 的日志配置为 JSON （logging.log_format=json ）输出并配置 Vector 或者 FluentBit 等将日志数据写入 GreptimeDB 中，采用如下 Schema 可适配企业版 Dashboard 进行日志搜索：

```sql
CREATE TABLE IF NOT EXISTS `_gt_logs` (
  `pod_ip` STRING NULL,
  `namespace` STRING NULL,
  `cluster` STRING NULL,
  `level` STRING NULL,
  `target` STRING NULL,
  `role` STRING NULL,
  `pod` STRING NULL SKIPPING INDEX WITH(granularity = '10240', type = 'BLOOM'),
  `message` STRING NULL FULLTEXT INDEX WITH(analyzer = 'English', case_sensitive = 'false'),
  `err` STRING NULL FULLTEXT INDEX WITH(analyzer = 'English', case_sensitive = 'false'),
  `timestamp` TIMESTAMP(9) NOT NULL,
  TIME INDEX (`timestamp`),
  PRIMARY KEY (`level`, `target`, `role`)
)
```

对于 GreptimeDB 的监控可包括如下几个方面：

- 基础监控
  - Pod 的 CPU / Memory / 磁盘使用情况 / 网络带宽流量监控
- GreptimeDB 基础业务监控
  - 错误日志监控（比如运维[关键日志](key-logs.md)中所列举的错误日志）
  - 延迟监控
  - 接口错误监控

## 导入监控指标到 Grafana

我们已将 GreptimeDB 指标的 Grafana 的监控大盘导出为 JSON 文件，
可在[这里](https://github.com/GreptimeTeam/greptimedb/tree/main/grafana)下载。
使用 Grafana 的 [Import Dashboard](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/import-dashboards/) 功能，
可以轻松创建出监控 GreptimeDB 所需的大盘。

## 告警指标

告警系统各公司一般都有自己使用的，配置方法可能各不相同，因此本文档不列举具体的告警配置方式，只列出部分需要关注的指标，可以基于这些指标配置一个是否长时间（超过数分钟）处于不正常数值的告警。你可以根据实际情况设置告警的水位。

| 指标 | 含义 | 参考规则 |
| --- | --- | --- |
| `sum(process_resident_memory_bytes{}) by (instance, pod)` | 进程的内存占用 | 占用率持续大于阈值 |
| `sum(rate(process_cpu_seconds_total{}[$__rate_interval]) * 1000) by (instance, pod)` | 进程的 CPU 暂用，CPU 显示的是 millicore | 利用率持续大于阈值 |
| `sum by(instance, pod) (greptime_mito_write_stall_total{instance=~"$datanode"})` | datanode 积压的写入请求数量 | 持续 n 分钟大于 0 |
| `sum(rate(greptime_table_operator_ingest_rows{instance=~"$frontend"}[$__rate_interval]))` | 当前每秒写入的行数 | 持续 n 分钟跌 0（或低于阈值） |
| `greptime_mito_compaction_failure_total` | compaction 失败 | 最近新增大于 0 |
| `greptime_mito_flush_failure_total` | flush 失败 | 最近新增大于 0 |
| `sum by(instance, pod, path, method, code) (rate(greptime_servers_http_requests_elapsed_count{path!~"/health\|/metrics"}[$__rate_interval]))` | HTTP 请求数和返回的响应码 | 响应码 200 的请求数量持续 n 分钟低于阈值或者响应码非 200 的请求数量持续 n 分钟大于正常阈值 |
| `sum by (instance, pod) (rate(greptime_mito_write_rows_total{instance=~"$datanode"}[$__rate_interval]))` | 存储引擎写入行数 | 持续 n 分钟低于正常阈值 |

Pod 维度还建议配置磁盘告警，当磁盘水位超过某个阈值后进行告警。
此外，也可以根据运维[关键日志](key-logs.md)中所列举的错误日志中的关键字监控以下事件：

- Region 续租失败
- Region failover
