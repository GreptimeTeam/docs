---
keywords: [query guard, 禁止 drop table, 禁止 drop database, 禁止 truncate table, 禁止 delete, 禁止 drop column, 数据保护, 安全, 配置]
description: 介绍如何在 GreptimeDB 企业版中配置 Query Guard 插件，为所有用户禁止 DROP TABLE、DROP DATABASE、TRUNCATE TABLE、DELETE 和 ALTER TABLE DROP COLUMN 等破坏性操作，并禁止跨 catalog 查询。
---

# Query Guard

Query Guard 是 GreptimeDB 企业版提供的一个插件，它在 Frontend 协议层拦截查询，
在语句执行前拒绝具有潜在危险的操作。它提供以下保护能力：

- **禁止 `DROP TABLE`**：拒绝所有 `DROP TABLE` 语句。
- **禁止 `DROP DATABASE`**：拒绝所有 `DROP DATABASE` 语句。
- **禁止 `TRUNCATE TABLE`**：拒绝所有 `TRUNCATE TABLE` 语句。
- **禁止 `DELETE`**：拒绝所有 `DELETE` 语句和原生 gRPC delete 请求。
- **禁止 `ALTER TABLE DROP COLUMN`**：拒绝 `ALTER TABLE ... DROP COLUMN`
  语句和原生 gRPC `DropColumns` 请求，同时仍允许 `ADD COLUMN` 等其他
  `ALTER TABLE` 操作。
- **拒绝 `COPY` 语句**：拒绝所有 `COPY` 语句。
- **禁止跨 catalog 访问**：拒绝引用不同 catalog 下表的查询、跨 catalog 的
  gRPC DDL 请求，以及写入其他 catalog 的 Flight bulk insert。

## 工作原理

配置中禁止的操作由查询拦截器强制拦截，拦截器在**任何权限检查之前**运行。
因此，禁止规则对**所有用户（包括管理员）**生效。在修改配置并重启 Frontend
之前，任何人都无法通过已配置的 Frontend 执行被禁止的操作。

该限制同时覆盖 SQL 协议（MySQL、PostgreSQL 和 HTTP）和 gRPC 协议：

- SQL 路径：配置中禁止的 `DROP TABLE`、`DROP DATABASE`、`TRUNCATE TABLE`、
  `DELETE` 和 `ALTER TABLE ... DROP COLUMN` 语句会被拒绝，并返回
  `NotSupported` 错误。`DELETE` 禁令同样会拒绝包裹在 `EXPLAIN ANALYZE`
  中的 `DELETE` 语句以及预编译（prepared）的 `DELETE` 语句。
- gRPC 路径：配置中禁止的结构化 `DROP TABLE` 和 `TRUNCATE TABLE` DDL 请求、
  批量 `DropColumns` alter-table 请求，以及两种原生 delete 请求编码
  （`Deletes` 和 `RowDeletes`）都会被拒绝。结构化 gRPC DDL 请求没有删除数据库的
  变体；但通过 gRPC 发送的 SQL 语句同样会经过 SQL 拦截器，因此 `DROP DATABASE`
  和 `DELETE` 禁令对 gRPC 上的 SQL 同样生效。

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
# 对所有用户禁止的操作，默认为空列表。
banned_ops = ["drop_table", "drop_database", "truncate_table", "delete", "drop_column"]
```

`banned_ops` 支持 `drop_table`、`drop_database`、`truncate_table`、`delete`
和 `drop_column`。如果只需禁止其中一部分操作，仅将相应名称加入
`banned_ops` 即可。

原有的 `ban_drop_table`、`ban_drop_database` 和 `ban_truncate_table` 配置项
已不再受支持。使用其中任意配置项都会导致配置解析失败。

该插件在 standalone 模式和分布式模式下均可工作。在分布式模式下，
它在配置了该插件的 Frontend 上生效。

## 注意事项

- **每个 Frontend 都必须携带该配置。** 在多 Frontend 部署中，
  必须在每个 Frontend 的配置文件中添加该插件配置；未配置的 Frontend
  仍会正常执行 `banned_ops` 中列出的操作。
- **操作禁令需要单独配置。** 开启 `query_guard` 会自动拒绝 `COPY` 语句、
  跨 catalog 查询、跨 catalog 的 gRPC DDL 请求，以及写入其他 catalog 的
  Flight bulk insert。要禁止受支持的操作，请将它们加入默认为空的 `banned_ops`。
- 该限制在协议层强制执行，修改配置后需要重启 Frontend 才能生效。
