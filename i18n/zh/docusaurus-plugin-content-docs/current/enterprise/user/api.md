---
keywords: [GreptimeDB 企业版, 用户管理, HTTP API, 身份验证, 权限, ACL]
description: GreptimeDB 企业版用户管理 HTTP API 参考，涵盖创建、查询、更新、删除用户及刷新 JWKS 密钥。
---

# 用户管理 API

在 standalone server 或 frontend 上启用[内置用户 Provider](/enterprise/user.md) 后，
可以通过这些 HTTP 接口管理账号。请求和响应使用 JSON。创建或更新用户时，
请设置 `Content-Type: application/json`。

## 身份验证与 Catalog 范围

所有接口都需要身份验证。大部分接口要求调用者具有 `Admin` 权限；
已通过身份验证的普通用户也可以查询自己的信息。

本地账号和 LDAP 账号均可使用 HTTP Basic 身份验证：

```shell
curl -u '<username>:<password>' \
  'http://localhost:4000/v1/users/current'
```

配置 `jwt_auth` 插件后，也可以使用 Bearer token：

```shell
curl -H 'Authorization: Bearer <token>' \
  'http://localhost:4000/v1/users/current'
```

默认情况下，token 必须标识已有用户；开启受限自动开户后，可以在默认 catalog
`greptime` 中创建缺失用户。token 不能登录内置的小写 `admin` 账号。请使用
access token，而不是 OIDC ID token。远程 OIDC、显式 JWT 验证、开户和用户名
映射详见 [SSO 身份验证](/enterprise/deployments-administration/sso.md)。

所有 `/v1/users` 操作都以请求的当前 catalog 为范围，默认值为 `greptime`。
用户名在同一个 catalog 内唯一。通过 `db` 查询参数或 `x-greptime-db-name`
请求头，以 `<catalog>-<database>` 格式选择其他 catalog：

```shell
curl -u '<admin-user>:<admin-password>' \
  'http://localhost:4000/v1/users?db=tenant_a-public'
```

等价的请求头是 `x-greptime-db-name: tenant_a-public`。两者同时存在时，请求头
优先。身份验证会在选定的 catalog 中查找用户。创建请求中的 `catalog` 字段
必须与当前 catalog 一致，不能用它切换目标 catalog。

在 [standalone leader-follower 部署](/enterprise/deployments-administration/standalone-follower.md)
中，请将管理请求发送到已就绪的 Leader。用户信息变更后，Follower 读取仍可能
使用缓存的凭据和权限。

## 接口一览

| 方法 | 路径 | 访问要求 | 成功状态码 |
| --- | --- | --- | --- |
| `GET` | `/v1/users` | Admin | `200` |
| `GET` | `/v1/users/current` | 任意已通过身份验证的用户 | `200` |
| `GET` | `/v1/users/{username}` | Admin 或被查询用户本人 | `200` |
| `POST` | `/v1/users` | Admin | `201` |
| `PUT` | `/v1/users/{username}` | Admin | `200` |
| `DELETE` | `/v1/users/{username}` | Admin | `200` |
| `POST` | `/v1/jwks/refresh` | Admin | `200` |

## 用户对象

查询单个用户时返回以下对象；列出用户时返回这些对象组成的数组。
响应不包含密码、密码哈希或协议专用的密码校验数据。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `username` | string | catalog 内的用户名。 |
| `catalog` | string | 账号所属的 catalog。 |
| `auth_source` | string | 密码身份验证来源：`local` 或 `ldap`。 |
| `privileges` | 32 位无符号整数 | [权限位掩码](#权限)。 |
| `acl_map` | object | [数据库和表的 ACL](#acl-映射)。 |
| `created_at` | 64 位有符号整数 | 创建时间，Unix 毫秒时间戳。 |
| `updated_at` | 64 位有符号整数 | 最后更新时间，Unix 毫秒时间戳。 |

```json
{
  "username": "alice",
  "catalog": "greptime",
  "auth_source": "local",
  "privileges": 8,
  "acl_map": {
    "public": [{"type": "match", "table": "cpu_metrics"}]
  },
  "created_at": 1705312345678,
  "updated_at": 1705312345678
}
```

### 权限

通过按位或组合权限。例如，`SqlSelect | SqlInsert` 的值为 `8 | 16 = 24`。
包含未知权限位的请求会被拒绝。默认值 `0` 不授予任何全局权限。
`Admin` 授予完整管理权限，并绕过 ACL 检查。

| 权限 | 值 |
| --- | ---: |
| `TableCreate` | `1` |
| `TableAlter` | `2` |
| `TableDrop` | `4` |
| `SqlSelect` | `8` |
| `SqlInsert` | `16` |
| `SqlDelete` | `32` |
| `FlowCreate` | `256` |
| `FlowDrop` | `512` |
| `DatabaseCreate` | `1024` |
| `DatabaseAlter` | `2048` |
| `DatabaseDrop` | `4096` |
| `Admin` | `8192` |
| `TriggerCreate` | `16384` |
| `TriggerDrop` | `32768` |
| `TriggerAlter` | `65536` |

各权限允许的操作，以及全局权限与 ACL 如何共同生效，请参阅
[权限与 ACL](/enterprise/user.md#权限与-acl)。

### ACL 映射

`acl_map` 将数据库（schema）选择器映射到表 ACL 条目数组。`public` 这样的普通
键按精确名称选择数据库；以 `~regex:` 开头的键通过正则表达式选择数据库。

| 条目 | 字段 | 访问范围 |
| --- | --- | --- |
| `{"type": "all"}` | 无额外字段 | 匹配数据库中的所有表。 |
| `{"type": "match", "table": "cpu_metrics"}` | `table`：string | 指定名称的表。 |
| `{"type": "regex", "pattern": "^cpu_.*$"}` | `pattern`：string | 名称符合正则表达式的表。 |

数据库正则表达式始终匹配完整名称。表正则表达式默认匹配子串，需要使用 `^`
和 `$` 才能限定完整名称。多个数据库选择器匹配同一数据库时，其条目会合并生效；
任一选择器中的 `all` 条目都会授予该数据库内所有表的访问权限。无效正则表达式
和空的数据库正则表达式会被拒绝。

例如，以下映射允许访问 `public` 中的 `cpu_metrics`，以及 `tenant_1`、
`tenant_42` 等数据库中的所有表：

```json
{
  "public": [{"type": "match", "table": "cpu_metrics"}],
  "~regex:tenant_[0-9]+": [{"type": "all"}]
}
```

对于非管理员用户，`{}` 不授予普通数据库的访问权限。空数组不授予任何表的
访问权限；保存创建和更新请求时，这些空数组对应的键会被省略。系统 schema
访问和数据库创建有单独的规则，详见[权限与 ACL](/enterprise/user.md#权限与-acl)。

## 列出用户

`GET /v1/users` 要求 `Admin` 权限，返回当前 catalog 内用户对象组成的 JSON 数组。
结果不分页。

```shell
curl -u '<admin-user>:<admin-password>' \
  'http://localhost:4000/v1/users'
```

成功时返回 `200 OK`。数组中每个元素的格式见[用户对象](#用户对象)。

## 查询当前用户

`GET /v1/users/current` 返回当前已通过身份验证的用户信息，无需 `Admin` 权限。

```shell
curl -u '<username>:<password>' \
  'http://localhost:4000/v1/users/current'
```

成功时返回 `200 OK`，响应为身份验证上下文中的[用户对象](#用户对象)。

## 查询指定用户

`GET /v1/users/{username}` 返回当前 catalog 中指定用户的信息。管理员可以查询
任意用户；普通用户只能查询自己。

```shell
curl -u '<admin-user>:<admin-password>' \
  'http://localhost:4000/v1/users/alice'
```

成功时返回 `200 OK`，响应格式见[用户对象](#用户对象)。用户不存在时返回 `404`。

## 创建用户

`POST /v1/users` 要求 `Admin` 权限。

| 字段 | 类型 | 是否必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `username` | string | 是 | — | ASCII 标识符或受约束的邮箱形状，最多 128 字节；邮箱形状的名称必须为小写，详见[用户名校验](/enterprise/user.md#用户名)。 |
| `password` | string | 本地用户必填 | — | 本地密码，长度为 6 到 64 个字符。LDAP 用户必须省略。 |
| `auth_source` | string | 否 | `"local"` | `"local"` 或 `"ldap"`。 |
| `catalog` | string | 否 | 当前 catalog | 如果提供，必须与请求的当前 catalog 一致。 |
| `privileges` | 32 位无符号整数 | 否 | `0` | 权限位掩码。 |
| `acl_map` | object | 否 | `{}` | 数据库和表的 ACL。 |

创建一个可以读取 `public.cpu_metrics` 的本地用户：

```shell
curl -X POST -u '<admin-user>:<admin-password>' \
  'http://localhost:4000/v1/users' \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "alice",
    "password": "alice_password",
    "privileges": 8,
    "acl_map": {
      "public": [{"type": "match", "table": "cpu_metrics"}]
    }
  }'
```

注册 LDAP 用户时，请先配置 `ldap_auth` 插件，再向同一接口发送以下格式的请求体。
LDAP 用户不能设置本地密码。

```json
{
  "username": "directory_reader",
  "auth_source": "ldap",
  "privileges": 8,
  "acl_map": {
    "public": [{"type": "all"}]
  }
}
```

成功时返回 `201 Created`。

```json
{"message": "User created successfully"}
```

当前 catalog 中已存在同名用户时，返回 `409 Conflict`。
创建请求中的邮箱形状名称必须已为小写；`Alice@Example.com` 这样的非规范形式会
返回 `400`。查询、更新和删除路径使用精确的已存储名称，并按需对路径字符进行 URL 编码。

## 更新用户

`PUT /v1/users/{username}` 要求 `Admin` 权限。至少提供一个非 `null` 字段。
省略的字段保留当前值。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `password` | string | 新的本地密码，长度为 6 到 64 个字符。LDAP 用户的密码更新会被拒绝。 |
| `privileges` | 32 位无符号整数 | 替换整个权限位掩码。 |
| `acl_map` | object | 替换整个 ACL 映射，不会与已存储的映射合并。 |

以下示例授予读取和写入权限，并将 ACL 替换为允许访问 `public` 中的所有表：

```shell
curl -X PUT -u '<admin-user>:<admin-password>' \
  'http://localhost:4000/v1/users/alice' \
  -H 'Content-Type: application/json' \
  -d '{
    "privileges": 24,
    "acl_map": {"public": [{"type": "all"}]}
  }'
```

成功时返回 `200 OK`。

```json
{"message": "User updated successfully"}
```

此接口不能更改用户名、catalog 或身份验证来源。移除受保护的 `admin` 账号的
`Admin` 权限会返回 `403`，并拒绝整个更新请求，包括同一请求中的密码和 ACL
变更。用户不存在时返回 `404`。并发更新可能返回 `409`；请先读取最新的用户
信息，再决定是否重试。

## 删除用户

`DELETE /v1/users/{username}` 要求 `Admin` 权限。不能删除自己的账号或受保护的
`admin` 账号，此类请求会返回 `403`。

```shell
curl -X DELETE -u '<admin-user>:<admin-password>' \
  'http://localhost:4000/v1/users/alice'
```

成功时返回 `200 OK`。

```json
{"message": "User 'alice' deleted successfully"}
```

用户不存在时返回 `404`。

删除自动创建的 SSO 用户不能撤销访问：后续有效 token 登录可能重新创建该账号。
应在 IdP 侧撤销访问，详见[自动开户](/enterprise/deployments-administration/sso.md#首次登录自动创建用户)。

## 刷新 JWKS 密钥

`POST /v1/jwks/refresh` 要求 `Admin` 权限，立即从配置的 JWKS URL 刷新 JWT
验证密钥。该操作只刷新接收请求的服务器。

```shell
curl -X POST -u '<admin-user>:<admin-password>' \
  'http://localhost:4000/v1/jwks/refresh'
```

成功时返回 `200 OK`，响应包含当前密钥集中可用的密钥数量：

```json
{"keys": 2}
```

未启用 token 身份验证、使用静态密钥，或使用远程 OIDC introspection/UserInfo
而不是 JWKS URL 时，返回 `400`。该接口不会刷新 OIDC 登录会话或 access token。
JWKS 刷新失败时返回 `502`，并保留之前缓存的密钥集。

## 错误响应

参数校验和用户管理错误包含 `error` 消息：

```json
{"error": "User 'alice' already exists"}
```

身份验证和服务器错误还可能包含 `code` 和 `execution_time_ms` 字段。
请通过 HTTP 状态码区分错误类别。

| 状态码 | 含义 |
| --- | --- |
| `400 Bad Request` | JSON 语法错误，用户名、密码、权限位或 ACL 无效，catalog 不匹配，更新字段为空，或执行不支持的变更。未配置 JWKS 刷新时也会返回此状态码。 |
| `401 Unauthorized` | 凭据缺失或无效、token 无效，或身份验证不允许访问选定的 catalog/数据库。 |
| `403 Forbidden` | 权限不足，或对受保护账号执行了不允许的操作。 |
| `404 Not Found` | 请求的用户不存在。 |
| `409 Conflict` | 用户名重复，或并发更新冲突。 |
| `413 Payload Too Large` | 请求体超出服务器限制。 |
| `415 Unsupported Media Type` | 创建或更新请求缺少 JSON Content-Type，或其值不受支持。 |
| `422 Unprocessable Entity` | JSON 不符合请求结构，例如缺少必填字段、字段类型错误或 `auth_source` 值不受支持。 |
| `500 Internal Server Error` | 服务器或元数据操作失败。 |
| `502 Bad Gateway` | JWKS 刷新失败，保留之前的密钥集。 |
