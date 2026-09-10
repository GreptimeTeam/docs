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
- 每条凭证必须恰好包含一个 `=`，密码不能包含 `=`。
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

:::warning
v1.0 中，无法识别的权限模式会退回读写权限。例如，`alice:readonyl=pwd` 会赋予 `alice` 读写权限。加载配置前应检查权限模式的拼写。
:::

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

- `admin` 拥有读写权限（默认）
- `alice` 拥有只读权限
- `bob` 拥有只写权限
- `viewer` 拥有只读权限
- `editor` 明确设置了读写权限

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
