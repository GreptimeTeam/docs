---
keywords: [Grafana, 数据源, 配置示例, Prometheus, MySQL]
description: 介绍如何将 GreptimeCloud 配置为 Grafana 数据源，并提供了使用 GreptimeCloud、Prometheus 和 MySQL 数据源的配置示例。
---

# Grafana

GreptimeDB 服务可以配置为 [Grafana 数据源](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/)。
你可以选择使用以下三个数据源之一连接 GreptimeDB 与 Grafana：GreptimeDB、Prometheus 或 MySQL。

## GreptimeDB 数据源插件

在使用 GreptimeDB 数据源之前，需要手动安装 GreptimeDB 数据源插件。
有关更多信息，请参考 [使用 GreptimeDB 数据源文档](https://docs.greptime.cn/user-guide/integrations/grafana#greptimedb-数据源插件)。

在 Grafana 中单击 Add data source 按钮，选择 GreptimeDB 作为类型。

在 GreptimeDB server URL 中填写以下地址：

```txt
https://<host>
```

接下来做如下配置：

- Database Name：填写数据库名称 `<dbname>`，留空则使用默认数据库 `public`
- 在 Auth 部分中单击 basic auth，并在 Basic Auth Details 中填写 GreptimeDB 的用户名和密码。未设置可留空：

  - User: `<username>`
  - Password: `<password>`

然后单击 Save & Test 按钮以测试连接。

## Prometheus 数据源

单击 Add data source 按钮，然后选择 Prometheus 作为类型。

在 HTTP 中填写 Prometheus server URL：

```txt
https://<host>/v1/prometheus
```

在 Auth 部分中单击 basic auth，并在 Basic Auth Details 中填写 GreptimeDB 的用户名和密码：

- User: `<username>`
- Password: `<password>`

在 Custom HTTP Headers 部分中点击 Add header:

- Header: `x-greptime-db-name`
- Value: `<dbname>`

然后单击 Save & Test 按钮以测试连接。

## MySQL 数据源

单击 Add data source 按钮，然后选择 MySQL 作为类型。在 MySQL Connection 中填写以下信息：

- Host: `<host>:4002`
- Database: `<dbname>`
- User: `<username>`
- Password: `<password>`
- Session timezone: `UTC`

然后单击 Save & Test 按钮以测试连接。

注意目前我们只能使用 SQL 创建 Grafana Panel。由于时间戳数据类型的区别，Grafana
的 SQL Builder 暂时无法选择时间戳字段。
