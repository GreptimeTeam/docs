---
date: 2024-08-02
---

# v0.9.1

Release date: August 02, 2024

This is a patch release, containing some important bug fixes:

- [#4447](https://github.com/GreptimeTeam/greptimedb/pull/4447): Full-text search may miss some rows when a full-text index is applied.
- [#4476](https://github.com/GreptimeTeam/greptimedb/pull/4476): Data ingestion can stall due to missing notifications.


**It's highly recommended to upgrade to this version if you're using v0.9.0.**



## Breaking changes

* refactor!: Remove `Mode` from `FrontendOptions` by [@zyy17](https://github.com/zyy17) in [#4401](https://github.com/GreptimeTeam/greptimedb/pull/4401)

### 🚀 Features

* feat: `FLOWS` table in information_schema&SHOW FLOWS by [@discord9](https://github.com/discord9) in [#4386](https://github.com/GreptimeTeam/greptimedb/pull/4386)
* feat: export database data by [@fengjiachun](https://github.com/fengjiachun) in [#4382](https://github.com/GreptimeTeam/greptimedb/pull/4382)
* feat(flow): `flush_flow` function by [@discord9](https://github.com/discord9) in [#4416](https://github.com/GreptimeTeam/greptimedb/pull/4416)
* feat: support pg_namespace, pg_class and related psql command by [@J0HN50N133](https://github.com/J0HN50N133) in [#4428](https://github.com/GreptimeTeam/greptimedb/pull/4428)
* feat: show root cause and db name on the error line by [@sunng87](https://github.com/sunng87) in [#4442](https://github.com/GreptimeTeam/greptimedb/pull/4442)
* feat: track prometheus HTTP API's query latency  by [@waynexia](https://github.com/waynexia) in [#4458](https://github.com/GreptimeTeam/greptimedb/pull/4458)
* feat: support setting time range in Copy From statement by [@realtaobo](https://github.com/realtaobo) in [#4405](https://github.com/GreptimeTeam/greptimedb/pull/4405)
* feat: remove dedicated runtime for grpc, mysql and pg protocols  by [@waynexia](https://github.com/waynexia) in [#4436](https://github.com/GreptimeTeam/greptimedb/pull/4436)
* feat: default export catalog name by [@fengjiachun](https://github.com/fengjiachun) in [#4464](https://github.com/GreptimeTeam/greptimedb/pull/4464)
* feat: track channels with query context and w/rcu by [@sunng87](https://github.com/sunng87) in [#4448](https://github.com/GreptimeTeam/greptimedb/pull/4448)
* feat: hint options for gRPC insert by [@fengjiachun](https://github.com/fengjiachun) in [#4454](https://github.com/GreptimeTeam/greptimedb/pull/4454)
* feat: improve extract hints by [@fengjiachun](https://github.com/fengjiachun) in [#4479](https://github.com/GreptimeTeam/greptimedb/pull/4479)
* feat: export all schemas and data at once in export tool by [@fengjiachun](https://github.com/fengjiachun) in [#4478](https://github.com/GreptimeTeam/greptimedb/pull/4478)
* feat: time poll elapsed for RegionScan plan by [@waynexia](https://github.com/waynexia) in [#4482](https://github.com/GreptimeTeam/greptimedb/pull/4482)
* feat: update dashboard to v0.5.4 by [@ZonaHex](https://github.com/ZonaHex) in [#4483](https://github.com/GreptimeTeam/greptimedb/pull/4483)
* feat(compaction): add file number limits to TWCS compaction by [@v0y4g3r](https://github.com/v0y4g3r) in [#4481](https://github.com/GreptimeTeam/greptimedb/pull/4481)
* feat: enlarge default page cache size by [@evenyag](https://github.com/evenyag) in [#4490](https://github.com/GreptimeTeam/greptimedb/pull/4490)

### 🐛 Bug Fixes

* fix: ensure keep alive is completed in time by [@WenyXu](https://github.com/WenyXu) in [#4349](https://github.com/GreptimeTeam/greptimedb/pull/4349)
* fix: user provider can't be configured by config file or environment variables by [@zyy17](https://github.com/zyy17) in [#4398](https://github.com/GreptimeTeam/greptimedb/pull/4398)
* fix: dictionary key type use u32 by [@evenyag](https://github.com/evenyag) in [#4396](https://github.com/GreptimeTeam/greptimedb/pull/4396)
* fix(wal): handle WAL deletion on region drop by [@v0y4g3r](https://github.com/v0y4g3r) in [#4400](https://github.com/GreptimeTeam/greptimedb/pull/4400)
* fix: add back AuthBackend which is required by custom auth backend by [@sunng87](https://github.com/sunng87) in [#4409](https://github.com/GreptimeTeam/greptimedb/pull/4409)
* fix(fulltext-index): clean up 0-value timer by [@zhongzc](https://github.com/zhongzc) in [#4423](https://github.com/GreptimeTeam/greptimedb/pull/4423)
* fix(metrics): RowGroupLastRowCachedReader metrics by [@v0y4g3r](https://github.com/v0y4g3r) in [#4418](https://github.com/GreptimeTeam/greptimedb/pull/4418)
* fix: information_schema tables and views column value by [@killme2008](https://github.com/killme2008) in [#4438](https://github.com/GreptimeTeam/greptimedb/pull/4438)
* fix: remove to_timezone function by [@killme2008](https://github.com/killme2008) in [#4439](https://github.com/GreptimeTeam/greptimedb/pull/4439)
* fix: use heartbeat runtime instead of background runtime by [@WenyXu](https://github.com/WenyXu) in [#4445](https://github.com/GreptimeTeam/greptimedb/pull/4445)
* fix(fulltext-search): prune rows in row group forget to take remainder by [@zhongzc](https://github.com/zhongzc) in [#4447](https://github.com/GreptimeTeam/greptimedb/pull/4447)
* fix: use status code to http status mapping in error IntoResponse by [@shuiyisong](https://github.com/shuiyisong) in [#4455](https://github.com/GreptimeTeam/greptimedb/pull/4455)
* fix: missing `pre_write` check on prometheus remote write by [@shuiyisong](https://github.com/shuiyisong) in [#4460](https://github.com/GreptimeTeam/greptimedb/pull/4460)
* fix: check_partition uses unqualified name by [@waynexia](https://github.com/waynexia) in [#4452](https://github.com/GreptimeTeam/greptimedb/pull/4452)
* fix: overflow when parsing default value with negative numbers by [@killme2008](https://github.com/killme2008) in [#4459](https://github.com/GreptimeTeam/greptimedb/pull/4459)
* fix: prometheus api only returns 200 by [@shuiyisong](https://github.com/shuiyisong) in [#4471](https://github.com/GreptimeTeam/greptimedb/pull/4471)
* fix: generate unique timestamp for inserting tests by [@WenyXu](https://github.com/WenyXu) in [#4472](https://github.com/GreptimeTeam/greptimedb/pull/4472)
* fix: notify flush receiver after write buffer is released by [@evenyag](https://github.com/evenyag) in [#4476](https://github.com/GreptimeTeam/greptimedb/pull/4476)
* fix: avoid total size overflow by [@evenyag](https://github.com/evenyag) in [#4487](https://github.com/GreptimeTeam/greptimedb/pull/4487)

### 🚜 Refactor

* refactor: add `&mut Plugins` argument in plugins setup api and remove unnecessary mut by [@zyy17](https://github.com/zyy17) in [#4389](https://github.com/GreptimeTeam/greptimedb/pull/4389)
* refactor: add `get_storage_path()` and `get_catalog_and_schema()` by [@zyy17](https://github.com/zyy17) in [#4397](https://github.com/GreptimeTeam/greptimedb/pull/4397)
* refactor(query): Remove PhysicalPlanner trait by [@leaf-potato](https://github.com/leaf-potato) in [#4412](https://github.com/GreptimeTeam/greptimedb/pull/4412)
* refactor: Remove PhysicalOptimizer and LogicalOptimizer trait by [@leaf-potato](https://github.com/leaf-potato) in [#4426](https://github.com/GreptimeTeam/greptimedb/pull/4426)
* refactor: add RetryInterceptor to print detailed error by [@zyy17](https://github.com/zyy17) in [#4434](https://github.com/GreptimeTeam/greptimedb/pull/4434)
* refactor(servers): improve postgres error message by [@leaf-potato](https://github.com/leaf-potato) in [#4463](https://github.com/GreptimeTeam/greptimedb/pull/4463)

### 📚 Documentation

* docs(common_error): format enum StatusCode docs by [@leaf-potato](https://github.com/leaf-potato) in [#4427](https://github.com/GreptimeTeam/greptimedb/pull/4427)
* docs: update readme by [@killme2008](https://github.com/killme2008) in [#4430](https://github.com/GreptimeTeam/greptimedb/pull/4430)
* docs: update readme by [@killme2008](https://github.com/killme2008) in [#4431](https://github.com/GreptimeTeam/greptimedb/pull/4431)
* docs: update project status by [@killme2008](https://github.com/killme2008) in [#4440](https://github.com/GreptimeTeam/greptimedb/pull/4440)
* docs: tweak readme by [@killme2008](https://github.com/killme2008) in [#4465](https://github.com/GreptimeTeam/greptimedb/pull/4465)
* docs(contributing): replace expired links by [@leaf-potato](https://github.com/leaf-potato) in [#4468](https://github.com/GreptimeTeam/greptimedb/pull/4468)

### ⚡ Performance

* perf: reduce lock scope and improve log by [@evenyag](https://github.com/evenyag) in [#4453](https://github.com/GreptimeTeam/greptimedb/pull/4453)

### ⚙️ Miscellaneous Tasks

* chore: support `pattern` as pipeline key name by [@shuiyisong](https://github.com/shuiyisong) in [#4368](https://github.com/GreptimeTeam/greptimedb/pull/4368)
* ci: disable auto review by [@evenyag](https://github.com/evenyag) in [#4387](https://github.com/GreptimeTeam/greptimedb/pull/4387)
* chore: add metrics for log ingestion by [@shuiyisong](https://github.com/shuiyisong) in [#4411](https://github.com/GreptimeTeam/greptimedb/pull/4411)
* chore: add a compile cfg for python in cmd package by [@discord9](https://github.com/discord9) in [#4406](https://github.com/GreptimeTeam/greptimedb/pull/4406)
* chore: update grafana dashboard to reflect recent metric changes by [@waynexia](https://github.com/waynexia) in [#4417](https://github.com/GreptimeTeam/greptimedb/pull/4417)
* chore: add docs for config file by [@WenyXu](https://github.com/WenyXu) in [#4432](https://github.com/GreptimeTeam/greptimedb/pull/4432)
* chore: add dynamic cache size adjustment for InvertedIndexConfig by [@v0y4g3r](https://github.com/v0y4g3r) in [#4433](https://github.com/GreptimeTeam/greptimedb/pull/4433)
* chore: temporarily disable fuzz chaos tests by [@WenyXu](https://github.com/WenyXu) in [#4457](https://github.com/GreptimeTeam/greptimedb/pull/4457)
* ci: keep sqlness log by default by [@evenyag](https://github.com/evenyag) in [#4449](https://github.com/GreptimeTeam/greptimedb/pull/4449)
* chore: add more metrics about parquet and cache by [@MichaelScofield](https://github.com/MichaelScofield) in [#4410](https://github.com/GreptimeTeam/greptimedb/pull/4410)
* chore(ci): bring back chaos tests by [@WenyXu](https://github.com/WenyXu) in [#4456](https://github.com/GreptimeTeam/greptimedb/pull/4456)
* ci: make docker image args configurable from env vars by [@zyy17](https://github.com/zyy17) in [#4484](https://github.com/GreptimeTeam/greptimedb/pull/4484)
* chore: bump version v0.9.1 by [@v0y4g3r](https://github.com/v0y4g3r) in [#4486](https://github.com/GreptimeTeam/greptimedb/pull/4486)

## New Contributors

* [@leaf-potato](https://github.com/leaf-potato) made their first contribution in [#4468](https://github.com/GreptimeTeam/greptimedb/pull/4468)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@J0HN50N133](https://github.com/J0HN50N133), [@MichaelScofield](https://github.com/MichaelScofield), [@WenyXu](https://github.com/WenyXu), [@ZonaHex](https://github.com/ZonaHex), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@killme2008](https://github.com/killme2008), [@leaf-potato](https://github.com/leaf-potato), [@realtaobo](https://github.com/realtaobo), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@zhongzc](https://github.com/zhongzc), [@zyy17](https://github.com/zyy17)
