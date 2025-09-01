---
keywords: [Trigger, 触发器, 告警, GreptimeDB 企业版, 语法]
description: 本文档系统描述了 GreptimeDB Trigger 的完整语法规范。
---

# Trigger 语法

:::tip 注意

本功能仅在 GreptimeDB 企业版中可用。

:::

## CREATE TRIGGER

创建 Trigger 的语法：

```sql
CREATE TRIGGER [IF NOT EXISTS] <trigger_name>
        ON (<query_expression>) EVERY <interval_expression>
        [LABELS (<label_name>=<label_val>, ...)]
        [ANNOTATIONS (<annotation_name>=<annotation_val>, ...)]
        NOTIFY (
                WEBHOOK <notify_name1> URL '<url1>' [WITH (<parameter1>=<value1>, ...)],
                WEBHOOK <notify_name2> URL '<url2>' [WITH (<parameter2>=<value2>, ...)]
        );
```

- Trigger name：Trigger 在 catalog 级别的唯一标识符。
- IF NOT EXISTS：阻止 Trigger 已经存在时的报错。

### On 子句

#### Query expression

指定的 SQL 查询会被定期执行。若查询结果非空，则触发通知；若查询结果包含多行，则
每一行都会触发一条独立通知。

此外，Trigger 会从查询结果中提取 labels 与 annotations，并与 `LABELS` 和 `ANNOTATIONS`
子句中指定的键值对一起附加到通知消息中。

提取规则如下：

- 若列名（或别名）以 `label_` 开头，则将该列提取到 LABELS 中，键名为去掉 `label_`
    前缀后的列名（或别名）。
- 其余所有列均提取到 ANNOTATIONS 中，键名即为列名（或别名）。

例如，查询表达式如下：

```sql
SELECT collect as label_collector, host as label_host, val
    FROM host_load1
    WHERE val > 10 and ts >= now() - '1 minutes'::INTERVAL
```

假设查询结果非空，且如下所示：

| label_collector  | label_host | val |
|------------------|------------|-----|
| collector1       | host1      | 12  |
| collector2       | host2      | 15  |

这将产生两条通知。

第一条通知的 labels 与 annotations 如下：
- Labels:
    - collector: collector1
    - host: host1
    - 以及 `LABELS` 子句中定义的 labels
- Annotations:
    - val: 12
    - 以及 `ANNOTATIONS` 子句中定义的 annotations

第二条通知的 labels 与 annotations 如下：
- Labels:
    - collector: collector2
    - host: host2
    - 以及 `LABELS` 子句中定义的 labels
- Annotations:
    - val: 15
    - 以及 `ANNOTATIONS` 子句中定义的 annotations
        
#### Interval expression

指定查询的执行间隔。它表示查询的执行频率。例如，`INTERVAL '1 minute'`、
`INTERVAL '1 hour'` 等。

- INTERVAL 表达式中**禁止**使用 `years` 和 `months`。月和年的时长是可变的，取决于具体的月份或年份，因此不适合用来定义固定的间隔。
- 最小间隔为 1 秒。任何小于 1 秒的间隔都会被自动向上取整为 1 秒。

有关 INTERVA L表达式的更多语法细节，请参见 [interval-type](/reference/sql/data-types.md#interval-type)。
### Labels 和 Annotations 子句

LABELS 和 ANNOTATIONS 子句用于在 Trigger 发送的通知消息中附加静态的键值对，以提
供有关该 Trigger 的额外上下文或元数据。

- LABELS：可用于 Alertmanager 的路由、分组与抑制规则等。
- ANNOTATIONS：通常用于存放供人类阅读的描述信息。

### Notify 子句

NOTIFY 子句允许指定一个或多个通知通道。目前，GreptimeDB 支持以下通道类型：

#### Webhook
    
当 Trigger 触发时，Webhook 通道会向指定的 URL 发送 HTTP 请求。请求的 payload
与 [Prometheus Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/)
兼容，因此我们可以复用 Alertmanager 的分组、抑制、静默和路由功能，而无需任何
额外的胶水代码。

可选的 WITH 子句允许指定额外的参数：

- timeout：HTTP 请求的超时时间，例如 `timeout='1m'`。

## SHOW TRIGGERS

列出所有的 Triggers：

```sql
SHOW TRIGGERS;
```

当然，它也支持 `LIKE` 查询：

```sql
SHOW TRIGGERS LIKE '<pattern>';
```

例如：

```sql
SHOW TRIGGERS LIKE 'load%';
```

以及 `WHERE` 条件：

```sql
SHOW TRIGGERS WHERE <condition>;
```

例如：

```sql
SHOW TRIGGERS WHERE name = 'load1_monitor';
```

## DROP TRIGGER

请使用以下 `DROP TRIGGER` 语句删除 Trigger：

```sql
DROP TRIGGER [IF EXISTS] <trigger-name>;
```

For example:

```sql
DROP TRIGGER IF EXISTS load1_monitor;
```

## 示例

请参考企业版用户指南中的 [Trigger](/enterprise/trigger.md) 文档。
