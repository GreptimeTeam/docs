GreptimeDB can be used to store time series data for Prometheus.
Additionally, GreptimeDB supports the Prometheus query language via its HTTP API.
This allows for an easy migration of your Prometheus long-term storage to GreptimeDB.

## Data model in difference

To understand the differences between the data models of Prometheus and GreptimeDB, please refer to the [Data Model](/user-guide/ingest-data/for-observerbility/prometheus.md#data-model) in the Ingest Data documentation.

## Prometheus Remote Write

<InjectContent id="remote-write" content={props.children}/>

## Prometheus HTTP API and PromQL

GreptimeDB supports the Prometheus query language (PromQL) via its HTTP API.
<InjectContent id="promql" content={props.children}/>

## Visualize data using Grafana

For developers accustomed to using Grafana for visualizing Prometheus data,
you can continue to use the same Grafana dashboards to visualize data stored in GreptimeDB.
<InjectContent id="grafana" content={props.children}/>

