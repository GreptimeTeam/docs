---
date: 2024-09-06
---

# v0.9.3

Release date: September 06, 2024

## Highlights

* fixes the following issues
    *  `last_value` function may return empty results due to cache #4652
    *  query timestamp column in append mode misses some data #4669
    * crash while query tables with `last_non_null` merge mode #4687
## Breaking changes

* feat!: impl admin command by [@killme2008](https://github.com/killme2008) in [#4600](https://github.com/GreptimeTeam/greptimedb/pull/4600)

### 🚀 Features

* feat: Implement the Buf to avoid extra memory allocation by [@ozewr](https://github.com/ozewr) in [#4585](https://github.com/GreptimeTeam/greptimedb/pull/4585)
* feat: remove sql in error desc by [@waynexia](https://github.com/waynexia) in [#4589](https://github.com/GreptimeTeam/greptimedb/pull/4589)
* feat: collect filters metrics for scanners by [@evenyag](https://github.com/evenyag) in [#4591](https://github.com/GreptimeTeam/greptimedb/pull/4591)
* feat: refactoring LruCacheLayer with list_with_metakey and concurrent_stat_in_list by [@ozewr](https://github.com/ozewr) in [#4596](https://github.com/GreptimeTeam/greptimedb/pull/4596)
* feat: add postgres response for trasaction related statements by [@sunng87](https://github.com/sunng87) in [#4562](https://github.com/GreptimeTeam/greptimedb/pull/4562)
* feat: allow skipping topic creation by [@WenyXu](https://github.com/WenyXu) in [#4616](https://github.com/GreptimeTeam/greptimedb/pull/4616)
* feat: remove some redundent clone/conversion on constructing MergeScan stream by [@waynexia](https://github.com/waynexia) in [#4632](https://github.com/GreptimeTeam/greptimedb/pull/4632)
* feat: replay WAL entries respect index by [@WenyXu](https://github.com/WenyXu) in [#4565](https://github.com/GreptimeTeam/greptimedb/pull/4565)
* feat(flow): use DataFusion's optimizer by [@discord9](https://github.com/discord9) in [#4489](https://github.com/GreptimeTeam/greptimedb/pull/4489)
* feat: copy database ignores view and temporary tables by [@fengjiachun](https://github.com/fengjiachun) in [#4640](https://github.com/GreptimeTeam/greptimedb/pull/4640)
* feat: pre-download the ingested sst by [@MichaelScofield](https://github.com/MichaelScofield) in [#4636](https://github.com/GreptimeTeam/greptimedb/pull/4636)
* feat: import cli tool by [@fengjiachun](https://github.com/fengjiachun) in [#4639](https://github.com/GreptimeTeam/greptimedb/pull/4639)
* feat: show create database by [@fengjiachun](https://github.com/fengjiachun) in [#4642](https://github.com/GreptimeTeam/greptimedb/pull/4642)
* feat: initialize partition range from ScanInput by [@waynexia](https://github.com/waynexia) in [#4635](https://github.com/GreptimeTeam/greptimedb/pull/4635)
* feat: remove the requirement that partition column must be PK by [@waynexia](https://github.com/waynexia) in [#4647](https://github.com/GreptimeTeam/greptimedb/pull/4647)
* feat: remove files from the write cache in purger by [@evenyag](https://github.com/evenyag) in [#4655](https://github.com/GreptimeTeam/greptimedb/pull/4655)
* feat: grpc writing supports TTL hint by [@killme2008](https://github.com/killme2008) in [#4651](https://github.com/GreptimeTeam/greptimedb/pull/4651)
* feat: export import database by [@fengjiachun](https://github.com/fengjiachun) in [#4654](https://github.com/GreptimeTeam/greptimedb/pull/4654)
* feat: supports name in object storage config by [@killme2008](https://github.com/killme2008) in [#4630](https://github.com/GreptimeTeam/greptimedb/pull/4630)
* feat: change log level dynamically by [@discord9](https://github.com/discord9) in [#4653](https://github.com/GreptimeTeam/greptimedb/pull/4653)
* feat: schedule compaction when adding sst files by editing region by [@MichaelScofield](https://github.com/MichaelScofield) in [#4648](https://github.com/GreptimeTeam/greptimedb/pull/4648)
* feat: add geohash and h3 as built-in functions by [@sunng87](https://github.com/sunng87) in [#4656](https://github.com/GreptimeTeam/greptimedb/pull/4656)
* feat: add more spans to mito engine by [@lyang24](https://github.com/lyang24) in [#4643](https://github.com/GreptimeTeam/greptimedb/pull/4643)
* feat: invalidate cache via invalidator on region migration by [@fengjiachun](https://github.com/fengjiachun) in [#4682](https://github.com/GreptimeTeam/greptimedb/pull/4682)

### 🐛 Bug Fixes

* fix: pipeline prepare loop break detects a conditional error by [@paomian](https://github.com/paomian) in [#4593](https://github.com/GreptimeTeam/greptimedb/pull/4593)
* fix: incremental compilation always compile the common-version crate  by [@fengys1996](https://github.com/fengys1996) in [#4605](https://github.com/GreptimeTeam/greptimedb/pull/4605)
* fix: failed to get github sha by [@daviderli614](https://github.com/daviderli614) in [#4620](https://github.com/GreptimeTeam/greptimedb/pull/4620)
* fix: change toolchain file name by [@daviderli614](https://github.com/daviderli614) in [#4621](https://github.com/GreptimeTeam/greptimedb/pull/4621)
* fix: failed to get version by [@daviderli614](https://github.com/daviderli614) in [#4622](https://github.com/GreptimeTeam/greptimedb/pull/4622)
* fix: fallback to window size in manifest by [@evenyag](https://github.com/evenyag) in [#4629](https://github.com/GreptimeTeam/greptimedb/pull/4629)
* fix: update properties on updating partitions by [@waynexia](https://github.com/waynexia) in [#4627](https://github.com/GreptimeTeam/greptimedb/pull/4627)
* fix: set `selector_result_cache_size` in unit test by [@WenyXu](https://github.com/WenyXu) in [#4631](https://github.com/GreptimeTeam/greptimedb/pull/4631)
* fix: config api and export metrics default database by [@killme2008](https://github.com/killme2008) in [#4633](https://github.com/GreptimeTeam/greptimedb/pull/4633)
* fix: set `selector_result_cache_size` in unit test again by [@WenyXu](https://github.com/WenyXu) in [#4641](https://github.com/GreptimeTeam/greptimedb/pull/4641)
* fix(mito): avoid caching empty batches in row group by [@v0y4g3r](https://github.com/v0y4g3r) in [#4652](https://github.com/GreptimeTeam/greptimedb/pull/4652)
* fix: correct otlp endpoint formatting by [@WenyXu](https://github.com/WenyXu) in [#4646](https://github.com/GreptimeTeam/greptimedb/pull/4646)
* fix: expose missing options for initializing regions by [@WenyXu](https://github.com/WenyXu) in [#4660](https://github.com/GreptimeTeam/greptimedb/pull/4660)
* fix: use 'target' for 'actions-rust-lang/setup-rust-toolchain' to fix cross build failed by [@zyy17](https://github.com/zyy17) in [#4661](https://github.com/GreptimeTeam/greptimedb/pull/4661)
* fix: use number of partitions as parallelism in region scanner  by [@waynexia](https://github.com/waynexia) in [#4669](https://github.com/GreptimeTeam/greptimedb/pull/4669)
* fix: ref to auth err by [@shuiyisong](https://github.com/shuiyisong) in [#4681](https://github.com/GreptimeTeam/greptimedb/pull/4681)
* fix: last non null iter not init by [@evenyag](https://github.com/evenyag) in [#4687](https://github.com/GreptimeTeam/greptimedb/pull/4687)

### 🚜 Refactor

* refactor(mito2): reduce duplicate IndexOutput struct by [@leaf-potato](https://github.com/leaf-potato) in [#4592](https://github.com/GreptimeTeam/greptimedb/pull/4592)
* refactor: skip checking the existence of the SST files  by [@MichaelScofield](https://github.com/MichaelScofield) in [#4602](https://github.com/GreptimeTeam/greptimedb/pull/4602)
* refactor: add `fallback_to_local` region option by [@zyy17](https://github.com/zyy17) in [#4578](https://github.com/GreptimeTeam/greptimedb/pull/4578)
* refactor: add `app` in `greptime_app_version` metric by [@zyy17](https://github.com/zyy17) in [#4626](https://github.com/GreptimeTeam/greptimedb/pull/4626)
* refactor: reduce a object store "stat" call by [@MichaelScofield](https://github.com/MichaelScofield) in [#4645](https://github.com/GreptimeTeam/greptimedb/pull/4645)
* refactor: remove unused error variants by [@waynexia](https://github.com/waynexia) in [#4666](https://github.com/GreptimeTeam/greptimedb/pull/4666)
* refactor: make `init_global_logging()` clean and add `log_format` by [@zyy17](https://github.com/zyy17) in [#4657](https://github.com/GreptimeTeam/greptimedb/pull/4657)

### 📚 Documentation

* docs: log benchmark by [@shuiyisong](https://github.com/shuiyisong) in [#4597](https://github.com/GreptimeTeam/greptimedb/pull/4597)
* docs: move v0.9.1 benchmark report to tsbs dir by [@evenyag](https://github.com/evenyag) in [#4598](https://github.com/GreptimeTeam/greptimedb/pull/4598)
* docs: add example configs introduced by pg_kvbackend by [@lyang24](https://github.com/lyang24) in [#4573](https://github.com/GreptimeTeam/greptimedb/pull/4573)

### ⚡ Performance

* perf: set simple filter on primary key columns to exact filter by [@waynexia](https://github.com/waynexia) in [#4564](https://github.com/GreptimeTeam/greptimedb/pull/4564)
* perf: optimize series divide algo by [@waynexia](https://github.com/waynexia) in [#4603](https://github.com/GreptimeTeam/greptimedb/pull/4603)
* perf: acclerate scatter query by [@waynexia](https://github.com/waynexia) in [#4607](https://github.com/GreptimeTeam/greptimedb/pull/4607)
* perf(flow): Map&Reduce Operator use batch to reduce alloc by [@discord9](https://github.com/discord9) in [#4567](https://github.com/GreptimeTeam/greptimedb/pull/4567)

### ⚙️ Miscellaneous Tasks

* chore: keep symbol table in nightly profile by [@fengys1996](https://github.com/fengys1996) in [#4588](https://github.com/GreptimeTeam/greptimedb/pull/4588)
* chore: bump tikv-jemalloc* to "0.6" by [@fengys1996](https://github.com/fengys1996) in [#4590](https://github.com/GreptimeTeam/greptimedb/pull/4590)
* chore: disable ttl for write cache by default by [@evenyag](https://github.com/evenyag) in [#4595](https://github.com/GreptimeTeam/greptimedb/pull/4595)
* chore: bump opendal version to 0.49 by [@WenyXu](https://github.com/WenyXu) in [#4587](https://github.com/GreptimeTeam/greptimedb/pull/4587)
* chore: upgrade toolchain to nightly-2024-08-07 by [@WenyXu](https://github.com/WenyXu) in [#4549](https://github.com/GreptimeTeam/greptimedb/pull/4549)
* chore: add commerial support section by [@sunng87](https://github.com/sunng87) in [#4601](https://github.com/GreptimeTeam/greptimedb/pull/4601)
* chore: bump rust toolchain to 2024-06-06 by [@waynexia](https://github.com/waynexia) in [#4606](https://github.com/GreptimeTeam/greptimedb/pull/4606)
* chore: bump rskafka to `75535b` by [@WenyXu](https://github.com/WenyXu) in [#4608](https://github.com/GreptimeTeam/greptimedb/pull/4608)
* chore: add `stats` feature for jemalloc-ctl by [@discord9](https://github.com/discord9) in [#4610](https://github.com/GreptimeTeam/greptimedb/pull/4610)
* chore: optimize common_version build by [@fengys1996](https://github.com/fengys1996) in [#4611](https://github.com/GreptimeTeam/greptimedb/pull/4611)
* ci: add push dev-build images to aws ecr by [@daviderli614](https://github.com/daviderli614) in [#4618](https://github.com/GreptimeTeam/greptimedb/pull/4618)
* chore: setting docker authentication in dev-build image by [@daviderli614](https://github.com/daviderli614) in [#4623](https://github.com/GreptimeTeam/greptimedb/pull/4623)
* ci: improve toolchain resolution in ci by [@sunng87](https://github.com/sunng87) in [#4614](https://github.com/GreptimeTeam/greptimedb/pull/4614)
* ci: add check-builder-rust-version job in release and change release-dev-builder-images trigger condition by [@zyy17](https://github.com/zyy17) in [#4615](https://github.com/GreptimeTeam/greptimedb/pull/4615)
* chore: modify grafana config to accord with version 9 by [@shuiyisong](https://github.com/shuiyisong) in [#4634](https://github.com/GreptimeTeam/greptimedb/pull/4634)
* chore: adding heartbeat sent/recv counts in greptimedb nodes by [@lyang24](https://github.com/lyang24) in [#4624](https://github.com/GreptimeTeam/greptimedb/pull/4624)
* ci: disable macos integration test and some minor refactoring by [@zyy17](https://github.com/zyy17) in [#4658](https://github.com/GreptimeTeam/greptimedb/pull/4658)
* chore: refactor metadata key value trait by [@fengjiachun](https://github.com/fengjiachun) in [#4664](https://github.com/GreptimeTeam/greptimedb/pull/4664)
* chore(ci): set etcd resources limits by [@WenyXu](https://github.com/WenyXu) in [#4665](https://github.com/GreptimeTeam/greptimedb/pull/4665)
* chore(dockerfile): remove mysql and postgresql clients in greptimedb image by [@daviderli614](https://github.com/daviderli614) in [#4685](https://github.com/GreptimeTeam/greptimedb/pull/4685)
* chore: bump version v0.9.3 by [@v0y4g3r](https://github.com/v0y4g3r) in [#4684](https://github.com/GreptimeTeam/greptimedb/pull/4684)

### Build

* build(deps): bump backon to 1.0 by [@waynexia](https://github.com/waynexia) in [#4625](https://github.com/GreptimeTeam/greptimedb/pull/4625)
* build: add mysql and postgresql clients to greptimedb image by [@MichaelScofield](https://github.com/MichaelScofield) in [#4677](https://github.com/GreptimeTeam/greptimedb/pull/4677)

## New Contributors

* [@ozewr](https://github.com/ozewr) made their first contribution in [#4596](https://github.com/GreptimeTeam/greptimedb/pull/4596)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@MichaelScofield](https://github.com/MichaelScofield), [@WenyXu](https://github.com/WenyXu), [@daviderli614](https://github.com/daviderli614), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@fengys1996](https://github.com/fengys1996), [@killme2008](https://github.com/killme2008), [@leaf-potato](https://github.com/leaf-potato), [@lyang24](https://github.com/lyang24), [@ozewr](https://github.com/ozewr), [@paomian](https://github.com/paomian), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@zyy17](https://github.com/zyy17)

