---
keywords: [身份验证, 用户 Provider, 静态用户, LDAP 用户, 连接数据库]
description: GreptimeDB 的身份验证概述，介绍了多种用户 Provider 的实现，包括静态用户 Provider 和 LDAP 用户 Provider。
---

# 鉴权

当客户端尝试连接到数据库时，将会进行身份验证。GreptimeDB 通过“user provider”进行身份验证。GreptimeDB 中有多种 user
provider 实现：

- [Static User Provider](./static.md)：一个简单的内置 user provider 实现，从静态文件中查找用户。
- [LDAP User Provider](/enterprise/deployments/authentication.md)：**企业版功能**，使用外部 LDAP 服务进行用户身份验证。

