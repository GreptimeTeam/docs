GreptimeDB 可以接收 Prometheus Remote Write Sample，并实现 Prometheus HTTP Query API。这些能力支持逐步迁移新增 Sample 和兼容的 PromQL Workload，但不能直接导入 Prometheus TSDB Block。

## 先检查兼容性

检查 [Prometheus 数据模型映射](/user-guide/ingest-data/for-observability/prometheus.md#数据模型)，并梳理：

- Scrape Job、External Label、Relabeling 和 Recording Rule
- Alert Rule 及其使用的全部 PromQL 函数
- Grafana Dashboard、Variable、Exemplar 和 Data Source 设置
- 当前保留时间，以及迁移后仍需查询的历史范围

GreptimeDB 通过 HTTP API 支持 PromQL，但这不保证每条 Rule 或 Dashboard 的行为完全一致。切换前，应使用相同的时间范围和 Label 集合测试关键表达式。

## 使用 Remote Write 发送新增 Sample

<InjectContent id="remote-write" content={props.children}/>

在保留 Prometheus 本地存储和现有 Remote Destination 的同时，把 GreptimeDB 添加为另一个 `remote_write` 目标。Remote Write 从 Prometheus WAL 读取 Sample；启用后不会重新发送完整的历史 TSDB 数据。

双路径运行期间监控 Prometheus Remote Write Queue，重点观察待发送 Sample、失败和重试 Sample、Queue Lag、CPU、内存和网络饱和度。未发送 Sample 超出 WAL 保留范围后可能丢失，因此持续失败的 Queue 是数据丢失风险，而不只是发送延迟。参见 [Prometheus Remote Write 调优指南](https://prometheus.io/docs/practices/remote_write/)。

对比两个系统中的近期数据：

- 重要 Job 的 Series 数量和 Label 集合
- 最小和最大 Sample 时间戳
- 选定 Series 的原始 Sample
- 固定时间范围内的 Recording Rule 和 Alert 表达式
- Prometheus 或 GreptimeDB 重启期间的缺失 Sample 情况

## 使用 PromQL 查询

GreptimeDB 通过 Prometheus HTTP API 提供 PromQL 查询。

<InjectContent id="promql" content={props.children}/>

迁移期间保持原 Prometheus 可查询。使用相同的 `time`、`start`、`end` 和 `step` 参数分别执行关键 Instant Query 和 Range Query，再比较数值、Label 和空 Series 行为。

## 迁移 Grafana Dashboard

<InjectContent id="grafana" content={props.children}/>

先复制一份 Prometheus Data Source 并指向 GreptimeDB，完成 Dashboard 测试后再切换生产 Data Source。使用兼容 PromQL 的 Dashboard 可能无需修改，但 Label 差异、不支持的函数、Exemplar 或 Metadata API 都可能需要调整。Alert 应与 Dashboard Panel 分开验证。

## 处理已有历史数据

GreptimeDB 不能直接导入 Prometheus TSDB Block 目录。可以选择：

- 保持旧 Prometheus 或长期存储只读，直到所需历史保留窗口结束。
- 使用经过测试的 Remote Write 兼容工具重放历史 Sample，并保留原始时间戳和 Label。
- 只迁移新增 Sample，在过渡期间为新旧时间范围保留不同 Data Source。

按有限时间范围回填，记录进度，并在每个范围完成后比较数量和查询结果。不要让没有进度记录的历史回填与实时 Remote Write 重叠，否则重复或冲突 Sample 很难对账。

## 切换

只有实时 Remote Write 已追平，而且关键查询、Dashboard 和 Alert 均通过对比后，才能切换读流量。在覆盖所需历史范围和约定观察期之前，保留旧查询 Endpoint 和回滚路径。
