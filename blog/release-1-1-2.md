---
keywords: [release, GreptimeDB, changelog, v1.1.2]
description: GreptimeDB v1.1.2 Changelog
date: 2026-07-02
---

# v1.1.2

Release date: July 02, 2026

GreptimeDB v1.1.2 is a patch release for the v1.1 line. It fixes scheduled Flow runtime semantics, improves slow-query context, and refreshes the bundled dashboards.

We recommend users on v1.1.0 and v1.1.1 upgrade to v1.1.2.

### 👍 Highlights

**Scheduled Flow execution now uses stable logical time.** Flows with `EVAL INTERVAL` now bind `now()` and `current_timestamp()` to the scheduled runtime, including distributed plans. This keeps scheduled windows stable instead of depending on when a worker happens to plan the query.

```sql
CREATE TABLE flow_input (
  ts TIMESTAMP(3) TIME INDEX,
  v DOUBLE,
  PRIMARY KEY(v)
);

CREATE FLOW flow_eval
SINK TO flow_eval_sink
EVAL INTERVAL '1s'
AS
SELECT
  date_bin(INTERVAL '1 second', ts) AS window_start,
  count(v) AS value_count,
  now() AS scheduled_at
FROM flow_input
WHERE ts >= date_trunc('second', now()) - INTERVAL '1 second'
  AND ts <  date_trunc('second', current_timestamp())
GROUP BY date_bin(INTERVAL '1 second', ts);
```

**Slow query records include schema context.** Slow query entries now carry the schema name for SQL, logical plan, and PromQL slow-query paths. This makes it easier to find which tenant or workload produced a slow query when multiple schemas share a cluster.

```sql
USE greptime_private;

SELECT schema_name, cost, threshold, query, timestamp
FROM slow_queries
ORDER BY timestamp DESC
LIMIT 10;
```

**Dashboard**

- Bundled Grafana metrics dashboards were reorganized for cluster and standalone deployments. The update fixes histogram bucket queries and counter-rate normalization, separates latency panels, and collapses flush/compaction sections to make troubleshooting easier.
- The embedded GreptimeDB dashboard was updated to v0.13.6. This dashboard release refines metric views and fixes SQL execution from the editor when the cursor is after a SQL line.


### 🚀 Features

* feat: update dashboard to v0.13.6 by [@sunchanglong](https://github.com/sunchanglong) in [#8369](https://github.com/GreptimeTeam/greptimedb/pull/8369)
* feat(flow): stabilize eval interval scheduling by [@evenyag](https://github.com/evenyag) in [#8378](https://github.com/GreptimeTeam/greptimedb/pull/8378)

### 🐛 Bug Fixes

* fix: improve Grafana metrics dashboards by [@evenyag](https://github.com/evenyag) in [#8298](https://github.com/GreptimeTeam/greptimedb/pull/8298)
* fix: redact Kafka SASL password in debug output by [@v0y4g3r](https://github.com/v0y4g3r) in [#8337](https://github.com/GreptimeTeam/greptimedb/pull/8337)
* fix(query): run optimizer rules before MergeScan by [@discord9](https://github.com/discord9) in [#8339](https://github.com/GreptimeTeam/greptimedb/pull/8339)
* fix: preserve bulk write grpc error details by [@fengjiachun](https://github.com/fengjiachun) in [#8349](https://github.com/GreptimeTeam/greptimedb/pull/8349)
* fix: include index files in GC listing by [@discord9](https://github.com/discord9) in [#8327](https://github.com/GreptimeTeam/greptimedb/pull/8327)
* fix: stream tables for prometheus label discovery by [@RitwijParmar](https://github.com/RitwijParmar) in [#8341](https://github.com/GreptimeTeam/greptimedb/pull/8341)
* fix: account parquet metadata cache size by [@v0y4g3r](https://github.com/v0y4g3r) in [#8368](https://github.com/GreptimeTeam/greptimedb/pull/8368)
* fix: respect gc mailbox timeout for admin gc by [@discord9](https://github.com/discord9) in [#8363](https://github.com/GreptimeTeam/greptimedb/pull/8363)
* fix: record catalog and schema in slow queries by [@v0y4g3r](https://github.com/v0y4g3r) in [#8387](https://github.com/GreptimeTeam/greptimedb/pull/8387)
* fix: invalidate comment DDL cache and lock by object ID by [@WenyXu](https://github.com/WenyXu) in [#8390](https://github.com/GreptimeTeam/greptimedb/pull/8390)
* fix: handle PromQL time binary aggregation by [@fengjiachun](https://github.com/fengjiachun) in [#8398](https://github.com/GreptimeTeam/greptimedb/pull/8398)
* fix(flow): bind scheduled now in dist plan by [@discord9](https://github.com/discord9) in [#8396](https://github.com/GreptimeTeam/greptimedb/pull/8396)

### ⚡ Performance

* perf(mito): prune files by manifest time range by [@discord9](https://github.com/discord9) in [#8352](https://github.com/GreptimeTeam/greptimedb/pull/8352)
* perf(mito): skip manifest-pruned file ranges by [@discord9](https://github.com/discord9) in [#8366](https://github.com/GreptimeTeam/greptimedb/pull/8366)

### ⚙️ Miscellaneous Tasks

* chore: client_ip error logs skip internal API by [@shuiyisong](https://github.com/shuiyisong) in [#8362](https://github.com/GreptimeTeam/greptimedb/pull/8362)
* chore: use ENV for building dashboard by [@shuiyisong](https://github.com/shuiyisong) in [#8384](https://github.com/GreptimeTeam/greptimedb/pull/8384)

## New Contributors

* [@RitwijParmar](https://github.com/RitwijParmar) made their first contribution in [#8341](https://github.com/GreptimeTeam/greptimedb/pull/8341)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@RitwijParmar](https://github.com/RitwijParmar), [@shuiyisong](https://github.com/shuiyisong), [@sunchanglong](https://github.com/sunchanglong), [@v0y4g3r](https://github.com/v0y4g3r), [@WenyXu](https://github.com/WenyXu)
