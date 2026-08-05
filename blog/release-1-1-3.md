---
keywords: [release, GreptimeDB, changelog, v1.1.3]
description: GreptimeDB v1.1.3 Changelog
date: 2026-07-17
---

# v1.1.3

Release date: July 17, 2026

GreptimeDB v1.1.3 is a patch release for the v1.1 line. It improves query correctness,
storage stability, and the bundled dashboard.

We recommend users on earlier v1.1 releases upgrade to v1.1.3.

### 👍 Highlights

- Scalar-subquery rewrites preserve global ordering for `ORDER BY ... DESC LIMIT 1` branches,
  avoiding a region-local latest row when the branch becomes an intermediate join input.
- PromQL range and instant selectors can now push cast-based time filters to datanodes for
  metric tables using `TIMESTAMP(6)` or `TIMESTAMP(9)`, improving scan pruning.

### Dashboard

- The embedded GreptimeDB dashboard was updated to v0.13.7. Table views are easier to resize
  and inspect, and the support menu is more prominent.
- Dashboard snapshots can now capture the current time range, variable values, and panel query
  results in a self-contained, read-only dashboard that can be saved, exported, and opened
  without querying live data sources.

### 🚀 Features

* feat: use scan output bytes for read costing by [@v0y4g3r](https://github.com/v0y4g3r) in [#8276](https://github.com/GreptimeTeam/greptimedb/pull/8276)
* feat: update dashboard to v0.13.7 by [@sunchanglong](https://github.com/sunchanglong) in [#8431](https://github.com/GreptimeTeam/greptimedb/pull/8431)
* feat: skip oversized compaction tasks by [@fengjiachun](https://github.com/fengjiachun) in [#8466](https://github.com/GreptimeTeam/greptimedb/pull/8466)

### 🐛 Bug Fixes

* fix(query): push down PromQL cast filters by [@discord9](https://github.com/discord9) in [#8407](https://github.com/GreptimeTeam/greptimedb/pull/8407)
* fix: update datafusion-pg-catalog by [@sunng87](https://github.com/sunng87) in [#8417](https://github.com/GreptimeTeam/greptimedb/pull/8417)
* fix: global limit for distributed inspect streams by [@fengjiachun](https://github.com/fengjiachun) in [#8412](https://github.com/GreptimeTeam/greptimedb/pull/8412)
* fix: upgrade datafusion fork by [@fengjiachun](https://github.com/fengjiachun) in [#8438](https://github.com/GreptimeTeam/greptimedb/pull/8438)
* fix: preserve repartitioned file refs during GC by [@discord9](https://github.com/discord9) in [#8445](https://github.com/GreptimeTeam/greptimedb/pull/8445)
* fix: repartition subset partition key joins by [@discord9](https://github.com/discord9) in [#8460](https://github.com/GreptimeTeam/greptimedb/pull/8460)
* fix: honor exclusive end in log queries by [@discord9](https://github.com/discord9) in [#8495](https://github.com/GreptimeTeam/greptimedb/pull/8495)
* fix: account logical record batch slice memory by [@fengjiachun](https://github.com/fengjiachun) in [#8480](https://github.com/GreptimeTeam/greptimedb/pull/8480)
* fix: preserve distributed topk merge ordering by [@discord9](https://github.com/discord9) in [#8432](https://github.com/GreptimeTeam/greptimedb/pull/8432)
* fix: reject out-of-range PostgreSQL numeric UInt64 by [@discord9](https://github.com/discord9) in [#8517](https://github.com/GreptimeTeam/greptimedb/pull/8517)
* fix(log-store): deduplicate Kafka WAL multipart records by [@WenyXu](https://github.com/WenyXu) in [#8514](https://github.com/GreptimeTeam/greptimedb/pull/8514)
* fix: apply log query limit after expressions by [@discord9](https://github.com/discord9) in [#8496](https://github.com/GreptimeTeam/greptimedb/pull/8496)
* fix(query): delegate merge sort cardinality effect by [@discord9](https://github.com/discord9) in [#8532](https://github.com/GreptimeTeam/greptimedb/pull/8532)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@WenyXu](https://github.com/WenyXu), [@discord9](https://github.com/discord9), [@fengjiachun](https://github.com/fengjiachun), [@sunchanglong](https://github.com/sunchanglong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r)
