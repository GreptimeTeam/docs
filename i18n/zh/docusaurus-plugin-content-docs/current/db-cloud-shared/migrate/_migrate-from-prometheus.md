GreptimeDB 可以用来存储 Prometheus 的时间序列数据。
此外，GreptimeDB 通过其 HTTP API 支持 Prometheus 查询语言。
这可以使你轻松将 Prometheus 的 long-term storage 切换到 GreptimeDB。

## 数据模型的区别

要了解 Prometheus 和 GreptimeDB 数据模型之间的差异，请参阅 Ingest Data 文档中的[数据模型](/user-guide/ingest-data/for-observerbility/prometheus.md#data-model)部分。

## Prometheus Remote Write

<InjectContent id="remote-write" content={props.children}/>

## Prometheus HTTP API 与 PromQL

GreptimeDB 通过其 HTTP API 支持 Prometheus 查询语言 (PromQL)。
<InjectContent id="promql" content={props.children}/>

## 使用 Grafana 可视化数据

对于习惯使用 Grafana 可视化 Prometheus 数据的开发人员，你可以继续使用相同的 Grafana 仪表板来可视化存储在 GreptimeDB 中的数据。
<InjectContent id="grafana" content={props.children}/>

