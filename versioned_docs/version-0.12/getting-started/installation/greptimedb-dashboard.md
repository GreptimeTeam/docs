---
keywords: [dashboard, data visualization, SQL queries, PromQL queries, time series data]
description: Information on accessing and using the GreptimeDB Dashboard for visualizing time series data.
---

# GreptimeDB Dashboard

Visualization plays a crucial role in effectively utilizing time series data. To help users leverage the various features of GreptimeDB, Greptime offers a simple [dashboard](https://github.com/GreptimeTeam/dashboard).

The Dashboard is embedded into GreptimeDB's binary since GreptimeDB v0.2.0. After starting [GreptimeDB Standalone](greptimedb-standalone.md) or [GreptimeDB Cluster](greptimedb-cluster.md), the dashboard can be accessed via the HTTP endpoint `http://localhost:4000/dashboard`. The dashboard supports multiple query languages, including [SQL queries](/user-guide/query-data/sql.md), and [PromQL queries](/user-guide/query-data/promql.md).

We offer various chart types to choose from based on different scenarios. The charts become more informative when you have sufficient data.

![line](/dashboard-line.png)
![scatter](/dashboard-scatter.png)

We are committed to the ongoing development and iteration of this open-source project, and we plan to expand the application of time series data in monitoring, analysis, and other relevant fields in the future.
