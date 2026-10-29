---
keywords: [AI 函数, ai_match, ai_choose, ai_score, 自然语言匹配, 分类, 评分, JSONB]
description: ai_match、ai_choose 和 ai_score 函数参考，包括函数签名、criteria 格式、返回值和 SQL 示例。
---

# 函数参考

本页介绍用于匹配、分类和评分的三个 AI 函数。
实验功能的可用范围、配置、NULL 处理和请求限制见 [AI 函数概述](./overview.md)。

## ai_match

`ai_match` 使用 Jev 后端的 Noul 模式，估计某个自然语言陈述对文本成立的概率。

### 函数签名

```sql
ai_match(text, prompt)
```

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `text` | `STRING` | 待评估的文本。 |
| `prompt` | `STRING` | 关于该文本的陈述句或是非问题。 |

**返回类型：** 可空 `DOUBLE`（`Float64`），取值范围为 `[0, 1]`。

概率越高表示匹配程度越高。返回值不是相似度分数，也不是 Choice 和 Score 模式中的独立 confidence 字段。
响应中的概率缺失、不是数值、为非有限值或越界时，查询会失败。
任一参数为 `NULL` 时，返回 `NULL`，不调用 API。

函数不接受阈值参数，请对结果使用普通 SQL 比较：
`ai_match(text, prompt) >= 0.8` 会包含概率恰好为 `0.8` 的结果。
与 `NULL` 比较会得到 `NULL`，`WHERE` 会排除这些行。

### 过滤文本

使用[示例数据](./overview.md#示例数据)，找出重试后仍然失败的支付事件：

```sql
SELECT occurred_at, service, message
FROM ai_events
WHERE occurred_at >= '2026-09-19T00:00:00Z'
  AND occurred_at <  '2026-09-20T00:00:00Z'
  AND service = 'payments'
  AND ai_match(
    message,
    'The event reports that a payment still failed after retries.'
  ) >= 0.8
ORDER BY occurred_at;
```

预期命中第一条事件。第二条描述支付已恢复成功，NULL 事件不会调用 API。
模型在不同评估中不保证返回完全相同的结果。

### 返回概率并排序

```sql
SELECT occurred_at, message,
       ai_match(message, 'The event reports that a payment still failed after retries.') AS probability
FROM ai_events
WHERE occurred_at >= '2026-09-19T00:00:00Z'
  AND occurred_at <  '2026-09-20T00:00:00Z'
  AND service = 'payments'
ORDER BY probability DESC NULLS LAST;
```

若还需要按该概率过滤，请[复用子查询别名](./overview.md#复用一次评估结果)，
而不是在 `WHERE` 中再次调用 AI 函数。

## ai_choose

`ai_choose` 使用 Jev 后端的 Choice 模式，将文本归入给定选项之一。

### 函数签名

```sql
ai_choose(text, prompt, criteria)
```

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `text` | `STRING` | 待分类的文本。 |
| `prompt` | `STRING` | 选择选项的指令。 |
| `criteria` | `STRING` | 定义 1–255 个命名选项的 JSON 对象字符串。 |

**返回类型：** 可空 `STRING`，内容是所选选项的 **key**，而不是描述。
函数不返回服务提供方的 confidence 字段。如果响应中的 key 不在给定 criteria 中，查询会失败。

任一参数为 SQL `NULL` 时，返回 `NULL`，不校验 criteria，也不调用 API。

### Criteria 格式

每个 key 是选项名称。对应的 value 必须是 JSON 字符串、对象或数组形式的描述；
如果仅凭名称就足以表达含义，也可以使用 JSON `null`：

```json
{
  "billing": "Payments, invoices, and refunds",
  "technical": {"description": "Bugs and outages", "examples": ["crash", "timeout"]},
  "other": null
}
```

空对象、超过 255 个选项、非法 JSON，或使用数字或布尔值作为选项描述，都会被判为无效。
选项描述中的 JSON `null` 不等同于 SQL 参数为 NULL：`'{"other":null}'` 是合法 criteria，
而字符串 `'null'` 不是 criteria 对象。

### 示例

创建[示例数据](./overview.md#示例数据)后，将事件分配给相应团队：

```sql
SELECT occurred_at, message,
       ai_choose(message, 'Which team should handle this event?',
                 '{"billing":"Payments and refunds","technical":"Bugs and outages","other":null}') AS team
FROM ai_events
WHERE occurred_at >= '2026-09-19T00:00:00Z'
  AND occurred_at <  '2026-09-20T00:00:00Z';
```

每个非 NULL 行的结果是 `billing`、`technical` 或 `other` 之一。
可以将结果用于字符串比较或分组。如果既要返回标签又要按标签过滤，
请[复用子查询别名](./overview.md#复用一次评估结果)，不要重复编写 AI 调用。

## ai_score

`ai_score` 使用 Jev 后端的 Score 模式，根据有序等级对文本评分。
它返回一次模型评估的结构化结果，而不只是一个数值。

### 函数签名

```sql
ai_score(text, prompt, criteria)
```

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `text` | `STRING` | 待评分的文本。 |
| `prompt` | `STRING` | 对文本评分的指令。 |
| `criteria` | `STRING` | 定义 2–10 个从低到高排列的等级的 JSON 数组字符串。 |

**返回类型：** 可空 JSONB 对象，内部表示为 `BinaryView`。
使用 [JSON 函数](../json.md)显示结果或提取字段。

任一参数为 SQL `NULL` 时，返回 `NULL`，不校验 criteria，也不调用 API。

### Criteria 格式

每个数组元素通过 JSON 字符串、对象或数组描述一个等级。
等级按照输入顺序从零开始编号，例如：

```json
["No impact", {"description": "Degraded service with a workaround"}, ["Blocking issue", "No workaround"]]
```

对于这三个等级，评分范围是 `0` 到 `2`，而不是 `0` 到 `1`。
等级少于 2 个或多于 10 个的数组无效。与 `ai_choose` 不同，
等级描述不能为 JSON `null`，数字和布尔值也不能作为描述。

### 返回结果

以下为三个等级的示意结果：

```json
{
  "score": 1.05,
  "confidence": 0.92,
  "probabilities": [0.0, 0.95, 0.05]
}
```

| 字段 | 含义 |
| --- | --- |
| `score` | 服务提供方返回的等级编号概率加权均值。N 个等级对应 `[0, N - 1]` 范围，结果可以是小数。 |
| `confidence` | 服务提供方返回的 `[0, 1]` 范围内的置信度，反映分布的集中程度，不保证答案正确。 |
| `probabilities` | 恰好包含 N 个概率的数组，顺序与 criteria 一致。第 `i` 项对应 `criteria[i]`，是各等级对应的概率，而不是累积概率。 |

相同均值可能对应不同判断：`[0, 1, 0]` 和 `[0.5, 0, 0.5]` 的 score 都是 `1`，
但前者集中在中间等级，后者则分布在两个极端。
不要仅凭均值认定一个明确等级，还应查看置信度和概率分布。

响应必须包含这三个字段。score 和 confidence 必须是各自范围内的有限数值，
每个等级的概率必须是 `[0, 1]` 范围内的数值，且概率总和与 1 的差值不能超过 `1e-6`。
等级缺失或数值无效会使查询失败。GreptimeDB 保留服务提供方的数值，不会重新归一化概率分布或重新计算 score。

### 提取字段并过滤

使用[示例数据](./overview.md#示例数据)，每个事件只评估一次，随后提取字段并按置信度过滤：

```sql
SELECT occurred_at, message,
       json_get_float(rating, 'score') AS severity,
       json_get_float(rating, 'confidence') AS confidence,
       json_get_float(rating, 'probabilities[2]') AS blocking_probability
FROM (
    SELECT occurred_at, message,
           ai_score(message, 'How severe is this event?',
                    '["No impact","Degraded service with a workaround","Blocking issue with no workaround"]') AS rating
    FROM ai_events
    WHERE occurred_at >= '2026-09-19T00:00:00Z'
      AND occurred_at <  '2026-09-20T00:00:00Z'
) AS rated
WHERE json_get_float(rating, 'confidence') >= 0.8
ORDER BY severity DESC NULLS LAST;
```

若需显示完整对象，可在外层查询中使用 `json_to_string(rating)`。
复用 `rating` 能保证提取的各字段来自同一次评估；
为每个字段重复调用 `ai_score(...)` 会产生额外 API 请求。
详见[复用一次评估结果](./overview.md#复用一次评估结果)。
