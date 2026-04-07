---
keywords: [logs, log service, pipeline, greptime_identity, quick start, JSON logs]
description: GreptimeDB 日志服务快速入门指南，包括使用内置 greptime_identity pipeline 的基本日志写入和与日志收集器的集成。
---

# 快速入门

本指南将引导你完成使用 GreptimeDB 日志服务的基本步骤。
你将学习如何使用内置的 `greptime_identity` pipeline 写入日志并集成日志收集器。

GreptimeDB 提供了强大的基于 pipeline 的日志写入系统。
你可以使用内置的 `greptime_identity` pipeline 快速写入 JSON 格式的日志，
该 pipeline 具有以下特点：

- 自动处理从 JSON 到表列的字段映射
- 如果表不存在则自动创建表
- 灵活支持变化的日志结构
- 需要最少的配置即可开始使用

## 直接通过 HTTP 写入日志

GreptimeDB 日志写入最简单的方法是通过使用 `greptime_identity` pipeline 发送 HTTP 请求。

例如，你可以使用 `curl` 发送带有 JSON 日志数据的 POST 请求：

```shell
curl -X POST \
  "http://localhost:4000/v1/ingest?db=public&table=demo_logs&pipeline_name=greptime_identity" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic {{authentication}}" \
  -d '[
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "level": "INFO",
      "service": "web-server",
      "message": "用户登录成功",
      "user_id": 12345,
      "ip_address": "192.168.1.100"
    },
    {
      "timestamp": "2024-01-15T10:31:00Z",
      "level": "ERROR", 
      "service": "database",
      "message": "连接超时",
      "error_code": 500,
      "retry_count": 3
    }
  ]'
```

关键参数包括：

- `db=public`：目标数据库名称（你的数据库名称）
- `table=demo_logs`：目标表名称（如果不存在则自动创建）
- `pipeline_name=greptime_identity`：使用 `greptime_identity` pipeline 进行 JSON 处理
- `Authorization` 头：使用 base64 编码的 `username:password` 进行基本身份验证，请参阅 [HTTP 鉴权指南](/user-guide/protocols/http.md#authentication)

成功的请求返回：

```json
{
  "output": [{"affectedrows": 2}],
  "execution_time_ms": 15
}
```

成功写入日志后，
相应的表 `demo_logs` 会根据 JSON 字段自动创建相应的列，其 schema 如下：

```sql
+--------------------+---------------------+------+------+---------+---------------+
| Column             | Type                | Key  | Null | Default | Semantic Type |
+--------------------+---------------------+------+------+---------+---------------+
| greptime_timestamp | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
| ip_address         | String              |      | YES  |         | FIELD         |
| level              | String              |      | YES  |         | FIELD         |
| message            | String              |      | YES  |         | FIELD         |
| service            | String              |      | YES  |         | FIELD         |
| timestamp          | String              |      | YES  |         | FIELD         |
| user_id            | Int64               |      | YES  |         | FIELD         |
| error_code         | Int64               |      | YES  |         | FIELD         |
| retry_count        | Int64               |      | YES  |         | FIELD         |
+--------------------+---------------------+------+------+---------+---------------+
```

## 与日志收集器集成

对于生产环境，
你通常会使用日志收集器自动将日志转发到 GreptimeDB。
以下是如何配置 Vector 使用 `greptime_identity` pipeline 向 GreptimeDB 发送日志的示例：

```toml
[sinks.my_sink_id]
type = "greptimedb_logs"
dbname = "public"
endpoint = "http://<host>:4000"
pipeline_name = "greptime_identity"
table = "<table>"
username = "<username>"
password = "<password>"
# 根据需要添加其他配置
```

关键配置参数包括：
- `type = "greptimedb_logs"`：指定 GreptimeDB 日志接收器
- `dbname`：目标数据库名称
- `endpoint`：GreptimeDB HTTP 端点
- `pipeline_name`：使用 `greptime_identity` pipeline 进行 JSON 处理
- `table`：目标表名称（如果不存在则自动创建）
- `username` 和 `password`：HTTP 基本身份验证的凭证

有关 Vector 配置和选项的详细信息，
请参阅 [Vector 集成指南](/user-guide/ingest-data/for-observability/vector.md#使用-greptimedb_logs-sink-推荐)。

## 下一步

你已成功写入了第一批日志，以下是推荐的后续步骤：

- **了解更多关于内置 Pipeline 的行为**：请参阅[内置 Pipeline](/reference/pipeline/built-in-pipelines.md)指南，了解可用的内置 pipeline 及其配置的详细信息
- **与流行的日志收集器集成**：有关将 GreptimeDB 与 Fluent Bit、Fluentd 等各种日志收集器集成的详细说明，请参阅[日志概览](./overview.md)中的[集成到日志收集器](./overview.md#集成到日志收集器)部分
- **使用自定义 Pipeline**：要了解使用自定义 pipeline 进行高级日志处理和转换的信息，请参阅[使用自定义 Pipeline](./use-custom-pipelines.md)指南

