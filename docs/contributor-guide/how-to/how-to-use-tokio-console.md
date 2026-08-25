---
keywords: [tokio-console, tokio_unstable, asynchronous tasks, diagnostics]
description: Build GreptimeDB with tokio-console support and inspect its Tokio runtime.
---

# How to use tokio-console in GreptimeDB

[`tokio-console`](https://github.com/tokio-rs/console) displays live Tokio tasks and resources. GreptimeDB compiles the subscriber behind the `cmd/tokio-console` feature and also requires Tokio's unstable instrumentation cfg.

Build GreptimeDB with both enabled:

```bash
RUSTFLAGS="--cfg tokio_unstable" cargo build -F cmd/tokio-console
```

Start the component with a full socket address for the console subscriber:

```bash
./target/debug/greptime --tokio-console-addr="127.0.0.1:6669" standalone start
```

The option is global and can also be used with `frontend`, `datanode`, `metasrv`, or `flownode` commands built with the same feature.

Install the console client as described in the [tokio-console repository](https://github.com/tokio-rs/console#installing-the-console) and connect to the configured address:

```bash
tokio-console http://127.0.0.1:6669
```

Keep the subscriber on a loopback or otherwise protected address. It is a diagnostic endpoint, not a public GreptimeDB protocol. The feature and `tokio_unstable` instrumentation add runtime diagnostics and should be enabled deliberately when investigating task stalls, wakeups, or resource contention.
