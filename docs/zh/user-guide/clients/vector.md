# Vector

[Vector](https://vector.dev/) 是一种高性能的可以帮助工程师控制可观测性数据的通道工具。

## 集成

<!--@include: ../../db-cloud-shared/clients/vector-integration.md-->

GreptimeDB 使用 gRPC 与 Vector 进行通信，因此 Vector sink 的默认端口是 `4001`。
如果你在使用 [自定义配置](../operations/configuration.md#configuration-file) 启动 GreptimeDB 时更改了默认的 gRPC 端口，请使用你自己的端口。

<!-- TODO ## Data Model -->
