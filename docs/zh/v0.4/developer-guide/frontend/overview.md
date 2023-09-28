# 概述

`frontend` 主要用于云服务中的分布式执行查询和运行某些特定任务，例如租户管理、鉴权认证、流量控制等。

`frontend` 暴露了多个接口以支持用多种协议读写数据。您可以参考 [客户端协议][1] 了解更多细节。在客户端连接建立后，`frontend` 在与数据交互时充当客户端和 `datanodes` 之间的桥梁。

下面是 GreptimeDB 在云中的典型部署流程。你可以看到请求通过 `frontend` 集群传输，以及请求的处理过程。

![frontend](/frontend.png)

## 查看更多

- [表分片][2]
- [分布式查询][3]

[1]: /zh/v0.4/user-guide/clients/overview.md
[2]: ./table-sharding.md
[3]: ./distributed-querying.md
