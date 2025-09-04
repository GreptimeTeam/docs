---
keywords: [release, GreptimeDB, changelog, v0.17.0]
description: GreptimeDB v0.17.0 Changelog
date: 2025-09-03
---

# v0.17.0

Release date: September 03, 2025

### 🚨 Breaking Changes

- **Ordered-set aggregate functions**  
  - Now require a `WITHIN GROUP (ORDER BY …)` clause (e.g., old: `approx_percentile_cont(latency, 0.95)`, new: `approx_percentile_cont(0.95) WITHIN GROUP (ORDER BY latency)`).
- **MySQL protocol**  
  - Incorrect comment styling is no longer allowed; comments must start with `--` instead of `---`.

### 👍 Highlights

- **Flow Support TQL(PromQL):**
  - TQL (Time Query Language) now integrates seamlessly with Flow, enabling advanced time-series computations such as rate calculations, moving averages, and other complex time-window operations. For more details, see [Using TQL with Flow for Advanced Time-Series Analysis](/user-guide/flow-computation/continuous-aggregation/#using-tql-with-flow-for-advanced-time-series-analysis).
- **Performance:**
  - Optimize sparse encoder with a 235% performance boost ([#6809](https://github.com/GreptimeTeam/greptimedb/pull/6809))
  - Introduced region pruning ([#6729](https://github.com/GreptimeTeam/greptimedb/pull/6729), [#6752](https://github.com/GreptimeTeam/greptimedb/pull/6752)).
- **Procedure:**
  - Introduced table reconciliation procedures to automatically detect and repair metadata inconsistencies between Metasrv and Datanode. For more information, refer to the [table reconciliation documentation](/user-guide/deployments-administration/maintenance/table-reconciliation/).
- **Remote WAL:**
  - Replace offset-based remote WAL pruning with size-based pruning strategy and other optimizations ([#6730](https://github.com/GreptimeTeam/greptimedb/pull/6730), [#6732](https://github.com/GreptimeTeam/greptimedb/pull/6732), [#6741](https://github.com/GreptimeTeam/greptimedb/pull/6741), [#6782](https://github.com/GreptimeTeam/greptimedb/pull/6782), [#6816](https://github.com/GreptimeTeam/greptimedb/pull/6816), [#6856](https://github.com/GreptimeTeam/greptimedb/pull/6856)).

### 🚀 Features
*feat: add metrics for reconciliation procedures by [@WenyXu](https://github.com/WenyXu) in [#6652](https://github.com/GreptimeTeam/greptimedb/pull/6652)
* feat(metric-engine): add metadata region cache by [@WenyXu](https://github.com/WenyXu) in [#6657](https://github.com/GreptimeTeam/greptimedb/pull/6657)
* feat: update pgwire to 0.32 by [@sunng87](https://github.com/sunng87) in [#6674](https://github.com/GreptimeTeam/greptimedb/pull/6674)
* feat: Implements an iterator to merge RecordBatches by [@evenyag](https://github.com/evenyag) in [#6666](https://github.com/GreptimeTeam/greptimedb/pull/6666)
* feat: able to set read preference to flownode by [@MichaelScofield](https://github.com/MichaelScofield) in [#6696](https://github.com/GreptimeTeam/greptimedb/pull/6696)
* feat: new HTTP API for formatting SQL by [@waynexia](https://github.com/waynexia) in [#6691](https://github.com/GreptimeTeam/greptimedb/pull/6691)
* feat: Implements last row dedup strategy for flat format by [@evenyag](https://github.com/evenyag) in [#6695](https://github.com/GreptimeTeam/greptimedb/pull/6695)
* feat: mito region staging state by [@waynexia](https://github.com/waynexia) in [#6664](https://github.com/GreptimeTeam/greptimedb/pull/6664)
* feat: Projection mapper for flat schema by [@evenyag](https://github.com/evenyag) in [#6679](https://github.com/GreptimeTeam/greptimedb/pull/6679)
* feat: add all partition column to logical table automatically by [@waynexia](https://github.com/waynexia) in [#6711](https://github.com/GreptimeTeam/greptimedb/pull/6711)
* feat: add integration tests for table reconciliation procedures part1 by [@WenyXu](https://github.com/WenyXu) in [#6705](https://github.com/GreptimeTeam/greptimedb/pull/6705)
* feat(log-query): try infer and cast type for literal value by [@waynexia](https://github.com/waynexia) in [#6712](https://github.com/GreptimeTeam/greptimedb/pull/6712)
* feat: introduce `PeriodicTopicStatsReporter` by [@WenyXu](https://github.com/WenyXu) in [#6730](https://github.com/GreptimeTeam/greptimedb/pull/6730)
* feat(metasrv): implement topic statistics collection by [@WenyXu](https://github.com/WenyXu) in [#6732](https://github.com/GreptimeTeam/greptimedb/pull/6732)
* feat: Store partition expr in RegionMetadata by [@zhongzc](https://github.com/zhongzc) in [#6699](https://github.com/GreptimeTeam/greptimedb/pull/6699)
* feat: improve slow queries options deserialization by [@killme2008](https://github.com/killme2008) in [#6734](https://github.com/GreptimeTeam/greptimedb/pull/6734)
* feat: predicate extractor (region prune part 1) by [@waynexia](https://github.com/waynexia) in [#6729](https://github.com/GreptimeTeam/greptimedb/pull/6729)
* feat: persist manifest, SST and index files to staging dir  by [@waynexia](https://github.com/waynexia) in [#6726](https://github.com/GreptimeTeam/greptimedb/pull/6726)
* feat: mysql add prepared_stmt_cache_capacity by [@sunheyi6](https://github.com/sunheyi6) in [#6639](https://github.com/GreptimeTeam/greptimedb/pull/6639)
* feat: Implements last-non-null dedup strategy for flat format by [@evenyag](https://github.com/evenyag) in [#6709](https://github.com/GreptimeTeam/greptimedb/pull/6709)
* feat: flownode grpc client to frontend tls option by [@discord9](https://github.com/discord9) in [#6750](https://github.com/GreptimeTeam/greptimedb/pull/6750)
* feat: add `RateMeter` for tracking memtable write throughput by [@WenyXu](https://github.com/WenyXu) in [#6744](https://github.com/GreptimeTeam/greptimedb/pull/6744)
* feat: Implements async FlatMergeReader and FlatDedupReader by [@evenyag](https://github.com/evenyag) in [#6761](https://github.com/GreptimeTeam/greptimedb/pull/6761)
* feat: update opentelemetry family by [@sunng87](https://github.com/sunng87) in [#6762](https://github.com/GreptimeTeam/greptimedb/pull/6762)
* feat: derive macro `ToRow` by [@WenyXu](https://github.com/WenyXu) in [#6768](https://github.com/GreptimeTeam/greptimedb/pull/6768)
* feat: disable month in trigger interval expr by [@fengys1996](https://github.com/fengys1996) in [#6774](https://github.com/GreptimeTeam/greptimedb/pull/6774)
* feat: Implements FlatCompatBatch to adapt schema in flat format by [@evenyag](https://github.com/evenyag) in [#6771](https://github.com/GreptimeTeam/greptimedb/pull/6771)
* feat: region prune part 2 by [@waynexia](https://github.com/waynexia) in [#6752](https://github.com/GreptimeTeam/greptimedb/pull/6752)
* feat: simplify more regex patterns in promql by [@waynexia](https://github.com/waynexia) in [#6747](https://github.com/GreptimeTeam/greptimedb/pull/6747)
* feat: add `IntoRow` and `Schema` derive macros by [@WenyXu](https://github.com/WenyXu) in [#6778](https://github.com/GreptimeTeam/greptimedb/pull/6778)
* feat: introduce `PersistStatsHandler`  by [@WenyXu](https://github.com/WenyXu) in [#6777](https://github.com/GreptimeTeam/greptimedb/pull/6777)
* feat: optimize CreateFlowData with lightweight FlowQueryContext by [@aaraujo](https://github.com/aaraujo) in [#6780](https://github.com/GreptimeTeam/greptimedb/pull/6780)
* feat: support for custom headers in otel exporter by [@sunng87](https://github.com/sunng87) in [#6773](https://github.com/GreptimeTeam/greptimedb/pull/6773)
* feat: frontend internal grpc port by [@discord9](https://github.com/discord9) in [#6784](https://github.com/GreptimeTeam/greptimedb/pull/6784)
* feat: provide  plan info when flow exec by [@discord9](https://github.com/discord9) in [#6783](https://github.com/GreptimeTeam/greptimedb/pull/6783)
* feat: update dashboard to v0.11.0 by [@ZonaHex](https://github.com/ZonaHex) in [#6794](https://github.com/GreptimeTeam/greptimedb/pull/6794)
* feat(mito): list SSTs from manifest and storage by [@zhongzc](https://github.com/zhongzc) in [#6766](https://github.com/GreptimeTeam/greptimedb/pull/6766)
* feat: bump opendal to v0.54 by [@killme2008](https://github.com/killme2008) in [#6792](https://github.com/GreptimeTeam/greptimedb/pull/6792)
* feat: add limit to label value api by [@sunng87](https://github.com/sunng87) in [#6795](https://github.com/GreptimeTeam/greptimedb/pull/6795)
* feat: add cli option for internal grpc by [@sunng87](https://github.com/sunng87) in [#6806](https://github.com/GreptimeTeam/greptimedb/pull/6806)
* feat: add FlatConvertFormat to convert record batches in old format to the flat format by [@evenyag](https://github.com/evenyag) in [#6786](https://github.com/GreptimeTeam/greptimedb/pull/6786)
* feat: name label regex matcher in label values api by [@sunng87](https://github.com/sunng87) in [#6799](https://github.com/GreptimeTeam/greptimedb/pull/6799)
* feat: only show prometheus logical tables for __name__ values query by [@sunng87](https://github.com/sunng87) in [#6814](https://github.com/GreptimeTeam/greptimedb/pull/6814)
* feat: update dashboard to v0.11.1 by [@ZonaHex](https://github.com/ZonaHex) in [#6824](https://github.com/GreptimeTeam/greptimedb/pull/6824)
* feat: resolve unused dependencies with cargo-udeps (#6578) by [@Arshdeep54](https://github.com/Arshdeep54) in [#6619](https://github.com/GreptimeTeam/greptimedb/pull/6619)
* feat: add support for TWCS time window hints in insert operations by [@WenyXu](https://github.com/WenyXu) in [#6823](https://github.com/GreptimeTeam/greptimedb/pull/6823)
* feat: functions and structs to scan flat format file and mem ranges by [@evenyag](https://github.com/evenyag) in [#6817](https://github.com/GreptimeTeam/greptimedb/pull/6817)
* feat: add replay checkpoint to reduce overhead for remote WAL by [@WenyXu](https://github.com/WenyXu) in [#6816](https://github.com/GreptimeTeam/greptimedb/pull/6816)
* feat(metasrv): support tls for etcd client by [@codephage2020](https://github.com/codephage2020) in [#6818](https://github.com/GreptimeTeam/greptimedb/pull/6818)
* feat(flow): add eval interval option by [@discord9](https://github.com/discord9) in [#6623](https://github.com/GreptimeTeam/greptimedb/pull/6623)
* feat: rename `region_statistics` to `region_statistics_history` by [@WenyXu](https://github.com/WenyXu) in [#6837](https://github.com/GreptimeTeam/greptimedb/pull/6837)
* feat: add event ts to region manifest by [@discord9](https://github.com/discord9) in [#6751](https://github.com/GreptimeTeam/greptimedb/pull/6751)
* feat: add optional schema for Postgres metadata tables by [@zqr10159](https://github.com/zqr10159) in [#6764](https://github.com/GreptimeTeam/greptimedb/pull/6764)
* feat: update dashboard to v0.11.2 by [@ZonaHex](https://github.com/ZonaHex) in [#6843](https://github.com/GreptimeTeam/greptimedb/pull/6843)
* feat: flow prom ql auto sink table is also promql-able by [@discord9](https://github.com/discord9) in [#6852](https://github.com/GreptimeTeam/greptimedb/pull/6852)
* feat: make etcd store max codec size configurable by [@fengjiachun](https://github.com/fengjiachun) in [#6859](https://github.com/GreptimeTeam/greptimedb/pull/6859)
* feat: Support more key types for the DictionaryVector by [@evenyag](https://github.com/evenyag) in [#6855](https://github.com/GreptimeTeam/greptimedb/pull/6855)
* feat: update rate limiter to use semaphore that will block without re… by [@sunng87](https://github.com/sunng87) in [#6853](https://github.com/GreptimeTeam/greptimedb/pull/6853)
* feat: update dashboard to v0.11.3 by [@ZonaHex](https://github.com/ZonaHex) in [#6864](https://github.com/GreptimeTeam/greptimedb/pull/6864)
* feat: add schema and recordbatch builder for sst entry by [@zhongzc](https://github.com/zhongzc) in [#6841](https://github.com/GreptimeTeam/greptimedb/pull/6841)
* feat: Update parquet writer and indexer to support the flat format by [@evenyag](https://github.com/evenyag) in [#6866](https://github.com/GreptimeTeam/greptimedb/pull/6866)
* feat: flow full aggr only trigger on new data by [@discord9](https://github.com/discord9) in [#6880](https://github.com/GreptimeTeam/greptimedb/pull/6880)

### 🐛 Bug Fixes

* fix: correctly set extension range source index by [@MichaelScofield](https://github.com/MichaelScofield) in [#6692](https://github.com/GreptimeTeam/greptimedb/pull/6692)
* fix: TQL CTE parser take raw query string by [@waynexia](https://github.com/waynexia) in [#6671](https://github.com/GreptimeTeam/greptimedb/pull/6671)
* fix: metrics without physical partition columns query push down by [@discord9](https://github.com/discord9) in [#6694](https://github.com/GreptimeTeam/greptimedb/pull/6694)
* fix: unit test about trigger labels parse by [@fengys1996](https://github.com/fengys1996) in [#6716](https://github.com/GreptimeTeam/greptimedb/pull/6716)
* fix: http and tql should return the same value for unknown by [@yihong0618](https://github.com/yihong0618) in [#6718](https://github.com/GreptimeTeam/greptimedb/pull/6718)
* fix: update pgwire to fix windows timeout issue by [@sunng87](https://github.com/sunng87) in [#6710](https://github.com/GreptimeTeam/greptimedb/pull/6710)
* fix: correct offset's symbol by [@waynexia](https://github.com/waynexia) in [#6728](https://github.com/GreptimeTeam/greptimedb/pull/6728)
* fix: label_join should work with unknown by [@yihong0618](https://github.com/yihong0618) in [#6714](https://github.com/GreptimeTeam/greptimedb/pull/6714)
* fix: two label_replace different from promql by [@yihong0618](https://github.com/yihong0618) in [#6720](https://github.com/GreptimeTeam/greptimedb/pull/6720)
* fix: support unknown for timestamp function by [@yihong0618](https://github.com/yihong0618) in [#6708](https://github.com/GreptimeTeam/greptimedb/pull/6708)
* fix: truncate manifest action compat by [@discord9](https://github.com/discord9) in [#6742](https://github.com/GreptimeTeam/greptimedb/pull/6742)
* fix: refine shadowrs dependency, remove libgit2, libz and potentially libssl by [@sunng87](https://github.com/sunng87) in [#6748](https://github.com/GreptimeTeam/greptimedb/pull/6748)
* fix: partition tree's dict size metrics mismatch by [@waynexia](https://github.com/waynexia) in [#6746](https://github.com/GreptimeTeam/greptimedb/pull/6746)
* fix: time() function should the same as behavior prometheus by [@yihong0618](https://github.com/yihong0618) in [#6704](https://github.com/GreptimeTeam/greptimedb/pull/6704)
* fix: time unit mismatch in `lookup_frontends` function by [@WenyXu](https://github.com/WenyXu) in [#6798](https://github.com/GreptimeTeam/greptimedb/pull/6798)
* fix: plan disorder from upgrading datafusion by [@waynexia](https://github.com/waynexia) in [#6787](https://github.com/GreptimeTeam/greptimedb/pull/6787)
* fix: follow promql rule for hanndling label of aggr by [@waynexia](https://github.com/waynexia) in [#6788](https://github.com/GreptimeTeam/greptimedb/pull/6788)
* fix: correct heartbeat stream handling logic  by [@WenyXu](https://github.com/WenyXu) in [#6821](https://github.com/GreptimeTeam/greptimedb/pull/6821)
* fix: prevent stale physical table route during procedure retries by [@WenyXu](https://github.com/WenyXu) in [#6825](https://github.com/GreptimeTeam/greptimedb/pull/6825)
* fix: use actual buf size as cache page value size by [@evenyag](https://github.com/evenyag) in [#6829](https://github.com/GreptimeTeam/greptimedb/pull/6829)
* fix: gRPC auth by [@shuiyisong](https://github.com/shuiyisong) in [#6827](https://github.com/GreptimeTeam/greptimedb/pull/6827)
* fix: correct config doc by [@WenyXu](https://github.com/WenyXu) in [#6836](https://github.com/GreptimeTeam/greptimedb/pull/6836)
* fix: no need to early lookup DNS for kafka broker by [@MichaelScofield](https://github.com/MichaelScofield) in [#6845](https://github.com/GreptimeTeam/greptimedb/pull/6845)
* fix: use configured kv_client in etcd multi-transaction operations by [@WenyXu](https://github.com/WenyXu) in [#6871](https://github.com/GreptimeTeam/greptimedb/pull/6871)
* fix: fix incorrect timestamp precision in information_schema.tables by [@WenyXu](https://github.com/WenyXu) in [#6872](https://github.com/GreptimeTeam/greptimedb/pull/6872)
* fix(flow): promql auto create table by [@discord9](https://github.com/discord9) in [#6867](https://github.com/GreptimeTeam/greptimedb/pull/6867)
* fix: ignore reserved column IDs and prevent panic on chunk_size is zero by [@WenyXu](https://github.com/WenyXu) in [#6882](https://github.com/GreptimeTeam/greptimedb/pull/6882)
* fix: prune intermediate dirs on index finish and region pruge by [@zhongzc](https://github.com/zhongzc) in [#6878](https://github.com/GreptimeTeam/greptimedb/pull/6878)
* fix: initialize remote WAL regions with correct flushed entry IDs by [@WenyXu](https://github.com/WenyXu) in [#6856](https://github.com/GreptimeTeam/greptimedb/pull/6856)
* fix: move prune_region_dir to region drop by [@zhongzc](https://github.com/zhongzc) in [#6891](https://github.com/GreptimeTeam/greptimedb/pull/6891)

### 🚜 Refactor

* refactor: refine error status code mappings by [@WenyXu](https://github.com/WenyXu) in [#6678](https://github.com/GreptimeTeam/greptimedb/pull/6678)
* refactor: unify the event recorder by [@zyy17](https://github.com/zyy17) in [#6689](https://github.com/GreptimeTeam/greptimedb/pull/6689)
* refactor: use DummyCatalog to construct query engine for datanode by [@zhongzc](https://github.com/zhongzc) in [#6723](https://github.com/GreptimeTeam/greptimedb/pull/6723)
* refactor: split node manager trait by [@zhongzc](https://github.com/zhongzc) in [#6743](https://github.com/GreptimeTeam/greptimedb/pull/6743)
* refactor: simplify WAL pruning procedure  and introduce region flush trigger by [@WenyXu](https://github.com/WenyXu) in [#6741](https://github.com/GreptimeTeam/greptimedb/pull/6741)
* refactor: enhanced trigger interval by [@fengys1996](https://github.com/fengys1996) in [#6740](https://github.com/GreptimeTeam/greptimedb/pull/6740)
* refactor: change plugin option type from `&[PluginOptions]` to `Option<&PluginOptions>` for understandability by [@zyy17](https://github.com/zyy17) in [#6763](https://github.com/GreptimeTeam/greptimedb/pull/6763)
* refactor: refactor admin functions with async udf by [@killme2008](https://github.com/killme2008) in [#6770](https://github.com/GreptimeTeam/greptimedb/pull/6770)
* refactor: use DataFusion's UDAF implementation directly by [@MichaelScofield](https://github.com/MichaelScofield) in [#6776](https://github.com/GreptimeTeam/greptimedb/pull/6776)
* refactor: simplify WAL Pruning procedure part2 by [@WenyXu](https://github.com/WenyXu) in [#6782](https://github.com/GreptimeTeam/greptimedb/pull/6782)
* refactor(meta): refactor admin service to use modern axum handlers by [@WenyXu](https://github.com/WenyXu) in [#6833](https://github.com/GreptimeTeam/greptimedb/pull/6833)
* refactor: add stop methods for `LocalFilePurger` and `CompactionRegion` by [@zyy17](https://github.com/zyy17) in [#6848](https://github.com/GreptimeTeam/greptimedb/pull/6848)
* refactor: query config options by [@killme2008](https://github.com/killme2008) in [#6781](https://github.com/GreptimeTeam/greptimedb/pull/6781)

### 📚 Documentation

* docs(rfc): rfc for gc worker by [@discord9](https://github.com/discord9) in [#6572](https://github.com/GreptimeTeam/greptimedb/pull/6572)
* docs: improve CONTRIBUTING.md by [@killme2008](https://github.com/killme2008) in [#6698](https://github.com/GreptimeTeam/greptimedb/pull/6698)
* docs: add internal grpc ports by [@discord9](https://github.com/discord9) in [#6815](https://github.com/GreptimeTeam/greptimedb/pull/6815)
* docs(rfc): async index build by [@SNC123](https://github.com/SNC123) in [#6757](https://github.com/GreptimeTeam/greptimedb/pull/6757)

### ⚡ Performance

* perf: improve bloom filter reader's byte reading logic by [@waynexia](https://github.com/waynexia) in [#6658](https://github.com/GreptimeTeam/greptimedb/pull/6658)
* perf: sparse encoder by [@v0y4g3r](https://github.com/v0y4g3r) in [#6809](https://github.com/GreptimeTeam/greptimedb/pull/6809)

### 🧪 Testing

* test: fix sqlness hash character count by [@sunng87](https://github.com/sunng87) in [#6758](https://github.com/GreptimeTeam/greptimedb/pull/6758)

### ⚙️ Miscellaneous Tasks

* chore: pub access layer by [@evenyag](https://github.com/evenyag) in [#6670](https://github.com/GreptimeTeam/greptimedb/pull/6670)
* chore: add and/or for log query by [@paomian](https://github.com/paomian) in [#6681](https://github.com/GreptimeTeam/greptimedb/pull/6681)
* chore: impl cast from primitives to PathType by [@v0y4g3r](https://github.com/v0y4g3r) in [#6724](https://github.com/GreptimeTeam/greptimedb/pull/6724)
* chore: prefix debug_assertion only variables with underscore by [@waynexia](https://github.com/waynexia) in [#6727](https://github.com/GreptimeTeam/greptimedb/pull/6727)
* chore: add u64 for EqualValue and set expr is true when filter is empty by [@paomian](https://github.com/paomian) in [#6731](https://github.com/GreptimeTeam/greptimedb/pull/6731)
* chore: update datafusion family by [@MichaelScofield](https://github.com/MichaelScofield) in [#6675](https://github.com/GreptimeTeam/greptimedb/pull/6675)
* ci: update dev-builder image tag by [@github-actions[bot]](https://github.com/github-actions[bot]) in [#6759](https://github.com/GreptimeTeam/greptimedb/pull/6759)
* ci: add Signed-off-by in update-dev-builder-version script by [@daviderli614](https://github.com/daviderli614) in [#6765](https://github.com/GreptimeTeam/greptimedb/pull/6765)
* ci: add `is-current-version-latest` check to `helm-charts/homebrew-greptime` bump jobs by [@daviderli614](https://github.com/daviderli614) in [#6772](https://github.com/GreptimeTeam/greptimedb/pull/6772)
* chore: no logging when init table_flow cache if empty by [@discord9](https://github.com/discord9) in [#6785](https://github.com/GreptimeTeam/greptimedb/pull/6785)
* chore: make internal grpc optional by [@discord9](https://github.com/discord9) in [#6789](https://github.com/GreptimeTeam/greptimedb/pull/6789)
* chore: improve error message when there are more than one time index by [@killme2008](https://github.com/killme2008) in [#6796](https://github.com/GreptimeTeam/greptimedb/pull/6796)
* chore: modifying the visibility of the ScalarFunctionFactory field by [@paomian](https://github.com/paomian) in [#6797](https://github.com/GreptimeTeam/greptimedb/pull/6797)
* chore: add peer address context to client error logging by [@WenyXu](https://github.com/WenyXu) in [#6793](https://github.com/GreptimeTeam/greptimedb/pull/6793)
* chore: revert #6763 by [@zyy17](https://github.com/zyy17) in [#6800](https://github.com/GreptimeTeam/greptimedb/pull/6800)
* chore: remove unused deps by [@WenyXu](https://github.com/WenyXu) in [#6828](https://github.com/GreptimeTeam/greptimedb/pull/6828)
* chore: update bitnami config by [@daviderli614](https://github.com/daviderli614) in [#6847](https://github.com/GreptimeTeam/greptimedb/pull/6847)
* chore: run `pull-test-deps-images.sh` before docker compose  to avoid rate limit by [@zyy17](https://github.com/zyy17) in [#6851](https://github.com/GreptimeTeam/greptimedb/pull/6851)
* chore: add server-side error logging to improve observability in gRPC by [@WenyXu](https://github.com/WenyXu) in [#6846](https://github.com/GreptimeTeam/greptimedb/pull/6846)
* ci: install ssh for Android dev-builder by [@MichaelScofield](https://github.com/MichaelScofield) in [#6854](https://github.com/GreptimeTeam/greptimedb/pull/6854)
* ci: update dev-builder image tag by [@github-actions[bot]](https://github.com/github-actions[bot]) in [#6858](https://github.com/GreptimeTeam/greptimedb/pull/6858)
* chore: enlarge max file limit to 384 by [@evenyag](https://github.com/evenyag) in [#6868](https://github.com/GreptimeTeam/greptimedb/pull/6868)
* chore: change encode raw values signature by [@v0y4g3r](https://github.com/v0y4g3r) in [#6869](https://github.com/GreptimeTeam/greptimedb/pull/6869)
* chore: use greptime dockerhub image by [@daviderli614](https://github.com/daviderli614) in [#6865](https://github.com/GreptimeTeam/greptimedb/pull/6865)
* chore: update dashboard by [@WenyXu](https://github.com/WenyXu) in [#6883](https://github.com/GreptimeTeam/greptimedb/pull/6883)
* chore: fix typo by [@waynexia](https://github.com/waynexia) in [#6885](https://github.com/GreptimeTeam/greptimedb/pull/6885)
* chore: fix typo by [@WenyXu](https://github.com/WenyXu) in [#6887](https://github.com/GreptimeTeam/greptimedb/pull/6887)
* chore: disable stats persistence by default by [@WenyXu](https://github.com/WenyXu) in [#6900](https://github.com/GreptimeTeam/greptimedb/pull/6900)

## New Contributors
* [@github-actions[bot]](https://github.com/github-actions[bot]) made their first contribution in [#6858](https://github.com/GreptimeTeam/greptimedb/pull/6858)
* [@aaraujo](https://github.com/aaraujo) made their first contribution in [#6780](https://github.com/GreptimeTeam/greptimedb/pull/6780)
* [@sunheyi6](https://github.com/sunheyi6) made their first contribution in [#6639](https://github.com/GreptimeTeam/greptimedb/pull/6639)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@Arshdeep54](https://github.com/Arshdeep54), [@MichaelScofield](https://github.com/MichaelScofield), [@SNC123](https://github.com/SNC123), [@WaterWhisperer](https://github.com/WaterWhisperer), [@WenyXu](https://github.com/WenyXu), [@ZonaHex](https://github.com/ZonaHex), [@aaraujo](https://github.com/aaraujo), [@codephage2020](https://github.com/codephage2020), [@daviderli614](https://github.com/daviderli614), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@fengys1996](https://github.com/fengys1996), [@github-actions[bot]](https://github.com/github-actions[bot]), [@killme2008](https://github.com/killme2008), [@paomian](https://github.com/paomian), [@shuiyisong](https://github.com/shuiyisong), [@sunheyi6](https://github.com/sunheyi6), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@yihong0618](https://github.com/yihong0618), [@zhongzc](https://github.com/zhongzc), [@zqr10159](https://github.com/zqr10159), [@zyy17](https://github.com/zyy17)