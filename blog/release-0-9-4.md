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

# v0.10.0-cd4bf239d-20240925-1727244173

Release date: September 25, 2024

## Breaking changes

* refactor!: add processor builder and transform buidler by [@paomian](https://github.com/paomian) in [#4571](https://github.com/GreptimeTeam/greptimedb/pull/4571)
* refactor!: simplify NativeType trait and remove percentile UDAF by [@waynexia](https://github.com/waynexia) in [#4758](https://github.com/GreptimeTeam/greptimedb/pull/4758)

### 🚀 Features

* feat: add extension field to HeartbeatRequest by [@fengjiachun](https://github.com/fengjiachun) in [#4688](https://github.com/GreptimeTeam/greptimedb/pull/4688)
* feat: add test pipeline api by [@paomian](https://github.com/paomian) in [#4667](https://github.com/GreptimeTeam/greptimedb/pull/4667)
* feat(wal): increase recovery parallelism by [@v0y4g3r](https://github.com/v0y4g3r) in [#4689](https://github.com/GreptimeTeam/greptimedb/pull/4689)
* feat: gRPC auto create table hint by [@fengjiachun](https://github.com/fengjiachun) in [#4700](https://github.com/GreptimeTeam/greptimedb/pull/4700)
* feat: add json data type by [@CookiePieWw](https://github.com/CookiePieWw) in [#4619](https://github.com/GreptimeTeam/greptimedb/pull/4619)
* feat: parallel in row group level under append mode by [@waynexia](https://github.com/waynexia) in [#4704](https://github.com/GreptimeTeam/greptimedb/pull/4704)
* feat: skip caching uncompressed pages if they are large by [@evenyag](https://github.com/evenyag) in [#4705](https://github.com/GreptimeTeam/greptimedb/pull/4705)
* feat(index): add `RangeReader` trait by [@zhongzc](https://github.com/zhongzc) in [#4718](https://github.com/GreptimeTeam/greptimedb/pull/4718)
* feat: add respective get_by_path UDFs for JSON type by [@CookiePieWw](https://github.com/CookiePieWw) in [#4720](https://github.com/GreptimeTeam/greptimedb/pull/4720)
* feat(index): add explicit adapter between `RangeReader` and `AsyncRead` by [@zhongzc](https://github.com/zhongzc) in [#4724](https://github.com/GreptimeTeam/greptimedb/pull/4724)
* feat: add respective `json_is` UDFs for JSON type by [@CookiePieWw](https://github.com/CookiePieWw) in [#4726](https://github.com/GreptimeTeam/greptimedb/pull/4726)
* feat: add an option to turn on compression for arrow output by [@sunng87](https://github.com/sunng87) in [#4730](https://github.com/GreptimeTeam/greptimedb/pull/4730)
* feat: improve support for postgres extended protocol by [@sunng87](https://github.com/sunng87) in [#4721](https://github.com/GreptimeTeam/greptimedb/pull/4721)
* feat: use new image for gcc-10 by [@discord9](https://github.com/discord9) in [#4748](https://github.com/GreptimeTeam/greptimedb/pull/4748)
* feat: flush other workers if still need flush by [@evenyag](https://github.com/evenyag) in [#4746](https://github.com/GreptimeTeam/greptimedb/pull/4746)
* feat: add more h3 scalar functions by [@sunng87](https://github.com/sunng87) in [#4707](https://github.com/GreptimeTeam/greptimedb/pull/4707)
* feat: improve observability for procedure by [@poltao](https://github.com/poltao) in [#4675](https://github.com/GreptimeTeam/greptimedb/pull/4675)
* feat: migrate local WAL regions by [@WenyXu](https://github.com/WenyXu) in [#4715](https://github.com/GreptimeTeam/greptimedb/pull/4715)
* feat: list/array/timezone support for postgres output by [@sunng87](https://github.com/sunng87) in [#4727](https://github.com/GreptimeTeam/greptimedb/pull/4727)
* feat: include order by to commutativity rule set by [@waynexia](https://github.com/waynexia) in [#4753](https://github.com/GreptimeTeam/greptimedb/pull/4753)
* feat: returning warning instead of error on unsupported `SET` statement by [@sunng87](https://github.com/sunng87) in [#4761](https://github.com/GreptimeTeam/greptimedb/pull/4761)

### 🐛 Bug Fixes

* fix: unconditional statistics by [@waynexia](https://github.com/waynexia) in [#4694](https://github.com/GreptimeTeam/greptimedb/pull/4694)
* fix: table resolving logic related to pg_catalog by [@J0HN50N133](https://github.com/J0HN50N133) in [#4580](https://github.com/GreptimeTeam/greptimedb/pull/4580)
* fix: return version string based on request protocol by [@sunng87](https://github.com/sunng87) in [#4680](https://github.com/GreptimeTeam/greptimedb/pull/4680)
* fix: support append-only physical table by [@waynexia](https://github.com/waynexia) in [#4716](https://github.com/GreptimeTeam/greptimedb/pull/4716)
* fix: pipeline dissert error is returned directly to the user, instead of printing a warn log by [@paomian](https://github.com/paomian) in [#4709](https://github.com/GreptimeTeam/greptimedb/pull/4709)
* fix: config test failed and use `similar_asserts::assert_eq` to replace `assert_eq` for long string compare by [@zyy17](https://github.com/zyy17) in [#4731](https://github.com/GreptimeTeam/greptimedb/pull/4731)
* fix: sort cargo toml by [@shuiyisong](https://github.com/shuiyisong) in [#4735](https://github.com/GreptimeTeam/greptimedb/pull/4735)
* fix: determine region role by using is_readonly by [@WenyXu](https://github.com/WenyXu) in [#4725](https://github.com/GreptimeTeam/greptimedb/pull/4725)
* fix: opensrv Use After Free update by [@discord9](https://github.com/discord9) in [#4732](https://github.com/GreptimeTeam/greptimedb/pull/4732)
* fix: use gcc-10 in release dev build by [@discord9](https://github.com/discord9) in [#4741](https://github.com/GreptimeTeam/greptimedb/pull/4741)
* fix: cannot input tag for the dev-builder image by [@daviderli614](https://github.com/daviderli614) in [#4743](https://github.com/GreptimeTeam/greptimedb/pull/4743)
* fix: disable field pruning in last non null mode by [@evenyag](https://github.com/evenyag) in [#4740](https://github.com/GreptimeTeam/greptimedb/pull/4740)
* fix: Release CI & make rustls use `ring` by [@discord9](https://github.com/discord9) in [#4750](https://github.com/GreptimeTeam/greptimedb/pull/4750)

### 🚜 Refactor

* refactor(tables): improve `tables` performance by [@v0y4g3r](https://github.com/v0y4g3r) in [#4737](https://github.com/GreptimeTeam/greptimedb/pull/4737)
* refactor: remove DfPlan wrapper  by [@waynexia](https://github.com/waynexia) in [#4733](https://github.com/GreptimeTeam/greptimedb/pull/4733)
* refactor: unify the styling in `create_or_alter_tables_on_demand` by [@WenyXu](https://github.com/WenyXu) in [#4756](https://github.com/GreptimeTeam/greptimedb/pull/4756)

### 📚 Documentation

* docs: use docs comment prefix and bump toml2docs version by [@zyy17](https://github.com/zyy17) in [#4711](https://github.com/GreptimeTeam/greptimedb/pull/4711)
* docs: json datatype rfc by [@CookiePieWw](https://github.com/CookiePieWw) in [#4515](https://github.com/GreptimeTeam/greptimedb/pull/4515)

### ⚡ Performance

* perf(flow): use batch mode for flow by [@discord9](https://github.com/discord9) in [#4599](https://github.com/GreptimeTeam/greptimedb/pull/4599)

### ⚙️ Miscellaneous Tasks

* chore: update the document link in README.md by [@nicecui](https://github.com/nicecui) in [#4690](https://github.com/GreptimeTeam/greptimedb/pull/4690)
* chore: print downgraded region last_entry_id by [@WenyXu](https://github.com/WenyXu) in [#4701](https://github.com/GreptimeTeam/greptimedb/pull/4701)
* chore: remove unused method by [@fengjiachun](https://github.com/fengjiachun) in [#4703](https://github.com/GreptimeTeam/greptimedb/pull/4703)
* chore: avoid schema check when auto_create_table_hint is disabled by [@fengjiachun](https://github.com/fengjiachun) in [#4712](https://github.com/GreptimeTeam/greptimedb/pull/4712)
* chore: remove `validate_request_with_table` by [@WenyXu](https://github.com/WenyXu) in [#4710](https://github.com/GreptimeTeam/greptimedb/pull/4710)
* chore: refresh route table by [@fengjiachun](https://github.com/fengjiachun) in [#4673](https://github.com/GreptimeTeam/greptimedb/pull/4673)
* chore: enable fuzz test for append table by [@WenyXu](https://github.com/WenyXu) in [#4702](https://github.com/GreptimeTeam/greptimedb/pull/4702)
* chore: add auto-decompression layer for otlp http request by [@shuiyisong](https://github.com/shuiyisong) in [#4723](https://github.com/GreptimeTeam/greptimedb/pull/4723)
* chore: add log ingest interceptor by [@shuiyisong](https://github.com/shuiyisong) in [#4734](https://github.com/GreptimeTeam/greptimedb/pull/4734)
* chore(fuzz): print table name for debugging by [@WenyXu](https://github.com/WenyXu) in [#4738](https://github.com/GreptimeTeam/greptimedb/pull/4738)
* chore: relax table name constraint by [@v0y4g3r](https://github.com/v0y4g3r) in [#4766](https://github.com/GreptimeTeam/greptimedb/pull/4766)

### Build

* build(deps): use original jsonb repo by [@CookiePieWw](https://github.com/CookiePieWw) in [#4742](https://github.com/GreptimeTeam/greptimedb/pull/4742)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@CookiePieWw](https://github.com/CookiePieWw), [@J0HN50N133](https://github.com/J0HN50N133), [@WenyXu](https://github.com/WenyXu), [@daviderli614](https://github.com/daviderli614), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@nicecui](https://github.com/nicecui), [@paomian](https://github.com/paomian), [@poltao](https://github.com/poltao), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@zhongzc](https://github.com/zhongzc), [@zyy17](https://github.com/zyy17)


