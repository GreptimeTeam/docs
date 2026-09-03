---
keywords: [单元测试, Rust, nextest, 测试覆盖率, CI]
description: 介绍 GreptimeDB 的单元测试，包括如何编写、运行和检查测试覆盖率。
---

# 单元测试

## 介绍

单元测试通常放在被测逻辑旁边，使用 Rust 的 `#[test]` 属性编写。GreptimeDB 主要使用 [`cargo-nextest`](https://nexte.st/) 运行 Rust 测试。

安装命令如下：

```shell
cargo install cargo-nextest --locked
```

开发时先运行本次修改的 package：

```shell
cargo nextest run -p <package>
```

可以继续使用测试名称或 nextest filter 缩小范围。影响范围较广的改动在提交前运行完整 workspace 测试：

```shell
make test
```

## 覆盖率

CI 会报告单元测试覆盖率。测试应覆盖本次改变的行为和可能回归的失败路径，而不是只追求覆盖率数字。
