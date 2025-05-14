---
keywords: [日志查询, 日志, 搜索, 实验功能, HTTP 接口]
description: GreptimeDB 实验性日志查询接口的说明文档，该接口提供了专门用于搜索和处理日志数据的 HTTP 服务。
---

# 日志查询（实验功能）

:::warning
日志查询接口目前仍处于实验阶段，在未来的版本中可能会有所调整。
:::

GreptimeDB 提供了一个专门用于查询日志数据的 HTTP 接口。通过这个功能，你可以使用简单的查询界面来搜索和处理日志记录。这是对 GreptimeDB 现有功能（如 SQL 查询和 Flow 计算）的补充。你仍然可以像之前一样使用已有的工具和工作流程来查询日志数据。

## 接口地址

```http
POST /v1/logs
```

## 请求头
- [认证](/user-guide/protocols/http.md#authentication)
- `Content-Type`: `application/json`

## 请求格式

请求体应为 JSON 格式（在实验阶段可能会随补丁版本有所变化）。关于最新的请求格式，请参考[源代码实现](https://github.com/GreptimeTeam/greptimedb/blob/main/src/log-query/src/log_query.rs)：

## 响应格式

此接口的响应格式与 SQL 查询接口相同。详情请参阅 [SQL 查询响应格式](/user-guide/protocols/http/#response)。

## 使用限制

- 最大结果数量：1000 条记录
- 仅支持包含时间戳和字符串列的表格

## 使用示例

以下示例展示了如何使用日志查询接口来查询日志数据（请注意，在实验性阶段这个例子可能会失效）：

```shell
curl -X "POST" "http://localhost:4000/v1/logs" \
    -H "Authorization: Basic {{authentication}}" \
    -H "Content-Type: application/json" \
    -d $'
    {
        "table": {
            "catalog_name": "greptime",
            "schema_name": "public",
            "table_name": "my_logs"
        },
        "time_filter": {
            "start": "2025-01-23"
        },
        "limit": {
            "fetch": 1
        },
        "columns": [
            "message"
        ],
        "filters": [
            {
                "column_name": "message",
                "filters": [
                    {
                       "Contains": "production"
                    }
                ]
            }
        ],
        "context": "None",
        "exprs": []
    }
'
```

在这个查询中，我们在 `greptime.public.my_logs` 表中搜索 `message` 字段包含 `production` 的日志记录。我们还设定了时间过滤条件，只获取 `2025-01-23` 当天的日志，并将结果限制为仅返回 1 条记录。

响应结果类似于以下内容：

```json
{
  "output": [
    {
      "records": {
        "schema": {
          "column_schemas": [
            {
              "name": "message",
              "data_type": "String"
            }
          ]
        },
        "rows": [
          [
            "Everything is in production"
          ]
        ],
        "total_rows": 1
      }
    }
  ],
  "execution_time_ms": 30
}
```
