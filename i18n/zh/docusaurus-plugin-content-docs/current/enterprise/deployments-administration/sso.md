---
keywords: [GreptimeDB 企业版, SSO, Okta, OIDC, JWT, JWKS, 身份验证]
description: 配置 GreptimeDB 企业版 Okta SSO，关联数据库用户，并排查 Dashboard 登录与 token 认证问题。
---

# SSO 身份验证

GreptimeDB 企业版支持通过 OpenID Connect（OIDC）接入 Okta，实现 Dashboard
单点登录（SSO）。Dashboard 负责浏览器登录，GreptimeDB 验证 access token，并按照
数据库用户已存储的权限和 ACL 控制访问。密码登录与 SSO 可以同时使用。

:::note 版本兼容性
请使用支持 OIDC 登录方式发现及下述验证模式的 GreptimeDB 企业版和 Dashboard。
本文描述 Nightly 实现，不代表历史企业版或 Dashboard 构建均支持这些能力。
:::

## 工作方式

最简 Okta 方案只需 org issuer 和公共应用的 client ID，无需自定义 Authorization
Server、用户名 claim、client secret 或 JWKS URL。

1. Dashboard 读取公开接口 `GET /v1/auth/config`，获取可用登录方式。
2. 从 `<issuer>/.well-known/openid-configuration` 发现授权端点，使用
   Authorization Code + PKCE 完成登录。
3. 浏览器发送 `Authorization: Bearer <access_token>`，使用的是 **access token，
   不是 ID token**。若经过 dashboard-apiserver，必须原样透传该请求头，包括
   opaque token。
4. GreptimeDB 调用 issuer 的 introspection 端点，检查 token 是否有效、过期时间、
   issuer、client ID、Bearer 类型及 `openid` scope；随后使用同一 token 调用
   UserInfo，默认读取 `preferred_username`。
5. GreptimeDB 按用户名查找数据库用户。Dashboard 从 `/v1/users/current` 获取最终身份。

此模式下省略 `jwks_url` **不等于跳过 token 验证**。登录跳转地址来自 issuer 的
发现文档，而不是 JWKS URL。

## 前置条件

- 在 standalone server 或每个对外服务的 Frontend 上启用
  [企业版内置用户 Provider](/enterprise/user.md)。`jwt_auth` 要求使用
  `greptime_ee_user_provider`，不能挂在 LDAP 或 static 等其他用户 Provider 上。
- 使用支持 SSO 的 Dashboard；若部署 dashboard-apiserver，其版本必须支持完整透传
  Bearer 认证。
- 通过 HTTPS 访问 Dashboard。PKCE 要求浏览器安全上下文；localhost 可用于本机开发，
  远程 HTTP 访问不满足这一要求。
- 浏览器和 GreptimeDB 均能通过可信 HTTPS 访问相应 Okta 端点。这是两条独立的网络链路。
- 仅将允许访问数据库的用户或组分配到 Okta 应用。应用用户名应由管理员控制，
  归一化后唯一，且不得回收分配给其他人。

## 配置 Okta

创建 **OIDC Single-Page Application**，使用以下设置：

| 配置项 | 取值 |
| --- | --- |
| 授权类型 | Authorization Code + PKCE。 |
| 客户端认证 | 在 General → Client Credentials 中确认 **Client authentication = None**。这是公共 SPA，不是机密 Web Application。 |
| Issuer | org URL，例如 `https://your-org.okta.com`，不是 `/oauth2/default`。 |
| Client ID | 应用公开的 OAuth client ID，不是用户 ID、Authorization Server ID 或密钥。 |
| 登录回调 URI | `<Dashboard origin>/dashboard/auth/callback`，协议、主机、端口和路径必须精确匹配。 |
| 登出回调 URI | `<Dashboard origin>/dashboard/auth/login`。按浏览器流程需要配置 Trusted Origins。 |
| 用户名映射 | 保留应用原生 `userName` 映射，对应 `UserInfo.preferred_username`；如需调整，修改 App Profile Mapping，无需新增 claim。 |
| 用户分配 | 仅分配允许访问数据库的用户或组。 |

Refresh Token grant 是可选项，首次登录不需要启用。参阅
[Okta OIDC 应用设置](https://help.okta.com/oie/en-us/Content/Topics/Apps/Apps_App_Integration_Wizard_OIDC.htm)
和 [org 与自定义授权服务器的区别](https://developer.okta.com/docs/concepts/auth-servers/)。
不要向浏览器提供 client secret。PKCE 保护授权码兑换流程，并不意味着公共 SPA
能够保管应用密钥。

## 配置 GreptimeDB

在 standalone 或 Frontend 配置中加入以下内容，其余服务端设置保持不变：

```toml
user_provider = "greptime_ee_user_provider:"

[[plugins]]
jwt_auth.issuer = "https://your-org.okta.com"
jwt_auth.client_id = "your-oidc-app-client-id"
```

将 issuer 和 client ID 替换为实际值。顶层 `user_provider` 必须放在 `[http]`、
`[[plugins]]` 等所有 TOML 表段之前。同一进程只配置一个 `jwt_auth` 插件。

末尾的 `:` 必须保留。空后缀表示不读取账号初始化文件，不会删除已有账号，也不
开启匿名访问。除非显式启用[自动开户](#首次登录自动创建用户)，否则需要预建数据库用户。

分布式部署需要在每个对外服务的 Frontend 上应用相同配置，并完成滚动更新。
不要只配置 Metasrv 或 Datanode。单机部署则配置 standalone 进程本身。

若部署已设置 `GREPTIMEDB_FRONTEND__USER_PROVIDER` 或等效启动参数，不要重复引入
相互冲突的配置来源。检查实际启动参数、挂载文件及相关环境变量。仅修改 ConfigMap
不会让运行中的进程重新加载配置；重启后应逐副本确认。配置了 `jwt_auth` 却没有启用
企业版用户 Provider 时，启动会失败，而不是静默关闭 SSO。

最简远程模式应省略 `secret`、`public_key`、`jwks_url`、`jwks_ca_cert_path`、
`audience`、`algorithm` 和 JWKS 刷新选项。指定密钥会选择另一种
[JWT 验证模式](#显式-jwt-与-jwks-验证)。

### 可选配置及默认值

以下默认值适用于只配置 issuer 和 client ID 的远程模式：

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `jwt_auth.username_claim` | `"preferred_username"` | UserInfo 顶层字段的精确名称，必须是非空字符串；不会回退到 `email` 或 `sub`，也不支持嵌套 JSON 路径。 |
| `jwt_auth.scopes` | `["openid", "profile", "email"]` | 浏览器请求的 scopes，必须包含 `openid`；默认不请求 `offline_access`。 |
| `jwt_auth.display_name` | `"SSO"` | 登录按钮名称。 |
| `jwt_auth.auto_provision` | `false` | 是否在首次成功 token 登录时创建缺失的数据库用户。 |
| `jwt_auth.auto_provision_privileges` | `[]` | 开启自动开户时必须显式设置为非空，不能包含 `Admin`。 |
| `jwt_auth.auto_provision_databases` | `[]` | 开启自动开户时必须显式设置为非空；授予所选数据库中所有表的访问权限，实际操作仍受全局权限约束。 |

需要自动续期时，在 Okta 应用中启用 Refresh Token grant，并在默认 scopes 基础上
显式增加 `offline_access`：

```toml
jwt_auth.scopes = ["openid", "profile", "email", "offline_access"]
```

将此设置加入已有插件，不要新增第二个插件。只有 issuer 实际返回 refresh token，
Dashboard 才能续期；否则 access token 到期后需要重新登录。

## 数据库用户与权限

默认需要在 SSO 登录前，通过[用户管理 API](/enterprise/user/api.md) 创建数据库用户。
用户名使用 `UserInfo.preferred_username` 的规范化值。手动创建本地账号仍需设置
强密码，但 token 认证不使用该密码。

用户名支持 ASCII 标识符或受约束的邮箱形状，最多 128 字节。包含 `@` 的名称统一
转为小写，其他名称大小写敏感。具体规则见[用户名校验](/enterprise/user.md#用户名)。
管理 API 使用规范化后的精确名称。

账号**按用户名关联**，不持久化 `(issuer, sub)` 绑定。必须防止重名、误关联已有
高权限账号和旧用户名复用。IdP 用户改名时，需要显式迁移数据库账号。
Okta groups 和 claims 不会自动映射为数据库角色或 ACL。

token 不能登录内置的小写 `admin` 用户。需要 SSO 管理权限时，使用其他用户名，
经审核后显式授予 `Admin`。升级到这一行为时，原先使用 `admin` JWT 的集成必须
迁移到其他账号。

### 首次登录自动创建用户

若需要在首次成功 token 登录时创建缺失用户，在同一个插件中追加：

```toml
jwt_auth.auto_provision = true
jwt_auth.auto_provision_privileges = ["SqlSelect"]
jwt_auth.auto_provision_databases = ["public"]
```

此例创建只能读取 `public` 的用户。自动开户规则如下：

- 默认关闭，只在默认 catalog `greptime` 中创建用户。
- 必须显式设置非空权限和数据库选择器，不能包含 `Admin`；策略无效时启动失败。
- 为每个数据库选择器授予全表 ACL。选择器可以是精确名称或 `~regex:<pattern>`；
  数据库正则匹配完整名称。
- 使用随机强密码。已有用户继续使用原权限和 ACL；并发首次登录不会覆盖已有账号。
- 远程 OIDC 模式要求 issuer 和 client ID；显式 JWT 模式要求 issuer 和 audience。

准入由 IdP 应用分配和 token 策略控制。删除自动创建的数据库用户不能撤销访问：
下一次有效登录可能重新创建该用户。应在 IdP 侧撤销访问，并验证实际结果。

## Dashboard 登录方式发现

Dashboard 无需再配置一份 Okta issuer/client ID。`GET /v1/auth/config` 是公开接口，
只返回登录元数据，不包含密钥。上述最简配置对应的响应为：

```json
{
  "auth_required": true,
  "methods": [
    {
      "type": "oidc",
      "id": "oidc",
      "display_name": "SSO",
      "issuer": "https://your-org.okta.com",
      "client_id": "your-oidc-app-client-id",
      "scopes": ["openid", "profile", "email"]
    },
    {"type": "password"}
  ]
}
```

下图展示了 SSO 登录按钮和切换到密码登录的入口。截图以 Keycloak 为例，
SSO 按钮名称取自配置项 `jwt_auth.display_name`。

![企业版 Dashboard 登录页，提供 SSO 与密码登录入口](/ent_user/sso-login.png)

Dashboard 根据响应展示登录方式，并可记住上次选择。未配置 OIDC 登录参数时，
企业版 Provider 只发布 `password`。未启用用户 Provider 时，响应为
`{"auth_required": false, "methods": []}`。旧服务端没有此接口时返回 `404`，
兼容的 Dashboard 会回退到密码登录。

经 dashboard-apiserver 部署时，发现路径为
`/api/v1/instances/<instance>/greptime/v1/auth/config`。确认实例指向正确的 Frontend，
网关允许未登录访问此接口。`enableUserAuthentication` 只控制登录 UI，不能代替
服务端认证。隐藏密码入口不会禁用 HTTP Basic，也不能强制所有访问只走 SSO。

SSO token 和 OIDC 状态保存在内存及标签页范围的 `sessionStorage` 中，不写入
`localStorage`；SSO 无需保存数据库密码。记住的登录方式不是凭据，也不要假定
session storage 会跨标签页共享。

实际获得 refresh token 后，Dashboard 会在 access token 过期前及收到 `401` 时
尝试续期；续期失败会结束本地会话并返回登录页。退出时清理本地 SSO 状态，并尝试
跳转 IdP 的 end-session 端点。应同时验证本地清理和 IdP 登出；仅清理本地状态不会
撤销 access token，也不会结束 Okta 会话。

## 程序与 SQL 客户端

| 协议 | token 用法 |
| --- | --- |
| HTTP | `Authorization: Bearer <access_token>` 或 `x-greptime-auth: Bearer <access_token>`。 |
| MySQL | 用户名为 `*`，access token 作为密码，使用 `mysql_clear_password` 插件，例如 `mysql --enable-cleartext-plugin`。必须启用 TLS。 |
| PostgreSQL | 用户名为 `*`，access token 作为明文密码。必须启用 TLS。 |
| gRPC | 不支持 token 认证，使用用户名和密码。 |

远程 OIDC 支持 opaque access token，客户端无需解码。每次新的认证都会访问 IdP。
已经认证的 SQL 连接不会在每条语句执行时重新验证，也不会因 token 被撤销而主动断开。

## 显式 JWT 与 JWKS 验证

已有部署可以继续通过显式密钥在本地验证 JWT access token。这与最简 Okta org
方案不同。应使用面向你的 API 签发 access token 的 issuer；不要把 Okta org
授权服务器的 access token 当作自定义授权服务器的 JWT 在本地验证。

以下是自定义授权服务器的示例：

```toml
user_provider = "greptime_ee_user_provider:"

[[plugins]]
jwt_auth.jwks_url = "https://your-org.okta.com/oauth2/your-server-id/v1/keys"
jwt_auth.issuer = "https://your-org.okta.com/oauth2/your-server-id"
jwt_auth.audience = "api://greptimedb"
jwt_auth.algorithm = "RS256"
jwt_auth.username_claim = "greptime_user"
jwt_auth.client_id = "your-oidc-app-client-id"
```

配置的 audience 和用户名 claim 必须与授权服务器签发的 access token 一致。
`greptime_user` 只是自定义 claim 示例，不是远程 OIDC 的必需项。此模式默认
`username_claim = "sub"`，浏览器 scopes 默认为
`["openid", "profile", "email", "offline_access"]`。若 `sub` 不能标识数据库用户，
需显式指定 claim。仅用于程序 JWT 验证、不需要 Dashboard SSO 入口时，可省略
`client_id`。

密钥来源三选一：`secret`（HMAC）、`public_key`（PEM 格式 RSA/EC 公钥）或
`jwks_url`，不能混用。支持 HS256/384/512、RS256/384/512 和 ES256/384；JWKS
默认允许受支持的 RSA/EC 算法，不允许 HMAC。JWT 必须包含 `exp`，存在 `nbf` 时也会
校验，允许 60 秒时钟偏差。配置了 issuer 和 audience 后，相应字段必须存在且匹配。

启动时拉取 JWKS，首次拉取失败则启动失败。默认每 3600 秒刷新一次
（`jwks_refresh_interval_secs`，最小 60）。遇到未知 `kid` 时触发刷新，由
`jwks_min_refresh_interval_secs` 限流（默认 60，限制在 1 到周期刷新间隔之间）。
管理员也可在每台服务器上[手动刷新 JWKS](/enterprise/user/api.md#刷新-jwks-密钥)。

JWKS URL 应使用 HTTPS；仅开发场景的 loopback 地址允许 HTTP。使用私有 CA 时，
将 PEM 证书包挂载到每个对外服务的 Frontend 或 standalone，并设置
`jwt_auth.jwks_ca_cert_path`。它只为 JWKS 客户端追加信任；文件缺失或不可用时启动
失败。此项**不适用于**远程 OIDC discovery、introspection 或 UserInfo。

Keycloak/JWKS 兼容性测试通过，不代表 Okta 公共客户端远程 introspection 兼容。
两种模式需要独立验证；仅删除 `jwks_url` 不足以完成任意 IdP 的迁移。

## 验证与排查

完成更新后：

1. 确认每个 Frontend 或 standalone 进程均就绪，discovery 成功。
2. 分别检查直连和代理 `/v1/auth/config` 的状态码、响应类型及原始 JSON，核对
   issuer、client ID、scopes 和 methods。
3. 在实际 Dashboard 完成登录，通过 `/v1/users/current` 确认规范化后的用户名和 catalog。
4. 验证允许的查询（例如 `SELECT 1`），以及按策略应被拒绝的合法操作。
   除登录外，还要确认数据库范围和 ACL。
5. 分别验证首次自动开户、过期、撤销、页面重载、新标签页，以及按需启用的续期和登出。
   真实 Okta 远程模式需要独立验收，不能从其他 IdP 或验证模式推断结果。

| 现象 | 排查方向 |
| --- | --- |
| 页面只有密码框 | 先看 `auth/config`。读取失败时可能静默回退密码登录，页面表现不能证明服务端原始 methods 只有 password。 |
| 没有发现请求，或已返回完整 OIDC JSON 但无入口 | 检查 Dashboard 构建、JS 错误、实例选择、静态资源缓存和记住的登录方式。OIDC 条目必须有非空 issuer 和 client ID。 |
| 发现接口返回 `404`、`401`/`403` 或 HTML | 检查服务端版本、代理路由、网关认证和 SPA fallback。接口必须公开且返回 JSON。 |
| 原始 methods 只有 `password` | 比较直连和代理响应；逐副本检查有效 Provider/插件设置、实际配置路径、覆盖来源、镜像和滚动更新结果。添加 claim 或 ACL 不能发布登录入口。 |
| 跳转或授权码兑换失败 | 检查 SPA 类型、Client authentication = None、应用分配、精确回调 URI、Trusted Origins、浏览器 HTTPS 信任及 PKCE/state 流程。不要向浏览器添加 client secret。 |
| Okta 登录成功，但 `/v1/users/current` 返回 `401` | 确认发送 access token 而非 ID token，代理完整透传 Bearer；检查 Frontend 到 introspection/UserInfo 的网络、应用/issuer/过期/scope 校验、UserInfo `sub` 与用户名字段、数据库账号及 catalog。 |
| 登录成功但查询返回 `403` | 检查已存储的权限及数据库/表 ACL。自动开户不会覆盖已有权限，不要通过授予 `Admin` 绕过预期拒绝。 |
| 会话过期且未自动续期 | 检查 Refresh Token grant、`offline_access`、是否实际返回 refresh token 及续期错误。 |

### 网络与运维限制

远程 OIDC 要求可信 HTTPS。发现文档中的 issuer 必须与配置精确匹配，introspection
和 UserInfo 端点必须与 issuer 同源，客户端不跟随重定向。排查 DNS、代理和证书链时
不要关闭 TLS 校验。当前远程模式没有专用的私有 CA 配置项。

每次成功的远程认证调用 introspection 和 UserInfo 两次，不缓存成功 token。
需要评估 IdP 延迟、可用性和限流。此模式面向交互式 SSO，不适合高吞吐机器写入。
Discovery 失败会阻止启动；验证端点失败时拒绝认证，不降级为未验证访问。

token 被判定 inactive 后，下一次认证会被拒绝，但已有 SQL 会话不会主动关闭。
显式 JWT 模式中，被撤销的 token 可能持续有效直到过期或相关密钥集变化。
清空浏览器 session storage 或关闭标签页只删除本地凭据，不保证 IdP 会话或服务端
token 立即失效。

仅支持一个 IdP。远程模式要求支持无 client secret 的公共客户端 introspection，
并返回上述必需字段；不能假定任意 OIDC 提供商都兼容。

提交排查信息时，保留版本、副本标识、请求路径、状态码、公开登录元数据原始响应，
以及脱敏配置和错误。不要发送密码、client secret、完整 token、授权码、Cookie、
未经脱敏的 HAR、完整环境变量或 Secret 内容，也不要把凭据上传到第三方 token 解码网站。
