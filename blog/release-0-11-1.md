---
keywords: [release, GreptimeDB, changelog, v0.11.1]
description: GreptimeDB v0.11.1 Changelog
date: 2024-12-21
---

# v0.11.1

Release date: December 21, 2024

### 👍 Highlights

* Supports `label_join()` and `label_replace()` for PromQL.
* Supports pushing down `IN` filters.
* Updates dashboard to [v0.7.3](https://github.com/GreptimeTeam/dashboard/releases/tag/v0.7.3)


### 🚀 Features

* feat: adjust WAL purge default configurations by [@killme2008](https://github.com/killme2008) in [#5107](https://github.com/GreptimeTeam/greptimedb/pull/5107)
* feat(vector): add scalar add function  by [@zhongzc](https://github.com/zhongzc) in [#5119](https://github.com/GreptimeTeam/greptimedb/pull/5119)
* feat: update dashboard to v0.7.2 by [@ZonaHex](https://github.com/ZonaHex) in [#5141](https://github.com/GreptimeTeam/greptimedb/pull/5141)
* feat: implement `v1/sql/parse` endpoint to parse GreptimeDB's SQL dialect by [@waynexia](https://github.com/waynexia) in [#5144](https://github.com/GreptimeTeam/greptimedb/pull/5144)
* feat: support push down IN filter by [@NiwakaDev](https://github.com/NiwakaDev) in [#5129](https://github.com/GreptimeTeam/greptimedb/pull/5129)
* feat: add prefetch support to `PuffinFileFooterReader` for reduced I/O time by [@WenyXu](https://github.com/WenyXu) in [#5145](https://github.com/GreptimeTeam/greptimedb/pull/5145)
* feat: add prefetch support to `InvertedIndexFooterReader` for reduced I/O time by [@WenyXu](https://github.com/WenyXu) in [#5146](https://github.com/GreptimeTeam/greptimedb/pull/5146)
* feat: introduce `PuffinMetadataCache` by [@WenyXu](https://github.com/WenyXu) in [#5148](https://github.com/GreptimeTeam/greptimedb/pull/5148)
* feat(fuzz): add alter table options for alter fuzzer by [@CookiePieWw](https://github.com/CookiePieWw) in [#5074](https://github.com/GreptimeTeam/greptimedb/pull/5074)
* feat(index): add `file_size_hint` for remote blob reader by [@WenyXu](https://github.com/WenyXu) in [#5147](https://github.com/GreptimeTeam/greptimedb/pull/5147)
* feat: collect reader metrics from prune reader by [@evenyag](https://github.com/evenyag) in [#5152](https://github.com/GreptimeTeam/greptimedb/pull/5152)
* feat: Add `vector_scalar_mul` function. by [@linyihai](https://github.com/linyihai) in [#5166](https://github.com/GreptimeTeam/greptimedb/pull/5166)
* feat: introduce SKIPPING index (part 1) by [@waynexia](https://github.com/waynexia) in [#5155](https://github.com/GreptimeTeam/greptimedb/pull/5155)
* feat: update dashboard to v0.7.3 by [@ZonaHex](https://github.com/ZonaHex) in [#5172](https://github.com/GreptimeTeam/greptimedb/pull/5172)
* feat(bloom-filter): add basic bloom filter creator (Part 1) by [@zhongzc](https://github.com/zhongzc) in [#5177](https://github.com/GreptimeTeam/greptimedb/pull/5177)
* feat: introduce Buffer for non-continuous bytes by [@CookiePieWw](https://github.com/CookiePieWw) in [#5164](https://github.com/GreptimeTeam/greptimedb/pull/5164)
* feat: impl label_join and label_replace for promql by [@killme2008](https://github.com/killme2008) in [#5153](https://github.com/GreptimeTeam/greptimedb/pull/5153)
* feat: do not keep MemtableRefs in ScanInput by [@evenyag](https://github.com/evenyag) in [#5184](https://github.com/GreptimeTeam/greptimedb/pull/5184)
* feat: do not remove time filters in ScanRegion by [@evenyag](https://github.com/evenyag) in [#5180](https://github.com/GreptimeTeam/greptimedb/pull/5180)
* feat: extract hints from http header by [@fengjiachun](https://github.com/fengjiachun) in [#5128](https://github.com/GreptimeTeam/greptimedb/pull/5128)
* feat: show create postgresql foreign table by [@sunng87](https://github.com/sunng87) in [#5143](https://github.com/GreptimeTeam/greptimedb/pull/5143)
* feat: show flow's mem usage in INFORMATION_SCHEMA.FLOWS by [@discord9](https://github.com/discord9) in [#4890](https://github.com/GreptimeTeam/greptimedb/pull/4890)

### 🐛 Bug Fixes

* fix: loki write row len error by [@paomian](https://github.com/paomian) in [#5161](https://github.com/GreptimeTeam/greptimedb/pull/5161)
* fix: support alter table ~ add ~ custom_type by [@NiwakaDev](https://github.com/NiwakaDev) in [#5165](https://github.com/GreptimeTeam/greptimedb/pull/5165)
* fix: correct `set_region_role_state_gracefully` behaviors by [@WenyXu](https://github.com/WenyXu) in [#5171](https://github.com/GreptimeTeam/greptimedb/pull/5171)
* fix: deletion between two put may not work in `last_non_null` mode by [@evenyag](https://github.com/evenyag) in [#5168](https://github.com/GreptimeTeam/greptimedb/pull/5168)
* fix: display inverted and fulltext index in show index by [@lyang24](https://github.com/lyang24) in [#5169](https://github.com/GreptimeTeam/greptimedb/pull/5169)
* fix(sqlness): enforce order in union tests by [@v0y4g3r](https://github.com/v0y4g3r) in [#5190](https://github.com/GreptimeTeam/greptimedb/pull/5190)
* fix: validate matcher op for __name__ in promql by [@waynexia](https://github.com/waynexia) in [#5191](https://github.com/GreptimeTeam/greptimedb/pull/5191)
* fix: ensure table route metadata is eventually rolled back on failure by [@WenyXu](https://github.com/WenyXu) in [#5174](https://github.com/GreptimeTeam/greptimedb/pull/5174)
* fix(flow): batch builder with type by [@discord9](https://github.com/discord9) in [#5195](https://github.com/GreptimeTeam/greptimedb/pull/5195)
* fix: auto created table ttl check by [@discord9](https://github.com/discord9) in [#5203](https://github.com/GreptimeTeam/greptimedb/pull/5203)

### 🚜 Refactor

* refactor: cache inverted index with fixed-size page by [@CookiePieWw](https://github.com/CookiePieWw) in [#5114](https://github.com/GreptimeTeam/greptimedb/pull/5114)
* refactor: produce BatchBuilder from a Batch to modify it again by [@MichaelScofield](https://github.com/MichaelScofield) in [#5186](https://github.com/GreptimeTeam/greptimedb/pull/5186)
* refactor: remove unused symbols by [@waynexia](https://github.com/waynexia) in [#5193](https://github.com/GreptimeTeam/greptimedb/pull/5193)

### 📚 Documentation

* docs: Add index panels to standalone grafana dashboard by [@evenyag](https://github.com/evenyag) in [#5140](https://github.com/GreptimeTeam/greptimedb/pull/5140)
* docs: fix grafana dashboard row by [@evenyag](https://github.com/evenyag) in [#5192](https://github.com/GreptimeTeam/greptimedb/pull/5192)

### ⚡ Performance

* perf: avoid cache during compaction by [@v0y4g3r](https://github.com/v0y4g3r) in [#5135](https://github.com/GreptimeTeam/greptimedb/pull/5135)
* perf: avoid holding memtable during compaction by [@v0y4g3r](https://github.com/v0y4g3r) in [#5157](https://github.com/GreptimeTeam/greptimedb/pull/5157)

### 🧪 Testing

* test: part of parser test migrated from duckdb by [@CookiePieWw](https://github.com/CookiePieWw) in [#5125](https://github.com/GreptimeTeam/greptimedb/pull/5125)
* test: flow rebuild by [@discord9](https://github.com/discord9) in [#5162](https://github.com/GreptimeTeam/greptimedb/pull/5162)
* test: sqlness upgrade compatibility tests by [@discord9](https://github.com/discord9) in [#5126](https://github.com/GreptimeTeam/greptimedb/pull/5126)

### ⚙️ Miscellaneous Tasks

* chore: bump main branch version to 0.12 by [@evenyag](https://github.com/evenyag) in [#5133](https://github.com/GreptimeTeam/greptimedb/pull/5133)
* chore: add `/ready` api for health checking by [@shuiyisong](https://github.com/shuiyisong) in [#5124](https://github.com/GreptimeTeam/greptimedb/pull/5124)
* chore: fix aws_lc not in depend tree check in CI by [@discord9](https://github.com/discord9) in [#5121](https://github.com/GreptimeTeam/greptimedb/pull/5121)
* chore: set store_key_prefix for all kvbackend by [@fengjiachun](https://github.com/fengjiachun) in [#5132](https://github.com/GreptimeTeam/greptimedb/pull/5132)
* chore: decide tag column in log api follow table schema if table exists by [@paomian](https://github.com/paomian) in [#5138](https://github.com/GreptimeTeam/greptimedb/pull/5138)
* chore: pipeline dryrun api can currently receives pipeline raw content by [@paomian](https://github.com/paomian) in [#5142](https://github.com/GreptimeTeam/greptimedb/pull/5142)
* ci: use 4xlarge for nightly build by [@evenyag](https://github.com/evenyag) in [#5158](https://github.com/GreptimeTeam/greptimedb/pull/5158)
* chore: remove unused dep by [@shuiyisong](https://github.com/shuiyisong) in [#5163](https://github.com/GreptimeTeam/greptimedb/pull/5163)
* chore: gauge for flush compaction by [@v0y4g3r](https://github.com/v0y4g3r) in [#5156](https://github.com/GreptimeTeam/greptimedb/pull/5156)
* chore: add nix-shell configuration for a minimal environment for development by [@sunng87](https://github.com/sunng87) in [#5175](https://github.com/GreptimeTeam/greptimedb/pull/5175)
* chore: add aquamarine to dep lists by [@evenyag](https://github.com/evenyag) in [#5181](https://github.com/GreptimeTeam/greptimedb/pull/5181)
* chore: make nix compilation environment config more robust by [@sunng87](https://github.com/sunng87) in [#5183](https://github.com/GreptimeTeam/greptimedb/pull/5183)
* chore: update PR template by [@killme2008](https://github.com/killme2008) in [#5199](https://github.com/GreptimeTeam/greptimedb/pull/5199)
* ci: install latest protobuf in dev-builder image by [@MichaelScofield](https://github.com/MichaelScofield) in [#5196](https://github.com/GreptimeTeam/greptimedb/pull/5196)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@CookiePieWw](https://github.com/CookiePieWw), [@MichaelScofield](https://github.com/MichaelScofield), [@NiwakaDev](https://github.com/NiwakaDev), [@WenyXu](https://github.com/WenyXu), [@ZonaHex](https://github.com/ZonaHex), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@killme2008](https://github.com/killme2008), [@linyihai](https://github.com/linyihai), [@lyang24](https://github.com/lyang24), [@paomian](https://github.com/paomian), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@zhongzc](https://github.com/zhongzc)
