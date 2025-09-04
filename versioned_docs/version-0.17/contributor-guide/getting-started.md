---
keywords: [setup, running from source, prerequisites, build dependencies, unit tests]
description: Instructions for setting up and running GreptimeDB from source, including prerequisites, build dependencies, and running unit tests.
---

# Getting started

This page describes how to run GreptimeDB from source in your local environment.

## Prerequisite

### System & Architecture

At the moment, GreptimeDB supports Linux(both amd64 and arm64), macOS (both amd64 and Apple Silicone) and Windows.

### Build Dependencies

- [Git](https://git-scm.com/book/en/v2/Getting-Started-The-Command-Line) (optional)
- C/C++ Toolchain: provides essential tools for compiling and linking. This is available either as `build-essential` on ubuntu or a similar name on other platforms.
- Rust ([guide][1])
  - Compile the source code
- Protobuf ([guide][2])
  - Compile the proto file
  - Note that the version needs to be >= 3.15. You can check it with `protoc --version`
- Machine: Recommended memory is 16GB or more, or use the [mold](https://github.com/rui314/mold) tool to reduce memory usage during linking.

[1]: <https://www.rust-lang.org/tools/install/>
[2]: <https://grpc.io/docs/protoc-installation/>

## Compile and Run

Start GreptimeDB standalone instance in just a few commands!

```shell
git clone https://github.com/GreptimeTeam/greptimedb.git
cd greptimedb
cargo run -- standalone start
```

Next, you can choose the protocol you like to interact with in GreptimeDB.

Or if you just want to build the server without running it:

```shell
cargo build # --release
```

The artifacts can be found under `$REPO/target/debug` or `$REPO/target/release`, depending on the build mode (whether the `--release` option is passed)

## Unit test

GreptimeDB is well-tested, the entire unit test suite is shipped with source code. To test them, run with [nextest](https://nexte.st/index.html).

To install nextest using cargo, run:

```shell
cargo install cargo-nextest --locked
```

Or you can check their [docs](https://nexte.st/docs/installation/pre-built-binaries/) for other ways to install.

After nextest is ready, you can run the test suite with:

```shell
cargo nextest run
```

## Docker

We also provide pre-build binary via Docker. It's which is available in dockerhub: [https://hub.docker.com/r/greptime/greptimedb](https://hub.docker.com/r/greptime/greptimedb)
