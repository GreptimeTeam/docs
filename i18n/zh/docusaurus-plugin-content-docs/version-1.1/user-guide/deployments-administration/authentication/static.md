---
keywords: [静态用户配置, 身份验证, 用户帐户, 配置文件, 固定帐户]
description: 介绍了 GreptimeDB 的静态用户配置，允许通过配置文件设置固定帐户进行身份验证。
---

# Static User Provider

GreptimeDB 提供了简单的内置身份验证机制，允许你配置一个固定的帐户以方便使用，或者配置一个帐户文件以支持多个用户帐户。通过传入文件，GreptimeDB 会加载其中的所有用户。

## 单机模式

GreptimeDB 从配置文件中读取用户配置，每行定义一个用户及其密码和可选的权限模式。

### 基本配置

基本格式使用 `=` 作为用户名和密码之间的分隔符：

```
greptime_user=greptime_pwd
alice=aaa
bob=bbb
```

以这种方式配置的用户默认拥有完整的读写权限。

### 权限模式

你可以选择性地指定权限模式来控制用户的访问级别。格式为：

```
username:permission_mode=password
```

可用的权限模式：
- `rw` 或 `readwrite` - 完整的读写权限（未指定时的默认值）
- `ro` 或 `readonly` - 只读权限
- `wo` 或 `writeonly` - 只写权限

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

从 v1.1 起，密码可以使用显式的 verifier 格式，从而无需在配置文件中保存明文密码。默认情况下密码以明文存储：

- `plain:<password>` — 明文。未指定前缀时的默认格式。
- `pbkdf2_sha256:<iterations>:<hex_salt>:<hex_hash>` — 以 PBKDF2-SHA256 哈希形式存储。
- `mysql_native_password:<hex_sha1_sha1_password>` — 哈希形式的 verifier，同时仍可服务 MySQL `mysql_native_password` 握手。

示例：

```
admin=plain:admin_pwd
alice=pbkdf2_sha256:4096:73616c74:c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a
bob=mysql_native_password:6bb4837eb74329105ee4568dda7dc67ed2ca2ad9
```

权限模式可与 verifier 格式组合使用，verifier 写在 `=` 之后：

```
alice:readonly=pbkdf2_sha256:4096:73616c74:c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a
```

#### 协议兼容性

单一 verifier 格式无法服务所有协议。请根据客户端的连接方式选择格式：

| Verifier | HTTP/gRPC Basic | PostgreSQL cleartext | MySQL clear password | MySQL `mysql_native_password` |
| --- | --- | --- | --- | --- |
| `plain:<password>`（或旧式 `user=password`） | 是 | 是 | 是 | 是 |
| `pbkdf2_sha256:...` | 是 | 是 | 是 | 否 |
| `mysql_native_password:...` | 否 | 否 | 否 | 是 |

`pbkdf2_sha256` 只保护静态存储的密码，并不改变链路安全性。支持明文传输的协议在生产环境中仍需启用 TLS。

:::warning 破坏性变更
密码现在按前缀解析。如果旧式明文密码恰好以 `plain:`、`pbkdf2_sha256:` 或 `mysql_native_password:` 开头，其含义会发生变化。请使用 `plain:` 前缀保留字面值。例如，若要保留字面密码 `plain:secret`，应配置为 `user=plain:plain:secret`。
:::

### 生成密码 Verifier

从 v1.1 起，可以使用 `greptime user hash-password` 命令生成 verifier 字符串。该命令独立运行，不会启动任何服务端组件：

```shell
./greptime user hash-password --password-stdin
```

它从标准输入读取明文密码，并将 verifier 打印到标准输出。交互式运行时，输入密码后按回车；在脚本中，使用不回显的方式读取再通过管道传入，避免明文出现在 shell 历史或进程列表中：

```shell
read -rs PASSWORD && printf '%s' "$PASSWORD" | ./greptime user hash-password --password-stdin
```

将输出复制到用户文件中作为密码：

```
admin=pbkdf2_sha256:4096:<random_hex_salt>:<hex_hash>
```

可用选项：

- `--format <FORMAT>` — verifier 格式，`pbkdf2_sha256`（默认）或 `mysql_native_password`。
- `--password <PASSWORD>` — 明文密码。与 `--password-stdin` 互斥，二者必须且只能指定其一。脚本中优先使用 `--password-stdin`，因为 `--password` 可能通过 shell 历史或进程列表泄露。
- `--password-stdin` — 从标准输入读取明文密码。
- `--iterations <N>` — PBKDF2-SHA256 迭代次数（默认 `4096`，范围 `1..=1000000`）。
- `--salt-len <N>` — 随机盐长度，单位字节（默认 `16`，范围 `1..=1024`）。
- `--salt-hex <HEX>` — 使用固定的十六进制盐替代随机盐，用于确定性的自动化场景。

生成 `mysql_native_password` 格式的 verifier：

```shell
./greptime user hash-password --password-stdin --format mysql_native_password
```

### 启动服务器

在启动服务端时，需添加 `--user-provider` 参数，并将其设置为 `static_user_provider:file:<path_to_file>`（请将 `<path_to_file>` 替换为你的用户配置文件路径）：

```shell
./greptime standalone start --user-provider=static_user_provider:file:<path_to_file>
```

用户及其权限将被载入 GreptimeDB 的内存。使用这些用户账户连接至 GreptimeDB 时，系统会严格执行相应的访问权限控制。

:::tip 注意
`static_user_provider:file` 模式下，文件的内容只会在启动时被加载到数据库中，在数据库运行时修改或追加的内容不会生效。
:::

### 动态文件重载

如果你需要在不重启服务器的情况下更新用户凭证，可以使用 `watch_file_user_provider` 替代 `static_user_provider:file`。该 provider 会监控凭证文件的变化并自动重新加载：

```shell
./greptime standalone start --user-provider=watch_file_user_provider:<path_to_file>
```

`watch_file_user_provider`的特点：
- 使用与 `static_user_provider:file` 相同的文件格式
- 自动检测文件修改并重新加载凭证
- 允许在不重启服务器的情况下添加、删除或修改用户
- 如果文件临时不可用或无效，会保持上次有效的配置

这在需要动态管理用户访问的生产环境中特别有用。

## Kubernetes 集群

你可以在 `values.yaml` 文件中配置鉴权用户。
更多详情，请参考 [Helm Chart 配置](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md#鉴权配置)。

