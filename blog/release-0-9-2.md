---
date: 2024-08-19
---

# v0.9.2

Release date: August 19, 2024

## 👍 Highlights

- [#4545](https://github.com/GreptimeTeam/greptimedb/pull/4545): Improve the performance of `count(*)` for append-only tables.
- [#4552](https://github.com/GreptimeTeam/greptimedb/pull/4552): Allow more than one segment for full-text index to handle a large number of rows.

### 🚀 Features

* feat: introduce new kafka topic consumer respecting WAL index by [@WenyXu](https://github.com/WenyXu) in [#4424](https://github.com/GreptimeTeam/greptimedb/pull/4424)
* feat: flow recreate on reboot by [@discord9](https://github.com/discord9) in [#4509](https://github.com/GreptimeTeam/greptimedb/pull/4509)
* feat: change the default selector to RoundRobin by [@fengjiachun](https://github.com/fengjiachun) in [#4528](https://github.com/GreptimeTeam/greptimedb/pull/4528)
* feat: add SASL  and TLS config for Kafka client by [@WenyXu](https://github.com/WenyXu) in [#4536](https://github.com/GreptimeTeam/greptimedb/pull/4536)
* feat(log_store): introduce the `IndexCollector` by [@WenyXu](https://github.com/WenyXu) in [#4461](https://github.com/GreptimeTeam/greptimedb/pull/4461)
* feat(flow): add some metrics by [@discord9](https://github.com/discord9) in [#4539](https://github.com/GreptimeTeam/greptimedb/pull/4539)
* feat(flow): add `eval_batch` for ScalarExpr by [@discord9](https://github.com/discord9) in [#4551](https://github.com/GreptimeTeam/greptimedb/pull/4551)
* feat: implement postgres kvbackend by [@lyang24](https://github.com/lyang24) in [#4421](https://github.com/GreptimeTeam/greptimedb/pull/4421)
* feat: add GcsConfig credential field by [@daviderli614](https://github.com/daviderli614) in [#4568](https://github.com/GreptimeTeam/greptimedb/pull/4568)
* feat: able to handle concurrent region edit requests by [@MichaelScofield](https://github.com/MichaelScofield) in [#4569](https://github.com/GreptimeTeam/greptimedb/pull/4569)
* feat(log_store): introduce the CollectionTask by [@WenyXu](https://github.com/WenyXu) in [#4530](https://github.com/GreptimeTeam/greptimedb/pull/4530)

### 🐛 Bug Fixes

* fix(tql): avoid unwrap on parsing tql query  by [@waynexia](https://github.com/waynexia) in [#4502](https://github.com/GreptimeTeam/greptimedb/pull/4502)
* fix: too large shadow-rs constants by [@MichaelScofield](https://github.com/MichaelScofield) in [#4506](https://github.com/GreptimeTeam/greptimedb/pull/4506)
* fix: fix incorrect result of topk with cte  by [@waynexia](https://github.com/waynexia) in [#4523](https://github.com/GreptimeTeam/greptimedb/pull/4523)
* fix: install script by [@v0y4g3r](https://github.com/v0y4g3r) in [#4527](https://github.com/GreptimeTeam/greptimedb/pull/4527)
* fix: larger stack size in debug mode by [@discord9](https://github.com/discord9) in [#4521](https://github.com/GreptimeTeam/greptimedb/pull/4521)
* fix: rollback only if dropping the metric physical table fails by [@WenyXu](https://github.com/WenyXu) in [#4525](https://github.com/GreptimeTeam/greptimedb/pull/4525)
* fix: configuration example for selector by [@sunng87](https://github.com/sunng87) in [#4532](https://github.com/GreptimeTeam/greptimedb/pull/4532)
* fix:  change the type of oid in pg_namespace to u32 by [@J0HN50N133](https://github.com/J0HN50N133) in [#4541](https://github.com/GreptimeTeam/greptimedb/pull/4541)
* fix: append table stats by [@v0y4g3r](https://github.com/v0y4g3r) in [#4561](https://github.com/GreptimeTeam/greptimedb/pull/4561)
* fix(fulltext-index): single segment is not sufficient for >50M rows SST by [@zhongzc](https://github.com/zhongzc) in [#4552](https://github.com/GreptimeTeam/greptimedb/pull/4552)
* fix(common_version): short_version with empty branch by [@leaf-potato](https://github.com/leaf-potato) in [#4572](https://github.com/GreptimeTeam/greptimedb/pull/4572)
* fix(sqlness): redact all volatile text by [@v0y4g3r](https://github.com/v0y4g3r) in [#4583](https://github.com/GreptimeTeam/greptimedb/pull/4583)

### 🚜 Refactor

* refactor: reuse aligned ts array in range manipulate exec by [@waynexia](https://github.com/waynexia) in [#4535](https://github.com/GreptimeTeam/greptimedb/pull/4535)
* refactor(plugin): add SetupPlugin and StartPlugin error by [@zyy17](https://github.com/zyy17) in [#4554](https://github.com/GreptimeTeam/greptimedb/pull/4554)

### 📚 Documentation

* docs: add v0.9.1 bench result by [@evenyag](https://github.com/evenyag) in [#4511](https://github.com/GreptimeTeam/greptimedb/pull/4511)
* docs: Adds more panels to grafana dashboards by [@evenyag](https://github.com/evenyag) in [#4540](https://github.com/GreptimeTeam/greptimedb/pull/4540)
* docs: update grafana readme by [@evenyag](https://github.com/evenyag) in [#4550](https://github.com/GreptimeTeam/greptimedb/pull/4550)

### ⚡ Performance

* perf: merge small byte ranges for optimized fetching by [@WenyXu](https://github.com/WenyXu) in [#4520](https://github.com/GreptimeTeam/greptimedb/pull/4520)
* perf: count(*) for append-only tables  by [@v0y4g3r](https://github.com/v0y4g3r) in [#4545](https://github.com/GreptimeTeam/greptimedb/pull/4545)
* perf: Optimizing pipeline performance by [@paomian](https://github.com/paomian) in [#4390](https://github.com/GreptimeTeam/greptimedb/pull/4390)

### 🧪 Testing

* test: more on processors by [@shuiyisong](https://github.com/shuiyisong) in [#4493](https://github.com/GreptimeTeam/greptimedb/pull/4493)

### ⚙️ Miscellaneous Tasks

* chore: bump opendal version to 0.48 by [@WenyXu](https://github.com/WenyXu) in [#4499](https://github.com/GreptimeTeam/greptimedb/pull/4499)
* chore: bump `shadow-rs` version to set the path to find the correct git repo by [@MichaelScofield](https://github.com/MichaelScofield) in [#4494](https://github.com/GreptimeTeam/greptimedb/pull/4494)
* chore: bump rust-postgres to 0.7.11 by [@WenyXu](https://github.com/WenyXu) in [#4504](https://github.com/GreptimeTeam/greptimedb/pull/4504)
* chore: reduce fuzz tests in CI by [@WenyXu](https://github.com/WenyXu) in [#4505](https://github.com/GreptimeTeam/greptimedb/pull/4505)
* chore: set default `otlp_endpoint` by [@WenyXu](https://github.com/WenyXu) in [#4508](https://github.com/GreptimeTeam/greptimedb/pull/4508)
* chore: support swcs as the short name for strict window compaction by [@v0y4g3r](https://github.com/v0y4g3r) in [#4517](https://github.com/GreptimeTeam/greptimedb/pull/4517)
* ci: squeeze some disk space for complex fuzz tests by [@MichaelScofield](https://github.com/MichaelScofield) in [#4519](https://github.com/GreptimeTeam/greptimedb/pull/4519)
* ci: fix windows temp path by [@evenyag](https://github.com/evenyag) in [#4518](https://github.com/GreptimeTeam/greptimedb/pull/4518)
* chore: use `configData` by [@WenyXu](https://github.com/WenyXu) in [#4522](https://github.com/GreptimeTeam/greptimedb/pull/4522)
* chore: update snafu to make clippy happy by [@MichaelScofield](https://github.com/MichaelScofield) in [#4507](https://github.com/GreptimeTeam/greptimedb/pull/4507)
* ci: download the latest stable released version by default and do some small refactoring by [@zyy17](https://github.com/zyy17) in [#4529](https://github.com/GreptimeTeam/greptimedb/pull/4529)
* chore: make mysql server version changeable by [@MichaelScofield](https://github.com/MichaelScofield) in [#4531](https://github.com/GreptimeTeam/greptimedb/pull/4531)
* chore: upload kind logs by [@WenyXu](https://github.com/WenyXu) in [#4544](https://github.com/GreptimeTeam/greptimedb/pull/4544)
* chore: update validator signature by [@shuiyisong](https://github.com/shuiyisong) in [#4548](https://github.com/GreptimeTeam/greptimedb/pull/4548)
* chore: Helper function to convert `Vec<Value>` to VectorRef by [@discord9](https://github.com/discord9) in [#4546](https://github.com/GreptimeTeam/greptimedb/pull/4546)
* chore: set topic to 3 for sqlness test by [@discord9](https://github.com/discord9) in [#4560](https://github.com/GreptimeTeam/greptimedb/pull/4560)
* chore: remove unused code by [@WenyXu](https://github.com/WenyXu) in [#4559](https://github.com/GreptimeTeam/greptimedb/pull/4559)
* chore(log_store): remove redundant metrics by [@WenyXu](https://github.com/WenyXu) in [#4570](https://github.com/GreptimeTeam/greptimedb/pull/4570)
* chore: bump version to v0.9.2 by [@zhongzc](https://github.com/zhongzc) in [#4581](https://github.com/GreptimeTeam/greptimedb/pull/4581)
* chore: setup kafka before downloading binary step by [@WenyXu](https://github.com/WenyXu) in [#4582](https://github.com/GreptimeTeam/greptimedb/pull/4582)

### Build

* build(deps): bump zerovec-derive from 0.10.2 to 0.10.3 by [@dependabot[bot]](https://github.com/dependabot[bot]) in [#4346](https://github.com/GreptimeTeam/greptimedb/pull/4346)
* build(deps): bump zerovec from 0.10.2 to 0.10.4 by [@dependabot[bot]](https://github.com/dependabot[bot]) in [#4335](https://github.com/GreptimeTeam/greptimedb/pull/4335)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@J0HN50N133](https://github.com/J0HN50N133), [@MichaelScofield](https://github.com/MichaelScofield), [@WenyXu](https://github.com/WenyXu), [@daviderli614](https://github.com/daviderli614), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@leaf-potato](https://github.com/leaf-potato), [@lyang24](https://github.com/lyang24), [@paomian](https://github.com/paomian), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@zhongzc](https://github.com/zhongzc), [@zyy17](https://github.com/zyy17)
