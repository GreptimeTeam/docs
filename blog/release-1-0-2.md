---
keywords: [release, GreptimeDB, changelog, v1.0.2]
description: GreptimeDB v1.0.2 Changelog
date: 2026-05-14
---

Release date: May 14, 2026

This release fixes a bug where a query could return incorrect rows when **all** of the following were true:

- the table uses merge mode (`merge_mode`);
- the range result cache is enabled;
- the query filters the time index column with `OR` (e.g. `WHERE ts = a OR ts = b`).

In this case the cache could reuse a previous query's result and return rows that should have been filtered out. This is now fixed. ([#8105](https://github.com/GreptimeTeam/greptimedb/pull/8105))

This release also improves performance for PromQL queries on tables whose time index uses a non-millisecond precision (e.g. `Timestamp(ns)` or `Timestamp(us)`). Previously the time-range filter could not be pushed down to storage in this case, so bounded PromQL queries fell back to scanning all SST files instead of pruning by time range. ([#7926](https://github.com/GreptimeTeam/greptimedb/pull/7926))

We recommend users on v1.0.0 and v1.0.1 upgrade to v1.0.2.


### 🚀 Features

* feat: pre-cast constants by [@waynexia](https://github.com/waynexia) in [#7926](https://github.com/GreptimeTeam/greptimedb/pull/7926)

### 🐛 Bug Fixes

* fix: window sort off by one precision TimeRange&better alias track by [@discord9](https://github.com/discord9) in [#8019](https://github.com/GreptimeTeam/greptimedb/pull/8019)
* fix(server): describe EXPLAIN statements so bind parameters work by [@BootstrapperSBL](https://github.com/BootstrapperSBL) in [#8035](https://github.com/GreptimeTeam/greptimedb/pull/8035)
* fix: windows windowed sort ci by [@discord9](https://github.com/discord9) in [#8039](https://github.com/GreptimeTeam/greptimedb/pull/8039)
* fix: batched prometheus ingest row metric by [@v0y4g3r](https://github.com/v0y4g3r) in [#8054](https://github.com/GreptimeTeam/greptimedb/pull/8054)
* fix: preserve case in database name from connection string by [@v0y4g3r](https://github.com/v0y4g3r) in [#8062](https://github.com/GreptimeTeam/greptimedb/pull/8062)
* fix(metric-engine): validate column types and require time index in verify_rows by [@BootstrapperSBL](https://github.com/BootstrapperSBL) in [#8018](https://github.com/GreptimeTeam/greptimedb/pull/8018)
* fix: type inference for sql rewrite by [@sunng87](https://github.com/sunng87) in [#8052](https://github.com/GreptimeTeam/greptimedb/pull/8052)
* fix: infer time index from column meta on derived table by [@waynexia](https://github.com/waynexia) in [#8013](https://github.com/GreptimeTeam/greptimedb/pull/8013)
* fix(mito): ignore compaction override in enum option validation by [@QuakeWang](https://github.com/QuakeWang) in [#8094](https://github.com/GreptimeTeam/greptimedb/pull/8094)
* fix(mito2): drop unsound time-filter cache-key stripping by [@evenyag](https://github.com/evenyag) in [#8105](https://github.com/GreptimeTeam/greptimedb/pull/8105)
* fix: remap batch table route addresses by [@WenyXu](https://github.com/WenyXu) in [#8109](https://github.com/GreptimeTeam/greptimedb/pull/8109)
* fix: avoid stale route update during repartition allocation by [@WenyXu](https://github.com/WenyXu) in [#8115](https://github.com/GreptimeTeam/greptimedb/pull/8115)

## New Contributors

* [@BootstrapperSBL](https://github.com/BootstrapperSBL) made their first contribution in [#8018](https://github.com/GreptimeTeam/greptimedb/pull/8018)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@BootstrapperSBL](https://github.com/BootstrapperSBL), [@QuakeWang](https://github.com/QuakeWang), [@WenyXu](https://github.com/WenyXu), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia)
