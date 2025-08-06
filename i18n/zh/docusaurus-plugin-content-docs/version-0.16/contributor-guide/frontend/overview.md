---
keywords: [Frontend, 客户端请求, 租户管理, 鉴权认证, 流量控制]
description: 介绍 GreptimeDB 中 Frontend 的功能和部署。
---

# Frontend

`Frontend` 执行客户端的请求，也处理云服务中的一些特定任务，例如租户管理、鉴权认证、流量控制等。

`Frontend` 暴露了多个接口以支持用多种协议读写数据。您可以参考 [客户端协议][1] 了解更多细节。

下图是 GreptimeDB 在云上的一个典型的部署。`Frontend` 实例组成了一个集群处理来自客户端的请求：

![frontend](/frontend.png)

## 查看更多

- [表分片][2]
- [分布式查询][3]

[1]: /user-guide/protocols/overview.md
[2]: ./table-sharding.md
[3]: ./distributed-querying.md
