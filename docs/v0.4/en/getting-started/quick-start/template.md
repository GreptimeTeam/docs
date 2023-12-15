# {{$frontmatter.title}}

In this section, we will collect system metric data, such as CPU and memory usage, and sends them to local GreptimeDB.

## Prerequisites

Before trying GreptimeDB, we need to have GreptimeDB and Grafana installed and running locally.

* [GreptimeDB](https://greptime.com/) is used for storing and querying data.
* [Grafana](https://grafana.com/) is used for visualizing data.

Here we use [Docker Compose](https://docs.docker.com/compose/) to start GreptimeDB and Grafana. To do this, create a `docker-compose.yml` file with the following content:

```yaml
services:
  grafana:
    image: grafana/grafana-oss:latest
    container_name: grafana
    ports:
      - 3000:3000

  greptime:
    image: greptime/greptimedb:latest
    container_name: greptimedb
    ports:
      - 4000:4000
      - 4001:4001
      - 4002:4002
      - 4003:4003
      - 4004:4004
      - 4242:4242
    command: "standalone start --http-addr 0.0.0.0:4000 --rpc-addr 0.0.0.0:4001 --mysql-addr 0.0.0.0:4002 --postgres-addr 0.0.0.0:4003 --opentsdb-addr 0.0.0.0:4242"
    volumes:
      - ./greptimedb:/tmp/greptimedb

networks: {}
```

Then run the following command:

```shell
docker-compose up
```

:::tip NOTE
The following steps assume that you have followed the documentation above, which uses Docker Compose to install GreptimeDB and Grafana.
:::

## Write Data

The following command collects system metric data, such as CPU and memory usage, and sends them to GreptimeDB. This demo is based on OpenTelemetry OTLP/http. The source code is available on <a :href="$frontmatter.githubDemoUrl">GitHub</a>.

```shell-vue
{{$frontmatter.writeDataShell}}
```

## Visualize Data with Grafana

### Add Data Source

You can access Grafana at `http://localhost:3000`.
Use `admin` as both the username and password to log in.

GreptimeDB can be configured as a Prometheus data source in Grafana.
Click the `Add data source` button and select Prometheus as the type.

![add-prometheus-data-source](/add-prometheus-data-source.jpg)

Fill in the following information:

* Name: `GreptimeDB`
* Prometheus server URL in HTTP: `http://greptime:4000/v1/prometheus?db=public`

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

## Next Steps

Congratulations on quickly experiencing the basic features of GreptimeDB!
Now, you can explore more of GreptimeDB's features by visiting the [User Guide documentation](/user-guide/overview.md).