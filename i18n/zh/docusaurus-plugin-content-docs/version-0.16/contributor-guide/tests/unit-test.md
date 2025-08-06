---
keywords: [单元测试, Rust, nextest, 测试覆盖率, CI]
description: 介绍 GreptimeDB 的单元测试，包括如何编写、运行和检查测试覆盖率。
---

# 单元测试

## 介绍

单元测试嵌入在代码库中，通常放置在被测试逻辑的旁边。它们使用 Rust 的 `#[test]` 属性编写，并可以使用 `cargo nextest run` 运行。

GreptimeDB 代码库不支持默认的 `cargo` 测试运行器。推荐使用 [`nextest`](https://nexte.st/)。你可以通过以下命令安装它：

```shell
cargo install cargo-nextest --locked
```

然后运行测试（这里 `--workspace` 不是必须的）

```shell
cargo nextest run
```

注意，如果你的 Rust 是通过 `rustup` 安装的，请确保使用 `cargo` 安装 `nextest`，而不是像 `homebrew` 这样的包管理器，否则会弄乱你的本地环境。

## 覆盖率

我们的持续集成（CI）作业有一个“覆盖率检查”步骤。它会报告有多少代码被单元测试覆盖。请在你的补丁中添加必要的单元测试。
