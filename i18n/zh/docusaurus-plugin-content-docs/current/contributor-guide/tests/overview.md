---
keywords: [测试, 单元测试, sqlness, 集成测试, 回归]
description: 根据代码改动选择并运行相应的 GreptimeDB 测试套件。
---

# 测试

GreptimeDB 使用多层测试。首先选择能够覆盖当前改动的最窄测试；如果行为跨组件或通过公共接口暴露，再增加对应层级的回归测试。

- [单元测试](./unit-test.md)覆盖 crate 内部逻辑、不变量和错误路径。测试与 Rust 实现放在一起，通过 cargo-nextest 运行。
- [Sqlness 测试](./sqlness-test.md)覆盖单机或分布式测试环境下用户可见的 SQL 和查询行为。测试输入及预期结果位于 `tests/cases/`。
- [集成测试](./integration-test.md)覆盖需要多个组件或外部服务的交互，包括存储 backend 和协议级行为。测试位于 `tests-integration/`。

仓库还包含 `tests-fuzz/`、`tests/compatibility/` 和 `tests/perf/` 等专项测试。改动涉及输入健壮性、持久化格式兼容性或性能时，应遵循相应目录中的 README 或 `AGENTS.md`。通过某一层测试，不能替代最接近回归可观察位置的测试。
