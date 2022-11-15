# Build from Source

## Get the Code

Clone GreptimeDB source code from [our main
repository](https://github.com/GreptimeTeam/greptimedb):

```shell
git clone https://github.com/GreptimeTeam/greptimedb.git
```

## Prerequist

To compile GreptimeDB from source, you'll need:

- C/C++ Toolchain: provides basic tools for compiling and linking. This is
  available as `build-essential` on ubuntu and similar name on other platforms.
- Rust: the easiest way to install Rust is to use
  [`rustup`](https://rustup.rs/), which will check our `rust-toolchain` file and
  install correct Rust version for you.
- Protobuf: `protoc` is required for compiling `.proto` files. `protobuf` is
  available from major package manager on macos and linux distributions. You can
  find an installation instructions
  [here](https://grpc.io/docs/protoc-installation/).

## Build and Run

```shell
cargo run -- standalone start
```

## Build with Docker

A docker image with necessary dependencies is provided:

```
docker build --network host -f docker/Dockerfile -t greptimedb .
```
