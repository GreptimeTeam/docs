# Integration Test

## Introduction
An integration test is also written with Rust test harness (`#[test]`). But unlike unit test they are placed separately under
[here](https://github.com/GreptimeTeam/greptimedb/tree/develop/tests-integration).
It's used to cover scenarios involving multiple components. One typical case is HTTP/gRPC-related features. You can check
its [documentation](https://github.com/GreptimeTeam/greptimedb/blob/develop/tests-integration/README.md) for more information.
