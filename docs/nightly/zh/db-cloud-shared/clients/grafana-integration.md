
GreptimeDB 服务可以配置为 [Grafana 数据源](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/)。

## GreptimeDB 数据源插件

### 单独安装插件

* #### 通过 grafana cli 安装
```
grafana cli --pluginUrl https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/download/info8fcc-greptimedb-datasource.zip plugins install info8fcc
```

* #### 解压安装
直接解压 [plugin zip](https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/download/info8fcc-greptimedb-datasource.zip) 到你的 [grafana plugin 目录](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#plugins)

### 通过 Docker 集成安装使用

* #### docker compose
[files in docker dirctory](https://github.com/GreptimeTeam/greptimedb-grafana-datasource/tree/main/docker) 中包含了集成使用的示例文件，可直接 `docker compose up` 运行
* #### docker
```
docker run -d -p 3000:3000 --name=grafana \
  -e "GF_INSTALL_PLUGINS=https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/download/info8fcc-greptimedb-datasource.zip;info8fcc" \
  grafana/grafana-oss
```

### Connection 配置

单击 Add data source 按钮，然后选择 GreptimeDB 作为类型。

- 在 GreptimeDB server URL 中填写 `http://<host>:4000`
- 在 Database Name 中填写数据库名称，默认 `public` (默认未设置，无需填写)
- 在 Auth 部分中单击 basic auth，并在 Basic Auth Details 中填写 GreptimeDB 的用户名和密码：(默认未设置，无需填写)

  - User: `<username>`
  - Password: `<password>`

然后单击 Save & Test 按钮以测试连接。

使用 GreptimeCloud 的用户，从这里获取配置
:::tip 注意
Host 对应 GreptimeDB server URL
:::
![greptimedb-connection-cloud](/greptimedb-connection-cloud.png)

### 创建仪表盘

在 Grafana 中创建一个新的仪表盘，点击 `Create your first dashboard` 按钮。
然后，点击 `Add visualization`，选择 `GreptimeDB` 作为数据源。

在 `Metric` 下拉列表中选择一个指标，然后点击 `Run query` 查看指标数据。
当你查看数据并确认无误后，点击 `Save` 保存面板。

![grafana-create-panel-with-selecting-metric](/grafana_greptimedb_editquery.jpg)

你还可以使用 PromQL 创建面板。
点击 `Query` 标签页右侧的 `code` 按钮，切换到 PromQL 编辑器。
然后输入一个 PromQL 语句，例如 `system_memory_usage{state="used"}`，点击 `Run query` 查看指标数据。

![grafana-create-panel-with-promql](/grafana-create-panel-with-promql.png)

:::tip 注意
GreptimeDB 兼容大部分 PromQL，但是有一些限制。请参考 [PromQL 限制](/user-guide/query-data/promql#limitations) 文档获取更多信息。
:::


## Prometheus

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

## MySQL

单击 Add data source 按钮，然后选择 MySQL 作为类型。在 MySQL Connection 中填写以下信息：

- Host: `<host>:4002`
- Database: `<dbname>`
- User: `<username>`
- Password: `<password>`
- Session timezone: `UTC`

然后单击 Save & Test 按钮以测试连接。

注意目前我们只能使用 SQL 创建 Grafana Panel。由于时间戳数据类型的区别，Grafana
的 SQL Builder 暂时无法选择时间戳字段。
