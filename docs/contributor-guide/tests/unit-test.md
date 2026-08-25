---
keywords: [unit tests, Rust, cargo-nextest, package tests, coverage]
description: Write and run crate-local Rust tests with cargo-nextest.
---

# Unit Test

## Introduction

Rust unit tests normally live in the module they exercise or in a nearby `*_test.rs` file. Use them for local invariants, boundary conditions, error handling, and behavior that does not require a running GreptimeDB cluster.

GreptimeDB's standard runner is [cargo-nextest](https://nexte.st/). Install it with:

```shell
cargo install cargo-nextest --locked
```

During development, run the affected package first:

```shell
cargo nextest run -p <package-name>
```

Run the workspace configuration used by CI before submitting a change that can affect several crates:

```shell
cargo nextest run --workspace --features pg_kvbackend,mysql_kvbackend
```

Feature-gated code requires the corresponding feature in the test command. Check the crate's `Cargo.toml`, local `AGENTS.md`, and CI workflow before assuming the default feature set covers the path.

## Coverage

CI records Rust test coverage. Add tests that protect the changed behavior and credible failure cases; do not add assertions solely to increase the percentage. Query-language behavior and cross-component flows usually need a sqlness or integration test in addition to a unit test.
