---
keywords: [release, GreptimeDB, changelog, v0.17.1]
description: GreptimeDB v0.17.1 Changelog
date: 2025-09-17
---

# v0.17.1

Release date: September 17, 2025

**If you are using [v0.17.0](https://github.com/GreptimeTeam/greptimedb/releases/tag/v0.17.1), we recommend upgrading to [v0.17.1](https://github.com/GreptimeTeam/greptimedb/releases/tag/v0.17.1).**

v0.17.1 improves overall reliability and includes important bug fixes, addressing critical issues such as SST metadata truncation that could lead to process panics, deadlocks during OpenTelemetry ingestion, and correcting SubqueryAlias pushdown to resolve subquery alias performance issues.

### 🚀 Features

* feat: skip compaction on large file on append only mode by [@waynexia](https://github.com/waynexia) in [#6838](https://github.com/GreptimeTeam/greptimedb/pull/6838)
* feat(query): better alias tracker by [@discord9](https://github.com/discord9) in [#6909](https://github.com/GreptimeTeam/greptimedb/pull/6909)
* feat: update dashboard to v0.11.4 by [@ZonaHex](https://github.com/ZonaHex) in [#6956](https://github.com/GreptimeTeam/greptimedb/pull/6956)
* feat: add postgres tls support for CLI by [@WenyXu](https://github.com/WenyXu) in [#6941](https://github.com/GreptimeTeam/greptimedb/pull/6941)
* feat: support `SubqueryAlias` pushdown by [@discord9](https://github.com/discord9) in [#6963](https://github.com/GreptimeTeam/greptimedb/pull/6963)

### 🐛 Bug Fixes

* fix: fix deploy greptimedb in sqlness-test by [@daviderli614](https://github.com/daviderli614) in [#6894](https://github.com/GreptimeTeam/greptimedb/pull/6894)
* fix: wrap tql cte in a subquery alias by [@waynexia](https://github.com/waynexia) in [#6910](https://github.com/GreptimeTeam/greptimedb/pull/6910)
* fix: handle hash distribution properly by [@waynexia](https://github.com/waynexia) in [#6943](https://github.com/GreptimeTeam/greptimedb/pull/6943)
* fix(path): fix program lookup failure on Windows CI by [@cscnk52](https://github.com/cscnk52) in [#6946](https://github.com/GreptimeTeam/greptimedb/pull/6946)
* fix: unstable query sort results by [@killme2008](https://github.com/killme2008) in [#6944](https://github.com/GreptimeTeam/greptimedb/pull/6944)
* fix: count(1) instead of count(ts) when >1 inputs by [@discord9](https://github.com/discord9) in [#6952](https://github.com/GreptimeTeam/greptimedb/pull/6952)
* fix: use `pull_request_target` to fix add labels 403 error by [@zyy17](https://github.com/zyy17) in [#6958](https://github.com/GreptimeTeam/greptimedb/pull/6958)
* fix: correct jemalloc metrics by [@fengys1996](https://github.com/fengys1996) in [#6959](https://github.com/GreptimeTeam/greptimedb/pull/6959)
* fix: shorten lock time by [@shuiyisong](https://github.com/shuiyisong) in [#6968](https://github.com/GreptimeTeam/greptimedb/pull/6968)
* fix: deadlock in dashmap by [@shuiyisong](https://github.com/shuiyisong) in [#6978](https://github.com/GreptimeTeam/greptimedb/pull/6978)
* fix: clean intm ignore notfound by [@zhongzc](https://github.com/zhongzc) in [#6971](https://github.com/GreptimeTeam/greptimedb/pull/6971)
* fix: avoid truncating SST statistics during flush by [@v0y4g3r](https://github.com/v0y4g3r) in [#6977](https://github.com/GreptimeTeam/greptimedb/pull/6977)
* fix: OTel metrics naming with Prometheus style by [@shuiyisong](https://github.com/shuiyisong) in [#6982](https://github.com/GreptimeTeam/greptimedb/pull/6982)

### 🧪 Testing

* test: adds approx_percentile_cont to range query test by [@killme2008](https://github.com/killme2008) in [#6903](https://github.com/GreptimeTeam/greptimedb/pull/6903)
* test: migrate duckdb tests, part 1 by [@killme2008](https://github.com/killme2008) in [#6870](https://github.com/GreptimeTeam/greptimedb/pull/6870)
* test: migrate join tests from duckdb, part3 by [@killme2008](https://github.com/killme2008) in [#6881](https://github.com/GreptimeTeam/greptimedb/pull/6881)

### ⚙️ Miscellaneous Tasks

* chore: reduce SeriesScan sender timeout by [@evenyag](https://github.com/evenyag) in [#6983](https://github.com/GreptimeTeam/greptimedb/pull/6983)

## New Contributors

* [@cscnk52](https://github.com/cscnk52) made their first contribution in [#6946](https://github.com/GreptimeTeam/greptimedb/pull/6946)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@WenyXu](https://github.com/WenyXu), [@ZonaHex](https://github.com/ZonaHex), [@cscnk52](https://github.com/cscnk52), [@daviderli614](https://github.com/daviderli614), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengys1996](https://github.com/fengys1996), [@killme2008](https://github.com/killme2008), [@shuiyisong](https://github.com/shuiyisong), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@zhongzc](https://github.com/zhongzc), [@zyy17](https://github.com/zyy17)