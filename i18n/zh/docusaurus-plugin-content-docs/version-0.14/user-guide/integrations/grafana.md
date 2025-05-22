---
keywords: [Grafana, 数据源, GreptimeDB 插件, Prometheus 数据源, MySQL 数据源, 仪表盘, 数据可视化]
description: 介绍如何将 GreptimeDB 配置为 Grafana 数据源，包括使用 GreptimeDB 数据源插件、Prometheus 数据源和 MySQL 数据源的方法。
---

# Grafana

GreptimeDB 服务可以配置为 [Grafana 数据源](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/)。
你可以选择使用以下三个数据源之一连接 GreptimeDB 与 Grafana：GreptimeDB、Prometheus 或 MySQL。

## GreptimeDB 数据源插件

[GreptimeDB 数据源插件（v2.x）](https://github.com/GreptimeTeam/greptimedb-grafana-datasource)基于 ClickHouse 插件开发并附加了特定于 GreptimeDB 的功能。
该插件完美适配了 GreptimeDB 的数据模型，
从而提供了更好的用户体验。
此外，和直接使用 Prometheus 数据源相比，它还解决了一些兼容性问题。

### 安装

GreptimeDB 数据源插件目前仅支持在本地 Grafana 中的安装，
在安装插件前请确保 Grafana 已经安装并运行。

你可以任选以下一种安装方式：

- 下载安装包并解压到相关目录：从[发布页面](https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/)获取最新版本，解压文件到你的 [grafana 插件目录](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#plugins)。
- 使用 Grafana Cli 下载并安装：
  ```shell
  grafana cli --pluginUrl https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/download/info8fcc-greptimedb-datasource.zip plugins install info8fcc
  ```
- 使用我们 [预构建的 Grafana 镜
  像](https://hub.docker.com/r/greptime/grafana-greptimedb)，已经提前包含了
  GreptimeDB 数据源插件 `docker run -p 3000:3000
  greptime/grafana-greptimedb:latest`

注意，安装插件后可能需要重新启动 Grafana 服务器。

### 使用 Docker 快速预览

Greptime 提供了一个 docker compose 文件，
将 GreptimeDB、Prometheus、Prometheus Node Exporter、Grafana 和该插件集成在一起，
以便你能够快速体验 GreptimeDB 数据源插件。

```shell
git clone https://github.com/GreptimeTeam/greptimedb-grafana-datasource.git
cd docker
docker compose up
```

你也可以从 Grafana 的 docker 镜像中试用此插件：

```shell
docker run -d -p 3000:3000 --name=grafana --rm \
  -e "GF_INSTALL_PLUGINS=https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/download/info8fcc-greptimedb-datasource.zip;info8fcc" \
  grafana/grafana-oss
```

### Connection 配置

在 Grafana 中单击 Add data source 按钮，选择 GreptimeDB 作为类型。

![grafana-add-greptimedb-data-source](/grafana-add-greptimedb-data-source.png)


在 GreptimeDB server URL 中填写以下地址：

```txt
http://<host>:4000
```

接下来做如下配置：

- Database Name：填写数据库名称 `<dbname>`，留空则使用默认数据库 `public`
- 在 Auth 部分中单击 basic auth，并在 Basic Auth Details 中填写 GreptimeDB 的用户名和密码。未设置可留空：

  - User: `<username>`
  - Password: `<password>`

然后单击 Save & Test 按钮以测试连接。

### 使用 Query Builder 构建查询
* Table: 对无时间戳字段的数据进行查询
  ![Table Query](/grafana/table.png)
* Time Series: 对包含时间戳字段的数据进行查询.
  ![Time Series](/grafana/series.png)
* Logs: 对日志数据进行查询。需要设置 `Time` 列和 `Message` 列。
  ![Logs](/grafana/logs.png)
* Traces: 对 Trace 类型数据进行查询。需要设置截图中数据表的对应列进行 trace 列表查询。
  ![Traces](/grafana/traceconfig.png)

## Prometheus 数据源

单击 Add data source 按钮，然后选择 Prometheus 作为类型。

在 HTTP 中填写 Prometheus server URL

```txt
http://<host>:4000/v1/prometheus
```

在 Auth 部分中单击 basic auth，并在 Basic Auth Details 中填写 GreptimeDB 的用户名和密码：

- User: `<username>`
- Password: `<password>`

在 Custom HTTP Headers 部分中点击 Add header:

- Header: `x-greptime-db-name`
- Value: `<dbname>`

然后单击 Save & Test 按钮以测试连接。

有关如何使用 PromQL 查询数据，请参阅 [Prometheus 查询语言](/user-guide/query-data/promql.md)文档。

## MySQL 数据源

单击 Add data source 按钮，然后选择 MySQL 作为类型。在 MySQL Connection 中填写以下信息：

- Host: `<host>:4002`
- Database: `<dbname>`
- User: `<username>`
- Password: `<password>`
- Session timezone: `UTC`

然后单击 Save & Test 按钮以测试连接。

注意目前我们只能使用 raw SQL 创建 Grafana Panel。由于时间戳数据类型的区别，Grafana
的 SQL Builder 暂时无法选择时间戳字段。

关于如何用 SQL 查询数据，请参考[使用 SQL 查询数据](/user-guide/query-data/sql.md)文档。
