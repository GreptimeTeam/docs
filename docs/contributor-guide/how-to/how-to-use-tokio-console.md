---
keywords: [tokio-console, GreptimeDB, tokio_unstable, build, connect, subscriber]
description: Guides on using tokio-console in GreptimeDB, including building with specific features and connecting to the tokio console subscriber.
---

# How to use tokio-console in GreptimeDB

This document introduces how to use the [tokio-console](https://github.com/tokio-rs/console) in GreptimeDB.

First, build GreptimeDB with feature `cmd/tokio-console`. Also the `tokio_unstable` cfg must be enabled:

```bash
RUSTFLAGS="--cfg tokio_unstable" cargo build -F cmd/tokio-console
```

Then start GreptimeDB with tokio console binding address config: `--tokio-console-addr`. Remember to run with
the `tokio_unstable` cfg. For example:

```bash
RUSTFLAGS="--cfg tokio_unstable" greptime --tokio-console-addr="127.0.0.1:6669" standalone start
```

Now you can use `tokio-console` to connect to GreptimeDB's tokio console subscriber:

```bash
tokio-console [TARGET_ADDR]
```

"TARGET_ADDR" defaults to "\<http://127.0.0.1:6669\>".

:::tip Note

You can refer to [tokio-console](https://github.com/tokio-rs/console) to see the installation of `tokio-console`.

:::
