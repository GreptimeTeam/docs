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
| [兼容性测试](https://github.com/GreptimeTeam/greptimedb/blob/main/tests/compatibility/README.md) | 读取旧版本写入的数据或元数据 | `cargo sqlness compat --from-version <version>` |

需要运行完整 Rust workspace 测试时使用 `make test`。如果改动涉及持久化元数据、WAL record、SST 文件或线上协议，并且输入可能由旧版本产生，还需要补充兼容性测试。
