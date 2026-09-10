---
keywords: [静态用户配置, 身份验证, 用户帐户, 配置文件, 固定帐户]
description: 介绍了 GreptimeDB 的静态用户配置，允许通过配置文件设置固定帐户进行身份验证。
---

# Static User Provider

GreptimeDB 通过 `static_user_provider` 提供用户名和密码认证，在启动时从文件或命令行参数加载凭证。`watch_file_user_provider` 使用相同的文件格式，并在文件变更时重新加载凭证。

## 单机模式

GreptimeDB 从配置文件中读取用户配置，每行定义一个用户及其密码和可选的权限模式。

### 基本配置

基本格式使用 `=` 作为用户名和密码之间的分隔符：

```
greptime_user=greptime_pwd
alice=aaa
bob=bbb
```

以这种方式配置的用户默认拥有读写权限。文件解析规则如下：

- 每行的首尾空白会被移除，空行和以 `#` 开头的行会被忽略。
- 每条凭证必须恰好包含一个 `=`。明文密码不能包含 `=`，添加 `plain:` 前缀也不能绕过此限制。此类密码需要以支持的哈希 verifier 格式存储。
- 用户名和密码中位于 `=` 两侧的空白不会被移除，不要在分隔符两侧添加空格。
- 同一用户名出现多次时，最后一条有效记录生效。
- 格式错误的记录会被跳过。文件必须存在且至少包含一条有效凭证，否则 provider 初始化失败。
- 读取错误（包括无效 UTF-8）会终止后续解析，错误发生前读到的有效凭证仍可能被加载。

### 权限模式

可通过可选的权限模式控制读写访问，格式为：

```
username:permission_mode=password
```

权限模式不区分大小写：

- `rw`、`readwrite` 或 `read_write` - 读写权限（未指定时的默认值）
- `ro`、`readonly` 或 `read_only` - 只读权限
- `wo`、`writeonly` 或 `write_only` - 只写权限

v1.1 中，无法识别的权限模式会退回读写权限。加载配置前应检查权限模式的拼写。

这些权限模式不限定到单个数据库或表。

混合权限模式的配置示例：

```
admin=admin_pwd
alice:readonly=aaa
bob:writeonly=bbb
viewer:ro=viewer_pwd
editor:rw=editor_pwd
```

在此配置中：

- `admin` 拥有完整的读写权限（默认）
- `alice` 拥有只读权限
- `bob` 拥有只写权限
- `viewer` 拥有只读权限
- `editor` 明确设置了读写权限

### 密码格式

从 v1.1 起，密码支持明文和哈希 verifier，格式如下：

- `plain:<password>` — 明文。未指定前缀时的默认格式。
- `pbkdf2_sha256:<iterations>:<hex_salt>:<hex_hash>` — 以 PBKDF2-SHA256 哈希形式存储。
- `mysql_native_password:<hex_sha1_sha1_password>` — 用于 MySQL `mysql_native_password` 认证的哈希 verifier。

以下哈希 verifier 示例使用密码 `password`，需要盐值的格式使用 `salt`：

```
admin=plain:admin_pwd
alice=pbkdf2_sha256:4096:73616c74:c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a
bob=mysql_native_password:2470c0c06dee42fd1618bb99005adca2ec9d1e19
```

权限模式可与 verifier 格式组合使用，verifier 写在 `=` 之后：

```
alice:readonly=pbkdf2_sha256:4096:73616c74:c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a
```

#### 协议兼容性

协议支持情况取决于 verifier 格式和 provider 选择的认证方法：

| Verifier | HTTP/gRPC 用户名和密码 | PostgreSQL cleartext | MySQL `mysql_native_password` |
| --- | --- | --- | --- |
| `plain:<password>`（或旧式 `user=password`） | 是 | 是 | 是 |
| `pbkdf2_sha256:...` | 是 | 是 | 否 |
| `mysql_native_password:...` | 否 | 否 | 是 |

`static_user_provider` 和 `watch_file_user_provider` 协商的 MySQL 认证方法是 `mysql_native_password`，不提供 `mysql_clear_password`。使用 `pbkdf2_sha256` 的用户无法通过这两个 provider 进行 MySQL 认证。启用 TLS 或客户端的明文认证插件不会改变服务端选择的认证方法。

哈希 verifier 用于保护存储的凭证，不会加密网络流量。生产环境应启用 TLS，尤其是使用 HTTP/gRPC 用户名和密码认证或 PostgreSQL 明文认证时。

:::warning 破坏性变更
密码按前缀解析。如果旧式明文密码恰好以 `plain:`、`pbkdf2_sha256:` 或 `mysql_native_password:` 开头，其含义会发生变化。使用 `plain:` 前缀保留字面值。例如，若要保留字面密码 `plain:secret`，应配置为 `user=plain:plain:secret`。
:::

### 生成密码 Verifier

`greptime user hash-password` 命令用于生成密码 verifier，无需启动服务器。从 v1.1 起支持：

```shell
./greptime user hash-password --password-stdin
```

该命令从标准输入读取一行，移除末尾的回车和换行符，并将 verifier 打印到标准输出。空输入会被拒绝。`--password-stdin` 不会关闭终端回显。在 Bash 中，可先以不回显的方式读取密码，再通过管道传入命令：

```bash
read -r -s password && printf '%s' "$password" | ./greptime user hash-password --password-stdin
```

将输出复制到用户文件中作为密码：

```
admin=pbkdf2_sha256:4096:<random_hex_salt>:<hex_hash>
```

可用选项：

- `--format <FORMAT>` — verifier 格式，`pbkdf2_sha256`（默认）或 `mysql_native_password`。
- `--password <PASSWORD>` — 明文密码。与 `--password-stdin` 互斥，二者必须且只能指定其一。脚本中优先使用 `--password-stdin`，因为 `--password` 可能通过 shell 历史或进程列表泄露。
- `--password-stdin` — 从标准输入读取一行明文密码。
- `--iterations <N>` — PBKDF2-SHA256 迭代次数（默认 `4096`，范围 `1..=1000000`）。
- `--salt-len <N>` — 随机盐长度，单位字节（默认 `16`，范围 `1..=1024`）。
- `--salt-hex <HEX>` — 使用固定的十六进制盐替代随机盐，覆盖 `--salt-len`。解码后的盐长度必须为 `1..=1024` 字节。

`--iterations`、`--salt-len` 和 `--salt-hex` 仅适用于带盐的格式，生成 `mysql_native_password` 时会被忽略。

生成 `mysql_native_password` 格式的 verifier：

```shell
./greptime user hash-password --password-stdin --format mysql_native_password
```

### 启动服务器

启动时，将 `--user-provider` 设置为 `static_user_provider:file:<path_to_file>`，并将 `<path_to_file>` 替换为用户配置文件路径：

```shell
./greptime standalone start --user-provider='static_user_provider:file:<path_to_file>'
```

provider 在启动时将有效用户及其权限模式加载到内存中。文件修改后需重启服务器才能生效。

也可以通过 `static_user_provider:cmd` 在命令行中配置凭证，使用逗号分隔多条记录：

```shell
./greptime standalone start --user-provider='static_user_provider:cmd:admin=admin_pwd,alice:ro=alice_pwd'
```

记录使用与文件相同的凭证语法。命令行中的明文密码不能包含 `,` 或 `=`，无效记录会导致 provider 初始化失败。命令行凭证可能出现在 shell 历史和进程列表中，部署时应使用凭证文件。

### 动态文件重载

`watch_file_user_provider` 监控凭证文件，无需重启服务器即可重新加载用户和权限模式：

```shell
./greptime standalone start --user-provider='watch_file_user_provider:<path_to_file>'
```

启动时，文件必须存在且至少包含一条有效凭证。重载时：

- 如果文件无法打开或没有有效凭证，provider 保留上一次配置。
- 否则，加载到的凭证会替换上一次配置。格式错误的记录会被跳过，不会导致整个文件被拒绝。未出现在加载结果中的用户会被移除，包括记录变为无效的用户。

重载不会断开已有的 MySQL 或 PostgreSQL 会话，也不会更新这些会话中已保存的用户信息。修改后的凭证和权限模式适用于后续认证。

## Kubernetes 集群

在 `values.yaml` 中配置鉴权用户，参见 [Helm Chart 配置](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md#鉴权配置)。
