GreptimeDB can be configured as a [Grafana data source](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/).
You have the option to connect GreptimeDB with Grafana using one of three data sources: GreptimeDB, Prometheus, or MySQL.

## GreptimeDB data source plugin

<InjectContent id="data-source-plugin-intro" content={props.children}/>

<InjectContent id="data-source-plugin-installation" content={props.children}/>

<InjectContent id="preview-greptimedb-using-docker" content={props.children}/>

<InjectContent id="connection-settings-title" content={props.children}/>

Click the Add data source button and select GreptimeDB as the type.

<InjectContent id="grafana-add-greptimedb-data-source-img" content={props.children}/>

Fill in the following URL in the GreptimeDB server URL:

<InjectContent id="greptime-data-source-connection-url" content={props.children}/>

Then do the following configuration:

- Database Name:`<dbname>`, leave it blank to use the default database `public`
- In the Auth section, click basic auth, and fill in the username and password for GreptimeDB in the Basic Auth Details section (not set by default, no need to fill in).
  - User: `<username>`
  - Password: `<password>`

Then click the Save & Test button to test the connection.

<InjectContent id="create-a-dashboard" content={props.children}/>

## Prometheus data source

Click the Add data source button and select Prometheus as the type.

Fill in Prometheus server URL in HTTP:

<InjectContent id="prometheus-server-url" content={props.children}/>

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
