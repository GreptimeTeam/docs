---
keywords: [query guard, 禁止 drop table, 禁止 drop database, 数据保护, 安全, 配置]
description: 介绍如何在 GreptimeDB 企业版中配置 Query Guard 插件，为所有用户禁止 DROP TABLE / DROP DATABASE 语句，并禁止跨 catalog 查询。
---

# Query Guard

Query Guard 是 GreptimeDB 企业版提供的一个插件，它在 Frontend 协议层拦截查询，
在语句执行前拒绝具有潜在危险的操作。它提供以下保护能力：

- **禁止 `DROP TABLE`**：拒绝所有 `DROP TABLE` 语句。
- **禁止 `DROP DATABASE`**：拒绝所有 `DROP DATABASE` 语句。
- **禁止跨 catalog 查询**：拒绝引用不同 catalog 下表的查询。

## 工作原理

对 `DROP TABLE` 和 `DROP DATABASE` 的禁止在查询拦截器中强制执行，
拦截器在**任何权限检查之前**运行。这意味着一旦启用，该限制对
**所有用户（包括管理员）**生效。在修改配置并重启 Frontend 之前，
任何人都无法通过客户端协议删除表或数据库。

该限制同时覆盖 SQL 协议（MySQL、PostgreSQL 和 HTTP）和 gRPC 协议：

- SQL 路径：`DROP TABLE` 和 `DROP DATABASE` 语句会被拒绝，返回 `NotSupported` 错误。
- gRPC 路径：`DROP TABLE` DDL 请求会被拒绝。注意 `DROP DATABASE` 仅存在于 SQL 协议中，
  gRPC 协议没有删除数据库的请求。

内部操作（例如基于 TTL 的数据过期和自动清理）不经过 Frontend 协议层拦截器，
因此**不受**这些限制影响。

## 配置

Query Guard 以插件形式提供。要启用并配置它，请在 GreptimeDB 配置文件中添加以下 TOML：

```toml
[[plugins]]
# 为 GreptimeDB 添加 query guard 插件。
[plugins.query_guard]
# 是否启用 query guard 插件，默认为 false。
enable = true
# 是否对所有用户禁止 DROP TABLE 语句，默认为 false。
ban_drop_table = true
# 是否对所有用户禁止 DROP DATABASE 语句，默认为 false。
ban_drop_database = true
```

该插件在 standalone 模式和分布式模式下均可工作。在分布式模式下，
它在配置了该插件的 Frontend 上生效。

## 注意事项

- **每个 Frontend 都必须携带该配置。** 在多 Frontend 部署中，
  必须在每个 Frontend 的配置文件中添加该插件配置；
  未配置的 Frontend 仍会正常执行 `DROP` 语句。
- **启用插件会同时禁止跨 catalog 查询。** 开启 `query_guard` 会自动启用
  `disallow_cross_catalog_query`，即使你只想禁止 `DROP` 语句。
- 该限制在协议层强制执行，修改配置后需要重启 Frontend 才能生效。
