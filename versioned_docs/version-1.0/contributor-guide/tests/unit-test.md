---
keywords: [unit tests, Rust, cargo nextest, test runner, coverage]
description: Guide on writing and running unit tests in GreptimeDB using Rust's `#[test]` attribute and `cargo nextest`.
---

# Unit Test

## Introduction

Unit tests are embedded into the codebase, usually placed next to the logic being tested.
They are written using Rust's `#[test]` attribute. GreptimeDB uses [`cargo-nextest`](https://nexte.st/) as its primary Rust test runner.

Install it with:

```shell
cargo install cargo-nextest --locked
```

Run the package you changed first:

```shell
cargo nextest run -p <package>
```

Use a test name or nextest filter to narrow the run further while developing. Before submitting a change with broad effects, run the full workspace suite:

```shell
make test
```

## Coverage

CI reports unit-test coverage. Add tests for changed behavior and failure cases that could otherwise regress; coverage percentage alone is not the goal.
