---
keywords: [语义图, 实体图, semantic_entities, semantic_relationships, 服务拓扑, RED 指标, 根因分析]
description: semantic_entities 与 semantic_relationships 两张表的 schema、行的派生方式、查询窗口约定和查询范式。
---

# 语义图

:::warning
语义图目前处于实验阶段。表名、列名和派生规则在未来版本中可能变化。
:::

语义图是 `greptime_private` 下的两张只读表：

| 表 | 内容 |
| --- | --- |
| `semantic_entities` | 节点集合：遥测数据所描述的实体。 |
| `semantic_relationships` | 边集合：这些实体之间带类型的关系。 |

两张表都在查询时计算。扫描其中任何一张，都会收集各表携带的实体声明，为每张声明表构建查询计划，并在查询时间窗口内对遥测数据执行。除人工声明的边以外，不存储任何内容。

针对这两张表的所有写入路径都会被拒绝：`INSERT`、`CREATE`、`ALTER`、`TRUNCATE`、`DROP` 都会返回只读错误。把别的表改名成这两个名字同样会被拒绝。

```sql
SELECT entity_type, entity_id, source_tables
FROM greptime_private.semantic_entities
WHERE observed_at >= now() - INTERVAL '15' MINUTE;
```

## `semantic_entities`

每行是一张贡献表在一个 60 秒窗口内的一条去重后的实体观测。一个由三张表声明的实体，每个窗口至少产生三行，所以取节点集合时用 `SELECT DISTINCT entity_type, entity_id` 去重。

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `observed_at` | `TimestampMillisecond` | 时间索引。观测到该实体的 60 秒时间桶。 |
| `window_start` | `TimestampMillisecond` | 观测窗口的起点。 |
| `window_end` | `TimestampMillisecond` | 观测窗口的终点（`window_start` + 60 秒）。 |
| `fresh_until` | `TimestampMillisecond` | 实体被视为存在的截止时间。派生行等于 `window_end`。 |
| `entity_type` | `String` | 实体类型，例如 `service`、`host`、`k8s.pod`、`gen_ai.agent`。 |
| `entity_id` | `String` | 规范化标识：标识列的值按声明顺序转义后用 `,` 连接。 |
| `entity_id_attrs` | `Json` | 标识属性对象，便于消费者从 id 反查它由哪些列组成。 |
| `scope` | `String` | id 所属的命名空间或环境；声明中没有 scope 列时为空。 |
| `descriptive` | `Json` | 已声明的非标识属性快照；未声明时为 `NULL`。 |
| `source_tables` | `Json` | 贡献这条观测的遥测表数组，格式为 `schema.table`。 |

实体 id 渲染的是值，不是列名。因此在 trace 表里叫 `service_name`、在 metric 表里叫 `job` 的同一个 service 是同一个节点，前提是两列的取值相同。

下面的行来自单张指标表 `graph_app_metrics`，它声明了 `service`（以 `env` 列作为 scope）、`service.instance`、`host`，以及由 `service_name` 加 `host` 标识的 `process`：

```sql
SELECT entity_type, entity_id, entity_id_attrs, scope, descriptive, source_tables
FROM greptime_private.semantic_entities
WHERE observed_at >= now() - INTERVAL '15' MINUTE
ORDER BY entity_type, entity_id;
```

```sql
+------------------+-----------+-------------------------------------+---------+-------------------+------------------------------+
| entity_type      | entity_id | entity_id_attrs                     | scope   | descriptive       | source_tables                |
+------------------+-----------+-------------------------------------+---------+-------------------+------------------------------+
| host             | h1        | {"host":"h1"}                       |         |                   | ["public.graph_app_metrics"] |
| process          | cart,h1   | {"host":"h1","service_name":"cart"} |         | {"env":"us-east"} | ["public.graph_app_metrics"] |
| service          | cart      | {"service_name":"cart"}             | us-east |                   | ["public.graph_app_metrics"] |
| service.instance | cart-0    | {"instance":"cart-0"}               |         |                   | ["public.graph_app_metrics"] |
+------------------+-----------+-------------------------------------+---------+-------------------+------------------------------+
```

`source_tables` 保存的是供后续查询使用的表名，SQL 不会自动解引用；直接查询这些表即可取到该实体的遥测数据。

## `semantic_relationships`

每行是一个 60 秒窗口内观测到的一条关系。

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `observed_at` | `TimestampMillisecond` | 时间索引。观测到该边的 60 秒时间桶。 |
| `window_start` | `TimestampMillisecond` | 观测窗口的起点。 |
| `window_end` | `TimestampMillisecond` | 观测窗口的终点（`window_start` + 60 秒）。 |
| `fresh_until` | `TimestampMillisecond` | 该边被视为有效的截止时间。 |
| `src_type` / `src_id` | `String` | 源端的类型和规范化 id。 |
| `dst_type` / `dst_id` | `String` | 目标端的类型和规范化 id。 |
| `rel_type` | `String` | 关系类型。方向为 `src` → `dst`。 |
| `provenance` | `String` | 边的来源方式：`trace`、`attribute`、`declared` 或 `agent`。 |
| `confidence` | `Float64` | 派生的确定程度，取值在 `[0, 1]`。 |
| `request_count` | `Int64` | 窗口内的请求数，仅 `calls` 边。 |
| `unmatched_count` | `Int64` | 该边上没有匹配到 server span 的 client span 数量。 |
| `error_count` | `Int64` | 窗口内的错误请求数。 |
| `duration_sum` | `Float64` | 请求耗时之和，单位为秒。 |
| `duration_count` | `Int64` | 参与求和的耗时个数，与 `duration_sum` 搭配得到均值。 |
| `duration_max` | `Float64` | 与 `duration_sum` 同一批样本中最长的单次请求耗时，单位为秒。 |
| `attributes` | `Json` | 边的属性，例如 `{"connection_type":"database"}`。 |

### 关系类型

| `rel_type` | 含义（src → dst） | 派生方式 |
| --- | --- | --- |
| `calls` | service 调用 service；agent 调用子 agent | 配对的 trace span |
| `runs_on` | `service.instance`、`process`、`container`、`k8s.pod`、`k8s.container` 运行在 `host`、`k8s.node`、`k8s.pod`、`container` 上 | 同一行上的两个身份 |
| `contains` | `k8s.pod` 包含 `k8s.container` | 同一行上的两个身份 |
| `part_of` | `service.instance` 属于某个 `service`；`k8s.pod` 属于某个 `k8s.workload` | 同一行上的两个身份 |
| `uses` | `gen_ai.agent` 使用 `gen_ai.model` | 同一 trace 行上的两个身份 |
| `invokes` | `gen_ai.agent` 调用 `gen_ai.tool` | 同一 trace 行上的两个身份 |
| `depends_on` | 逻辑依赖 | 人工声明 |
| `owns` | 团队或 service 拥有目标端 | 人工声明 |

只存储一个方向。反向关系（`called_by`、`hosts`、`dependency_of`）是查询侧的事：把过滤条件换到另一端即可。声明边中的自定义 `rel_type` 只是一个字符串，内置的只有派生规则和上表的词汇。

`provenance` 是边身份的一部分，因此同一对端点上人工声明的边和派生出的边可以共存，声明的边在没有任何派生结果时也不会消失。

`confidence` 表达的是派生的确定程度，不是统计完整性。配对成功的边和声明的边为 `1.0`，虚拟节点边为 `0.5`。它不修正 trace 采样带来的偏差。

### 派生的调用边

`calls` 的派生把每个 client span 与它的子 server span 配对：`trace_id` 相同，且 server span 的 `parent_span_id` 等于 client span 的 `span_id`。配对成功的结果按 60 秒窗口聚合为 RED 列。这是 Tempo service graph processor 和 OpenTelemetry Collector `service_graph` connector 的 SQL 形式。

当部署用 `x-greptime-trace-table-name` 做路由时，同一条 trace 的 span 可能落在不同的表里。派生会先把 trace 表 union 起来再配对，跨表的一对 span 同样产生一条边。

没有匹配到 server span 的 client span 指向一个未插桩的对端，它会成为指向**虚拟节点**的边，节点名取自第一个存在的 span 属性，顺序如下：

| 属性列 | `connection_type` |
| --- | --- |
| `span_attributes.service.peer.name` | `virtual_node` |
| `span_attributes.peer.service` | `virtual_node` |
| `span_attributes.db.namespace` | `database` |
| `span_attributes.db.name` | `database` |
| `span_attributes.server.address` | `virtual_node` |

虚拟节点边的 `confidence` 为 `0.5`，`attributes` 中带 `connection_type`。当一个窗口内某条边存在真实配对时，RED 列只描述配对结果，未匹配的 client 计入同一行的 `unmatched_count`——这正是区分"被调方不再响应"和"流量不再进来"的依据。

```sql
SELECT src_id, dst_id, rel_type, provenance, confidence,
       request_count, unmatched_count, error_count,
       duration_sum, duration_count, duration_max, attributes
FROM greptime_private.semantic_relationships
WHERE observed_at >= now() - INTERVAL '15' MINUTE
ORDER BY dst_id;
```

```sql
+----------+-----------+----------+------------+------------+---------------+-----------------+-------------+--------------+----------------+--------------+------------------------------------+
| src_id   | dst_id    | rel_type | provenance | confidence | request_count | unmatched_count | error_count | duration_sum | duration_count | duration_max | attributes                         |
+----------+-----------+----------+------------+------------+---------------+-----------------+-------------+--------------+----------------+--------------+------------------------------------+
| frontend | cart      | calls    | trace      | 1          | 2             | 0               | 1           | 2            | 2              | 1.5          |                                    |
| frontend | orders-db | calls    | trace      | 0.5        | 1             | 1               | 0           | 0.1          | 1              | 0.1          | {"connection_type":"database"}     |
| frontend | redis     | calls    | trace      | 0.5        | 1             | 1               | 0           | 0.25         | 1              | 0.25         | {"connection_type":"virtual_node"} |
+----------+-----------+----------+------------+------------+---------------+-----------------+-------------+--------------+----------------+--------------+------------------------------------+
```

RED 指标描述的是实际存储下来的 span 配对。在采样下，计数会低于真实流量；只有当采样与状态、耗时无关时，错误率这类比值才有代表性——保留错误和慢请求的 tail sampling 会同时扭曲两者。

### 派生的包含与承载边

一行同时携带两个实体的身份，就见证了它们之间的关系，方向和类型由内置词汇确定。这类边的 `provenance` 为 `attribute`，来自 trace 行的 agent 边除外，它们为 `trace`。完整规则见[由同行共同声明派生的关系](./declaring-entities.md#由同行共同声明派生的关系)。

## 查询窗口

派生所用的时间窗口取自 `observed_at` 谓词：

| 谓词 | 窗口 |
| --- | --- |
| 没有 | 最近一小时 |
| 只有下界 | 从下界到当前时间 |
| 上下界都有 | 查询的范围 |
| 只有上界，或无法解析的形式 | 报错 |

```sql
SELECT src_id FROM greptime_private.semantic_relationships
WHERE observed_at < '2001-01-02 00:00:00';
```

```sql
ERROR 1815 (HY000): (EngineExecuteQuery): Invalid SQL, error: the observed_at filter has no lower bound; the graph cannot derive over unbounded history — add e.g. observed_at >= '2026-01-01 00:00:00'
```

使用带字面量边界或 `now() - INTERVAL '15' MINUTE` 的普通范围谓词（`>=`、`<`、`BETWEEN`）。`observed_at` 上的 `OR`、`IN` 等析取形式同样会被拒绝。

源表扫描会扩展到完整的 60 秒时间桶，因此窗口边界处的 RED 指标是完整的，不会被截断。

窗口就是资源边界：裸的 `SELECT * FROM greptime_private.semantic_entities` 最多扫描每张声明表最近一小时的数据，窗口放大则扫描量随之增加。

## 权限

派生以调用者的身份执行。每张源表单独鉴权：调用者读不到的表会被排除，它的实体、描述属性以及 `source_tables` 条目都不会出现。由 join 派生的边要求对参与 join 的每张表都有读权限。查询图不会放大对底层遥测数据的访问范围。

## 查询范式

### 有哪些实体

```sql
SELECT DISTINCT entity_type, entity_id
FROM greptime_private.semantic_entities
WHERE observed_at >= now() - INTERVAL '15' MINUTE
ORDER BY entity_type, entity_id;
```

### 当前拓扑

```sql
SELECT DISTINCT src_type, src_id, rel_type, dst_type, dst_id, provenance
FROM greptime_private.semantic_relationships
WHERE fresh_until >= now() - INTERVAL '5' MINUTE
  AND observed_at >= now() - INTERVAL '15' MINUTE;
```

### 某个 service 的下游依赖，按问题严重程度排序

```sql
SELECT dst_id,
       sum(request_count) AS requests,
       sum(error_count) AS errors,
       max(duration_max) AS slowest
FROM greptime_private.semantic_relationships
WHERE src_type = 'service' AND src_id = 'frontend'
  AND rel_type = 'calls'
  AND observed_at >= now() - INTERVAL '15' MINUTE
GROUP BY dst_id
ORDER BY errors DESC;
```

### 谁在调用某个 service

```sql
SELECT DISTINCT src_id
FROM greptime_private.semantic_relationships
WHERE dst_type = 'service' AND dst_id = 'cart'
  AND rel_type = 'calls'
  AND observed_at >= now() - INTERVAL '15' MINUTE;
```

### 某个 service 运行在哪里

实例通过 `part_of` 归属于 service，又通过 `runs_on` 指向承载它的节点，把两者 join 起来即可：

```sql
SELECT DISTINCT hosts.dst_type, hosts.dst_id
FROM greptime_private.semantic_relationships AS belongs
JOIN greptime_private.semantic_relationships AS hosts
  ON hosts.src_type = belongs.src_type AND hosts.src_id = belongs.src_id
WHERE belongs.rel_type = 'part_of'
  AND belongs.dst_type = 'service' AND belongs.dst_id = 'cart'
  AND hosts.rel_type = 'runs_on'
  AND belongs.observed_at >= now() - INTERVAL '15' MINUTE
  AND hosts.observed_at >= now() - INTERVAL '15' MINUTE;
```

### 某个实体的遥测数据在哪些表里

```sql
SELECT DISTINCT source_tables
FROM greptime_private.semantic_entities
WHERE entity_type = 'service' AND entity_id = 'cart'
  AND observed_at >= now() - INTERVAL '15' MINUTE;
```

### 多跳遍历

每多一跳就多一次自连接。用 `LEFT JOIN` 可以保留没有下一跳的邻居：

```sql
SELECT DISTINCT hop1.dst_id AS depth1, hop2.dst_id AS depth2
FROM greptime_private.semantic_relationships AS hop1
LEFT JOIN greptime_private.semantic_relationships AS hop2
  ON hop2.src_id = hop1.dst_id
  AND hop2.rel_type = 'calls'
  AND hop2.observed_at >= now() - INTERVAL '15' MINUTE
WHERE hop1.src_type = 'service' AND hop1.src_id = 'frontend'
  AND hop1.rel_type = 'calls'
  AND hop1.observed_at >= now() - INTERVAL '15' MINUTE
ORDER BY depth1, depth2;
```

图表不支持递归 CTE：`WITH RECURSIVE` 的递归项如果扫描 `semantic_entities` 或 `semantic_relationships`，会以 `Execution error: Stream already exhausted` 失败。

## 限制

- 实体行是逐条观测的，需要在查询里去重。
- RED 指标反映的是存储下来的 span 配对，在采样下不等于真实流量。
- 两张表用不同的值指代同一个实体会得到两个节点。需要对齐标识值，或者声明取值相同的标识列。
- 读时派生每次扫描都会重新计算。在非常大的 trace 表上，宽窗口的代价很高。
- 遍历深度在写查询时就固定了：一跳一次自连接，不能用 `WITH RECURSIVE`。
- 尚未实现 ISO SQL/PGQ 的 `GRAPH_TABLE` / `MATCH` 接口。
