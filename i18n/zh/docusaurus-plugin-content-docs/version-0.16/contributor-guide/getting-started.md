---
keywords: [编译, 运行, 源代码, 系统要求, 依赖项, Docker]
description: 介绍如何在本地环境中从源代码编译和运行 GreptimeDB，包括系统要求和依赖项。
---

# 立即开始

本页面介绍如何在本地环境中从源代码运行 GreptimeDB。

## 先决条件

### 系统和架构

目前，GreptimeDB 支持 Linux（amd64 和 arm64）、macOS（amd64 和 Apple Silicone）和 Windows。

### 构建依赖项

- [Git](https://git-scm.com/book/en/v2/Getting-Started-The-Command-Line)（可选）
- C/C++ 工具链：提供编译和链接的基本工具。在 Ubuntu 上，这可用作 `build-essential`。在其他平台上，也有类似的命令。
- Rust（[指南][1]）
  - 编译源代码
- Protobuf（[指南][2]）
  - 编译 proto 文件
  - 请注意，版本需要 >= 3.15。你可以使用 `protoc --version` 检查它。
- 机器：建议内存在 16GB 以上 或者 使用[mold](https://github.com/rui314/mold)工具以降低链接时的内存使用。

[1]: <https://www.rust-lang.org/tools/install/>
[2]: <https://grpc.io/docs/protoc-installation/>

## 编译和运行

只需几个命令即可使用以 Standalone 模式启动 GreptimeDB 实例：

```shell
git clone https://github.com/GreptimeTeam/greptimedb.git
cd greptimedb
cargo run -- standalone start
```

接下来，你可以选择与 GreptimeDB 交互的协议。

如果你只想构建服务器而不运行它：

```shell
cargo build # --release
```

根据构建的模式（是否传递了 `--release` 选项），构建后的文件可以在 `$REPO/target/debug` 或 `$REPO/target/release` 目录下找到。

## 单元测试

GreptimeDB 经过了充分的测试，整个单元测试套件都随源代码一起提供。要测试它们，请使用 [nextest](https://nexte.st/index.html)。

要使用 cargo 安装 nextest，请运行：

```shell
cargo install cargo-nextest --locked
```

或者，你可以查看他们的[文档](https://nexte.st/docs/installation/pre-built-binaries/)以了解其他安装方式。

安装好 nextest 后，你可以使用以下命令运行测试套件：

```shell
cargo nextest run
```

## Docker

我们还通过 Docker 提供预构建二进制文件，可以在 [Docker Hub 上获取](https://hub.docker.com/r/greptime/greptimedb)。
