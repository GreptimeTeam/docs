# Get started

## Introduction

This page describes how to run GreptimeDB from source in your local environment.

## Prerequisite

### System & Architecture

At the moment, GreptimeDB now only supports Linux(amd64) and macOS (both amd64 and Apple Silicone).

### Build Dependencies

- Git (optional)
  - Clone the source from
- C/C++ Toolchain: provides basic tools for compiling and linking. This is available as build-essential on ubuntu and similar name on other platforms.
- Rust ([guide][1])
  - Compile the source code
- Protobuf ([guide][2])
  - Compile the proto file

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

GreptimeDB is well-tested, the entire unit test suite is shipped with source code. To test them, run

```shell
cargo test --workspace
```

## Docker

We also provide pre-build binary via Docker. It's which is avaliable in dockerhub: <https://hub.docker.com/r/greptime/greptimedb>
