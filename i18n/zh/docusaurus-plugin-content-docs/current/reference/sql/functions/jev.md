---
keywords: [Jev, 自然语言过滤, 语义过滤, SQL 函数, TypeSafe]
description: 使用实验性的 Jev SQL 函数，通过自然语言条件和概率阈值过滤文本。
---

# Jev 自然语言过滤

`jev(text, statement, threshold)` 使用 [TypeSafe 的 Jev 模型](https://docs.typesafe.ai/introduction)
判断文本是否满足自然语言描述的条件，返回布尔值，可用于 `WHERE` 或 `SELECT`。

:::note 实验功能的可用范围
在包含 Jev 实现的构建中，**默认启用的 Cargo feature `ai-functions`** 会编译并注册此函数。
实际调用外部 API 仍需启用运行时开关并提供 API key。
实现进度见 [GreptimeDB PR #9265](https://github.com/GreptimeTeam/greptimedb/pull/9265)。
:::

## 启用 Jev

在包含此功能的 GreptimeDB 源码目录中，设置服务端环境变量，并启动启用了 feature 的 standalone 实例：

```shell
export GREPTIMEDB_EXPERIMENTAL_JEV=true
export JEV_API_KEY='<your TypeSafe API key>'
cargo run -p cmd -- standalone start
```

这里有两个独立的开关：

- 默认启用的 Cargo feature `ai-functions` 控制 SQL 函数的编译与注册。
- `GREPTIMEDB_EXPERIMENTAL_JEV=true` 允许已编译的函数调用 API。

默认构建会注册 `jev()`，但不会自动允许外部 API 调用。
如果需要显式启用 Cargo feature，可以使用 `--features ai-functions`。
环境变量必须传给 GreptimeDB 进程，在另一个终端设置变量不会更新已运行的服务。

| 环境变量 | 默认值 | 说明 |
| --- | --- | --- |
| `GREPTIMEDB_EXPERIMENTAL_JEV` | 关闭 | 设置为 `true`，允许调用 API。 |
| `JEV_API_KEY` | 无 | TypeSafe API key，执行非 NULL 输入时必需。 |
| `JEV_MODEL` | `jev-latest` | 发送给 TypeSafe 的模型名。 |
| `JEV_ENDPOINT` | `https://api.typesafe.ai/v1/systemone` | 完整的 HTTP 评估接口 URL。 |

当前 MVP 使用这些环境变量，没有对应的 TOML 配置段。
API key 应保存在服务端环境中，不要写入 SQL。

## 函数签名

```sql
jev(text, statement, threshold)
```

**返回类型：** 可空 `BOOLEAN`。

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `text` | 字符串 | 待判断的文本，作为 API 的 `state`。 |
| `statement` | 字符串 | 陈述句或是非问题，作为 Noul 问题的 `instructions`。 |
| `threshold` | `DOUBLE` | `[0, 1]` 范围内的有限数值。 |

参数均非 NULL 时，若返回的 Noul 概率**大于或等于** `threshold`，函数返回 `true`，否则返回 `false`。
例如，概率为 `0.8` 的结果满足阈值 `0.8`。

阈值针对的是条件成立的概率，不是相似度分数，也不是 TypeSafe 的 Choice 或 Score 原语返回的独立 confidence 字段。
SQL 函数仅返回布尔判断，不返回原始概率。

任一参数为 `NULL` 时，结果为 `NULL`，该行不会发送 API 请求。
`WHERE` 会排除结果为 `false` 或 `NULL` 的行。
如果整个 batch 的输入都因 NULL 而跳过，则不要求 API key，也不检查运行时开关。

第一个参数是单个字符串表达式。`(message)` 只是带括号的表达式，不是行元组。
如果需要提供多个字段，请显式拼接，例如 `concat(service, ': ', message)`。

## 示例

创建表并插入合成的支付事件。`service` 和 `message` 是 SQL 关键字，因此在建表语句中为列名加引号：

```sql
CREATE TABLE jev_events (
    occurred_at TIMESTAMP TIME INDEX,
    "service" STRING,
    "message" STRING,
    PRIMARY KEY ("service")
);

INSERT INTO jev_events VALUES
    ('2026-09-19T01:00:00Z', 'payments',
     'Payment failed permanently: all three retries exhausted; the payment is still unsuccessful.'),
    ('2026-09-19T02:00:00Z', 'payments',
     'Payment succeeded on the second retry; the payment is complete.'),
    ('2026-09-19T03:00:00Z', 'payments', NULL);

SELECT occurred_at, service, message
FROM jev_events
WHERE occurred_at >= '2026-09-19T00:00:00Z'
  AND occurred_at <  '2026-09-20T00:00:00Z'
  AND service = 'payments'
  AND jev(
    message,
    'The event reports that a payment still failed after retries.',
    0.8
  )
ORDER BY occurred_at;
```

预期命中第一条事件：重试耗尽后支付仍然失败。
第二条事件表示支付已恢复成功；NULL 事件不调用 API，直接被排除。
模型的判断可能随输入和模型版本变化。

如果需要查看每行的布尔判断，可将 `jev(...) AS matched` 放入 `SELECT` 列表，而不是用作过滤条件。
再次查询会重新评估文本，结果不会跨查询缓存。

示例运行结束后可删除测试表：

```sql
DROP TABLE jev_events;
```

## 错误与 MVP 限制

- 对于非 NULL 行，阈值超出 `[0, 1]`、为 NaN 或无穷值时，会在该 batch 发出任何请求前报错。
- 每个参与评估的非 NULL 行都会产生一个独立 HTTP 请求。文本会发送到配置的外部接口，并使用 Bearer 认证。
- **每个表达式的一次 batch 调用**最多并发 8 个请求，每个请求超时为 30 秒。
  这不是查询级或进程级上限；多个分区和查询并行时，总请求并发数可能更高。
- 网络错误、超时、HTTP 错误（包括 `429` 和 `529`）、非法 JSON、格式错误或越界的 Noul 响应都会使查询失败，
  不会转换为 `false` 或 `NULL`。当前没有自动重试或退避机制。
- 普通 SQL 条件可以缩小候选数据范围，但条件不保证按 SQL 文本顺序求值，`LIMIT` 也不是 API 请求数的硬上限。
  建议先使用数据量较小、时间范围明确的查询。
- 默认模型别名 `jev-latest` 可能随时间变化。如果需要固定模型版本，可以通过 `JEV_MODEL` 指定服务支持的版本名。
- 真实服务的端到端验证以 standalone 为主。分布式部署需要在所有实际执行此函数的节点使用启用 feature 的二进制，
  配置相应环境变量，并单独验证真实服务调用链路。

请求和响应的详细定义见 [TypeSafe HTTP API 参考](https://docs.typesafe.ai/api)
与 [Noul 文档](https://docs.typesafe.ai/primitives/noul)。
