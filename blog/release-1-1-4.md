---
keywords: [release, GreptimeDB, changelog, v1.1.4]
description: GreptimeDB v1.1.4 Changelog
date: 2026-07-24
---

# v1.1.4

Release date: July 24, 2026

GreptimeDB v1.1.4 is a focused maintenance release improving correctness for streaming Flow expiration and timestamp presentation over MySQL. It also includes stability, query-validation, metadata-client, and storage fixes.

We recommend users on earlier v1.1 releases upgrade to v1.1.4.

### 👍 Highlights

- Streaming Flow `EXPIRE AFTER` values are now converted to the correct time unit, preventing state from expiring too early. Negative values are rejected while `0` remains valid.
- MySQL timestamp results now respect the column's configured precision, avoiding padded millisecond values and truncated nanosecond values.
- MetaSrv leader caching is now enabled correctly after leader election, restoring leader-side metadata-cache performance.
- Compaction scheduling now removes stale status after throttling, so later compaction work can continue normally.

### 🐛 Bug Fixes

* fix(query): validate DistAnalyzeExec child count by [@discord9](https://github.com/discord9) in [#8510](https://github.com/GreptimeTeam/greptimedb/pull/8510)
* fix: avoid panic when negating MIN-valued literals by [@raphaelroshan](https://github.com/raphaelroshan) in [#8484](https://github.com/GreptimeTeam/greptimedb/pull/8484)
* fix: preserve nulls in timestamp arrays by [@discord9](https://github.com/discord9) in [#8508](https://github.com/GreptimeTeam/greptimedb/pull/8508)
* fix: timestamp display precision should respect column schema (#8227) by [@divyansh-1009](https://github.com/divyansh-1009) in [#8238](https://github.com/GreptimeTeam/greptimedb/pull/8238)
* fix(mito): chunk manifest object writes by [@WenyXu](https://github.com/WenyXu) in [#8567](https://github.com/GreptimeTeam/greptimedb/pull/8567)
* fix: display codes in metasrv client errors by [@evenyag](https://github.com/evenyag) in [#8558](https://github.com/GreptimeTeam/greptimedb/pull/8558)
* fix(mito): notify bulk writes on WAL error by [@v0y4g3r](https://github.com/v0y4g3r) in [#8563](https://github.com/GreptimeTeam/greptimedb/pull/8563)
* fix: ignore dropping marker during GC by [@v0y4g3r](https://github.com/v0y4g3r) in [#8588](https://github.com/GreptimeTeam/greptimedb/pull/8588)
* fix(query): preserve bare plan names in analyze json by [@discord9](https://github.com/discord9) in [#8519](https://github.com/GreptimeTeam/greptimedb/pull/8519)
* fix(flow): lower routine batching messages to debug by [@discord9](https://github.com/discord9) in [#8592](https://github.com/GreptimeTeam/greptimedb/pull/8592)
* fix(flow): downgrade disabled incremental checkpoint log by [@discord9](https://github.com/discord9) in [#8572](https://github.com/GreptimeTeam/greptimedb/pull/8572)
* fix: demote expected remote dynamic filter misses by [@discord9](https://github.com/discord9) in [#8574](https://github.com/GreptimeTeam/greptimedb/pull/8574)
* fix: prevent credential leaks in sanitize_connection_string by [@raphaelroshan](https://github.com/raphaelroshan) in [#8539](https://github.com/GreptimeTeam/greptimedb/pull/8539)
* fix(mito2): remove stale compaction status when next compaction is throttled by [@v0y4g3r](https://github.com/v0y4g3r) in [#8618](https://github.com/GreptimeTeam/greptimedb/pull/8618)
* fix(meta): configure gRPC message limits by [@WenyXu](https://github.com/WenyXu) in [#8616](https://github.com/GreptimeTeam/greptimedb/pull/8616)
* fix(flow): convert streaming expiration to milliseconds by [@QuakeWang](https://github.com/QuakeWang) in [#8481](https://github.com/GreptimeTeam/greptimedb/pull/8481)
* fix: qualify scalar-subquery tables in persisted views by [@discord9](https://github.com/discord9) in [#8581](https://github.com/GreptimeTeam/greptimedb/pull/8581)
* fix: preserve leader cache configuration and record cache hits by [@WenyXu](https://github.com/WenyXu) in [#8576](https://github.com/GreptimeTeam/greptimedb/pull/8576)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@QuakeWang](https://github.com/QuakeWang), [@WenyXu](https://github.com/WenyXu), [@discord9](https://github.com/discord9), [@divyansh-1009](https://github.com/divyansh-1009), [@evenyag](https://github.com/evenyag), [@raphaelroshan](https://github.com/raphaelroshan), [@v0y4g3r](https://github.com/v0y4g3r)
