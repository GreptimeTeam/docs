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

