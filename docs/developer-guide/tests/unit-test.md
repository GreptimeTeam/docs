# Unit Test

## Introduction
Unit tests are embedded into the codebase, usually placed next to the logic being tested.
They are written using Rust's `#[test]` attribute and can run with `cargo test --workspace`.
Since `GreptimeDB` orchestrates its components in the "workspace" manner, the tailing
`--workspace` is necessary to run all the unit cases.

The default test runner ships with `cargo` is a bit slow. It's recommended to use
[`nextest`](https://nexte.st/) to speed up the test procedure. You can install it with
```shell
cargo install nextest
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