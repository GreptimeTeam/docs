---
keywords: [开发环境, 源码构建, Rust 工具链, 单元测试]
description: 配置开发环境，并从源码构建、运行和测试 GreptimeDB。
---

# 立即开始

本页说明从源码构建和运行 GreptimeDB 所需的基本环境。

## 先决条件

### 系统和架构

GreptimeDB 支持 x86-64 和 Arm64 架构的 Linux 与 macOS，也支持 Windows。

### 构建依赖项

- [Git](https://git-scm.com/book/en/v2/Getting-Started-The-Command-Line)。
- C/C++ 构建工具链，例如 Ubuntu 上的 `build-essential` 或 macOS 上的 Xcode Command Line Tools。
- [Rustup](https://rustup.rs/)。仓库中的 `rust-toolchain.toml` 会自动选择项目要求的 nightly 工具链。
- 3.15 或更高版本的 [Protocol Buffers 编译器](https://grpc.io/docs/protoc-installation/)。使用 `protoc --version` 检查版本。

## 编译和运行

克隆仓库并启动单机实例：

```shell
git clone https://github.com/GreptimeTeam/greptimedb.git
cd greptimedb
cargo run -- standalone start
```

只构建、不启动服务时运行：

```shell
cargo build
```

优化构建请添加 `--release`。构建产物位于 `target/debug` 或 `target/release`。

## 单元测试

GreptimeDB 使用 [cargo-nextest](https://nexte.st/) 作为标准 Rust 测试运行器。安装命令如下：

```shell
cargo install cargo-nextest --locked
```

使用 CI 对应的 feature 运行 workspace 测试：

```shell
cargo nextest run --workspace --features pg_kvbackend,mysql_kvbackend
```

按 crate 运行测试以及其他测试类型参见[测试指南](./tests/overview.md)。

## Docker

预构建镜像发布在 [Docker Hub](https://hub.docker.com/r/greptime/greptimedb)。镜像适合直接运行 GreptimeDB；开发和验证代码改动时仍应使用源码构建。
