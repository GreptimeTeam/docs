# 鉴权

当用户尝试连接到数据库时，将会进行身份验证。在 GreptimeDB 中，用户通过“user provider”进行身份验证。GreptimeDB 中有多种 user
provider 实现：

- [Static user provider](./static.md)：一个简单的内置 user provider 实现，从静态文件中查找用户。
- [LDAP user provider](./ldap.md)：使用外部 LDAP 服务进行用户身份验证。

:::tip NOTE

**LDAP user provider 是 GreptimeDB 企业版的功能。**

:::
