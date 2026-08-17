GreptimeDB accepts Prometheus Remote Write samples and implements the Prometheus HTTP query API. This supports a staged migration of new samples and compatible PromQL workloads, but it is not a direct import of Prometheus TSDB blocks.

## Check compatibility first

Review the [Prometheus data model mapping](/user-guide/ingest-data/for-observability/prometheus.md#data-model) and inventory:

- Scrape jobs, external labels, relabeling, and recording rules
- Alert rules and every PromQL function they use
- Grafana dashboards, variables, exemplars, and data-source settings
- Current retention and the historical range that must remain queryable

GreptimeDB supports PromQL through its HTTP API, but that does not guarantee that every rule or dashboard behaves identically. Test critical expressions against the same time range and label set before cutover.

## Send new samples with Remote Write

<InjectContent id="remote-write" content={props.children}/>

Add GreptimeDB as another `remote_write` destination while keeping the existing Prometheus storage and any current remote destination. Remote Write reads samples from the Prometheus WAL; enabling it does not resend the complete historical TSDB.

Monitor the Prometheus remote-write queue while both paths run. In particular, watch pending samples, failed and retried samples, queue lag, CPU, memory, and network saturation. Prometheus can lose unsent remote-write samples after they age out of the WAL, so a continuously failing queue is a data-loss condition, not merely delayed delivery. See the [Prometheus Remote Write tuning guide](https://prometheus.io/docs/practices/remote_write/).

Compare recent data in both systems:

- Series count and label sets for important jobs
- Minimum and maximum sample timestamps
- Raw samples for selected series
- Recording-rule and alert expressions over fixed time ranges
- Missing-sample behavior during Prometheus or GreptimeDB restarts

## Query with PromQL

GreptimeDB exposes the Prometheus HTTP API for PromQL queries.

<InjectContent id="promql" content={props.children}/>

Keep the original Prometheus queryable during migration. Run critical instant and range queries against both endpoints with identical `time`, `start`, `end`, and `step` parameters, then compare values, labels, and empty-series behavior.

## Move Grafana dashboards

<InjectContent id="grafana" content={props.children}/>

Point a copy of the Prometheus data source at GreptimeDB and test dashboards before switching the production data source. Dashboards that use supported PromQL may work unchanged, but differences in labels, unsupported functions, exemplars, or metadata APIs can require edits. Validate alerts separately from dashboard panels.

## Handle existing history

GreptimeDB does not directly import Prometheus TSDB block directories. Choose one of these approaches:

- Keep the old Prometheus or long-term store read-only until its required retention window expires.
- Replay historical samples through a tested Remote Write-compatible tool, preserving original timestamps and labels.
- Migrate only new samples and keep separate data sources for old and new time ranges during the transition.

Backfill in bounded ranges, record progress, and compare counts and queries after each range. Avoid overlapping an untracked backfill with live Remote Write because duplicates or conflicting samples become difficult to reconcile.

## Cut over

Move read traffic only after live Remote Write is caught up and the critical queries, dashboards, and alerts pass comparison. Keep the old query endpoint and rollback path until the required historical range and an agreed observation window have been covered.
