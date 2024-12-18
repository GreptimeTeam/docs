---
keywords: [unit tests, Rust, cargo nextest, test runner, coverage]
description: Guide on writing and running unit tests in GreptimeDB using Rust's `#[test]` attribute and `cargo nextest`.
---

# Unit Test

## Introduction

Unit tests are embedded into the codebase, usually placed next to the logic being tested.
They are written using Rust's `#[test]` attribute and can run with `cargo nextest run`.

The default test runner ships with `cargo` is not supported in GreptimeDB codebase. It's recommended
to use [`nextest`](https://nexte.st/) instead. You can install it with

```shell
cargo install cargo-nextest --locked
```

And run the tests (here the `--workspace` is not necessary)

```shell
cargo nextest run
```

Notes if your Rust is installed via `rustup`, be sure to install `nextest` with `cargo` rather
than the package manager like `homebrew`. Otherwise it will mess up your local environment.

## Coverage

Our continuous integration (CI) jobs have a "coverage checking" step. It will report how many
codes are covered by unit tests. Please add the necessary unit test to your patch.
