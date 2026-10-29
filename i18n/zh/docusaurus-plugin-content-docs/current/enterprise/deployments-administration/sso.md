---
keywords: [GreptimeDB 企业版, SSO, Okta, OIDC, 身份验证]
description: 配置 GreptimeDB 企业版 Okta SSO，开通数据库用户并登录 Dashboard。
---

# SSO 身份验证

通过 Okta 单点登录（SSO）访问 GreptimeDB 企业版 Dashboard。
用户使用 Okta 账号登录，数据库访问范围由 GreptimeDB 中的权限和 ACL 控制。
密码登录与 SSO 可以同时使用。

:::note 版本兼容性
本文适用于 Nightly。请使用支持 SSO 的 GreptimeDB 企业版和 Dashboard，
历史构建可能不支持以下配置。
:::

## 前置条件

- 在 standalone server 或每个对外服务的 Frontend 上启用
  [企业版内置用户 Provider](/enterprise/user.md) `greptime_ee_user_provider`。
  此方案不使用 LDAP 或 static 用户 Provider。
- 使用支持 SSO 的 Dashboard；若部署 dashboard-apiserver，其版本也需要支持
  Bearer 认证。
- 通过 HTTPS 访问 Dashboard。浏览器和 GreptimeDB 均应能够通过可信 HTTPS 访问 Okta。
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

### 可选配置及默认值

将可选配置加入同一个 `[[plugins]]` 条目：

| 配置项 | 默认值 | 用法 |
| --- | --- | --- |
| `jwt_auth.username_claim` | `"preferred_username"` | Okta 提供的用户名字段；使用应用原生用户名映射时保留默认值。 |
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
grant，并在同一个插件的 scopes 中增加 `offline_access`：

```toml
jwt_auth.scopes = ["openid", "profile", "email", "offline_access"]
```

未获得 refresh token，或续期失败时，用户需要重新登录。

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

## 常见问题

| 现象 | 检查项 |
| --- | --- |
| 只有密码登录入口 | 确认 Dashboard 和 GreptimeDB 支持 SSO、实例指向正确的 Frontend，且所有 Frontend 已加载 issuer 和 client ID 配置并重启。 |
| Okta 跳转失败 | 检查 SPA 应用类型、Client authentication = None、用户分配、精确回调 URI、Trusted Origins 和 HTTPS 证书。 |
| 登录被拒绝 | 检查应用用户名映射和对应的数据库账号，或开启受限自动开户；同时检查 token 是否过期、能否连接 Okta。 |
| 登录成功但查询被拒绝 | 检查用户权限及数据库/表 ACL，不要通过授予 `Admin` 绕过预期拒绝。 |
| token 到期后需要重新登录 | 如果需要自动续期，启用 Refresh Token grant 并请求 `offline_access`。 |

此配置仅支持一个身份提供商，不要假定其他 OIDC 提供商也适用相同设置。
排查连接或证书问题时，请保留 TLS 校验。
