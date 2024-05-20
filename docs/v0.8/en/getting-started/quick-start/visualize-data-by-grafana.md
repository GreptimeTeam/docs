### Add Data Source

You can access Grafana at `http://localhost:3000`.
Use `admin` as both the username and password to log in.

GreptimeDB can be configured as a Prometheus data source in Grafana.
Click the `Add data source` button and select Prometheus as the type.

![add-prometheus-data-source](/add-prometheus-data-source.jpg)

Fill in the following information:

* Name: `GreptimeDB`
* Prometheus server URL in HTTP: `http://greptimedb:4000/v1/prometheus`
* Custom HTTP headers: Click "Add header" and fill in the header `x-greptime-db-name` with the value `public`, which is the name of the database.

![grafana-prometheus-config.jpg](/grafana-prometheus-config.jpg)

Then click Save & Test button to test the connection.

For more information on using Prometheus as a data source for GreptimeDB,
please refer to [Grafana-Prometheus](/user-guide/clients/grafana.md#prometheus).

### Create a Dashboard

To create a new dashboard in Grafana, click the `Create your first dashboard` button on the home page.
Then, click `Add visualization` and select `GreptimeDB` as the data source.

To view the metric data on the panel page,
select a metric from the `Metric` drop-down list in the `Query` tab, and then click `Run query`.
Once you have reviewed the data, click `Save` to save the panel.

![grafana-create-panel-with-selecting-metric](/grafana-create-panel-with-selecting-metric.png)

You can also use PromQL to create panels.
Click the `code` button on the right side of the `Query` tab to switch to the PromQL editor.
Then, enter a PromQL statement, such as `system_memory_usage{state="used"}`,
and click `Run query` to view the metric data.

![grafana-create-panel-with-promql](/grafana-create-panel-with-promql.png)

:::tip NOTE
GreptimeDB is compatible with most of PromQL, but there are some limitations. Please refer to the [PromQL Limitations](/user-guide/query-data/promql#limitations) documentation for more information.
:::
