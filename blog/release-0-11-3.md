---
keywords: [release, GreptimeDB, changelog, v0.11.3]
description: GreptimeDB v0.11.3 Changelog
date: 2025-01-24
---

# v0.11.3

Release date: January 24, 2025


This version fixes the following issues:
- Panics when processing `matches()` or invalid queries.
- Altering compaction time window doesn't take effect.


### 🚀 Features

* feat: set default compaction parallelism by [@waynexia](https://github.com/waynexia) in [#5371](https://github.com/GreptimeTeam/greptimedb/pull/5371)
* feat: overwrites inferred compaction window by region options by [@evenyag](https://github.com/evenyag) in [#5396](https://github.com/GreptimeTeam/greptimedb/pull/5396)



### 🐛 Bug Fixes

* fix: handle insert default value by [@discord9](https://github.com/discord9) in [#5307](https://github.com/GreptimeTeam/greptimedb/pull/5307)
* fix: matches incorrectly uses byte len as char len by [@zhongzc](https://github.com/zhongzc) in [#5411](https://github.com/GreptimeTeam/greptimedb/pull/5411)
* fix: panic when received invalid query string by [@waynexia](https://github.com/waynexia) in [#5366](https://github.com/GreptimeTeam/greptimedb/pull/5366)
* fix: avoid suppress manual compaction by [@v0y4g3r](https://github.com/v0y4g3r) in [#5399](https://github.com/GreptimeTeam/greptimedb/pull/5399)
* fix(log-query): panic on prometheus by [@waynexia](https://github.com/waynexia) in [#5429](https://github.com/GreptimeTeam/greptimedb/pull/5429)


### 🚜 Refactor

* refactor: optimize out partition split insert requests by [@MichaelScofield](https://github.com/MichaelScofield) in [#5298](https://github.com/GreptimeTeam/greptimedb/pull/5298)


### ⚙️ Miscellaneous Tasks

* ci: disable docker/rust cache temporarily and merge docker compose files by [@sunng87](https://github.com/sunng87) in [#5293](https://github.com/GreptimeTeam/greptimedb/pull/5293)
* ci: do not trigger tests when there is a merge conflict by [@sunng87](https://github.com/sunng87) in [#5318](https://github.com/GreptimeTeam/greptimedb/pull/5318)
* ci: use mold for tests by [@sunng87](https://github.com/sunng87) in [#5319](https://github.com/GreptimeTeam/greptimedb/pull/5319)
* ci: disable cache for some tasks, create cache in nightly build by [@sunng87](https://github.com/sunng87) in [#5324](https://github.com/GreptimeTeam/greptimedb/pull/5324)
* ci: do not collect coverage from pull request any more by [@sunng87](https://github.com/sunng87) in [#5364](https://github.com/GreptimeTeam/greptimedb/pull/5364)
* ci: automatically bump doc version when release GreptimeDB by [@nicecui](https://github.com/nicecui) in [#5343](https://github.com/GreptimeTeam/greptimedb/pull/5343)
* ci: use arm builders for tests by [@sunng87](https://github.com/sunng87) in [#5395](https://github.com/GreptimeTeam/greptimedb/pull/5395)
* ci: revert coverage runner by [@sunng87](https://github.com/sunng87) in [#5403](https://github.com/GreptimeTeam/greptimedb/pull/5403)


## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@MichaelScofield](https://github.com/MichaelScofield), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@nicecui](https://github.com/nicecui), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@zhongzc](https://github.com/zhongzc)
