---
keywords: [release, GreptimeDB, changelog, v1.0.0-beta.3]
description: GreptimeDB v1.0.0-beta.3 Changelog
date: 2025-12-17
---

# v1.0.0-beta.3

Release date: December 17, 2025

## Breaking changes

* feat!: download file to fill the cache on write cache miss by [@evenyag](https://github.com/evenyag) in [#7294](https://github.com/GreptimeTeam/greptimedb/pull/7294)

### 🚀 Features

* feat: implement a cache for manifest files by [@evenyag](https://github.com/evenyag) in [#7326](https://github.com/GreptimeTeam/greptimedb/pull/7326)
* feat: add more verbose metrics to scanners by [@evenyag](https://github.com/evenyag) in [#7336](https://github.com/GreptimeTeam/greptimedb/pull/7336)
* feat: decode pk eagerly by [@waynexia](https://github.com/waynexia) in [#7350](https://github.com/GreptimeTeam/greptimedb/pull/7350)
* feat: run histogram quantile in safe mode for incomplete data by [@waynexia](https://github.com/waynexia) in [#7297](https://github.com/GreptimeTeam/greptimedb/pull/7297)
* feat: update dashboard to v0.11.9 by [@ZonaHex](https://github.com/ZonaHex) in [#7364](https://github.com/GreptimeTeam/greptimedb/pull/7364)
* feat: allow publishing new nightly release when some platforms are absent by [@waynexia](https://github.com/waynexia) in [#7354](https://github.com/GreptimeTeam/greptimedb/pull/7354)
* feat: allow one to many VRL pipeline by [@v0y4g3r](https://github.com/v0y4g3r) in [#7342](https://github.com/GreptimeTeam/greptimedb/pull/7342)
* feat: collect merge and dedup metrics by [@evenyag](https://github.com/evenyag) in [#7375](https://github.com/GreptimeTeam/greptimedb/pull/7375)
* feat: suspend frontend and datanode by [@MichaelScofield](https://github.com/MichaelScofield) in [#7370](https://github.com/GreptimeTeam/greptimedb/pull/7370)
* feat: table/column/flow COMMENT by [@waynexia](https://github.com/waynexia) in [#7060](https://github.com/GreptimeTeam/greptimedb/pull/7060)
* feat: grafana postgresql data source query builder support by [@sunng87](https://github.com/sunng87) in [#7379](https://github.com/GreptimeTeam/greptimedb/pull/7379)
* feat: mark index outdated by [@discord9](https://github.com/discord9) in [#7383](https://github.com/GreptimeTeam/greptimedb/pull/7383)
* feat: mem manager on compaction by [@fengjiachun](https://github.com/fengjiachun) in [#7305](https://github.com/GreptimeTeam/greptimedb/pull/7305)
* feat: optimize and fix part sort on overlapping time windows by [@waynexia](https://github.com/waynexia) in [#7387](https://github.com/GreptimeTeam/greptimedb/pull/7387)
* feat: per file scan metrics by [@evenyag](https://github.com/evenyag) in [#7396](https://github.com/GreptimeTeam/greptimedb/pull/7396)
* feat: move memory_manager to common crate by [@fengjiachun](https://github.com/fengjiachun) in [#7408](https://github.com/GreptimeTeam/greptimedb/pull/7408)
* feat: introduce `copy_region_from` for mito engine by [@WenyXu](https://github.com/WenyXu) in [#7389](https://github.com/GreptimeTeam/greptimedb/pull/7389)
* feat: support function aliases and add MySQL-compatible aliases by [@killme2008](https://github.com/killme2008) in [#7410](https://github.com/GreptimeTeam/greptimedb/pull/7410)
* feat(vector_index): adds the foundational types and SQL parsing support for vector index by [@killme2008](https://github.com/killme2008) in [#7366](https://github.com/GreptimeTeam/greptimedb/pull/7366)

### 🐛 Bug Fixes

* fix: reset cached channel on errors with VIP by [@fengjiachun](https://github.com/fengjiachun) in [#7335](https://github.com/GreptimeTeam/greptimedb/pull/7335)
* fix: configure HTTP/2 keep-alive for heartbeat client to detect network failures faster by [@WenyXu](https://github.com/WenyXu) in [#7344](https://github.com/GreptimeTeam/greptimedb/pull/7344)
* fix: regression with shortcutted statement on postgres extended query by [@sunng87](https://github.com/sunng87) in [#7340](https://github.com/GreptimeTeam/greptimedb/pull/7340)
* fix: use saturating in gc tracker by [@discord9](https://github.com/discord9) in [#7369](https://github.com/GreptimeTeam/greptimedb/pull/7369)
* fix: part sort behavior by [@waynexia](https://github.com/waynexia) in [#7374](https://github.com/GreptimeTeam/greptimedb/pull/7374)
* fix: improve network failure detection by [@WenyXu](https://github.com/WenyXu) in [#7382](https://github.com/GreptimeTeam/greptimedb/pull/7382)
* fix(procedure): update procedure state correctly during execution and on failure by [@WenyXu](https://github.com/WenyXu) in [#7376](https://github.com/GreptimeTeam/greptimedb/pull/7376)
* fix: gc listing op first by [@discord9](https://github.com/discord9) in [#7385](https://github.com/GreptimeTeam/greptimedb/pull/7385)
* fix: parse "KEEP FIRING FOR" by [@fengys1996](https://github.com/fengys1996) in [#7386](https://github.com/GreptimeTeam/greptimedb/pull/7386)
* fix: promql histogram with aggregation by [@waynexia](https://github.com/waynexia) in [#7393](https://github.com/GreptimeTeam/greptimedb/pull/7393)
* fix: promql offset direction by [@waynexia](https://github.com/waynexia) in [#7392](https://github.com/GreptimeTeam/greptimedb/pull/7392)
* fix: TLS option validate and merge by [@shuiyisong](https://github.com/shuiyisong) in [#7401](https://github.com/GreptimeTeam/greptimedb/pull/7401)
* fix: cpu cores got wrongly calculated to 0 by [@MichaelScofield](https://github.com/MichaelScofield) in [#7405](https://github.com/GreptimeTeam/greptimedb/pull/7405)
* fix: use verified recycling method for PostgreSQL connection pool by [@WenyXu](https://github.com/WenyXu) in [#7407](https://github.com/GreptimeTeam/greptimedb/pull/7407)
* fix(servers): flight stuck on waiting for first message by [@v0y4g3r](https://github.com/v0y4g3r) in [#7413](https://github.com/GreptimeTeam/greptimedb/pull/7413)
* fix: using anonymous s3 access when ak and sk is not provided by [@shuiyisong](https://github.com/shuiyisong) in [#7425](https://github.com/GreptimeTeam/greptimedb/pull/7425)

### 🚜 Refactor

* refactor(servers): allow custom flight service by [@v0y4g3r](https://github.com/v0y4g3r) in [#7333](https://github.com/GreptimeTeam/greptimedb/pull/7333)
* refactor(servers): bulk insert service by [@v0y4g3r](https://github.com/v0y4g3r) in [#7329](https://github.com/GreptimeTeam/greptimedb/pull/7329)
* refactor: remove datafusion data frame wrapper by [@waynexia](https://github.com/waynexia) in [#7347](https://github.com/GreptimeTeam/greptimedb/pull/7347)
* refactor: use versioned index for index file by [@discord9](https://github.com/discord9) in [#7309](https://github.com/GreptimeTeam/greptimedb/pull/7309)
* refactor: extract file watcher to common-config by [@shuiyisong](https://github.com/shuiyisong) in [#7357](https://github.com/GreptimeTeam/greptimedb/pull/7357)
* refactor: remove duplication coverage and code from window sort tests by [@waynexia](https://github.com/waynexia) in [#7384](https://github.com/GreptimeTeam/greptimedb/pull/7384)
* refactor: optimize heartbeat channel and etcd client keepalive settings by [@WenyXu](https://github.com/WenyXu) in [#7390](https://github.com/GreptimeTeam/greptimedb/pull/7390)

### ⚡ Performance

* perf: treat DISTINCT as comm/part-comm by [@waynexia](https://github.com/waynexia) in [#7348](https://github.com/GreptimeTeam/greptimedb/pull/7348)

### 🧪 Testing

* test: gc worker scheduler mock test by [@discord9](https://github.com/discord9) in [#7292](https://github.com/GreptimeTeam/greptimedb/pull/7292)
* test: test_tracker_cleanup skip non linux by [@discord9](https://github.com/discord9) in [#7398](https://github.com/GreptimeTeam/greptimedb/pull/7398)

### ⚙️ Miscellaneous Tasks

* chore: members and committers update by [@fengjiachun](https://github.com/fengjiachun) in [#7341](https://github.com/GreptimeTeam/greptimedb/pull/7341)
* chore: rm unnecessary warning by [@discord9](https://github.com/discord9) in [#7352](https://github.com/GreptimeTeam/greptimedb/pull/7352)
* chore: rename to avoid git reserved name by [@discord9](https://github.com/discord9) in [#7359](https://github.com/GreptimeTeam/greptimedb/pull/7359)
* chore(mito): expose some symbols by [@v0y4g3r](https://github.com/v0y4g3r) in [#7373](https://github.com/GreptimeTeam/greptimedb/pull/7373)
* chore: saturating duration since by [@discord9](https://github.com/discord9) in [#7380](https://github.com/GreptimeTeam/greptimedb/pull/7380)
* chore(mito): nit avoid clone the batch object on inverted index building by [@lyang24](https://github.com/lyang24) in [#7388](https://github.com/GreptimeTeam/greptimedb/pull/7388)
* chore: sort histogram sqlness result by [@waynexia](https://github.com/waynexia) in [#7406](https://github.com/GreptimeTeam/greptimedb/pull/7406)
* chore: add `is_initialized` method for frontend client by [@fengys1996](https://github.com/fengys1996) in [#7409](https://github.com/GreptimeTeam/greptimedb/pull/7409)
* chore: expose symbols by [@v0y4g3r](https://github.com/v0y4g3r) in [#7417](https://github.com/GreptimeTeam/greptimedb/pull/7417)
* chore: change etcd endpoints to array in the test scripts by [@daviderli614](https://github.com/daviderli614) in [#7419](https://github.com/GreptimeTeam/greptimedb/pull/7419)
* chore: bump version to beta.3 by [@discord9](https://github.com/discord9) in [#7423](https://github.com/GreptimeTeam/greptimedb/pull/7423)
* chore: feature gate vector_index by [@discord9](https://github.com/discord9) in [#7428](https://github.com/GreptimeTeam/greptimedb/pull/7428)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@MichaelScofield](https://github.com/MichaelScofield), [@WenyXu](https://github.com/WenyXu), [@ZonaHex](https://github.com/ZonaHex), [@daviderli614](https://github.com/daviderli614), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@fengys1996](https://github.com/fengys1996), [@killme2008](https://github.com/killme2008), [@lyang24](https://github.com/lyang24), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia)


