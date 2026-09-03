---
keywords: [LDAP 鉴权, simple bind, search bind, 配置示例, 身份验证]
description: 介绍 GreptimeDB Enterprise 中的 LDAP 鉴权功能，包括 simple bind 和 search bind 两种模式的配置示例及使用方法。
---

# LDAP 鉴权

除了 GreptimeDB OSS 中内置的 [Static User Provider](/user-guide/deployments-administration/authentication/static.md)，
GreptimeDB Enterprise 还提供了连接到外部 LDAP 服务器进行身份验证的功能。

## 配置

与 [PostgreSQL 中的 LDAP 机制相似](https://www.postgresql.org/docs/current/auth-ldap.html)，在 GreptimeDB 中，LDAP 鉴权也分为两种模式："simple bind" 和 "search bind"。

在 "simple bind" 模式下，GreptimeDB 会构造一个格式为 `{prefix}{username}{suffix}` 的 "DN"(distinguished name)
，并使用客户端传来的密码向 LDAP 服务发起”绑定 (bind)“。绑定的结果就是鉴权的结果。一个典型配置是，`prefix` 参数指定 `cn=`，
`suffix` 用于指定 DN 的其余部分。`username` 将会被替换为客户端发来的用户名。

以下一个 LDAP user provider "simple bind" 模式的配置文件示例：

```toml
# LDAP 服务地址。
server = "127.0.0.1"
# LDAP 服务端口。
port = 636
# 设置为 "ldap" 以使用 LDAP scheme，"ldaps" 以使用 LDAPS。
# GreptimeDB 和 LDAP 服务之间的连接一开始时是未加密的。连接建立后升级到 TLS。这是 LDAPv3 的 "StartTLS" 标准。
scheme = "ldaps"

# LDAP 鉴权模式。`bind = "simple"` 和 `bind = "search"` 只能选择其一。
[auth_mode]
# 以下配置仅在 simple bind 模式下使用：
bind = "simple"
# 当进行 simple bind 鉴权时，用于构造绑定 DN 的前缀。
prefix = "cn="
# 当进行 simple bind 鉴权时，用于构造绑定 DN 的后缀。
suffix = ",dc=example,dc=com"
```

在 "search bind" 模式中，GreptimeDB 首先会使用配置文件中设置的固定用户名和密码（`bind_dn` 和 `bind_passwd`）尝试绑定到 LDAP
目录。然后 GreptimeDB 会在 LDAP 目录中搜索尝试登录到数据库的用户。搜索将在 `base_dn` 下的子树中进行，由 `search_filter`
过滤，并尝试对 `search_attribute` 中指定的属性进行精确匹配。一旦在搜索中找到用户，GreptimeDB
会以此用户重新绑定到目录，使用客户端指定的密码，以验证登录是否正确。这种方法允许用户对象在 LDAP 目录中的位置更加灵活，但会导致向
LDAP 服务器发出两个额外的请求。

以下 toml 片段展示了 GreptimeDB LDAP user provider "search bind" 模式的配置文件示例。在上面的 "simple bind" 模式配置文件中显示的
`server`、`port` 和 `scheme` 的公共部分被省略了：

```toml
[auth_mode]
# 以下配置仅在 search bind 模式下使用：
bind = "search"
# 进行 search bind 鉴权时，开始搜索用户的根 DN。
base_dn = "ou=people,dc=example,dc=com"
# 进行 search bind 鉴权时，首先进行绑定的用户 DN。
bind_dn = "cn=admin,dc=example,dc=com"
# 进行 search bind 鉴权时，首先进行绑定的用户密码。
bind_passwd = "secret"
# 进行 search bind 鉴权时，用于匹配的用户属性。
# 如果未指定属性，则将使用 uid 属性。
search_attribute = "cn"
# 进行 search bind 鉴权时，使用的搜索过滤器。
# "$username" 将被替换为客户端传来的用户名。
# 这允许比 search_attribute 更灵活的用户搜索。
search_filter = "(cn=$username)"
```

## 在 GreptimeDB 中使用 LDAP User Provider

要使用 LDAP User Provider，首先参照上文配置你的 LDAP 鉴权模式，然后在启动 GreptimeDB 时使用 `--user-provider` 参数，将其设置为
`ldap_user_provider:<ldap 配置文件路径>`。例如，如果你有一个配置文件是 `/home/greptimedb/ldap.toml`，你可以使用以下命令启动一个
standalone GreptimeDB：

```shell
greptime standalone start --user-provider=ldap_user_provider:/home/greptimedb/ldap.toml
```

现在你就可以使用你的 LDAP 用户账户创建一个连接到 GreptimeDB 了。

:::tip 注意
如果你使用 MySQL CLI 连接到配置了 LDAP User Provider 的 GreptimeDB，你需要在 MySQL CLI 中指定
`--enable-cleartext-plugin`。
:::
