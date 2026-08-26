---
keywords: [Grafana, 数据源, GreptimeDB 插件, Prometheus 数据源, MySQL 数据源, 仪表盘, 数据可视化]
description: 介绍如何将 GreptimeDB 配置为 Grafana 数据源，包括使用 GreptimeDB 数据源插件、Prometheus 数据源和 MySQL 数据源的方法。
---

# Grafana

GreptimeDB 服务可以配置为 [Grafana 数据源](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/)。
你可以选择使用以下三个数据源之一连接 GreptimeDB 与 Grafana：[GreptimeDB](#greptimedb-数据源插件)、[Prometheus](#prometheus-数据源) 或 [MySQL](#mysql-数据源)。

## GreptimeDB 数据源插件

[GreptimeDB 数据源插件](https://github.com/GreptimeTeam/greptimedb-grafana-datasource)专为 GreptimeDB 打造：更好地适配 GreptimeDB SQL 查询，并提供 Logs 与 Traces 查询类型（支持 OpenTelemetry 预设及自定义列映射）。基于 ClickHouse 数据源插件修改。

### 安装

推荐从[最新 Release](https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/)安装 **unsigned** 插件 zip。
请先允许加载该插件 ID 的未签名插件。

在 `grafana.ini` 中：

```
allow_loading_unsigned_plugins = info8fcc-greptimedb-datasource
```

或在 Docker 中运行 Grafana 时：

```
GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=info8fcc-greptimedb-datasource
```

#### 手动安装

下载 `info8fcc-greptimedb-datasource-unsigned.zip`，解压到你的 [Grafana 插件目录](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#plugins)。

#### 使用 grafana cli 安装

```shell
grafana cli --pluginUrl https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/download/info8fcc-greptimedb-datasource-unsigned.zip plugins install info8fcc
```

安装插件后请重启 Grafana。

如果 Grafana 的 host 不是 `localhost:3000`，请[联系我们](https://greptime.com/contactus)定制 signed 构建。

#### Docker 镜像

我们也提供默认包含 GreptimeDB 数据源的 Grafana Docker 镜像：

```shell
docker pull greptime/grafana-greptimedb:latest
docker run -p 3000:3000 greptime/grafana-greptimedb:latest
```

访问 http://localhost:3000 登录。默认用户名和密码均为 `admin`。

### Connection 配置

在 GreptimeDB server URL 中填写以下地址：

```txt
http://<host>:4000
```

在 Auth 部分中单击 basic auth，并在 Basic Auth Details 中填写 GreptimeDB 的用户名和密码。未设置可留空：

- User: `<username>`
- Password: `<password>`

然后单击 Save & Test 按钮以测试连接。

### Query Builder

#### 基础查询设置

在选择任何查询类型之前，需要先配置要查询的 **Database** 和 **Table**。

| 设置项 | 说明 |
|-----------|-------------|
| **Database** | 选择要查询的数据库 |
| **Table** | 选择要查询的表 |

每个 Builder 面板都会自动包含 **Within Dashboard Time Range** 过滤条件。
这会在 SQL 中生成 `$__timeFilter("col")`，由插件展开为仪表盘当前时间范围。

![DB Table Config](/grafana/dbtable.png)

---

#### Table 查询

当查询结果**不包含时间列**时，选择 `Table` 查询类型，适合展示表格数据。

| 设置项 | 说明 |
|-----------|-------------|
| **Columns** | 选择要查询的列，可多选 |
| **Filters** | 设置筛选条件 |

![Table Query](/grafana/table.png)

---

#### Time Series 查询

当查询包含时间列和数值时，选择 `Time Series` 查询类型，适合按时间可视化指标。

##### 使用 `date_bin` 分桶查询

对一段时间做聚合时，可用 `date_bin` 对时序数据降采样：按时间间隔计算分桶，
并将每个时间戳映射到最近区间的起点，从而把行归入时间窗口，再对每个窗口应用
聚合或选择函数。

示例（或原始 SQL）：

```sql
SELECT date_bin('$__interval', timestamp) AS time,
       SUM(`span_attributes.gen_ai.usage.input_tokens`) AS input_tokens
FROM opentelemetry_traces
WHERE $__timeFilter(timestamp)
GROUP BY time
ORDER BY time;
```

`$__interval` 跟随 Grafana 面板间隔；`$__timeFilter` 限制仪表盘时间范围。
更多宏见 [SQL Macros](#sql-macros)。

| 设置项 | 说明 |
|:--------|:------------|
| **Time** | 选择时间列 |
| **Columns** | 选择标签列（如 `host`、`region`） |
| **Aggregate functions** | 对数值列使用 AVG / MAX / MIN / SUM / COUNT |
| **Group By** | 选择分组列 |
| **Filters** | 可选条件：`=`、`!=`、`>`、`<`、`LIKE`、`IN`、`IS NULL`，以及 AND/OR |

![Time Series](/grafana/series.png)

##### Multi-Frame 拆分

当查询结果包含 **时间 + 字符串 + 数值** 字段时，插件会自动将长表拆成多个 frame——每个唯一标签组合一个。Grafana 将每个 frame 渲染为图表中的独立序列。

例如，`GROUP BY host` 且有三个 host 时，会生成三个 frame（host-a、host-b、host-c），各自有独立标签和颜色。

若要避免拆分，请改用 `Table` 查询类型。

---

#### Logs 查询

选择 `Logs` 查询类型以查询日志数据。

| 设置项 | 说明 |
|:--------|:------------|
| **Time** | 选择时间戳列 |
| **Message** | 选择日志内容列 |
| **Log Level** | （可选）选择日志级别列 |
| **Context Columns** | 展开日志行时额外显示的列（来自数据源配置） |

![Logs](/grafana/logs.png)

**全文搜索**：使用 `matches_term(body, 'keyword')` 进行精确词/短语匹配。

---

#### Traces 查询

选择 `Traces` 查询类型以查询分布式追踪数据。

**两种模式：**

| 模式 | 用途 | 面板 |
|------|---------|-------|
| **Trace Search** | 列出最近的 Trace | Table |
| **Trace ID** | 查看单条 Trace 的 Span 瀑布图 | Traces（甘特图 + Span 树） |

查看 Trace 瀑布图的方式：
- 切换到 **Trace ID** 模式并输入 Trace ID
- 在 Trace Search 表格中点击 `trace_id` 单元格 → "View trace"

| 设置项 | 说明 | 默认值 |
|:--------|:------------|---------|
| **Trace Mode** | `Trace Search` 或 `Trace ID` | |
| **Trace Id Column** | Trace ID 字段 | `trace_id` |
| **Span Id Column** | Span ID 字段 | `span_id` |
| **Parent Span ID Column** | Parent Span ID 字段 | `parent_span_id` |
| **Service Name Column** | 服务名字段 | `service_name` |
| **Operation Name Column** | Span/操作名字段 | `span_name` |
| **Start Time Column** | Span 开始时间字段 | `timestamp` |
| **Duration Time Column** | 耗时字段 | `duration_nano` |
| **Duration Unit** | 耗时列单位 | `nanoseconds` |
| **Tags Column** | Span attributes（前缀如 `span_attributes`） | |
| **Service Tags Column** | Resource attributes（前缀如 `resource_attributes`） | |

![Traces](/grafana/traceconfig.png)

##### Attribute 自动发现

当 Trace ID 查询使用 `SELECT *` 时，插件会自动发现所有以 `span_attributes.` 和 `resource_attributes.` 开头的列，并在瀑布图中作为可展开标签展示，无需手动枚举每个 attribute 列。

### SQL Macros

在原始 SQL 模式下可使用这些宏。插件会将其展开为兼容 GreptimeDB 的 SQL。

#### 时间范围

| Macro | 展开为 |
|-------|-----------|
| `$__timeFilter(col)` | `"col" >= 'ISO' AND "col" <= 'ISO'` |
| `$__timeFilter_ms(col)` | 同上（毫秒精度） |
| `$__fromTime` | 开始时间的 ISO 字符串 |
| `$__toTime` | 结束时间的 ISO 字符串 |
| `$fromTime_ms` | 开始时间的毫秒 ISO 字符串 |
| `$toTime_ms` | 结束时间的毫秒 ISO 字符串 |

#### 时间间隔

| Macro | 展开为 |
|-------|-----------|
| `$__timeInterval(col)` | `date_bin('<interval>', "col")` |
| `$__timeInterval_ms(col)` | `date_bin('<interval>', "col")`（毫秒） |
| `$__interval` | 面板间隔字面量（如 `15s`） |
| `$interval_s` | 面板间隔秒数（如 `15`） |

#### 日期过滤

| Macro | 展开为 |
|-------|-----------|
| `$__dateFilter(col)` | `"col" >= 'YYYY-MM-DD' AND "col" <= 'YYYY-MM-DD'` |
| `$__dateTimeFilter(dc, tc)` | 日期 + 时间组合过滤 |
| `$__dt(dc, tc)` | `$__dateTimeFilter` 的别名 |

#### 特殊

| Macro | 展开为 |
|-------|-----------|
| `$__conditionalAll(col)` | 全选 → `1=1`；否则 → `col IN (values)` |

#### 标识符引用

插件会自动为宏中的列名添加双引号。
`$__timeFilter(timestamp)` 和 `$__timeFilter("timestamp")` 都会展开为
`"timestamp" >= 'ISO1' AND "timestamp" <= 'ISO2'`。`date_bin` 函数
不会对其列参数加引号：`date_bin('15s', ts)`。

### 配置列映射

在使用 Logs 或 Traces 查询类型之前，请先在数据源设置中配置默认列名，以便 Query Builder 自动映射。

#### Logs 配置

| 字段 | 用途 | 建议值（OTel 表） |
|-------|---------|------------------------|
| Default Table | 默认日志表 | `genai_conversations` |
| Time Column | 时间戳列 | `timestamp` |
| Message Column | 日志正文列 | `body` |
| Level Column | 日志级别列 | `severity_text` |
| Trace ID Column | 用于关联的 Trace ID | `trace_id` |
| Context Columns | 展开日志行时额外显示的列 | `scope_name`, `trace_id` |

启用 **Select context columns** 可在日志查询中自动包含这些列。

#### Traces 配置

| 字段 | 用途 | 建议值（OTel 表） |
|-------|---------|---------|
| Default Table | 默认 Trace 表 | `opentelemetry_traces` |
| Trace ID Column | Trace ID | `trace_id` |
| Span ID Column | Span ID | `span_id` |
| Parent Span ID Column | Parent Span ID | `parent_span_id` |
| Service Name Column | 服务名 | `service_name` |
| Operation Name Column | Span/操作名 | `span_name` |
| Duration Column | 耗时值 | `duration_nano` |
| Duration Unit | 耗时列单位 | `nanoseconds` |
| Start Time Column | Span 开始时间 | `timestamp` |
| Tags Column | Span attributes 前缀 | `span_attributes` |
| Service Tags Column | Resource attributes 前缀 | `resource_attributes` |

#### OTel 预设

如果表遵循 OpenTelemetry 约定，可启用 **Use OTel** 并选择版本。上方所有列字段会自动填充。你可以在数据源配置和 Query Builder 面板编辑器中开关 OTel。

启用 OTel 时，预设使用 GreptimeDB 风格的小写下划线列名（例如 `trace_id` 而非 `TraceId`），因为 GreptimeDB 不保留大小写。

完整 OTel 1.29.0 列映射：

| Hint | Column |
|------|--------|
| Time | `timestamp` |
| LogLevel | `severity_text` |
| LogMessage | `body` |
| TraceId | `trace_id` |
| TraceSpanId | `span_id` |
| TraceParentSpanId | `parent_span_id` |
| TraceServiceName | `service_name` |
| TraceOperationName | `span_name` |
| TraceDurationTime | `duration_nano` |
| TraceTags | `span_attributes` |
| TraceServiceTags | `resource_attributes` |
| TraceStatusCode | `span_status_code` |
| TraceEventsPrefix | `span_events` |

### 内置仪表盘

插件内置两个仪表盘。配置好 GreptimeDB 数据源后：

1. 打开 **Connections → Data sources →** 你的 GreptimeDB 实例
2. 打开 **Dashboards** 标签页
3. 点击仪表盘旁的 **Import**

内置仪表盘：

- **GreptimeDB - OTel Min Demo**
- **GenAI Observability**

![GenAI Observability](/grafana/genai-observability.jpg)

这些仪表盘的示例数据可通过 [demo-scene](https://github.com/GreptimeTeam/demo-scene) 中的 [genai-observability](https://github.com/GreptimeTeam/demo-scene/tree/main/genai-observability) demo 写入 GreptimeDB。

## Prometheus 数据源

单击 Add data source 按钮，然后选择 Prometheus 作为类型。

在 HTTP 中填写 Prometheus server URL

```txt
http://<host>:4000/v1/prometheus
```

在 Auth 部分中单击 basic auth，并在 Basic Auth Details 中填写 GreptimeDB 的用户名和密码：

- User: `<username>`
- Password: `<password>`

在 Custom HTTP Headers 部分中点击 Add header:

- Header: `x-greptime-db-name`
- Value: `<dbname>`

然后单击 Save & Test 按钮以测试连接。

有关如何使用 PromQL 查询数据，请参阅 [Prometheus 查询语言](/user-guide/query-data/promql.md)文档。

## MySQL 数据源

单击 Add data source 按钮，然后选择 MySQL 作为类型。在 MySQL Connection 中填写以下信息：

- Host: `<host>:4002`
- Database: `<dbname>`
- User: `<username>`
- Password: `<password>`
- Session timezone: `UTC`

然后单击 Save & Test 按钮以测试连接。

注意目前我们只能使用 raw SQL 创建 Grafana Panel。由于时间戳数据类型的区别，Grafana
的 SQL Builder 暂时无法选择时间戳字段。

关于如何用 SQL 查询数据，请参考[使用 SQL 查询数据](/user-guide/query-data/sql.md)文档。
