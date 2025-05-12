---
keywords: [Grafana, data source, plugin, installation, connection settings, Prometheus, MySQL]
description: Steps to configure GreptimeDB as a data source in Grafana using different plugins and data sources, including installation and connection settings.
---

# Grafana

GreptimeDB can be configured as a [Grafana data source](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/).
You have the option to connect GreptimeDB with Grafana using one of three data sources: [GreptimeDB](#greptimedb-data-source-plugin), [Prometheus](#prometheus-data-source), or [MySQL](#mysql-data-source).

## GreptimeDB data source plugin

The [GreptimeDB data source plugin (v2.0)](https://github.com/GreptimeTeam/greptimedb-grafana-datasource) is based on the ClickHouse data source and adds GreptimeDB-specific features.
The plugin adapts perfectly to the GreptimeDB data model,
thus providing a better user experience.
In addition, it also solves some compatibility issues compared to using the Prometheus data source directly.

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
- Use our [prebuilt Grafana docker
  image](https://hub.docker.com/r/greptime/grafana-greptimedb), which ships the
  plugin by default: `docker run -p 3000:3000
  greptime/grafana-greptimedb:latest`

Note that you may need to restart your grafana server after installing the plugin.

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

### Connection settings

Click the Add data source button and select GreptimeDB as the type.

![grafana-add-greptimedb-data-source](/grafana-add-greptimedb-data-source.png)

Fill in the following URL in the GreptimeDB server URL:

```txt
http://<host>:4000
```

Then do the following configuration:

- Database Name:`<dbname>`, leave it blank to use the default database `public`
- In the Auth section, click basic auth, and fill in the username and password for GreptimeDB in the Basic Auth Details section (not set by default, no need to fill in).
  - User: `<username>`
  - Password: `<password>`

Then click the Save & Test button to test the connection.

### Use the query builder
* Table: Query for datasets without a timestamp field.
  ![Table Query](/grafana/table.png)
* Time Series: Query for datasets has a timestamp field.
  ![Time Series](/grafana/series.png)
* Logs: Query for logs. Need specify the `timestamp` field and the `message` field.
  ![Logs](/grafana/logs.png)
* Traces: Query for trace data. Need specify the columns in the table as the screenshot to get trace list.
  ![Traces](/grafana/traceconfig.png)


## Prometheus data source

Click the "Add data source" button and select Prometheus as the type.

Fill in Prometheus server URL in HTTP:

```txt
http://<host>:4000/v1/prometheus
```

Click basic auth in the Auth section and fill in your GreptimeDB username and password in Basic Auth Details:

- User: `<username>`
- Password: `<password>`

Click Custom HTTP Headers and add one header:

- Header: `x-greptime-db-name`
- Value: `<dbname>`

Then click "Save & Test" button to test the connection.

For how to query data with PromQL, please refer to the [Prometheus Query Language](/user-guide/query-data/promql.md) document.

## MySQL data source

Click the "Add data source" button and select MySQL as the type. Fill in the following information in MySQL Connection:

- Host: `<host>:4002`
- Database: `<dbname>`
- User: `<username>`
- Password: `<password>`
- Session timezone: `UTC`

Then click "Save & Test" button to test the connection.

Note that you need to use raw SQL editor for panel creation. SQL Builder is not
supported due to timestamp data type difference between GreptimeDB and vanilla
MySQL.

For how to query data with SQL, please refer to the [Query Data with SQL](/user-guide/query-data/sql.md) document.
