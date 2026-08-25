---
keywords: [tokio-console, tokio_unstable, 异步任务, 诊断]
description: 构建启用 tokio-console 的 GreptimeDB 并检查 Tokio runtime。
---

# 如何在 GreptimeDB 中启用 tokio-console

[`tokio-console`](https://github.com/tokio-rs/console) 用于查看实时 Tokio task 和 resource。GreptimeDB 通过 `cmd/tokio-console` feature 编译 subscriber，同时要求启用 Tokio 的 unstable instrumentation cfg。

使用以下命令构建：

```bash
RUSTFLAGS="--cfg tokio_unstable" cargo build -F cmd/tokio-console
```

启动组件时为 console subscriber 指定完整 socket address：

```bash
./target/debug/greptime --tokio-console-addr="127.0.0.1:6669" standalone start
```

该参数是全局参数，也可以用于以相同 feature 构建的 `frontend`、`datanode`、`metasrv` 或 `flownode` 命令。

按照 [tokio-console 仓库](https://github.com/tokio-rs/console#installing-the-console)的说明安装 client，再连接到配置地址：

```bash
tokio-console http://127.0.0.1:6669
```

Subscriber 应绑定到 loopback 或其他受保护的地址。它是诊断端点，不是公开的 GreptimeDB 协议。该 feature 和 `tokio_unstable` instrumentation 会增加 runtime 诊断信息，只应在排查 task 阻塞、唤醒或资源争用时按需启用。
