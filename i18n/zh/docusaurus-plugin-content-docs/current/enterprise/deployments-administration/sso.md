---
keywords: [GreptimeDB 企业版, SSO, Okta, OIDC, 身份验证]
description: 配置 GreptimeDB 企业版 Okta SSO，开通数据库用户并登录 Dashboard。
---

# SSO 身份验证

通过 OpenID Connect（OIDC）将 Okta 单点登录（SSO）接入 GreptimeDB 企业版
Dashboard。Dashboard 完成 Authorization Code + PKCE 流程，并将获取的
access token 发送给 GreptimeDB。GreptimeDB 通过 Okta 验证 token，将其映射为
数据库用户，再应用该用户的权限和 ACL。密码登录与 SSO 可以同时使用。

:::note 版本兼容性
本文适用于 Nightly。请使用支持 SSO 的 GreptimeDB 企业版和 Dashboard，
历史构建可能不支持以下配置。
:::

## 工作原理

1. Dashboard 请求无需认证的 `GET /v1/auth/config` 接口，获取可用的登录方式。
   内置模式直接请求 GreptimeDB；经 dashboard-apiserver 部署时，请求路径为
   `/api/v1/instances/<实例名>/greptime/v1/auth/config`。
2. Dashboard 和 GreptimeDB 通过 `<issuer>/.well-known/openid-configuration`
   发现 OIDC 端点。Dashboard 使用发现的 authorization endpoint 发起
   Authorization Code + PKCE 登录；本方案不使用 `jwks_url`，它也不是登录端点。
3. 登录完成后，浏览器以 Bearer 凭证发送 **access token，而不是 ID token**。
   dashboard-apiserver 原样转发该凭证。
4. 仅配置 `issuer` 和 `client_id`，且未配置 `secret`、`public_key` 或
   `jwks_url` 时，GreptimeDB 通过远程 OIDC 验证 token。它先调用 Okta
   introspection，确认 token 有效且未过期、由配置的 issuer 签发给配置的
   client，并且类型为 `Bearer`、包含 `openid` scope；随后读取 UserInfo，
   默认从 `preferred_username` 获取数据库用户名。
5. GreptimeDB 将用户名解析为数据库用户，并通过 `/v1/users/current` 返回用户
   信息。后续 Dashboard 请求使用同一个 Bearer 凭证，并按相同方式逐请求校验，
   权限和 ACL 仍由 GreptimeDB 管理。

远程 OIDC 模式也支持 opaque access token，Dashboard 和 GreptimeDB 都不需要将
access token 解析为 JWT。

## 前置条件

- 在 standalone server 或每个对外服务的 Frontend 上启用
  [企业版内置用户 Provider](/enterprise/user.md) `greptime_ee_user_provider`。
  此方案不使用 LDAP 或 static 用户 Provider。
- 使用支持 SSO 的 Dashboard；若部署 dashboard-apiserver，其版本也需要支持
  Bearer 认证。
- 通过 HTTPS 访问 Dashboard。浏览器和 GreptimeDB 均应能够通过可信 HTTPS 访问
  Okta。GreptimeDB 必须能够访问 Okta 的 discovery、introspection 和 UserInfo
  端点，且 Okta public 应用必须支持不提供 client secret 的 introspection。
- 具备创建 Okta 应用、分配用户或用户组的权限。

## 配置 Okta

创建 **OIDC Single-Page Application**，使用以下设置：

| 配置项 | 取值 |
| --- | --- |
| 授权类型 | Authorization Code + PKCE。 |
| 客户端认证 | 在 General → Client Credentials 中选择 **Client authentication = None**，不配置 client secret。 |
| Issuer | org URL，例如 `https://your-org.okta.com`，不是 `/oauth2/default`。 |
| Client ID | 复制应用的 OAuth client ID。 |
| 登录回调 URI | `<Dashboard origin>/dashboard/auth/callback`，协议、主机、端口和路径必须精确匹配。 |
| 登出回调 URI | `<Dashboard origin>/dashboard/auth/login`，按需配置 Trusted Origins。 |
| 用户名映射 | 保留应用原生 `userName` 映射；如需调整，修改 App Profile Mapping。 |
| 用户分配 | 仅分配允许访问数据库的用户或组。 |

例如，Dashboard 地址为 `https://dashboard.example.com/dashboard/` 时，登录回调 URI
应为 `https://dashboard.example.com/dashboard/auth/callback`。

此方案无需自定义 Authorization Server、claim 或 JWKS URL。详细设置参阅
[Okta OIDC 应用设置](https://help.okta.com/oie/en-us/Content/Topics/Apps/Apps_App_Integration_Wizard_OIDC.htm)。

## 配置 GreptimeDB

在 standalone 或 Frontend 配置中加入以下内容，将 issuer 和 client ID 替换为实际值：

```toml
user_provider = "greptime_ee_user_provider:"

[[plugins]]
jwt_auth.issuer = "https://your-org.okta.com"
jwt_auth.client_id = "your-oidc-app-client-id"
```

- 顶层 `user_provider` 放在 `[http]`、`[[plugins]]` 等所有 TOML 表段之前。
  保留末尾的 `:`，表示启用 Provider 但不读取账号初始化文件，不会删除已有用户。
- 同一进程只配置一个 `jwt_auth` 插件。此方案不要添加 `secret`、`public_key`、
  `jwks_url`、`jwks_ca_cert_path`、`audience`、`algorithm` 或 JWKS 刷新选项。
- 分布式部署需要配置每个对外服务的 Frontend，而不是 Metasrv 或 Datanode；
  单机部署配置 standalone 进程。
- 若部署已通过环境变量或启动参数启用 Provider，避免重复配置导致冲突。

重启相关进程或滚动更新 Frontend，并确认每个副本就绪。仅修改 ConfigMap
不会让运行中的进程重新加载配置。

GreptimeDB 在启动时执行 OIDC discovery。如果 discovery 无法访问或内容无效、
发现的 issuer 与 `jwt_auth.issuer` 不一致，或者 introspection 和 UserInfo 端点
与 issuer 不同源，启动会失败；系统不会静默关闭 SSO 并降级为仅密码认证。

### 可选配置及默认值

将可选配置加入同一个 `[[plugins]]` 条目：

| 配置项 | 默认值 | 用法 |
| --- | --- | --- |
| `jwt_auth.username_claim` | `"preferred_username"` | 用作数据库用户名的 UserInfo 顶层字段。若所选字段缺失或为空，不会回退到 `email` 或 `sub`。 |
| `jwt_auth.scopes` | `["openid", "profile", "email"]` | 登录请求的 scopes，必须包含 `openid`。 |
| `jwt_auth.display_name` | `"SSO"` | 登录按钮名称，例如 `"Okta"`。 |
| `jwt_auth.auto_provision` | `false` | 是否在首次 SSO 登录时创建缺失用户。 |
| `jwt_auth.auto_provision_privileges` | `[]` | 新用户的初始权限；自动开户时必填，不能包含 `Admin`。 |
| `jwt_auth.auto_provision_databases` | `[]` | 新用户可访问的数据库；自动开户时必填。 |

## 数据库用户与权限

默认需要在首次登录前，通过[用户管理 API](/enterprise/user/api.md) 创建用户。
数据库用户名应与 Okta 应用的用户名（`preferred_username`）一致。
邮箱形状的名称必须使用小写，其他名称大小写敏感。支持的格式及 128 字节长度限制
见[用户名校验](/enterprise/user.md#用户名)。手动创建本地账号仍需设置强密码，
但用户使用 SSO 时无需输入该密码。

确保应用用户名归一化后唯一，不要将旧用户名分配给其他人。修改 Okta 用户名时，
相应调整数据库账号并检查权限。在 GreptimeDB 中管理权限和 ACL；Okta 用户组不会
自动授予数据库角色。

内置的小写 `admin` 账号不能使用 SSO 或 token 登录。需要 SSO 管理权限时，使用
其他用户名并显式授予 `Admin`。原先使用 `admin` JWT 的集成需要改用其他账号。

### 首次登录自动创建用户

如需在首次登录时创建缺失用户，在同一个插件中追加：

```toml
jwt_auth.auto_provision = true
jwt_auth.auto_provision_privileges = ["SqlSelect"]
jwt_auth.auto_provision_databases = ["public"]
```

此配置为新用户授予 `public` 中所有表的只读访问权限。两个列表均不能为空，
且权限不能包含 `Admin`。数据库条目可使用精确名称或匹配完整数据库名的
`~regex:<pattern>` 选择器。

在远程 OIDC 模式下，配置的 issuer 和 client ID 共同构成准入边界。任何能够
获取该 issuer 和 client 的有效 token 的人都可能被自动创建为用户，因此必须将
Okta 应用分配和访问策略限制在目标用户范围内。

自动开户仅在默认 catalog `greptime` 中创建用户。已有用户保留原权限和 ACL，
管理员可在之后通过 Dashboard 或用户 API 调整权限。

撤销访问时，应在 Okta 中移除用户的访问权限。仅删除自动创建的数据库用户不够：
后续有效登录可能重新创建该账号。

## 登录 Dashboard

1. 通过 HTTPS 打开 Dashboard。
2. 点击 SSO 登录按钮，完成 Okta 登录。
3. 返回 Dashboard 后，确认可以查询预期的数据库，例如执行 `SELECT 1`。
4. 使用完毕后，通过 Dashboard 的退出操作登出。

Dashboard 无需再单独配置 Okta。经 dashboard-apiserver 部署时，使用
`enableUserAuthentication` 开启登录界面，并将实例指向正确的 Frontend。
此 UI 设置不能代替 GreptimeDB 服务端认证。

下图以 Keycloak 为例。SSO 按钮名称取自 `jwt_auth.display_name`，按钮下方的链接
可切换到密码登录。

![企业版 Dashboard 登录页，提供 SSO 与密码登录入口](/ent_user/sso-login.png)

密码登录仍然可用，隐藏界面入口不会禁用密码认证。退出或关闭标签页不会撤销
access token；在 Okta 撤销访问后，已有 SQL 连接也可能继续保持。

### 启用会话续期

若希望用户在 access token 到期后保持登录，在 Okta 应用中启用 **Refresh Token**
grant 和 refresh token 轮换，并在同一个插件的 scopes 中增加
`offline_access`：

```toml
jwt_auth.scopes = ["openid", "profile", "email", "offline_access"]
```

未获得 refresh token，或续期失败时，用户需要重新登录。

### 验证配置

1. 登录前，按照[工作原理](#工作原理)中的路径直接检查 `/v1/auth/config`，
   或通过 dashboard-apiserver 检查。响应应先包含 `oidc` 方式，且其中的
   `issuer`、`client_id` 和 `scopes` 符合预期，随后包含 `password` 方式。
   该接口虽然公开，但不得返回 client secret 或其他凭证。
2. 完成 Okta 登录，确认 `/v1/users/current` 返回预期的数据库用户名和 catalog。
3. 执行允许的查询，例如 `SELECT 1`，并确认超出用户权限或数据库 ACL 的操作
   会被拒绝。
4. 如果开启自动开户，使用新的 Okta 用户确认创建的账号仅具有配置的初始权限
   和数据库访问范围，同时确认未分配应用的 Okta 用户无法登录。

验证过程中，不要在截图、日志或支持请求中泄露 access token。

## 程序与 SQL 客户端

客户端应使用 **access token，而不是 ID token**：

| 协议 | 用法 |
| --- | --- |
| HTTP | 发送 `Authorization: Bearer <access_token>` 或 `x-greptime-auth: Bearer <access_token>`。 |
| MySQL | 用户名设为 `*`，access token 作为密码；启用 `mysql_clear_password`（例如使用 `mysql --enable-cleartext-plugin`），并开启 TLS。 |
| PostgreSQL | 用户名设为 `*`，access token 作为密码，并开启 TLS。 |
| gRPC | 使用用户名和密码，不支持 token 认证。 |

代理必须完整保留 Bearer 认证头。不要在日志、截图或支持请求中泄露 token、密码或
client secret。

## 网络、证书与可用性

- 浏览器和 GreptimeDB 连接 Okta 时都应使用可信 HTTPS 证书。discovery 返回的
  issuer 必须与 `jwt_auth.issuer` 精确一致，introspection 和 UserInfo 端点必须
  与 issuer 同源。GreptimeDB 不会跟随这些请求的重定向。
- 远程 OIDC 客户端使用系统信任根。`jwks_ca_cert_path` 仅适用于显式 JWKS 配置，
  不能为远程 discovery、introspection 或 UserInfo 添加私有 CA。不要通过关闭
  TLS 校验来规避证书错误。
- 每个携带该 token 的请求都会触发这两次调用：Dashboard 的每次 HTTP 请求、
  每条新建的 SQL 连接都会执行一次 introspection 和一次 UserInfo，成功验证的
  token 不会被缓存。需要评估 Okta 的可用性、延迟和限流；校验开销随请求速率而
  非登录次数增长。此模式面向交互式 SSO，不适合高吞吐机器写入。
- 端点故障会拒绝新的认证请求，GreptimeDB 不会降级为未验证访问。吊销 token
  会影响其下一次认证，但不会断开已经完成认证的 SQL 连接。

## 常见问题

| 现象 | 检查项 |
| --- | --- |
| 只有密码登录入口 | 分别检查直连和经 dashboard-apiserver 代理的原始 `auth/config` 响应。确认 Dashboard 和 GreptimeDB 支持 SSO、实例指向正确的 Frontend，且所有 Frontend 已加载 issuer 和 client ID 配置并重启。 |
| `auth/config` 返回 `404`、`401`/`403`、HTML 或其他错误 | 获取失败（`404`、其他错误状态或网络错误）都会使 Dashboard 静默回退为密码登录，应以原始响应而非登录页判断服务端配置。`404` 时检查 GreptimeDB 版本和代理路由，旧服务端不提供该接口。网关不应要求先认证才能访问该公开接口。返回 HTML 通常表示代理路由错误或进入 SPA fallback，而不是有效的 JSON 响应。 |
| `auth/config` 只返回 `password` | 检查每个对外服务 Frontend 的实际生效配置，包括实际挂载文件和环境变量覆盖。确认已加载 `greptime_ee_user_provider`、一个有效的 `jwt_auth` 插件、`issuer` 和 `client_id`，并检查启动日志中的 OIDC discovery 错误。 |
| 配置 OIDC 后 GreptimeDB 无法启动 | 检查 issuer discovery 的网络连通性、issuer 精确匹配、端点同源和 TLS 证书。远程配置中不要混入 `audience`、`algorithm` 和 JWKS 刷新设置等 JWT 专用选项。 |
| Okta 跳转或授权码交换失败 | 检查 SPA 应用类型、Client authentication = None、Authorization Code + PKCE、用户分配、精确回调 URI、Trusted Origins 和 HTTPS 证书。不要在浏览器中放置 client secret。 |
| Okta 登录成功但 GreptimeDB 返回 `401` | 确认客户端发送的是 access token 而非 ID token，且代理保留了 Bearer scheme。检查 introspection 和 UserInfo 连通性、token 的 issuer/client/scope/有效期、所选 UserInfo 用户名字段，以及对应数据库用户是否存在或是否开启受限自动开户。 |
| 登录成功但查询被拒绝 | 检查用户权限及数据库/表 ACL。开启自动开户不会改变已有用户的权限。不要通过授予 `Admin` 绕过预期拒绝。 |
| token 到期后需要重新登录 | 启用 Refresh Token grant 和轮换，请求 `offline_access`，并确认 Okta 实际返回了 refresh token。 |

此配置仅支持一个身份提供商。其他 OIDC 提供商必须支持相同的 public-client
discovery、无需 client secret 的 introspection 和 UserInfo 行为，不能假定
Okta 的配置步骤可以原样套用。

Dashboard 将 OIDC token 保存在 sessionStorage 中，而不是 localStorage。关闭
标签页或清除浏览器存储只会删除本地副本，不会吊销 token。
