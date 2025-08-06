GreptimeDB 可以用来存储 [Prometheus](https://prometheus.io/) 的时间序列数据。
此外，GreptimeDB 通过其 HTTP API 支持 Prometheus 查询语言。
这可以使你轻松将 Prometheus 的 long-term storage 切换到 GreptimeDB。

## 数据模型的区别

要了解 Prometheus 和 GreptimeDB 数据模型之间的差异，请参阅 Ingest Data 文档中的[数据模型](/user-guide/ingest-data/for-observability/prometheus.md#data-model)部分。

## Prometheus Remote Write

<InjectContent id="remote-write" content={props.children}/>

## Prometheus HTTP API 与 PromQL

GreptimeDB 通过其 HTTP API 支持 Prometheus 查询语言 (PromQL)。
<InjectContent id="promql" content={props.children}/>

## 使用 Grafana 可视化数据

对于习惯使用 Grafana 可视化 Prometheus 数据的开发人员，你可以继续使用相同的 Grafana 仪表板来可视化存储在 GreptimeDB 中的数据。
<InjectContent id="grafana" content={props.children}/>

## 参考阅读

请参考以下博客文章查看 GreptimeDB 与 Prometheus 的集成教程及用户故事：

- [如何配置 GreptimeDB 作为 Prometheus 的长期存储](https://greptime.com/blogs/2024-08-09-prometheus-backend-tutorial)
- [Scale Prometheus：K8s 部署 GreptimeDB 集群作为 Prometheus 长期存储](https://greptime.com/blogs/2024-10-07-scale-prometheus)
- [「用户故事」从 Thanos 到 GreptimeDB，我们实现了 Prometheus 高效长期存储](https://greptime.com/blogs/2024-10-16-thanos-migration-to-greptimedb)

如果您需要更详细的迁移方案或示例脚本，请提供具体的表结构和数据量信息。[GreptimeDB 官方社区](https://github.com/orgs/GreptimeTeam/discussions)将为您提供进一步的支持。欢迎加入 [Greptime Slack](http://greptime.com/slack) 社区交流。
