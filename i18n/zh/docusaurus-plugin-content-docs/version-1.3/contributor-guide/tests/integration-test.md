---
keywords: [集成测试, Rust, HTTP, gRPC, 测试工具]
description: 介绍 GreptimeDB 的集成测试，包括测试范围和如何运行这些测试。
---

# 集成测试

## 介绍

集成测试覆盖跨 crate 或服务边界的行为，例如 HTTP 和 gRPC 处理、分布式组件或外部存储。测试使用 Rust test harness，位于 [`tests-integration`](https://github.com/GreptimeTeam/greptimedb/tree/main/tests-integration) package。

运行命令如下：

```shell
cargo nextest run -p tests-integration
```

部分 case 依赖外部服务的环境变量或 fixture。运行前按照 package 的[准备说明](https://github.com/GreptimeTeam/greptimedb/blob/main/tests-integration/README.md)配置环境。

只有 crate 级测试或 Sqlness case 无法覆盖所需边界时才使用集成测试。隔离的逻辑仍放在单元测试中，便于快速复现失败。
