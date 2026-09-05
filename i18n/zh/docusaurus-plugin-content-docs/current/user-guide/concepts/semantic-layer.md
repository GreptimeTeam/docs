---
keywords: [语义层, 语义图, 实体, 关系, 可观测性元数据, MCP, AI agent, OpenTelemetry, 信号类型]
description: 介绍语义层——表语义元数据，以及 GreptimeDB 向机器消费者暴露的派生实体图。
---

# 语义层

:::warning
语义层目前处于实验阶段，未来版本可能发生变化。没有语义元数据的表照常工作；语义层是可选的、增量式的。
:::

语义层描述 GreptimeDB 所存数据的可观测性含义，让 LLM agent、告警与仪表盘生成器、[MCP server](/user-guide/integrations/mcp.md) 和 ETL 流水线等机器消费者不必从列名推断。它由两部分组成：

- **表语义**记录单张表代表什么：遥测信号类型、接入来源，以及 metric 单位、instrument 类型等信号特定的元数据。
- **语义图**记录遥测数据描述的对象：行背后的实体（service、host、pod、container、AI agent）以及它们之间的关系（哪个 service 调用哪个、哪个 pod 运行在哪个节点上）。

## 为什么需要它

GreptimeDB 接收 OTLP metrics、traces、logs，以及 Prometheus remote write、InfluxDB Line Protocol、OpenTSDB、Loki Push API 和 Elasticsearch Bulk API 数据。有两类信息随数据一同到达，但在落库后的行里无处存放。

第一类是接入协议携带、而行编码器丢弃的单表元数据：

- 一张 OTLP traces 表看起来和任何宽表没区别；signal type 和 source 只能从命名去猜。
- OTLP metric 的单位（`s`、`By`）被行编码器丢弃，从数据里无法还原。
- OTLP 的聚合 temporality（`cumulative` vs `delta`）在 metric 名字里看不出来。
- Prometheus 中根据 `_total` 后缀推断出的 `counter` 不是协议声明。没有语义元数据时，表中不会记录这个区别。

第二类是跨表的结构。一个 service 的延迟指标、它的 span、它的日志分别落在不同的表里，"它们描述同一个 service"、"这个 service 调用了另一个 service"这类事实，只以列值约定的形式存在。想要"这个实体、它的邻居以及它们的遥测数据"的消费者，只能把拓扑写死或者靠猜。

两类信息都保留下来之后，告警生成器能区分速率和绝对值，仪表盘生成器能按 signal type 选择展示方式，agent 能在同一个查询引擎内从告警的 service 走到它的依赖，再走到这些依赖的遥测数据。

## 工作原理

两部分都使用现有的 SQL 接口，不增加协议或 DDL 关键字。

1. **`greptime.semantic.*` 表选项**与 `ttl`、`table_data_model` 等选项一起保存表身份、写入元数据和实体身份。支持的接入路径会自动写入，你也可以用 `CREATE TABLE ... WITH (...)` 或 `ALTER TABLE ... SET` 设置。
2. **[`information_schema.table_semantics`](/reference/sql/information-schema/table-semantics.md)** 是这些选项、以及由它们解析出的实体声明的查询入口。
3. **`greptime_private.semantic_entities` 和 `greptime_private.semantic_relationships`** 以两张只读表的形式暴露语义图。

## 实体与关系

**实体**是遥测数据所描述的对象：service、service instance、host、container、Kubernetes 的 pod、node、workload、service，以及 AI agent、model、tool。一张表声明它的行描述了哪些实体，以及哪些列标识每个实体。两张表如果用相同的标识值指向同一个实体，那它们描述的就是同一个实体——因此一个 service 从 trace 和从 metric 进入图后，仍然是同一个节点。

**关系**是两个实体之间带类型、有方向、在某个时间窗口内成立的边：`calls`、`runs_on`、`contains`、`part_of`、`depends_on`、`uses`、`invokes`。每条边都带一个 `provenance`，记录它是怎么得到的——由配对的 trace span 派生、由同一行上的两个身份派生，还是人工声明——以及一个 `confidence`。调用边还带有所在窗口的 RED 指标（请求数、错误数、耗时）。

边是有时间范围的事实，不是当前状态：一行断言的是这条边在某个 60 秒窗口内存在过。"当前拓扑"是对最近若干窗口的查询；实体或边一旦不再产生遥测数据就不再出现，不需要额外的过期机制。

## 读时派生

两张图表是计算出来的，不是存储的。扫描它们时，会枚举实体声明、为每张声明表构建查询计划，并在已有的遥测数据上执行。只有人工声明的边是持久化的，存放在 `greptime_private.semantic_relationships_declared`。

这来自 GreptimeDB 用一个引擎存储 metrics、logs 和 traces：服务调用图是 trace 表的自连接，把实体和它的遥测数据关联起来是同库内的 join，两者都不需要第二份存储。

由此带来三个结果：

- 实体在第一行数据落库的那一刻就出现。没有写入期的建索引步骤，没有物化延迟，也没有需要对账的第二份数据。
- 派生以发起查询的用户身份执行。调用者读不到的源表会被排除在结果之外，而不是借此放大其权限。
- 每次扫描都会对源表做实际计算，计算量由查询的时间窗口决定。没有 `observed_at` 下界的查询会被拒绝，而不是扫描全部历史。

## 限制

- `calls` 边上的 RED 指标描述的是实际观测到的 span 配对。在 trace 采样下，计数会低于真实流量；只有当采样与状态、耗时无关时，错误率才有代表性。
- 图的连通程度取决于各张表共享的标识值。两张表用不同的值指代同一个 service，就会得到两个节点。
- `semantic_entities` 每个窗口、每张贡献表返回一行。消费者用 `SELECT DISTINCT entity_type, entity_id` 去重。
- 在非常大的 trace 表上，读时派生每次扫描的开销都高于物化好的拓扑。

## 下一步

- **[语义层用户指南](/user-guide/semantic-layer/overview.md)**——选项、图表和查询写法。
- [声明实体与关系](/user-guide/semantic-layer/declaring-entities.md)——哪些数据无需配置即可进入图，其余的如何声明。
- [`information_schema.table_semantics`](/reference/sql/information-schema/table-semantics.md)、[`semantic_entities`](/reference/sql/greptime-private/semantic-entities.md)、[`semantic_relationships`](/reference/sql/greptime-private/semantic-relationships.md)——列定义参考。
