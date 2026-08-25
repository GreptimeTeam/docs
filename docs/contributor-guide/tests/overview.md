---
keywords: [tests, unit tests, sqlness, integration tests, regression]
description: Choose and run the GreptimeDB test suite that matches a code change.
---

# Tests

GreptimeDB uses several test layers. Choose the narrowest layer that exercises the behavior being changed, then add a broader regression test when the behavior crosses component boundaries or is visible through a public interface.

- [Unit tests](./unit-test.md) cover crate-local logic, invariants, and error paths. They live next to the Rust implementation and run with cargo-nextest.
- [Sqlness tests](./sqlness-test.md) cover user-visible SQL and query behavior against standalone or distributed test environments. Cases and expected results live under `tests/cases/`.
- [Integration tests](./integration-test.md) cover interactions that require multiple components or external services, including storage backends and protocol-level behavior. They live under `tests-integration/`.

The repository also contains specialized suites such as `tests-fuzz/`, `tests/compatibility/`, and `tests/perf/`. Use their local README or `AGENTS.md` instructions when a change affects input robustness, persisted-format compatibility, or performance. Passing one layer does not replace a test at the layer where the regression would be observed.
