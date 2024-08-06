# Prometheus

## Data Model

Data in GreptimeDB is organized as tables, which can be thought of as groups of columns. There are three types of columns: Time Index, Primary Key, and non of both. When mapping to Prometheus, Time Index is the timestamp, Primary Key is the tag (or label) and the rest are values. Hence, GreptimeDB can be thought of as a multi-value data model, one table is a group of multiple Prometheus metrics. For example:

![Data Model](/PromQL-multi-value-data-model.png)

## Storage

Please refer to [write data](../ingest-data/for-observerbility/prometheus.md) for details.

## Prometheus Query Language

Please refer to [query data](../query-data/promql.md) for details.
