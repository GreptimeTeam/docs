---
keywords: [ai_match, AI 函数, 自然语言匹配, 概率, 语义过滤]
description: 使用 ai_match 返回自然语言匹配概率，用于过滤、投影和排序。
---

# ai_match

`ai_match` 使用 Jev 后端的 Noul 模式，估计某个自然语言陈述对文本成立的概率。
实验功能的可用范围、配置、NULL 处理和请求限制见 [AI 函数概述](./overview.md)。

## 函数签名

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

## 过滤文本

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

## 返回概率并排序

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
