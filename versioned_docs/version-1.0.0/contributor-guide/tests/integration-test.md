---
keywords: [integration tests, Rust test harness, multiple components, HTTP testing, gRPC testing]
description: Guide on writing and running integration tests in GreptimeDB, covering scenarios involving multiple components.
---

# Integration Test

## Introduction

Integration testing is written with Rust test harness (`#[test]`), unlike unit testing, they are placed separately
[here](https://github.com/GreptimeTeam/greptimedb/tree/main/tests-integration).
It covers scenarios involving multiple components, in which one typical case is HTTP/gRPC-related features. You can check
its [documentation](https://github.com/GreptimeTeam/greptimedb/blob/main/tests-integration/README.md) for more information.
