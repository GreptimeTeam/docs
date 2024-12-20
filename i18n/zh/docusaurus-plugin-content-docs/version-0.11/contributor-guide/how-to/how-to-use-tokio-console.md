---
keywords: [tokio-console, GreptimeDB, 构建配置, 启动配置, 调试工具]
description: 介绍如何在 GreptimeDB 中启用 tokio-console，包括构建和启动时的配置方法。
---

# 如何在 GreptimeDB 中启用 tokio-console

本文介绍了如何在 GreptimeDB 中启用 [tokio-console](https://github.com/tokio-rs/console)。

首先，在构建 GreptimeDB 时带上 feature `cmd/tokio-console`。同时 `tokio_unstable` cfg 也必须开启：

```bash
RUSTFLAGS="--cfg tokio_unstable" cargo build -F cmd/tokio-console
```

启动 GreptimeDB，可设置 tokio console 绑定的地址，配置是 `--tokio-console-addr`。`tokio_unstable` 的 cfg 也需要同时开启。例如：

```bash
RUSTFLAGS="--cfg tokio_unstable" greptime --tokio-console-addr="127.0.0.1:6669" standalone start
```

这样就可以使用 `tokio-console` 命令去连接 GreptimeDB 的 tokio console 服务了：

```bash
tokio-console [TARGET_ADDR]
```

"`TARGET_ADDR`" 默认是 "\<http://127.0.0.1:6669\>"。

:::tip Note

`tokio-console` 命令的安装方法参见 [tokio-console](https://github.com/tokio-rs/console)。

:::
