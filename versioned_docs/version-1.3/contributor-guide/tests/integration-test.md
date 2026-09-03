---
keywords: [integration tests, Rust test harness, multiple components, HTTP testing, gRPC testing]
description: Guide on writing and running integration tests in GreptimeDB, covering scenarios involving multiple components.
---

# Integration Test

## Introduction

Integration tests cover behavior that crosses crate or service boundaries, such as HTTP and gRPC handling, distributed components, or external storage. They use Rust's test harness and live in the [`tests-integration`](https://github.com/GreptimeTeam/greptimedb/tree/main/tests-integration) package.

Run the package with:

```shell
cargo nextest run -p tests-integration
```

Some cases require environment variables or fixtures for external services. Follow the package's [setup instructions](https://github.com/GreptimeTeam/greptimedb/blob/main/tests-integration/README.md) before running those cases.

Use an integration test when a crate-level test or a Sqlness case cannot exercise the required boundary. Keep isolated logic in unit tests so that failures remain fast to reproduce.
