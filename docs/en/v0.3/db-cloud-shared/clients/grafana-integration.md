GreptimeDB can be configured as a [Grafana data source](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/).

## Prometheus

Click the Add data source button and select Prometheus as the type.

Fill in Prometheus server URL in HTTP:

- GreptimeCloud: `https://<host>/v1/prometheus?db=<dbname>`
- Self-host GreptimeDB: Your own host address, for example: `http://localhost:4000/v1/prometheus?db=<dbname>`

Click basic auth in the Auth section and fill in your GreptimeDB username and password in Basic Auth Details:

- User: `<username>`
- Password: `<password>`

Then click Save & Test button to test the connection.

## MySQL

Click the Add data source button and select MySQL as the type. Fill in the following information in MySQL Connection:

- Host: `<host>:4002`
- Database: `<dbname>`
- User: `<username>`
- Password: `<password>`
- Session timezone: `UTC`

Then click Save & Test button to test the connection.
