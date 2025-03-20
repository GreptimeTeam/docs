import DocTemplate from '../../db-cloud-shared/clients/grafana-integration.md' 

# Grafana

<DocTemplate>

<div id="data-source-plugin-intro">

GreptimeDB 数据源插件基于 Prometheus 数据源开发并附加了特定于 GreptimeDB 的功能。
该插件完美适配了 GreptimeDB 的数据模型，
从而提供了更好的用户体验。
此外，和直接使用 Prometheus 数据源相比，它还解决了一些兼容性问题。

</div>

<div id="data-source-plugin-installation">

### 安装

GreptimeDB 数据源插件目前仅支持在本地 Grafana 中的安装，
在安装插件前请确保 Grafana 已经安装并运行。

你可以任选以下一种安装方式：

- 下载安装包并解压到相关目录：从 [发布页面](https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/) 获取最新版本，解压文件到你的 [grafana 插件目录](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#plugins)。
- 使用 Grafana Cli 下载并安装：
  ```shell
  grafana cli --pluginUrl https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/download/info8fcc-greptimedb-datasource.zip plugins install info8fcc
  ```

注意，安装插件后可能需要重新启动 Grafana 服务器。

</div>

<div id="preview-greptimedb-using-docker">

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

</div>

<div id="grafana-add-greptimedb-data-source-img">

![grafana-add-greptimedb-data-source](/grafana-add-greptimedb-data-source.png)

</div>


<div id="connection-settings-title">

### Connection 配置

</div>


<div id="greptime-data-source-connection-url">

```txt
http://<host>:4000
```

</div>


<div id="create-a-dashboard">

### 创建仪表盘

在 Grafana 中创建一个新的仪表盘，点击 `Create your first dashboard` 按钮。
然后，点击 `Add visualization`，选择 `GreptimeDB` 作为数据源。

在 `Metric` 下拉列表中选择一个指标，然后点击 `Run query` 查看指标数据。
当你查看数据并确认无误后，点击 `Save` 保存面板。

![grafana-create-panel-with-selecting-metric](/create-panel-with-selecting-metric-greptimedb.png)

你还可以使用 PromQL 创建面板。
点击 `Query` 标签页右侧的 `code` 按钮，切换到 PromQL 编辑器。
然后输入一个 PromQL 语句，例如 `system_memory_usage{state="used"}`，点击 `Run queries` 查看指标数据。

![grafana-create-panel-with-promql](/grafana-create-panel-with-promql.png)

:::tip 注意
GreptimeDB 兼容大部分 PromQL，但是有一些限制。请参考 [PromQL 限制](/user-guide/query-data/promql.md#局限) 文档获取更多信息。
:::

</div>


<div id="prometheus-server-url">

```txt
http://<host>:4000/v1/prometheus
```

</div>

</DocTemplate>
