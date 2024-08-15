import DocTemplate from '../../db-cloud-shared/clients/grafana-integration.md' 

# Grafana

<DocTemplate>

<div id="data-source-plugin-intro">

The GreptimeDB data source plugin is based on the Prometheus data source and adds GreptimeDB-specific features.
The plugin adapts perfectly to the GreptimeDB data model,
thus providing a better user experience.
In addition, it also solves some compatibility issues compared to using the Prometheus data source directly.

</div>

<div id="data-source-plugin-installation">

### Installation

The GreptimeDB Data source plugin can currently only be installed on a local Grafana instance.
Make sure Grafana is installed and running before installing the plugin.

You can choose one of the following installation methods:
- Download the installation package and unzip it to the relevant directory: Grab the latest release from [release
page](https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/),
Unzip the file to your [grafana plugin
directory](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#plugins).
- Use grafana cli to download and install:
  ```shell
  grafana cli --pluginUrl https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/download/info8fcc-greptimedb-datasource.zip plugins install info8fcc
  ```

Note that you may need to restart your grafana server after installing the plugin.

</div>

<div id="preview-greptimedb-using-docker">

### Quick preview using Docker

Greptime provides a docker compose file that integrates GreptimeDB, Prometheus, Prometheus Node Exporter, Grafana, and this plugin together so you can quickly experience the GreptimeDB data source plugin.

```shell
git clone https://github.com/GreptimeTeam/greptimedb-grafana-datasource.git
cd docker
docker compose up
```

You can also try out this plugin from a Grafana docker image:

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
### Connection settings
</div>

<div id="greptime-data-source-connection-url">

```txt
http://<host>:4000
```

</div>

<div id="create-a-dashboard">

### Create a dashboard

Create a new dashboard in Grafana by clicking the `Create your first dashboard` button.
Then click `Add visualization`, select `GreptimeDB` as the data source.

Select a metric from the `Metric` dropdown list, then click `Run queries` to view the metric data.
When you see the data and confirm it is correct, click `Save` to save the panel.

![grafana-create-panel-with-selecting-metric](/create-panel-with-selecting-metric-greptimedb.png)

You can also create a panel using PromQL.
Click the `code` button on the right side of the `Query` tab to switch to the PromQL editor.
Then enter a PromQL statement, such as `system_memory_usage{state="used"}`, click `Run query` to view the metric data.

![grafana-create-panel-with-promql](/grafana-create-panel-with-promql.png)


:::tip NOTE
GreptimeDB is compatible with most PromQL, but there are some limitations. Please refer to the [PromQL limitations](/user-guide/query-data/promql.md#limitations) document for more information.
:::

</div>

<div id="prometheus-server-url">

```txt
http://<host>:4000/v1/prometheus
```

</div>

</DocTemplate>
