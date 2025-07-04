---
keywords: [静态用户配置, 身份验证, 用户帐户, 配置文件, 固定帐户]
description: 介绍了 GreptimeDB 的静态用户配置，允许通过配置文件设置固定帐户进行身份验证。
---

# Static User Provider

GreptimeDB 提供了简单的内置身份验证机制，允许你配置一个固定的帐户以方便使用，或者配置一个帐户文件以支持多个用户帐户。通过传入文件，GreptimeDB 会加载其中的所有用户。

## 单机模式

GreptimeDB 使用 `=` 作为分隔符，读取文件内每行中的用户和密码。
例如在文件中添加以下内容：

```
greptime_user=greptime_pwd
alice=aaa
bob=bbb
```

接下来在启动服务端时添加 `--user-provider` 参数：

```shell
./greptime standalone start --user-provider=static_user_provider:file:<path_to_file>
```

这样，用户 `alice` 和 `bob` 的账户信息就会被加载到 GreptimeDB 中。你可以使用这些用户连接 GreptimeDB。

:::tip 注意
文件的内容只会在启动时被加载到数据库中，在数据库运行时修改或追加的内容不会生效。
:::

## Kubernetes 集群

你可以在 `values.yaml` 文件中配置鉴权用户。
更多详情，请参考 [Helm Chart 配置](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md#鉴权配置)。

