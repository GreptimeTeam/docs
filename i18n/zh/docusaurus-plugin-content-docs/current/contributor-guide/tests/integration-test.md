---
keywords: [集成测试, Rust test harness, 存储 backend, Kafka, 协议]
description: 运行 tests-integration 中的多组件和外部服务测试。
---

# 集成测试

## 介绍

`tests-integration/` crate 包含需要多个 GreptimeDB 组件或外部服务的 Rust test-harness case。常见场景包括 HTTP 或 gRPC 行为、对象存储 backend、Kafka WAL，以及启用 TLS 的依赖服务。

如果某项行为无法通过 crate 内单元测试或 sqlness 查询 case 验证，应使用集成测试。协议断言应放在公共接口边界，并复用 `tests-integration/fixtures/` 中的 fixture，不要另建一套环境配置。

环境准备和命令以 [`tests-integration/README.md`](https://github.com/GreptimeTeam/greptimedb/blob/main/tests-integration/README.md) 为准。需要凭据或 endpoint 的测试会读取仓库根目录下由 `.env.example` 创建的 `.env` 文件；不要提交凭据。

在仓库根目录运行通用集成测试组：

```shell
cargo test integration
```

特定 backend 使用对应的 filter，例如：

```shell
cargo test s3
cargo test oss
cargo test azblob
```

Kafka 和 TLS case 需要集成测试 README 中记录的 Docker Compose 服务。只启动当前测试需要的依赖，并在测试结束后清理这些服务。
