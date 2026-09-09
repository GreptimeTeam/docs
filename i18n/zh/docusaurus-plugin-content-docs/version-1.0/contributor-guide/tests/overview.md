---
keywords: [测试]
description: GreptimeDB 的测试
---

# 测试

选择能够覆盖本次改动的最小测试范围：

| 测试类型 | 适用场景 | 常用命令 |
| --- | --- | --- |
| [单元测试](unit-test.md) | 单个 crate 或组件内的逻辑 | `cargo nextest run -p <package>` |
| [Sqlness 测试](sqlness-test.md) | SQL、协议、planner、执行和端到端回归 | `cargo sqlness bare -t <case>` |
| [集成测试](integration-test.md) | 跨组件或依赖外部服务的行为 | `cargo nextest run -p tests-integration` |

需要运行完整 Rust workspace 测试时使用 `make test`。
