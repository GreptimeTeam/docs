---
keywords: [集成测试, Rust, HTTP, gRPC, 测试工具]
description: 介绍 GreptimeDB 的集成测试，包括测试范围和如何运行这些测试。
---

# 集成测试

## 介绍

集成测试使用 Rust 测试工具（`#[test]`）编写，与单元测试不同，它们被单独放置在
[这里](https://github.com/GreptimeTeam/greptimedb/tree/main/tests-integration)。
它涵盖了涉及多个组件的场景，其中一个典型案例是与 HTTP/gRPC 相关的功能。你可以查看
其[文档](https://github.com/GreptimeTeam/greptimedb/blob/main/tests-integration/README.md)以获取更多信息。

