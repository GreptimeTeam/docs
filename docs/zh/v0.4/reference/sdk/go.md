# Go SDK

用于 GreptimeDB 的 Go 客户端，兼容 GreptimeDB 协议且轻量级。

## 特性

- 并发安全
- Non-blocking
- 方便易用的 Metric 和 Series 结构体
- 支持 Sql 和 PromQL 查询

## 如何使用

请参考用户指南章节学习 [如何安装 SDK](/v0.4/user-guide/clients/sdk-libraries/go.md)、
[如何写入数据](/v0.4/user-guide/write-data/sdk-libraries/go.md) 和 [如何查询数据](/v0.4/user-guide/query-data/sdk-libraries/go.md)。

## 配置

| 名称     | 描述                                         |
| :------- | :------------------------------------------- |
| Host     | GreptimeDB 服务器                            |
| Port     | 默认为 4001                                  |
| Username | 如果连接的数据库没有身份验证，请将该字段留空 |
| Password | 如果连接的数据库没有身份验证，请将该字段留空 |
| Database | 默认要操作的数据库                           |

## 使用示例

有关常用方法的可运行代码片段和说明，请参见 [示例][example]。

<!-- 链接 -->

[example]: https://pkg.go.dev/github.com/GreptimeTeam/greptimedb-client-go#example-package

## API

请参考 [API 文档](https://pkg.go.dev/github.com/GreptimeTeam/greptimedb-client-go)。
