---
keywords: [AI 函数, 自然语言匹配, 分类, 评分, SQL 函数, Jev, TypeSafe]
description: 在 GreptimeDB 中配置和使用实验性的 AI 函数，实现自然语言匹配、分类和评分。
---

# AI 函数

AI 函数根据自然语言提示词评估文本。SQL 函数名不绑定特定服务提供方，当前后端使用
[TypeSafe 的 Jev 模型](https://docs.typesafe.ai/introduction)。

| 函数 | 用途 | 返回值 |
| --- | --- | --- |
| [`ai_match(text, prompt)`](./ai-match.md) | 估计某个陈述对文本成立的概率 | `[0, 1]` 范围内的 `DOUBLE` 概率 |
| [`ai_choose(text, prompt, criteria)`](./ai-choose.md) | 将文本归入给定选项之一 | 包含选项名称的 `STRING` |
| [`ai_score(text, prompt, criteria)`](./ai-score.md) | 根据有序等级对文本评分 | 包含 `score`、`confidence` 和 `probabilities` 的 JSONB 对象 |

:::warning 实验功能的可用范围
这些函数处于实验阶段，后续可能发生变化，需要使用包含
[GreptimeDB PR #9300](https://github.com/GreptimeTeam/greptimedb/pull/9300) 的构建。
它们替代了尚未发布的 `jev(text, statement, threshold)` API，`jev` 不再注册。
需要布尔过滤时，请使用 `ai_match(text, prompt) >= threshold`。
:::

## 启用 API 调用

**默认启用的 Cargo feature `ai_functions`** 会编译并注册这三个函数，但不会自动允许调用外部 API。
需要在 GreptimeDB 进程中单独启用 Jev 后端：

```shell
export GREPTIMEDB_EXPERIMENTAL_JEV=true
export JEV_API_KEY='<your TypeSafe API key>'
cargo run -p cmd -- standalone start
```

在包含该实现的 GreptimeDB 源码目录中运行上述命令。
如果需要显式启用 Cargo feature，可在 `--` 之前添加 `--features ai_functions`。
虽然 SQL 函数名不再绑定后端，运行时环境变量仍保留 Jev 名称。

| 环境变量 | 默认值 | 说明 |
| --- | --- | --- |
| `GREPTIMEDB_EXPERIMENTAL_JEV` | 关闭 | 设置为 `true`，允许调用 API。 |
| `JEV_API_KEY` | 无 | TypeSafe API key，执行非 NULL 输入时必需。 |
| `JEV_MODEL` | `jev-latest` | 发送给 TypeSafe 的模型名。 |
| `JEV_ENDPOINT` | `https://api.typesafe.ai/v1/systemone` | 完整的 HTTP 评估接口 URL。 |

当前 MVP 使用环境变量，没有对应的 TOML 配置段。环境变量必须传给服务端进程；
在另一个终端设置变量不会更新已运行的服务。API key 应保存在服务端环境中，不要写入 SQL。

:::warning 数据会发送到外部服务
传给这些函数的文本、提示词和 criteria 都会发送到配置的接口。
请仅使用允许发送到该服务的数据。
:::

## 参数与 NULL 处理

所有参数都是 SQL 字符串，可以是字面量或列表达式。
`text` 作为 API 的 `state`，`prompt` 作为问题的 `instructions`。
若需提供多个字段，请显式拼接，例如 `concat(service, ': ', message)`。
`(message)` 外面的括号不会创建行元组。

`ai_choose` 和 `ai_score` 的 criteria 参数是 **JSON 字符串**，而不是 JSONB 值。
criteria 可以逐行不同。常量 criteria 在每个 batch 中只解析一次并共享。

任一参数为 SQL `NULL` 时，该行返回 SQL `NULL`，不校验 criteria，也不发送 API 请求。
如果整个 batch 的行都被跳过，则不要求启用运行时开关或提供 API key。
例如，以下查询即使传入了非法的 criteria 字符串，也会返回 `NULL`：

```sql
SELECT ai_choose(NULL, 'Route the ticket', 'invalid JSON');
```

## 示例数据

各函数页面使用以下小规模合成数据集。`service` 和 `message` 被解析器视为关键字，
因此在建表语句中为列名加引号：

```sql
CREATE TABLE ai_events (
    occurred_at TIMESTAMP TIME INDEX,
    "service" STRING,
    "message" STRING,
    PRIMARY KEY ("service")
);

INSERT INTO ai_events VALUES
    ('2026-09-19T01:00:00Z', 'payments',
     'Payment failed permanently: all three retries exhausted; the payment is still unsuccessful.'),
    ('2026-09-19T02:00:00Z', 'payments',
     'Payment succeeded on the second retry; the payment is complete.'),
    ('2026-09-19T03:00:00Z', 'payments', NULL);
```

模型判断可能随输入和模型版本变化。体验完示例后，可使用 `DROP TABLE ai_events;` 删除测试表。

## 复用一次评估结果

AI 函数被标记为 volatile：查询规划阶段不会将其作为常量求值，
分别写在 `SELECT` 和 `WHERE` 中的相同调用也会分别执行。
如果过滤阶段评估了 N 个非 NULL 行，随后有 M 行进入投影阶段，则可能产生 N + M 次请求；
当全部行都通过过滤时，请求数可达 2N。

如果要根据同一个结果进行过滤、返回和排序，请在子查询中计算一次，再复用别名：

```sql
SELECT occurred_at, message, probability
FROM (
    SELECT occurred_at, message,
           ai_match(message, 'The event reports that a payment still failed after retries.') AS probability
    FROM ai_events
    WHERE occurred_at >= '2026-09-19T00:00:00Z'
      AND occurred_at <  '2026-09-20T00:00:00Z'
      AND service = 'payments'
) AS matched
WHERE probability >= 0.8
ORDER BY probability DESC;
```

此写法也适用于 `ai_choose` 和 `ai_score`。从 `ai_score` 结果的别名提取多个字段，
而不是为每个字段重新调用模型。这只复用当前查询内的结果，不会跨查询缓存。

## 错误与 MVP 限制

- **每次函数调用**中，每个参与评估的非 NULL 行都会产生一个 HTTP 请求。
  不同函数之间不会共享或合并请求，也没有跨查询缓存。
- 在 batch 发出任何请求之前，会先校验其中所有非 NULL 行的 criteria。
  非法 JSON、描述类型或选项/等级数量会在本地报错。
- 网络错误、超时、HTTP 错误（包括 `429` 和 `529`）、非法 JSON 或无效答案都会使查询失败，
  不会转换为 `NULL`。当前没有自动重试或退避机制。响应必须包含请求所对应的问题类型，
  并满足各函数页面列出的取值约束。
- **每个表达式的一次 batch 调用**最多并发 8 个请求，每个请求超时为 30 秒。
  这不是查询级或进程级上限；多个分区和查询并行时，总请求并发数可能更高。
- 普通 SQL 条件可以缩小候选数据范围，但不保证按 SQL 文本顺序求值，`LIMIT` 也不是 API 请求数的硬上限。
  建议先使用数据量较小、时间范围明确的查询。
- 默认模型别名 `jev-latest` 可能随时间变化。需要固定版本时，可通过 `JEV_MODEL` 指定服务支持的模型版本名。
- 真实服务的端到端验证以 standalone 为主。分布式部署需要在所有实际执行函数的节点使用启用 feature 的二进制，
  配置相应环境变量，并单独验证真实服务调用链路。

后端协议详见 [TypeSafe HTTP API 参考](https://docs.typesafe.ai/api)。
