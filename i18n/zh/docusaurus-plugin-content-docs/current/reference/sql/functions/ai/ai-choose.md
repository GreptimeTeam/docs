---
keywords: [ai_choose, AI 函数, 分类, criteria, 自然语言]
description: 使用 ai_choose 根据 JSON criteria 将文本归入指定的命名选项。
---

# ai_choose

`ai_choose` 使用 Jev 后端的 Choice 模式，将文本归入给定选项之一。
实验功能的可用范围、配置、NULL 处理和请求限制见 [AI 函数概述](./overview.md)。

## 函数签名

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

## Criteria 格式

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

## 示例

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
