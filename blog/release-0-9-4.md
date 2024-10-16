---
date: 2024-10-15
---

# v0.9.4

Release date: October 15, 2024

## Breaking changes

* feat!: move v1/prof API to debug/prof by [@evenyag](https://github.com/evenyag) in [#4810](https://github.com/GreptimeTeam/greptimedb/pull/4810)
* feat!: implement interval type by multiple structs by [@evenyag](https://github.com/evenyag) in [#4772](https://github.com/GreptimeTeam/greptimedb/pull/4772)

### 🚀 Features

* feat: protect datanode with concurrency limit. by [@lyang24](https://github.com/lyang24) in [#4699](https://github.com/GreptimeTeam/greptimedb/pull/4699)
* feat: add `region_statistics` table by [@WenyXu](https://github.com/WenyXu) in [#4771](https://github.com/GreptimeTeam/greptimedb/pull/4771)
* feat(mito): limit compaction output file size by [@v0y4g3r](https://github.com/v0y4g3r) in [#4754](https://github.com/GreptimeTeam/greptimedb/pull/4754)
* feat: add a new status code for "external" errors by [@MichaelScofield](https://github.com/MichaelScofield) in [#4775](https://github.com/GreptimeTeam/greptimedb/pull/4775)
* feat: unordered scanner scans data by time ranges by [@evenyag](https://github.com/evenyag) in [#4757](https://github.com/GreptimeTeam/greptimedb/pull/4757)
* feat: add `StatementStatistics` for slow query logging implementation by [@zyy17](https://github.com/zyy17) in [#4719](https://github.com/GreptimeTeam/greptimedb/pull/4719)
* feat: support to reject write after flushing by [@WenyXu](https://github.com/WenyXu) in [#4759](https://github.com/GreptimeTeam/greptimedb/pull/4759)
* feat: add `add_handler_after`, `add_handler_before`, `replace_handler` by [@WenyXu](https://github.com/WenyXu) in [#4788](https://github.com/GreptimeTeam/greptimedb/pull/4788)
* feat: customize channel information for sqlness tests by [@J0HN50N133](https://github.com/J0HN50N133) in [#4729](https://github.com/GreptimeTeam/greptimedb/pull/4729)
* feat: set max log files to 720 by default, info log only by [@Kev1n8](https://github.com/Kev1n8) in [#4787](https://github.com/GreptimeTeam/greptimedb/pull/4787)
* feat: introduce `HeartbeatHandlerGroupBuilderCustomizer` by [@WenyXu](https://github.com/WenyXu) in [#4803](https://github.com/GreptimeTeam/greptimedb/pull/4803)
* feat: add function to aggregate path into a geojson path by [@sunng87](https://github.com/sunng87) in [#4798](https://github.com/GreptimeTeam/greptimedb/pull/4798)
* feat: add json format output for http interface by [@Kev1n8](https://github.com/Kev1n8) in [#4797](https://github.com/GreptimeTeam/greptimedb/pull/4797)
* feat: Merge sort Logical plan by [@discord9](https://github.com/discord9) in [#4768](https://github.com/GreptimeTeam/greptimedb/pull/4768)
* feat: json_path_exists udf by [@CookiePieWw](https://github.com/CookiePieWw) in [#4807](https://github.com/GreptimeTeam/greptimedb/pull/4807)
* feat: expose `RegionMigrationManagerRef` by [@WenyXu](https://github.com/WenyXu) in [#4812](https://github.com/GreptimeTeam/greptimedb/pull/4812)
* feat: information extension by [@fengjiachun](https://github.com/fengjiachun) in [#4811](https://github.com/GreptimeTeam/greptimedb/pull/4811)
* feat: introduce `LeadershipChangeNotifier` and `LeadershipChangeListener` by [@WenyXu](https://github.com/WenyXu) in [#4817](https://github.com/GreptimeTeam/greptimedb/pull/4817)
* feat: add more h3 functions by [@sunng87](https://github.com/sunng87) in [#4770](https://github.com/GreptimeTeam/greptimedb/pull/4770)
* feat: remove the distributed lock by [@fengjiachun](https://github.com/fengjiachun) in [#4825](https://github.com/GreptimeTeam/greptimedb/pull/4825)
* feat: enable prof features by default by [@evenyag](https://github.com/evenyag) in [#4815](https://github.com/GreptimeTeam/greptimedb/pull/4815)
* feat: cache logical region's metadata by [@waynexia](https://github.com/waynexia) in [#4827](https://github.com/GreptimeTeam/greptimedb/pull/4827)
* feat: defer `HeartbeatHandlerGroup` construction  and enhance `LeadershipChangeNotifier` by [@WenyXu](https://github.com/WenyXu) in [#4826](https://github.com/GreptimeTeam/greptimedb/pull/4826)
* feat: add some s2 geo functions by [@sunng87](https://github.com/sunng87) in [#4823](https://github.com/GreptimeTeam/greptimedb/pull/4823)
* feat: introduce default customizers by [@WenyXu](https://github.com/WenyXu) in [#4831](https://github.com/GreptimeTeam/greptimedb/pull/4831)

### 🐛 Bug Fixes

* fix: use information_schema returns Unknown database  by [@J0HN50N133](https://github.com/J0HN50N133) in [#4774](https://github.com/GreptimeTeam/greptimedb/pull/4774)
* fix: dead loop on detecting postgres ssl handshake by [@sunng87](https://github.com/sunng87) in [#4778](https://github.com/GreptimeTeam/greptimedb/pull/4778)
* fix: update pgwire for potential issue with connection establish by [@sunng87](https://github.com/sunng87) in [#4783](https://github.com/GreptimeTeam/greptimedb/pull/4783)
* fix(sqlness): sqlness isolation by [@v0y4g3r](https://github.com/v0y4g3r) in [#4780](https://github.com/GreptimeTeam/greptimedb/pull/4780)
* fix: ts conversion during transform phase by [@shuiyisong](https://github.com/shuiyisong) in [#4790](https://github.com/GreptimeTeam/greptimedb/pull/4790)
* fix: Panic in UNION ALL queries by [@v0y4g3r](https://github.com/v0y4g3r) in [#4796](https://github.com/GreptimeTeam/greptimedb/pull/4796)
* fix: error in admin function is not formatted properly by [@waynexia](https://github.com/waynexia) in [#4820](https://github.com/GreptimeTeam/greptimedb/pull/4820)
* fix: correct table name formatting by [@WenyXu](https://github.com/WenyXu) in [#4819](https://github.com/GreptimeTeam/greptimedb/pull/4819)
* fix: case sensitive for __field__ matcher by [@waynexia](https://github.com/waynexia) in [#4822](https://github.com/GreptimeTeam/greptimedb/pull/4822)

### 🚜 Refactor

* refactor: Change the error type in the pipeline crate from String to Error by [@paomian](https://github.com/paomian) in [#4763](https://github.com/GreptimeTeam/greptimedb/pull/4763)
* refactor: introduce `HeartbeatHandlerGroupBuilder` by [@WenyXu](https://github.com/WenyXu) in [#4785](https://github.com/GreptimeTeam/greptimedb/pull/4785)
* refactor: change sqlness ports to avoid conflict with local instance by [@sunng87](https://github.com/sunng87) in [#4794](https://github.com/GreptimeTeam/greptimedb/pull/4794)
* refactor: replace info logs with debug logs in region server by [@waynexia](https://github.com/waynexia) in [#4829](https://github.com/GreptimeTeam/greptimedb/pull/4829)

### 📚 Documentation

* docs: add TM to logos by [@evenyag](https://github.com/evenyag) in [#4789](https://github.com/GreptimeTeam/greptimedb/pull/4789)

### ⚙️ Miscellaneous Tasks

* chore: make sure aws-lc-sys wouldn't be built by [@discord9](https://github.com/discord9) in [#4767](https://github.com/GreptimeTeam/greptimedb/pull/4767)
* chore: replace anymap with anymap2 by [@v0y4g3r](https://github.com/v0y4g3r) in [#4781](https://github.com/GreptimeTeam/greptimedb/pull/4781)
* chore: add json write by [@paomian](https://github.com/paomian) in [#4744](https://github.com/GreptimeTeam/greptimedb/pull/4744)
* chore: bump promql-parser to v0.4.1 and use `to_string()` for EvalStmt by [@zyy17](https://github.com/zyy17) in [#4832](https://github.com/GreptimeTeam/greptimedb/pull/4832)
* chore: bump version v0.9.4 by [@discord9](https://github.com/discord9) in [#4833](https://github.com/GreptimeTeam/greptimedb/pull/4833)

## New Contributors

* [@Kev1n8](https://github.com/Kev1n8) made their first contribution in [#4797](https://github.com/GreptimeTeam/greptimedb/pull/4797)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@CookiePieWw](https://github.com/CookiePieWw), [@J0HN50N133](https://github.com/J0HN50N133), [@Kev1n8](https://github.com/Kev1n8), [@MichaelScofield](https://github.com/MichaelScofield), [@WenyXu](https://github.com/WenyXu), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@lyang24](https://github.com/lyang24), [@paomian](https://github.com/paomian), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@zyy17](https://github.com/zyy17)


