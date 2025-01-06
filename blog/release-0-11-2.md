---
keywords: [release, GreptimeDB, changelog, v0.11.2]
description: GreptimeDB v0.11.2 Changelog
date: 2024-12-21
---

# v0.11.2

Release date: January 04, 2025


This version fixes the following critical issues:
- Automatic alteration of the table may lead to inconsistent metadata.
- Compaction doesn't use files in the local cache.


### Notes
This version modifies the default object storage cache paths:
- The path for write cache has changed from the default `{data_home}/object_cache/write` to `{data_home}/cache/object/write`.
- The path for read cache has changed from the default `{data_home}/object_cache/read` to `{data_home}/cache/object/read`.
- When configuring write cache and read cache, only the root directory of the cache needs to be specified, which defaults to `{data_home}`.


We recommend that users no longer manually configure the cache paths after version 0.11, as the database can automatically set appropriate paths.


### 🚀 Features

* feat(bloom-filter): add memory control for creator by [@zhongzc](https://github.com/zhongzc) in [#5185](https://github.com/GreptimeTeam/greptimedb/pull/5185)
* feat(bloom-filter): add bloom filter reader by [@zhongzc](https://github.com/zhongzc) in [#5204](https://github.com/GreptimeTeam/greptimedb/pull/5204)
* feat(index-cache): abstract `IndexCache` to be shared by multi types of indexes by [@zhongzc](https://github.com/zhongzc) in [#5219](https://github.com/GreptimeTeam/greptimedb/pull/5219)
* feat: logs query endpoint by [@waynexia](https://github.com/waynexia) in [#5202](https://github.com/GreptimeTeam/greptimedb/pull/5202)
* feat(mito): parquet memtable reader by [@v0y4g3r](https://github.com/v0y4g3r) in [#4967](https://github.com/GreptimeTeam/greptimedb/pull/4967)
* feat(bloom-filter): impl batch push to creator by [@zhongzc](https://github.com/zhongzc) in [#5225](https://github.com/GreptimeTeam/greptimedb/pull/5225)
* feat: introduce the Limiter in frontend to limit the requests by in-flight write bytes size. by [@zyy17](https://github.com/zyy17) in [#5231](https://github.com/GreptimeTeam/greptimedb/pull/5231)
* feat: add some critical metrics to flownode by [@waynexia](https://github.com/waynexia) in [#5235](https://github.com/GreptimeTeam/greptimedb/pull/5235)
* feat(flow): check sink table mismatch on flow creation by [@discord9](https://github.com/discord9) in [#5112](https://github.com/GreptimeTeam/greptimedb/pull/5112)
* feat: Add `vec_mul` function. by [@linyihai](https://github.com/linyihai) in [#5205](https://github.com/GreptimeTeam/greptimedb/pull/5205)
* feat(bloom-filter): integrate indexer with mito2  by [@zhongzc](https://github.com/zhongzc) in [#5236](https://github.com/GreptimeTeam/greptimedb/pull/5236)
* feat(bloom-filter): bloom filter applier by [@waynexia](https://github.com/waynexia) in [#5220](https://github.com/GreptimeTeam/greptimedb/pull/5220)
* feat(config): add bloom filter config by [@zhongzc](https://github.com/zhongzc) in [#5237](https://github.com/GreptimeTeam/greptimedb/pull/5237)
* feat(mito): add bloom filter read metrics by [@zhongzc](https://github.com/zhongzc) in [#5239](https://github.com/GreptimeTeam/greptimedb/pull/5239)
* feat: init PgElection with candidate registration by [@CookiePieWw](https://github.com/CookiePieWw) in [#5209](https://github.com/GreptimeTeam/greptimedb/pull/5209)
* feat(vector): add vector functions `vec_sub` & `vec_sum` & `vec_elem_sum` by [@KKould](https://github.com/KKould) in [#5230](https://github.com/GreptimeTeam/greptimedb/pull/5230)
* feat: add sqlness test for bloom filter index by [@waynexia](https://github.com/waynexia) in [#5240](https://github.com/GreptimeTeam/greptimedb/pull/5240)
* feat: add `vec_div` function by [@linyihai](https://github.com/linyihai) in [#5245](https://github.com/GreptimeTeam/greptimedb/pull/5245)
* feat: update partition duration of memtable using compaction window by [@evenyag](https://github.com/evenyag) in [#5197](https://github.com/GreptimeTeam/greptimedb/pull/5197)
* feat: override `__sequence` on creating SST to save space and CPU by [@waynexia](https://github.com/waynexia) in [#5252](https://github.com/GreptimeTeam/greptimedb/pull/5252)
* feat(log-query): implement pagination with limit and offset parameters by [@waynexia](https://github.com/waynexia) in [#5241](https://github.com/GreptimeTeam/greptimedb/pull/5241)
* feat: hints all in one by [@fengjiachun](https://github.com/fengjiachun) in [#5194](https://github.com/GreptimeTeam/greptimedb/pull/5194)
* feat: support add if not exists in the gRPC alter kind by [@evenyag](https://github.com/evenyag) in [#5273](https://github.com/GreptimeTeam/greptimedb/pull/5273)
* feat: bump opendal and switch prometheus layer to the upstream impl by [@waynexia](https://github.com/waynexia) in [#5179](https://github.com/GreptimeTeam/greptimedb/pull/5179)

### 🐛 Bug Fixes

* fix: dead links by [@nicecui](https://github.com/nicecui) in [#5212](https://github.com/GreptimeTeam/greptimedb/pull/5212)
* fix: correct write cache's metric labels by [@waynexia](https://github.com/waynexia) in [#5227](https://github.com/GreptimeTeam/greptimedb/pull/5227)
* fix: flow compare null values by [@discord9](https://github.com/discord9) in [#5234](https://github.com/GreptimeTeam/greptimedb/pull/5234)
* fix: disable path label in opendal for now by [@shuiyisong](https://github.com/shuiyisong) in [#5247](https://github.com/GreptimeTeam/greptimedb/pull/5247)
* fix: implement a CacheStrategy to ensure compaction use cache correctly by [@evenyag](https://github.com/evenyag) in [#5254](https://github.com/GreptimeTeam/greptimedb/pull/5254)
* fix(bloom-filter): skip applying for non-indexed columns by [@zhongzc](https://github.com/zhongzc) in [#5246](https://github.com/GreptimeTeam/greptimedb/pull/5246)
* fix: correct invalid testing feature gate usage by [@sunng87](https://github.com/sunng87) in [#5258](https://github.com/GreptimeTeam/greptimedb/pull/5258)
* fix: import tokio-metrics and tokio-metrics-collector by [@chenmortal](https://github.com/chenmortal) in [#5264](https://github.com/GreptimeTeam/greptimedb/pull/5264)
* fix(flow): flow's table schema cache by [@discord9](https://github.com/discord9) in [#5251](https://github.com/GreptimeTeam/greptimedb/pull/5251)
* fix: flow handle reordered inserts by [@discord9](https://github.com/discord9) in [#5275](https://github.com/GreptimeTeam/greptimedb/pull/5275)
* fix: better fmt check from 40s to 4s by [@yihong0618](https://github.com/yihong0618) in [#5279](https://github.com/GreptimeTeam/greptimedb/pull/5279)

### 🚜 Refactor

* refactor: remove unnecessary wrap by [@WenyXu](https://github.com/WenyXu) in [#5221](https://github.com/GreptimeTeam/greptimedb/pull/5221)
* refactor: support to convert time string to timestamp in `convert_value()` by [@zyy17](https://github.com/zyy17) in [#5242](https://github.com/GreptimeTeam/greptimedb/pull/5242)
* refactor: adjust index cache page size by [@CookiePieWw](https://github.com/CookiePieWw) in [#5267](https://github.com/GreptimeTeam/greptimedb/pull/5267)
* refactor: flow replace check&better error msg by [@discord9](https://github.com/discord9) in [#5277](https://github.com/GreptimeTeam/greptimedb/pull/5277)

### 📚 Documentation

* docs: add greptimedb-operator project link in 'Tools & Extensions' and other small improvements by [@zyy17](https://github.com/zyy17) in [#5216](https://github.com/GreptimeTeam/greptimedb/pull/5216)

### ⚙️ Miscellaneous Tasks

* chore: adjust fuzz tests cfg by [@WenyXu](https://github.com/WenyXu) in [#5207](https://github.com/GreptimeTeam/greptimedb/pull/5207)
* ci: fix nightly ci task on nix build by [@sunng87](https://github.com/sunng87) in [#5198](https://github.com/GreptimeTeam/greptimedb/pull/5198)
* chore: bump opendal to fork version to fix prometheus layer by [@waynexia](https://github.com/waynexia) in [#5223](https://github.com/GreptimeTeam/greptimedb/pull/5223)
* ci: support to pack multiple files in upload-artifacts action by [@zyy17](https://github.com/zyy17) in [#5228](https://github.com/GreptimeTeam/greptimedb/pull/5228)
* chore: add log for converting region to follower by [@WenyXu](https://github.com/WenyXu) in [#5222](https://github.com/GreptimeTeam/greptimedb/pull/5222)
* ci: upload .pdb files too for better windows debug by [@discord9](https://github.com/discord9) in [#5224](https://github.com/GreptimeTeam/greptimedb/pull/5224)
* chore: add more info for pipeline dryrun API by [@paomian](https://github.com/paomian) in [#5232](https://github.com/GreptimeTeam/greptimedb/pull/5232)
* ci: make sure clippy passes before running tests by [@sunng87](https://github.com/sunng87) in [#5253](https://github.com/GreptimeTeam/greptimedb/pull/5253)
* ci: disable pyo3 build tasks by [@sunng87](https://github.com/sunng87) in [#5256](https://github.com/GreptimeTeam/greptimedb/pull/5256)
* chore: typo by [@discord9](https://github.com/discord9) in [#5265](https://github.com/GreptimeTeam/greptimedb/pull/5265)
* ci: update nix setup by [@sunng87](https://github.com/sunng87) in [#5272](https://github.com/GreptimeTeam/greptimedb/pull/5272)
* chore: suppress list warning by [@v0y4g3r](https://github.com/v0y4g3r) in [#5280](https://github.com/GreptimeTeam/greptimedb/pull/5280)
* chore: update greptime-proto to include add_if_not_exists by [@evenyag](https://github.com/evenyag) in [#5289](https://github.com/GreptimeTeam/greptimedb/pull/5289)

### Build

* build: use 8xlarge as arm default by [@evenyag](https://github.com/evenyag) in [#5214](https://github.com/GreptimeTeam/greptimedb/pull/5214)

## New Contributors

* [@yihong0618](https://github.com/yihong0618) made their first contribution in [#5279](https://github.com/GreptimeTeam/greptimedb/pull/5279)
* [@chenmortal](https://github.com/chenmortal) made their first contribution in [#5264](https://github.com/GreptimeTeam/greptimedb/pull/5264)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@CookiePieWw](https://github.com/CookiePieWw), [@KKould](https://github.com/KKould), [@WenyXu](https://github.com/WenyXu), [@chenmortal](https://github.com/chenmortal), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@linyihai](https://github.com/linyihai), [@nicecui](https://github.com/nicecui), [@paomian](https://github.com/paomian), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@yihong0618](https://github.com/yihong0618), [@zhongzc](https://github.com/zhongzc), [@zyy17](https://github.com/zyy17)
