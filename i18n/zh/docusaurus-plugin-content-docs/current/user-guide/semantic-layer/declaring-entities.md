---
keywords: [实体声明, greptime.semantic.entity, 语义图, kube-state-metrics, target_info, 声明边, semantic_relationships_declared]
description: 哪些数据无需配置即可进入语义图、如何在自己的表上声明实体，以及如何人工声明边。
---

# 声明实体与关系

:::warning
实体声明目前处于实验阶段。选项 key、内置约定和声明边表在未来版本中可能变化。
:::

一张表通过声明"它的行描述了哪些实体、哪些列标识每个实体"加入[语义图](./semantic-graph.md)。常见情况由内置约定覆盖，其余的用 `greptime.semantic.entity.*` 表选项声明。

## 内置约定

约定随二进制发布，不可配置。某个实体类型上的显式声明总是覆盖该类型的约定声明，包括显式声明本身不可用的情况：写错的声明不会悄悄退回到另一套身份。

### OTLP trace 表

任何 `table_data_model` = `greptime_trace_v1` 的表，无需任何选项，就会从展开的 resource attributes 得到以下声明：

| 实体 | 标识列 | 描述列 |
| --- | --- | --- |
| `service` | `service_name` | — |
| `service.instance` | `service_name`、`resource_attributes.service.instance.id` | — |
| `host` | `resource_attributes.host.id` | `resource_attributes.host.name` |
| `k8s.pod` | `resource_attributes.k8s.pod.uid` | `resource_attributes.k8s.pod.name`、`resource_attributes.k8s.namespace.name` |
| `k8s.node` | `resource_attributes.k8s.node.name` | — |
| `k8s.container` | `resource_attributes.k8s.pod.uid`、`resource_attributes.k8s.container.name` | `resource_attributes.container.id`、`resource_attributes.container.name` |
| `container` | `resource_attributes.container.id` | `resource_attributes.container.name` |

只有当一行上某个声明的全部标识列都存在且非空时，该声明才在这一行生效。在携带完整 `k8s.container` 身份的行上，通用的 `container` 声明让位，因此 pod 里的容器是一个节点，而不是两个。

OTLP trace 接入路径在建表时还会写入 `greptime.semantic.entity.service.id` = `service_name`。这个显式选项优先于约定的 `service` 声明，因此从 trace 派生的 `service` id 就是不带前缀的服务名。

`service.instance` 没有这个写入，走约定：`resource_attributes.service.namespace` 存在时，id 渲染为 `<namespace>/<service_name>,<instance.id>`。其中的首个分量与 Prometheus 的 `job` 标签一致——OpenTelemetry 兼容性规范把 `job` 定义为 `<service.namespace>/<service.name>`。

两条规则在 `service` 这一层对不齐。当 `service.namespace` 为 `shop`、`service.name` 为 `api` 时，同一个服务会以两个节点进入图：

| 来源 | `entity_type` | `entity_id` |
| --- | --- | --- |
| OTLP trace 表 | `service` | `api` |
| `target_info` 或 `greptime_otel_resource_info` | `service` | `shop/api` |
| OTLP trace 表 | `service.instance` | `shop/api,<instance.id>` |

只有 `service.namespace` 为空、`job` 就等于服务名本身时，两者才会重合。在这个差异存在期间要合并它们，需要在其中一侧用携带对方取值的列显式声明身份。

### Prometheus 描述性指标

由 remote write 路径打上 `signal_type` = `metric` 和 `source` = `prometheus` 的表，如果表名命中白名单内的 kube-state-metrics 或 `target_info` 描述性指标，且标识列存在，就会得到隐式声明：

| 表 | 实体（标识列） |
| --- | --- |
| `kube_pod_info` | `k8s.pod`（`uid`）、`k8s.node`（`node`） |
| `kube_node_info` | `k8s.node`（`node`） |
| `kube_pod_owner` | `k8s.pod`（`uid`）、`k8s.workload`（`namespace`、`owner_kind`、`owner_name`） |
| `kube_pod_container_info` | `k8s.pod`（`uid`）、`k8s.container`（`uid`、`container`） |
| `kube_pod_init_container_info` | `k8s.pod`（`uid`）、`k8s.container`（`uid`、`container`） |
| `kube_service_info` | `k8s.service`（`uid`） |
| `target_info` | `service`（`job`）、`service.instance`（`job`、`instance`） |

这些表同时贡献描述属性——pod 名和 namespace、节点内核版本、容器镜像——并按表上实际存在的列过滤，因为 kube-state-metrics 的标签集随版本变化。`target_info` 还会把剩余的全部 tag 列快照到 `service.instance` 实体上。

普通指标表不会被扫描出实体：带 `job` 和 `instance` 标签的指标本身不贡献任何东西，是 `target_info` 把这些 service 放进图里的。

### OTLP 资源描述表

GreptimeDB 可以从写入的 OTLP metrics 的 resource attributes 中合成一张 `greptime_otel_resource_info` 表，让只有指标的 service 也能进入图。该功能默认关闭；开启后会创建并写入一张客户端没有发送的表。

```toml
[otlp]
experimental_enable_resource_info = true
```

开启后，该表声明 `service`（`job`）、`service.instance`（`job`、`instance`）、`host`（`host.id`）、`k8s.pod`（`k8s.pod.uid`）、`k8s.node`（`k8s.node.name`）、`k8s.container`（`k8s.pod.uid`、`k8s.container.name`）和 `container`（`container.id`），让位规则与 trace 侧相同。

## 在自己的表上声明实体

每种实体类型有三个选项 key：

```
greptime.semantic.entity.<entity_type>.id          = 逗号分隔的列名
greptime.semantic.entity.<entity_type>.descriptive = 逗号分隔的列名   （可选）
greptime.semantic.entity.<entity_type>.scope       = 逗号分隔的列名   （可选）
```

`<entity_type>` 是一个或多个用点分隔的 `[a-z0-9_]` 片段，例如 `service`、`k8s.pod`、`gen_ai.agent`，也可以是自定义类型。与语义词汇表的其余部分不同，实体类型是开放的。

DDL 阶段强制四条规则：

- 列必须在表上存在。
- 列必须能渲染成字符串。`Binary`、`Json`、`Vector`、`List`、`Struct`、`Dictionary` 类型会被拒绝；把被引用的列 `ALTER TABLE ... MODIFY COLUMN` 改成这些类型同样会被拒绝。
- 列可以是 tag，也可以是 field。
- `id` 列的顺序是身份的一部分。`entity_id` 是这些列的值按该顺序连接的结果，因此声明同一实体类型的各张表必须以相同顺序（从宽到窄）列出它们。

```sql
CREATE TABLE app_request_latency (
  ts           TIMESTAMP(3) TIME INDEX,
  service_name STRING,
  instance     STRING,
  host         STRING,
  env          STRING,
  latency      DOUBLE,
  PRIMARY KEY (service_name, instance, host, env)
) WITH (
  'greptime.semantic.signal_type' = 'metric',
  'greptime.semantic.entity.service.id' = 'service_name',
  'greptime.semantic.entity.service.scope' = 'env',
  'greptime.semantic.entity.service.instance.id' = 'service_name,instance',
  'greptime.semantic.entity.host.id' = 'host'
);
```

`service.instance` 把 `service_name` 排在 `instance` 之前，与该类型的内置身份保持一致。只用实例名不唯一：两个服务都把实例命名为 `0` 时会合并成一个节点。

标识列为 `NULL` 或空字符串的行不标识任何实体，会被跳过。

`scope` 不属于身份，只是把命名空间或环境值作为过滤和展示列暴露出来。真正用于区分两个实体的命名空间应该放进 `id`。

表可以在创建之后加入或退出图：

```sql
ALTER TABLE app_request_latency SET 'greptime.semantic.entity.process.id' = 'service_name,host';

ALTER TABLE app_request_latency UNSET 'greptime.semantic.entity.process.id';
```

实体在下一次查询图时出现，不回填，也不重写数据。

## 由同行共同声明派生的关系

一行同时携带两个实体的身份，就见证了它们之间的关系。哪些组合产生边、方向如何，由内置词汇决定：

| 源端 | 目标端 | `rel_type` |
| --- | --- | --- |
| `service.instance` | `host` | `runs_on` |
| `service.instance` | `k8s.pod` | `runs_on` |
| `service.instance` | `container` | `runs_on` |
| `service.instance` | `k8s.container` | `runs_on` |
| `service.instance` | `service` | `part_of` |
| `process` | `host` | `runs_on` |
| `container` | `host` | `runs_on` |
| `k8s.container` | `host` | `runs_on` |
| `k8s.pod` | `k8s.node` | `runs_on` |
| `k8s.pod` | `k8s.container` | `contains` |
| `k8s.pod` | `k8s.workload` | `part_of` |

另有两条只作用于 trace 表：

| 源端 | 目标端 | `rel_type` |
| --- | --- | --- |
| `gen_ai.agent` | `gen_ai.model` | `uses` |
| `gen_ai.agent` | `gen_ai.tool` | `invokes` |

这样派生出的边 `provenance` 为 `attribute`，agent 边除外——它们是 span 结构的观测，`provenance` 为 `trace`。仅仅共享一个列值不会派生出任何东西：组合必须在上述词汇内，且两个身份必须声明在同一张表上。

以上两张表就是完整的规则集。要关联没有任何一张表共同声明的实体，需要人工声明边。

## 人工声明边

`greptime_private.semantic_relationships_declared` 存放你自己断言的边。它的行会 union 进 `semantic_relationships`，与派生边一起出现，`provenance` 为 `declared`。

这张表的定义由 GreptimeDB 管理：首次 `INSERT` 时按规范 schema 创建，`CREATE`、`ALTER` 以及把别的表改名成这个名字都会被拒绝；`INSERT`、`DELETE`、`DROP` 允许，下一次写入会重新创建这张表。

```sql
INSERT INTO greptime_private.semantic_relationships_declared
  (observed_at, src_type, src_id, rel_type, dst_type, dst_id, provenance, scope, generation_id)
VALUES
  (now(), 'service', 'frontend', 'depends_on', 'service', 'users-db', 'declared', '', '');
```

| 列 | 说明 |
| --- | --- |
| `observed_at` | 时间索引，即声明时间。 |
| `src_type`、`src_id`、`rel_type`、`dst_type`、`dst_id`、`provenance`、`scope`、`generation_id` | tag 列，构成主键。主键要求全部提供，不使用 `scope` 和 `generation_id` 时传 `''`。 |
| `valid_from`、`valid_until` | 业务有效期。`valid_from` 为 `NULL` 表示自声明起有效；`valid_until` 为 `NULL` 表示只要行存在就有效。 |
| `confidence`、`request_count`、`error_count`、`duration_sum`、`duration_count` | 可选，声明边通常留空。 |
| `attributes` | 可选的 JSON。 |

自己断言的边把 `provenance` 设为 `declared`，LLM 推断出的边设为 `agent`。因为 `provenance` 是边身份的一部分，推断出的边始终与观测到的结构可区分，也无法覆盖后者。

这条边在下一次查询时出现在 `semantic_relationships` 中，没有填写的列为 `NULL`。

用相同的边主键再次插入会存入一个新版本，读取时保留查询窗口内的最新版本。要下线一条边，把 `valid_until` 设为过去的时间，或者删除该行：

```sql
DELETE FROM greptime_private.semantic_relationships_declared
WHERE src_id = 'frontend' AND dst_id = 'users-db' AND rel_type = 'depends_on';
```

这张表的 TTL 是 90 天，一直不再断言的边最终随行过期。

## 查看声明

`information_schema.table_semantics` 的 `entity_declarations` 列报告一张表贡献的全部声明，显式声明和约定声明都在内：

```sql
SELECT table_name, entity_declarations
FROM information_schema.table_semantics
WHERE entity_declarations IS NOT NULL;
```

JSON 数组的每个元素描述一条声明：

| 字段 | 说明 |
| --- | --- |
| `entity_type` | 声明的类型。 |
| `origin` | `declared` 表示来自表选项，`convention` 表示来自内置规则。 |
| `id` | 标识列，按声明顺序排列。 |
| `id_qualifier` | 约定使用的、限定第一个 id 分量的列。 |
| `superseded_by` | 更具体类型的标识列；行上带齐这些列时由该类型接管。 |
| `descriptive`、`scope` | 承担这两种角色的列。 |

用它确认一张表实际贡献了什么，以及显式声明是否替换掉了约定声明。
