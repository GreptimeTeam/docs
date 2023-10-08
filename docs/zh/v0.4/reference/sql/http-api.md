# HTTP API

要通过 HTTP API 向 GreptimeDB 服务器提交 SQL 查询，请使用以下格式：

```shell
curl -X POST \
  -H 'Authorization: Basic {{authentication}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql={{SQL-statement}}' \
http://{{API-host}}/v1/sql?db={{db-name}}
```

## Method

请使用 POST 方法

## Header

- `Authorization`: 身份凭证。如果你使用启用了身份验证的 GreptimeDB，则此项为必需。 请参考[鉴权](/zh/v0.4/user-guide/clients/http-api.md#authentication).
- `Content-Type`: `application/x-www-form-urlencoded`.

## Query 参数

- `db`: 数据库名称。如果你使用启用了需要身份验证的 GreptimeDB，则此项必需。如果使用默认的 `public` 数据库就可以省略这一项。

## Body

- `sql`: SQL 语句，必需。

## Response

请求的响应是一个 JSON 对象。

- `code`: 结果状态码，0 代表成功，其他代表失败。
- `output`: SQL 的执行结果，包括 Schema 和数据。

## 示例

请参考用户指南中的[表管理](/zh/v0.4/user-guide/table-management.md#http-api), [写入数据](/zh/v0.4/user-guide/write-data/sql.md#http-api) and [查询数据](/zh/v0.4/user-guide/query-data/sql.md#http-api)。
