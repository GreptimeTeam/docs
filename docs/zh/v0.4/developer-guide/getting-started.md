# 立即开始

本页面介绍如何在本地环境中从源代码运行 GreptimeDB。

## 先决条件

### 系统和架构

目前，GreptimeDB 仅支持 Linux（amd64）和 macOS（amd64 和 Apple Silicone）。

### 构建依赖项

- [Git](https://git-scm.com/book/en/v2/Getting-Started-The-Command-Line)（可选）
- C/C++ 工具链：提供编译和链接的基本工具。在 Ubuntu 上，这可用作 `build-essential`。在其他平台上，也有类似的命令。
- Rust（[指南][1]）
  - 编译源代码
- Protobuf（[指南][2]）
  - 编译 proto 文件
  - 请注意，版本需要 >= 3.15。你可以使用 `protoc --version` 检查它。

[1]: <https://www.rust-lang.org/tools/install/>
[2]: <https://grpc.io/docs/protoc-installation/>

## 编译和运行

只需几个命令即可使用以 Standalone 模式启动 GreptimeDB 实例:

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

GreptimeDB 经过了充分的测试，整个单元测试套件都随源代码一起提供。通过以下命令来运行测试：

```shell
cargo test --workspace
```

## Docker

我们还通过 Docker 提供预构建二进制文件，可以在 [Docker Hub 上获取](https://hub.docker.com/r/greptime/greptimedb)。
