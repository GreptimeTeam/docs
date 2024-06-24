GreptimeDB can be configured as a [Grafana data source](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/).

## GreptimeDB Data Source Plugin

### Installation

Grab the latest release from [release
page](https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/),
Unzip the file to your [grafana plugin
directory](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#plugins).

You can also use grafana cli to download and install

```
grafana cli --pluginUrl https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/download/info8fcc-greptimedb-datasource.zip plugins install info8fcc
```

Note that you may need to restart your grafana server after installing the plugin.

### Quick Preview using Docker

We built a docker compose file that integrated GreptimeDB, Prometheus,
Prometheus Node Exporter, Grafana and this plugin together.

```bash
git clone https://github.com/GreptimeTeam/greptimedb-grafana-datasource.git
cd docker
docker compose up
```

You can also try out this plugin from a Grafana docker image:

```
docker run -d -p 3000:3000 --name=grafana --rm \
  -e "GF_INSTALL_PLUGINS=https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/download/info8fcc-greptimedb-datasource.zip;info8fcc" \
  grafana/grafana-oss
```

### Connection Settings

Click the Add data source button and select GreptimeDB as the type.

- Fill in the `http://<host>:4000` in the GreptimeDB server URL field.
- Fill in the database name in the Database Name field, default is `public` (not set by default, no need to fill in).
- In the Auth section, click basic auth, and fill in the username and password for GreptimeDB in the Basic Auth Details section (not set by default, no need to fill in).

  - User: `<username>`
  - Password: `<password>`

Then click the Save & Test button to test the connection.

For users using GreptimeCloud, get the configuration from here.
:::tip Note
Host corresponds to GreptimeDB server URL.
:::
![greptimedb-connection-cloud](/greptimedb-connection-cloud.png)


## Prometheus

Click the Add data source button and select Prometheus as the type.

Fill in Prometheus server URL in HTTP:

{template prometheus-server-url%%}

Click basic auth in the Auth section and fill in your GreptimeDB username and password in Basic Auth Details:

- User: `<username>`
- Password: `<password>`

Click Custom HTTP Headers and add one header:

- Header: `x-greptime-db-name`
- Value: `<dbname>`

Then click Save & Test button to test the connection.

## MySQL

Click the Add data source button and select MySQL as the type. Fill in the following information in MySQL Connection:

- Host: `<host>:4002`
- Database: `<dbname>`
- User: `<username>`
- Password: `<password>`
- Session timezone: `UTC`

Then click Save & Test button to test the connection.

Note that you need to use raw SQL editor for panel creation. SQL Builder is not
supported due to timestamp data type difference between GreptimeDB and vanilla
MySQL.
