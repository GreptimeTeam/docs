# Grafana

GreptimeCloud service can be configured as a [Grafana data source](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/).

## Prometheus

Click the `Add data source` button and select `Prometheus` as the type.

Fill in the following information in `HTTP`:

- Prometheus server URL: `https://<host>/v1/prometheus/read?db=<dbname>`

Click `basic auth` in the `Auth` section and fill in your GreptimeCloud service username and password in `Basic Auth Details`:

- User: `<username>`
- Password: *Your GreptimeCloud service password*

Then click `Save & Test` button to test the connection.

## MySQL

Click the `Add data source` button and select `MySQL` as the type. Fill in the following information in `MySQL Connection`:

- Host: `<host>:4002`
- Database: `<dbname>`
- User: `<username>`
- Password: *Your GreptimeCloud service password*
- Session timezone: `UTC`

Then click `Save & Test` button to test the connection.
