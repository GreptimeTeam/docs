---
keywords: [testing methods, behavior testing, performance testing, test overview, GreptimeDB tests]
description: Overview of the testing methods used in GreptimeDB to ensure its behavior and performance.
---

# Tests

Choose the narrowest test that exercises the behavior you changed:

| Test type | Use it for | Typical command |
| --- | --- | --- |
| [Unit test](unit-test.md) | Logic contained within one crate or component | `cargo nextest run -p <package>` |
| [Sqlness test](sqlness-test.md) | SQL, protocol, planner, execution, and end-to-end regressions | `cargo sqlness bare -t <case>` |
| [Integration test](integration-test.md) | Behavior that crosses components or requires external services | `cargo nextest run -p tests-integration` |

Run `make test` when a change needs the full Rust workspace test suite.
