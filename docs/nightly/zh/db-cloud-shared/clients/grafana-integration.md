
GreptimeDB 服务可以配置为 [Grafana 数据源](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/)。

## GreptimeDB 数据源插件

### 安装

从[发布页面](https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/)获取最新版本，解压文件到你的 [grafana 插件目录](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#plugins)。

你也可以使用 Grafana Cli 下载并安装：

```shell
grafana cli --pluginUrl https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/download/info8fcc-greptimedb-datasource.zip plugins install info8fcc
```

注意，安装插件后可能需要重新启动 Grafana 服务器。

{template preview-greptimedb-using-docker%%}

### Connection 配置

{template greptimecloud-configurations%%}

在 Grafana 中单击 Add data source 按钮，然后选择 GreptimeDB 作为类型。
在 GreptimeDB server URL 中填写以下地址：

{template greptime-data-source-connection-url%%}

接下来做如下配置：

- Database Name：填写数据库名称 `<dbname>`，留空则使用默认数据库 `public`
- 在 Auth 部分中单击 basic auth，并在 Basic Auth Details 中填写 GreptimeDB 的用户名和密码。未设置可留空：

  - User: `<username>`
  - Password: `<password>`

然后单击 Save & Test 按钮以测试连接。

### 创建仪表盘

在 Grafana 中创建一个新的仪表盘，点击 `Create your first dashboard` 按钮。
然后，点击 `Add visualization`，选择 `GreptimeDB` 作为数据源。

在 `Metric` 下拉列表中选择一个指标，然后点击 `Run query` 查看指标数据。
当你查看数据并确认无误后，点击 `Save` 保存面板。

![grafana-create-panel-with-selecting-metric](/create-panel-with-selecting-metric-greptimedb.jpg)

你还可以使用 PromQL 创建面板。
点击 `Query` 标签页右侧的 `code` 按钮，切换到 PromQL 编辑器。
然后输入一个 PromQL 语句，例如 `system_memory_usage{state="used"}`，点击 `Run query` 查看指标数据。

![grafana-create-panel-with-promql](/grafana-create-panel-with-promql.png)

:::tip 注意
GreptimeDB 兼容大部分 PromQL，但是有一些限制。请参考 [PromQL 限制](/user-guide/query-data/promql#limitations) 文档获取更多信息。
:::

## Prometheus 数据源

单击 Add data source 按钮，然后选择 Prometheus 作为类型。

在 HTTP 中填写 Prometheus server URL

{template prometheus-server-url%%}

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
