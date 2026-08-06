---
keywords: [standalone monitoring, GreptimeDB, metrics, Grafana]
description: Guide to monitor GreptimeDB standalone instance using Prometheus metrics and Grafana.
---

# Standalone Monitoring

GreptimeDB standalone provides a `/metrics` endpoint on the HTTP port (default `4000`) that exposes [Prometheus metrics](/reference/http-endpoints.md#metrics).

You can use Prometheus to scrape these metrics and Grafana to visualize them.

## Grafana Dashboard Integration

GreptimeDB provides pre-built Grafana dashboards for monitoring standalone deployments.
You can access the dashboard JSON files from the [GreptimeDB repository](https://github.com/GreptimeTeam/greptimedb/tree/VAR::greptimedbVersion/grafana/dashboards/metrics/standalone).


