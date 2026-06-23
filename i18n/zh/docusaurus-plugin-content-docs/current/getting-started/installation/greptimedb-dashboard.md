---
keywords: [控制台, 可观测性, SQL, PromQL, metrics, logs, traces, 统一数据库]
description: 介绍如何访问 GreptimeDB 内置控制台，以及通过 Table Query 和按信号类型划分的查询视图探索 metrics、logs 和 traces。
---

# GreptimeDB 控制台

GreptimeDB 将 metrics、logs 和 traces 存储在同一数据库中。[控制台](https://github.com/GreptimeTeam/dashboard) 是安装后即可使用的内置 Web UI，用于探索这些数据，无需额外组件。关于统一可观测性存储的设计，见 [为什么选择 GreptimeDB](/user-guide/concepts/why-greptimedb.md)。

## 访问控制台

自 GreptimeDB v0.2.0 起，控制台已嵌入 binary。启动 [GreptimeDB 单机版](greptimedb-standalone.md) 或 [GreptimeDB 集群](greptimedb-cluster.md) 后，在浏览器中打开：

```
http://localhost:4000/dashboard
```

如需禁用控制台 HTTP 服务，可在启动 frontend 时设置 `--disable-dashboard`。详见 [frontend 命令行参数](/reference/command-lines/frontend.md)。

## 查询数据

控制台提供通用查询入口和按信号类型划分的专用视图：

| 视图 | 数据范围 | 说明 |
| --- | --- | --- |
| [Table Query](#table-query) | 任意数据 | 通用查询入口，编辑器内可切换 SQL 与 PromQL。 |
| [Metrics Query](#metrics-query) | Metrics | 面向指标的 PromQL 查询界面。 |
| [Logs Query](#logs-query) | Logs | 通过 Builder 或代码编辑器过滤和检索日志。 |
| [Traces Query](#traces-query) | Traces | 通过 Builder 或代码编辑器检索 trace 并查看 span。 |

## Table Query

Table Query 是控制台的通用查询入口。你可以查询 GreptimeDB 中的任意数据，并在编辑器中切换 SQL 与 PromQL。左侧浏览数据库和表，使用 **Run Query**、**Explain Query** 或 **Run All** 执行查询，在下方查看结果。

![Table Query](/dashboard/tablequery.png)

- 在左侧面板浏览数据库和表。
- 在同一编辑器中编写多条查询。
- 在结果表中查看数据，支持分页。
- 使用 **Explain Query** 可视化 [`EXPLAIN ANALYZE`](/reference/sql/explain.md) 执行计划。

查询语法见 [SQL](/user-guide/query-data/sql.md) 和 [PromQL](/user-guide/query-data/promql.md)。

## Metrics Query

Metrics Query 是面向 metrics 的专用视图。浏览可用指标，输入指标名或 PromQL 表达式，在列表和图表视图之间切换。

![Metrics Query](/dashboard/metricquery.png)

- 在左侧面板搜索和浏览指标。
- 在编辑器中运行查询，按 label 查看时序值。
- 在列表和图表显示模式之间切换。

查询语法见 [PromQL](/user-guide/query-data/promql.md)。你也可以在 [Table Query](#table-query) 中运行 PromQL。

## Logs Query

Logs Query 是面向 logs 的专用视图。选择数据库和日志表，添加过滤条件，查看日志行。使用 **Builder** 进行点选式查询，或切换到 **Code** 直接编写查询。

![Logs Query](/dashboard/logsquery.png)

- 在 Builder 中设置时间范围、过滤、排序和 Limit。
- 在结果上方查看按时间分布的行数图表。
- 开启 **Live** 实时查看日志，或将结果导出为 CSV。

详见 [Log Query](/user-guide/query-data/log-query.md) 和 [Logs](/user-guide/logs/overview.md)。

## Traces Query

Traces Query 是面向 traces 的专用视图。选择 trace 表，按 trace ID 或 span 属性过滤，查看 trace 记录。

![Traces Query](/dashboard/tracesquery.png)

- 使用 **Builder** 或 **Code** 编写查询。
- 过滤根 span（例如 `parent_span_id` 不存在），或按 `trace_id` 搜索。

详见 [Traces](/user-guide/traces/overview.md) 和 [Jaeger](/user-guide/query-data/jaeger.md)。

## Visualization

控制台内嵌了 [Perses](https://perses.dev/)，用于构建可观测性大盘。在侧边栏点击 **Visualization**，即可创建、编辑和浏览大盘，无需单独安装 Perses。

GreptimeDB 预配置了两个数据源插件，自动连接到本地实例：

| 查询类型 | 数据源插件 | 面板类型 | 适用场景 |
| --- | --- | --- | --- |
| **PromQL** | `PrometheusDatasource` | `TimeSeriesChart`、`GaugeChart`、`StatChart` | Prometheus 指标、`node_exporter`、迁移的 Grafana 大盘 |
| **SQL 时序** | `GreptimeDBDatasource` | `TimeSeriesChart`、`StatChart`、`Table` | 使用 `RANGE`、`ALIGN`、`FILL` 的 GreptimeDB 表 |
| **Logs** | `GreptimeDBDatasource` | `LogsTable` | 日志表，支持 SQL 过滤和仪表盘变量 |
| **Traces** | `GreptimeDBDatasource` | `TraceTable`、`TracingGanttChart` | Trace 表 — trace 列表与单条 trace 的 Gantt 视图 |

例如，内置的 **Node Exporter** 大盘通过 PromQL 展示 CPU、内存、磁盘和网络面板，并支持 `job`、`host` 等变量：

![Visualization](/dashboard/visulization.png)

数据源连接、面板配置和 Grafana 迁移详见 [Perses 集成](/user-guide/integrations/perses.md)。

## 更多功能

控制台还提供以下功能：

### Logs Pipelines

在 UI 中创建、编辑和测试日志 pipeline。见 [管理 Pipeline](/user-guide/logs/manage-pipelines.md)。

### Ingest

以 [InfluxDB Line Protocol](/user-guide/ingest-data/for-iot/influxdb-line-protocol.md) 格式手动写入数据。

### Flow

查看和管理 Flow 持续计算任务。见 [管理 Flow](/user-guide/flow-computation/manage-flow.md)。
