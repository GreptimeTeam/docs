---
keywords: [Grafana, data source, Prometheus, MySQL, GreptimeCloud]
description: Guide on configuring GreptimeCloud as a data source in Grafana using GreptimeDB, Prometheus, or MySQL data sources.
---

# Grafana

GreptimeDB can be configured as a [Grafana data source](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/).
You have the option to connect GreptimeDB with Grafana using one of three data sources: GreptimeDB, Prometheus, or MySQL.

## GreptimeDB data source plugin

Before using the GreptimeDB data source, it is necessary to manually install the GreptimeDB data source plugin.
For more information,
please refer to the [GreptimeDB data source plugin](https://docs.greptime.com/user-guide/integrations/grafana##greptimedb-data-source-plugin) document.

Click the Add data source button and select GreptimeDB as the type. Fill in the following URL in the GreptimeDB server URL:

```txt
https://<host>
```

Then do the following configuration:

- Database Name:`<dbname>`, leave it blank to use the default database `public`
- In the Auth section, click basic auth, and fill in the username and password for GreptimeDB in the Basic Auth Details section (not set by default, no need to fill in).
  - User: `<username>`
  - Password: `<password>`

Then click the Save & Test button to test the connection.


## Prometheus data source

Click the Add data source button and select Prometheus as the type.

Fill in Prometheus server URL in HTTP:

```txt
https://<host>/v1/prometheus
```

Click basic auth in the Auth section and fill in your GreptimeDB username and password in Basic Auth Details:

- User: `<username>`
- Password: `<password>`

Click Custom HTTP Headers and add one header:

- Header: `x-greptime-db-name`
- Value: `<dbname>`

Then click Save & Test button to test the connection.

## MySQL data source

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
