

### 添加 GreptimeDB 数据源插件

你可以在 `http://localhost:3000` 访问 Grafana 并使用 `admin` 作为用户名和密码登录。

![add-greptimedb-data-source](/greptimedb-add.png)

填写以下信息：

- 在 GreptimeDB server URL 中填写 `http://<host>:4000`
- 在 Database Name 中填写数据库名称，默认 `public` (默认未设置，无需填写)
- 在 Auth 部分中单击 basic auth，并在 Basic Auth Details 中填写 GreptimeDB 的用户名和密码：(默认未设置，无需填写)

  - User: `<username>`
  - Password: `<password>`

![grafana-prometheus-config.jpg](/greptimedb-connection.jpg)

点击 `Save & Test` 按钮，确保数据源配置成功。

关于使用 GreptimeDB 数据源插件的更多信息，请参考 [Grafana-GreptimeDB](/user-guide/clients/grafana.md#greptimedb)。


:::tip 注意
GreptimeDB 兼容大部分 PromQL，但是有一些限制。请参考 [PromQL 限制](/user-guide/query-data/promql#limitations) 文档获取更多信息。
:::


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


### 添加 Prometheus 数据源插件

你可以在 `http://localhost:3000` 访问 Grafana 并使用 `admin` 作为用户名和密码登录。

GreptimeDB 可以作为 Prometheus 数据源配置在 Grafana 中。
点击 `Add data source` 按钮，选择 Prometheus 作为类型。

![add-prometheus-data-source](/add-prometheus-data-source.jpg)

填写以下信息：

* Name: `GreptimeDB`
* Prometheus server URL in HTTP: `http://greptimedb:4000/v1/prometheus`
* Custom HTTP headers: 点击 Add header, 填写 header `x-greptime-db-name` 和 value `public`，即数据库的名称。

![grafana-prometheus-config.jpg](/grafana-prometheus-config.jpg)

点击 `Save & Test` 按钮，确保数据源配置成功。

关于使用 Prometheus 作为 GreptimeDB 数据源的更多信息，请参考 [Grafana-Prometheus](/user-guide/clients/grafana.md#prometheus)。