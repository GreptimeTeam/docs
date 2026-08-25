---
keywords: [单元测试, Rust, cargo-nextest, crate 测试, 覆盖率]
description: 使用 cargo-nextest 编写并运行 crate 内的 Rust 测试。
---

# 单元测试

## 介绍

Rust 单元测试通常位于被测模块内或相邻的 `*_test.rs` 文件中。适合覆盖 crate 内部不变量、边界条件、错误处理，以及不需要启动 GreptimeDB 集群的行为。

GreptimeDB 的标准测试运行器是 [cargo-nextest](https://nexte.st/)。安装命令如下：

```shell
cargo install cargo-nextest --locked
```

开发期间先运行受影响 crate 的测试：

```shell
cargo nextest run -p <package-name>
```

可能影响多个 crate 的改动，在提交前应运行 CI 对应的 workspace 配置：

```shell
cargo nextest run --workspace --features pg_kvbackend,mysql_kvbackend
```

Feature-gated 代码需要在测试命令中启用对应 feature。不要假设默认 feature set 已覆盖相关路径，应检查 crate 的 `Cargo.toml`、本地 `AGENTS.md` 和 CI workflow。

## 覆盖率

CI 会记录 Rust 测试覆盖率。测试应保护实际改动的行为和可信的失败场景，不要只为提高百分比增加断言。查询语言行为和跨组件流程通常还需要 sqlness 或集成测试。
