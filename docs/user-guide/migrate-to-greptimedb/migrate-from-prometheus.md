---
keywords: [migrate from Prometheus, remote write configuration, PromQL queries, Grafana integration]
description: Instructions on migrating from Prometheus to GreptimeDB, including remote write configuration, PromQL queries, and Grafana integration.
---

import DocTemplate from '../../db-cloud-shared/migrate/_migrate-from-prometheus.md' 

# Migrate from Prometheus

<DocTemplate>

<div id="remote-write">

For information on configuring Prometheus to write data to GreptimeDB, please refer to the [remote write](/user-guide/ingest-data/for-observability/prometheus.md#remote-write-configuration) documentation.

</div>

<div id="promql">

For detailed information on querying data in GreptimeDB using Prometheus query language, please refer to the [HTTP API](/user-guide/query-data/promql.md#prometheus-http-api) section in the PromQL documentation.

</div>

<div id="grafana">

To add GreptimeDB as a Prometheus data source in Grafana, please refer to the [Grafana](/user-guide/integrations/grafana.md#prometheus-data-source) documentation.

</div>

</DocTemplate>

If you need a more detailed migration plan or example scripts, please provide the specific table structure and data volume. The [GreptimeDB official community](https://github.com/orgs/GreptimeTeam/discussions) will offer further support. Welcome to join the [Greptime Slack](http://greptime.com/slack).