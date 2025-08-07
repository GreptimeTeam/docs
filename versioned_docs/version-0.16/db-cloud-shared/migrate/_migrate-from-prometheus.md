GreptimeDB can be used to store time series data for [Prometheus](https://prometheus.io/).
Additionally, GreptimeDB supports the Prometheus query language via its HTTP API.
This allows for an easy migration of your Prometheus long-term storage to GreptimeDB.

## Data model in difference

To understand the differences between the data models of Prometheus and GreptimeDB, please refer to the [Data Model](/user-guide/ingest-data/for-observability/prometheus.md#data-model) in the Ingest Data documentation.

## Prometheus Remote Write

<InjectContent id="remote-write" content={props.children}/>

## Prometheus HTTP API and PromQL

GreptimeDB supports the Prometheus query language (PromQL) via its HTTP API.
<InjectContent id="promql" content={props.children}/>

## Visualize data using Grafana

For developers accustomed to using Grafana for visualizing Prometheus data,
you can continue to use the same Grafana dashboards to visualize data stored in GreptimeDB.
<InjectContent id="grafana" content={props.children}/>


## Reference

For tutorials and user stories on integrating GreptimeDB with Prometheus, please refer to the following blog posts:

- [Setting Up GreptimeDB for Long-Term Prometheus Storage](https://greptime.com/blogs/2024-08-09-prometheus-backend-tutorial)
- [Scale Prometheus - Deploying GreptimeDB Cluster as Long-Term Storage for Prometheus in K8s](https://greptime.com/blogs/2024-10-07-scale-prometheus)
- [User Story — Why We Switched from Thanos to GreptimeDB for Prometheus Long-Term Storage](https://greptime.com/blogs/2024-10-16-thanos-migration-to-greptimedb)

If you need a more detailed migration plan or example scripts, please provide the specific table structure and data volume. The [GreptimeDB official community](https://github.com/orgs/GreptimeTeam/discussions) will offer further support. Welcome to join the [Greptime Slack](http://greptime.com/slack).
