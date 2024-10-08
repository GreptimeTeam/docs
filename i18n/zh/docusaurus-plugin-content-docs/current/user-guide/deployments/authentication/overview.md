# 鉴权

当客户端尝试连接到数据库时，将会进行身份验证。GreptimeDB 通过 “user provider” 进行身份验证。GreptimeDB 中有多种 user
provider 实现：

- [Static user provider](./static.md)：一个简单的内置 user provider 实现，从静态文件中查找用户。
- [LDAP user provider](./ldap.md)：**企业版功能。**使用外部 LDAP 服务进行用户身份验证。

