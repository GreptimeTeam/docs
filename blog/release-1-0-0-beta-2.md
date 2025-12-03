---
keywords: [release, GreptimeDB, changelog, v1.0.0-beta.2]
description: GreptimeDB v1.0.0-beta.2 Changelog
date: 2025-12-03
---

# v1.0.0-beta.2

Release date: December 02, 2025

### Breaking changes

* fix!: align numeric type aliases with PostgreSQL and MySQL by [@killme2008](https://github.com/killme2008) in [#7270](https://github.com/GreptimeTeam/greptimedb/pull/7270)
* feat!: improve mysql/pg compatibility by [@killme2008](https://github.com/killme2008) in [#7315](https://github.com/GreptimeTeam/greptimedb/pull/7315)
* perf(metric-engine)!: Replace mur3 with fxhash for faster TSID generation by [@v0y4g3r](https://github.com/v0y4g3r) in [#7316](https://github.com/GreptimeTeam/greptimedb/pull/7316)

### 👍 Highlights

#### 🚀 Key New Features

* **Region Migration:**
    * Introduced **batch region migration**.
* **JSON Handling:**
    * New UDF: **`json_get_object`**.
* **Operations:**
    * Supported **dynamic enabling or disabling of tracing**.
    * Enabled **parallel table operations** in `COPY DATABASE`.
    * Supported the ability to **alter database compaction options**.

#### ⚡ Performance Improvements

* Enhanced efficiency by **parallelizing file source region** and **building partition sources in parallel**.
* Optimized query execution by **avoiding unnecessary merge sort**.
* Implemented tracking for the **query memory pool**.

#### 🐛 Notable Bug Fixes

* Fixed a critical **write stall issue that prevented recovery** due to flush logic problems.
* Resolved a **deadlock in the metric engine** when altering a group of tables.
* Fixed multiple compatibility issues, including corrections for **PostgreSQL extended query parameter parsing**, **timezone settings**, and **MySQL binary date type** handling.

### 🚀 Features

* feat: load latest index file first by [@evenyag](https://github.com/evenyag) in [#7221](https://github.com/GreptimeTeam/greptimedb/pull/7221)
* feat: introduce batch region migration by [@WenyXu](https://github.com/WenyXu) in [#7176](https://github.com/GreptimeTeam/greptimedb/pull/7176)
* feat: build partition sources in parallel by [@waynexia](https://github.com/waynexia) in [#7243](https://github.com/GreptimeTeam/greptimedb/pull/7243)
* feat: dynamic enable or disable trace by [@waynexia](https://github.com/waynexia) in [#6609](https://github.com/GreptimeTeam/greptimedb/pull/6609)
* feat: support parallel table operations in `COPY DATABASE` by [@WenyXu](https://github.com/WenyXu) in [#7213](https://github.com/GreptimeTeam/greptimedb/pull/7213)
* feat: gc worker only local regions&test by [@discord9](https://github.com/discord9) in [#7203](https://github.com/GreptimeTeam/greptimedb/pull/7203)
* feat: implement compressed CSV/JSON export functionality by [@McKnight22](https://github.com/McKnight22) in [#7162](https://github.com/GreptimeTeam/greptimedb/pull/7162)
* feat: split batches before merge by [@evenyag](https://github.com/evenyag) in [#7225](https://github.com/GreptimeTeam/greptimedb/pull/7225)
* feat: gc scheduler ctx&procedure by [@discord9](https://github.com/discord9) in [#7252](https://github.com/GreptimeTeam/greptimedb/pull/7252)
* feat: gc get ref from manifest by [@discord9](https://github.com/discord9) in [#7260](https://github.com/GreptimeTeam/greptimedb/pull/7260)
* feat: support alter database compaction options by [@WaterWhisperer](https://github.com/WaterWhisperer) in [#7251](https://github.com/GreptimeTeam/greptimedb/pull/7251)
* feat: don't validate external table's region schema by [@waynexia](https://github.com/waynexia) in [#7268](https://github.com/GreptimeTeam/greptimedb/pull/7268)
* feat: simplify merge scan stream by [@waynexia](https://github.com/waynexia) in [#7269](https://github.com/GreptimeTeam/greptimedb/pull/7269)
* feat: udf `json_get_object` by [@MichaelScofield](https://github.com/MichaelScofield) in [#7241](https://github.com/GreptimeTeam/greptimedb/pull/7241)
* feat: support Dictionary type by [@waynexia](https://github.com/waynexia) in [#7277](https://github.com/GreptimeTeam/greptimedb/pull/7277)
* feat: simplify file_stream::create_stream by [@waynexia](https://github.com/waynexia) in [#7275](https://github.com/GreptimeTeam/greptimedb/pull/7275)
* feat: track query memory pool by [@fengjiachun](https://github.com/fengjiachun) in [#7219](https://github.com/GreptimeTeam/greptimedb/pull/7219)
* feat: basic gc scheduler by [@discord9](https://github.com/discord9) in [#7263](https://github.com/GreptimeTeam/greptimedb/pull/7263)
* feat: reloadable tls client config by [@shuiyisong](https://github.com/shuiyisong) in [#7230](https://github.com/GreptimeTeam/greptimedb/pull/7230)
* feat: `decode_primary_key` method for debugging by [@waynexia](https://github.com/waynexia) in [#7284](https://github.com/GreptimeTeam/greptimedb/pull/7284)
* feat: update dashboard to v0.11.8 by [@ZonaHex](https://github.com/ZonaHex) in [#7281](https://github.com/GreptimeTeam/greptimedb/pull/7281)
* feat: introduce `remap_manifests` for `RegionEngine` by [@WenyXu](https://github.com/WenyXu) in [#7265](https://github.com/GreptimeTeam/greptimedb/pull/7265)
* feat: implement manual type for async index build by [@SNC123](https://github.com/SNC123) in [#7104](https://github.com/GreptimeTeam/greptimedb/pull/7104)
* feat:  add building option to build images base on distroless image by [@WaterWhisperer](https://github.com/WaterWhisperer) in [#7240](https://github.com/GreptimeTeam/greptimedb/pull/7240)
* feat: batch region migration for failover by [@WenyXu](https://github.com/WenyXu) in [#7245](https://github.com/GreptimeTeam/greptimedb/pull/7245)
* feat: add batch gc procedure by [@discord9](https://github.com/discord9) in [#7296](https://github.com/GreptimeTeam/greptimedb/pull/7296)
* feat: add region repartition group procedure infrastructure by [@WenyXu](https://github.com/WenyXu) in [#7299](https://github.com/GreptimeTeam/greptimedb/pull/7299)
* feat: add some configurable points by [@fengys1996](https://github.com/fengys1996) in [#7227](https://github.com/GreptimeTeam/greptimedb/pull/7227)
* feat: simple read write new json type values by [@MichaelScofield](https://github.com/MichaelScofield) in [#7175](https://github.com/GreptimeTeam/greptimedb/pull/7175)
* feat: introduce `EnterStagingRequest` for `RegionEngine` by [@WenyXu](https://github.com/WenyXu) in [#7261](https://github.com/GreptimeTeam/greptimedb/pull/7261)
* feat: implement metadata update for repartition group procedure by [@WenyXu](https://github.com/WenyXu) in [#7311](https://github.com/GreptimeTeam/greptimedb/pull/7311)
* feat: implement `Display` trait for `FlushRegions` by [@WenyXu](https://github.com/WenyXu) in [#7320](https://github.com/GreptimeTeam/greptimedb/pull/7320)
* feat: update pg-catalog for describe table by [@sunng87](https://github.com/sunng87) in [#7321](https://github.com/GreptimeTeam/greptimedb/pull/7321)

### 🐛 Bug Fixes

* fix: obtain system time after fetching lease values by [@WenyXu](https://github.com/WenyXu) in [#7223](https://github.com/GreptimeTeam/greptimedb/pull/7223)
* fix: clone the page before putting into the index cache by [@evenyag](https://github.com/evenyag) in [#7229](https://github.com/GreptimeTeam/greptimedb/pull/7229)
* fix: correct signature of current_schemas function by [@sunng87](https://github.com/sunng87) in [#7233](https://github.com/GreptimeTeam/greptimedb/pull/7233)
* fix: allow compacting L1 files under append mode by [@evenyag](https://github.com/evenyag) in [#7239](https://github.com/GreptimeTeam/greptimedb/pull/7239)
* fix: dynamic reload tracing layer loses trace id by [@waynexia](https://github.com/waynexia) in [#7257](https://github.com/GreptimeTeam/greptimedb/pull/7257)
* fix: log not print by [@killme2008](https://github.com/killme2008) in [#7272](https://github.com/GreptimeTeam/greptimedb/pull/7272)
* fix: return sqlalchemy compatible version string in version() by [@sunng87](https://github.com/sunng87) in [#7271](https://github.com/GreptimeTeam/greptimedb/pull/7271)
* fix: postgres extended query parameter parsing and type check by [@sunng87](https://github.com/sunng87) in [#7276](https://github.com/GreptimeTeam/greptimedb/pull/7276)
* fix: unlimit `trace_id` query in jaeger API by [@shuiyisong](https://github.com/shuiyisong) in [#7283](https://github.com/GreptimeTeam/greptimedb/pull/7283)
* fix: postgres show statement describe and timestamp text parsing by [@sunng87](https://github.com/sunng87) in [#7286](https://github.com/GreptimeTeam/greptimedb/pull/7286)
* fix: postgres timezone setting by default by [@killme2008](https://github.com/killme2008) in [#7289](https://github.com/GreptimeTeam/greptimedb/pull/7289)
* fix: pre-commit all files failed by [@yihong0618](https://github.com/yihong0618) in [#7290](https://github.com/GreptimeTeam/greptimedb/pull/7290)
* fix: mysql binary date type and multi-lang ci tests by [@killme2008](https://github.com/killme2008) in [#7291](https://github.com/GreptimeTeam/greptimedb/pull/7291)
* fix: partition tree metric should the delta by [@evenyag](https://github.com/evenyag) in [#7307](https://github.com/GreptimeTeam/greptimedb/pull/7307)
* fix: implement bulk write for time partitions and bulk memtable by [@evenyag](https://github.com/evenyag) in [#7293](https://github.com/GreptimeTeam/greptimedb/pull/7293)
* fix: metric engine deadlock when altering a group of tables by [@waynexia](https://github.com/waynexia) in [#7308](https://github.com/GreptimeTeam/greptimedb/pull/7308)
* fix: request limiter test case fix by [@fengjiachun](https://github.com/fengjiachun) in [#7323](https://github.com/GreptimeTeam/greptimedb/pull/7323)
* fix: fix write stall that never recovers due to flush logic issues by [@WenyXu](https://github.com/WenyXu) in [#7322](https://github.com/GreptimeTeam/greptimedb/pull/7322)

### 🚜 Refactor

* refactor: remove `export_metrics` and related configuration by [@WaterWhisperer](https://github.com/WaterWhisperer) in [#7236](https://github.com/GreptimeTeam/greptimedb/pull/7236)
* refactor: create `JsonValue` for json value by [@MichaelScofield](https://github.com/MichaelScofield) in [#7214](https://github.com/GreptimeTeam/greptimedb/pull/7214)
* refactor: make `show tables` fast under large tables by [@MichaelScofield](https://github.com/MichaelScofield) in [#7231](https://github.com/GreptimeTeam/greptimedb/pull/7231)
* refactor: remove `Vector`s from `RecordBatch` completely by [@MichaelScofield](https://github.com/MichaelScofield) in [#7184](https://github.com/GreptimeTeam/greptimedb/pull/7184)
* refactor: make json value use json type by [@MichaelScofield](https://github.com/MichaelScofield) in [#7248](https://github.com/GreptimeTeam/greptimedb/pull/7248)
* refactor: pub `HttpOutputWriter` for external use by [@MichaelScofield](https://github.com/MichaelScofield) in [#7287](https://github.com/GreptimeTeam/greptimedb/pull/7287)
* refactor: load metadata using official impl by [@discord9](https://github.com/discord9) in [#7302](https://github.com/GreptimeTeam/greptimedb/pull/7302)

### 📚 Documentation

* docs: update project status and tweak readme by [@killme2008](https://github.com/killme2008) in [#7216](https://github.com/GreptimeTeam/greptimedb/pull/7216)
* docs(config): clarify `store_addrs` format by [@fengys1996](https://github.com/fengys1996) in [#7279](https://github.com/GreptimeTeam/greptimedb/pull/7279)

### ⚡ Performance

* perf: avoid unnecessary merge sort by [@waynexia](https://github.com/waynexia) in [#7274](https://github.com/GreptimeTeam/greptimedb/pull/7274)
* perf: parallelize file source region by [@waynexia](https://github.com/waynexia) in [#7285](https://github.com/GreptimeTeam/greptimedb/pull/7285)

### 🧪 Testing

* test: gc integration test by [@discord9](https://github.com/discord9) in [#7306](https://github.com/GreptimeTeam/greptimedb/pull/7306)

### ⚙️ Miscellaneous Tasks

* chore: allow unlimited return if timerange is applied by [@shuiyisong](https://github.com/shuiyisong) in [#7222](https://github.com/GreptimeTeam/greptimedb/pull/7222)
* chore: add debug log on receiving logs by [@shuiyisong](https://github.com/shuiyisong) in [#7211](https://github.com/GreptimeTeam/greptimedb/pull/7211)
* chore: add `tls-watch` option in cmd by [@shuiyisong](https://github.com/shuiyisong) in [#7226](https://github.com/GreptimeTeam/greptimedb/pull/7226)
* ci: update helm-charts and homebrew-greptime pull request reviewer by [@daviderli614](https://github.com/daviderli614) in [#7232](https://github.com/GreptimeTeam/greptimedb/pull/7232)
* chore: fix SQLness test for `COPY` command from CSV file by [@Standing-Man](https://github.com/Standing-Man) in [#7235](https://github.com/GreptimeTeam/greptimedb/pull/7235)
* ci: dev-build with large page size by [@MichaelScofield](https://github.com/MichaelScofield) in [#7228](https://github.com/GreptimeTeam/greptimedb/pull/7228)
* chore: bump version to beta.2 by [@discord9](https://github.com/discord9) in [#7238](https://github.com/GreptimeTeam/greptimedb/pull/7238)
* ci: update review code owners by [@evenyag](https://github.com/evenyag) in [#7250](https://github.com/GreptimeTeam/greptimedb/pull/7250)
* chore: add tests for election reset and region lease failure handling by [@WenyXu](https://github.com/WenyXu) in [#7266](https://github.com/GreptimeTeam/greptimedb/pull/7266)
* chore: add default value to sparse_primary_key_encoding config item by [@fengys1996](https://github.com/fengys1996) in [#7273](https://github.com/GreptimeTeam/greptimedb/pull/7273)
* chore: add `INFORMATION_SCHEMA_ALERTS_TABLE_ID` const value by [@fengys1996](https://github.com/fengys1996) in [#7288](https://github.com/GreptimeTeam/greptimedb/pull/7288)
* chore: return meaningful message when content type mismatch in otel by [@killme2008](https://github.com/killme2008) in [#7301](https://github.com/GreptimeTeam/greptimedb/pull/7301)
* ci: add multi lang tests workflow into release and nightly workflows by [@killme2008](https://github.com/killme2008) in [#7300](https://github.com/GreptimeTeam/greptimedb/pull/7300)
* chore: optimize search traces from Grafana by [@shuiyisong](https://github.com/shuiyisong) in [#7298](https://github.com/GreptimeTeam/greptimedb/pull/7298)
* chore: return 404 if trace not found by [@shuiyisong](https://github.com/shuiyisong) in [#7304](https://github.com/GreptimeTeam/greptimedb/pull/7304)
* chore: add more fields to DdlManagerConfigureContext by [@fengys1996](https://github.com/fengys1996) in [#7310](https://github.com/GreptimeTeam/greptimedb/pull/7310)

### Build

* build: update opensrv-mysql to 0.10 by [@killme2008](https://github.com/killme2008) in [#7246](https://github.com/GreptimeTeam/greptimedb/pull/7246)

## New Contributors

* [@McKnight22](https://github.com/McKnight22) made their first contribution in [#7162](https://github.com/GreptimeTeam/greptimedb/pull/7162)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@McKnight22](https://github.com/McKnight22), [@MichaelScofield](https://github.com/MichaelScofield), [@SNC123](https://github.com/SNC123), [@Standing-Man](https://github.com/Standing-Man), [@WaterWhisperer](https://github.com/WaterWhisperer), [@WenyXu](https://github.com/WenyXu), [@ZonaHex](https://github.com/ZonaHex), [@daviderli614](https://github.com/daviderli614), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@fengys1996](https://github.com/fengys1996), [@killme2008](https://github.com/killme2008), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@yihong0618](https://github.com/yihong0618)