---
keywords: [setup, build from source, Rust toolchain, unit tests]
description: Set up a development environment and build, run, and test GreptimeDB from source.
---

# Getting started

This page covers the minimum setup for building and running GreptimeDB from source.

<AnchorAlias id="prerequisite" />

## Prerequisites

### System & Architecture

GreptimeDB supports Linux and macOS on x86-64 and Arm64, as well as Windows.

### Build Dependencies

- [Git](https://git-scm.com/book/en/v2/Getting-Started-The-Command-Line).
- A C/C++ build toolchain, such as `build-essential` on Ubuntu or Xcode Command Line Tools on macOS.
- [Rustup](https://rustup.rs/). The repository's `rust-toolchain.toml` selects the required nightly toolchain automatically.
- [Protocol Buffers compiler](https://grpc.io/docs/protoc-installation/) 3.15 or later. Check the installed version with `protoc --version`.

## Compile and Run

Clone the repository and start a standalone instance:

```shell
git clone https://github.com/GreptimeTeam/greptimedb.git
cd greptimedb
cargo run -- standalone start
```

To build without starting the server, run:

```shell
cargo build
```

Add `--release` for an optimized build. Artifacts are written to `target/debug` or `target/release`.

<AnchorAlias id="unit-test" />

## Unit tests

GreptimeDB uses [cargo-nextest](https://nexte.st/) as its standard Rust test runner. Install it with:

```shell
cargo install cargo-nextest --locked
```

Run the workspace test suite with the features used by CI:

```shell
cargo nextest run --workspace --features pg_kvbackend,mysql_kvbackend
```

For package-scoped tests and other test types, see the [testing guide](./tests/overview.md).

## Docker

Prebuilt images are published to [Docker Hub](https://hub.docker.com/r/greptime/greptimedb). They are useful for running GreptimeDB, but do not replace the source build when developing or testing code changes.
