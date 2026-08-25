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
| [Compatibility test](https://github.com/GreptimeTeam/greptimedb/blob/main/tests/compatibility/README.md) | Reading data or metadata written by an older release | `cargo run -p sqlness-runner -- compat --from-version <version>` |

Run `make test` when a change needs the full Rust workspace test suite. Changes to persisted metadata, WAL records, SST files, or wire formats should also include a compatibility test when an older release may have produced the input.
