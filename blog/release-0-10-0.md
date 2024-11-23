---
date: 2024-11-22
---

# v0.10.0

Release date: November 22, 2024

## 👍 Highlights

* [Vector type](https://docs.greptime.com/user-guide/vectors/vector-type): GreptimeDB supports vector data types to optimize edge scenarios, such as IoT in vehicles, enabling efficient storage and computation of vector data for real-time perception and AI applications in smart driving.
* [Free index](https://docs.greptime.com/reference/sql/create#inverted-index): Inverted indexes are no longer tied to primary keys, allowing users to create them on any column, enhancing query flexibility and efficiency across different scenarios.
* [Alter table options](https://docs.greptime.com/reference/sql/alter): Enhancements include setting TTL for databases and tables, modifying compaction parameters, and enabling/disabling full-text indexes on columns.
* Loki remote write: GreptimeDB now supports the Loki remote write protocol, allowing users to log data in Loki format through Grafana tools.
* Performance Optimization: Up to 10x improvement for queries fetching the latest N records by timestamp (`ORDER BY timestamp DESC LIMIT N`).

## Breaking changes

* fix!: replace timeout_millis and connect_timeout_millis with Duration in DatanodeClientOptions by [@WenyXu](https://github.com/WenyXu) in [#4867](https://github.com/GreptimeTeam/greptimedb/pull/4867)
* feat!: Divide flush and compaction job pool by [@evenyag](https://github.com/evenyag) in [#4871](https://github.com/GreptimeTeam/greptimedb/pull/4871)

### 🚀 Features

* feat: yields empty batch after reading a range by [@evenyag](https://github.com/evenyag) in [#4845](https://github.com/GreptimeTeam/greptimedb/pull/4845)
* feat: update dashboard to v0.6.0 by [@ZonaHex](https://github.com/ZonaHex) in [#4861](https://github.com/GreptimeTeam/greptimedb/pull/4861)
* feat: Sort within each PartitionRange by [@discord9](https://github.com/discord9) in [#4847](https://github.com/GreptimeTeam/greptimedb/pull/4847)
* feat: Add functionality to the Opentelemetry write interface to extract fields from attr to top-level data.  by [@paomian](https://github.com/paomian) in [#4859](https://github.com/GreptimeTeam/greptimedb/pull/4859)
* feat: Limit CPU in runtime (#3685) by [@ActivePeter](https://github.com/ActivePeter) in [#4782](https://github.com/GreptimeTeam/greptimedb/pull/4782)
* feat: introduce the `PluginOptions` by [@WenyXu](https://github.com/WenyXu) in [#4835](https://github.com/GreptimeTeam/greptimedb/pull/4835)
* feat: add json_path_match udf by [@Kev1n8](https://github.com/Kev1n8) in [#4864](https://github.com/GreptimeTeam/greptimedb/pull/4864)
* feat: optimizer rule for windowed sort by [@waynexia](https://github.com/waynexia) in [#4874](https://github.com/GreptimeTeam/greptimedb/pull/4874)
* feat(index): support building inverted index for the field column on Mito by [@zhongzc](https://github.com/zhongzc) in [#4887](https://github.com/GreptimeTeam/greptimedb/pull/4887)
* feat: add json datatype for grpc protocol by [@WenyXu](https://github.com/WenyXu) in [#4897](https://github.com/GreptimeTeam/greptimedb/pull/4897)
* feat: Support altering table TTL by [@v0y4g3r](https://github.com/v0y4g3r) in [#4848](https://github.com/GreptimeTeam/greptimedb/pull/4848)
* feat: adds the number of rows and index files size to region_statistics table by [@killme2008](https://github.com/killme2008) in [#4909](https://github.com/GreptimeTeam/greptimedb/pull/4909)
* feat: implement parse_query api by [@sunng87](https://github.com/sunng87) in [#4860](https://github.com/GreptimeTeam/greptimedb/pull/4860)
* feat: enhance windowed-sort optimizer rule by [@waynexia](https://github.com/waynexia) in [#4910](https://github.com/GreptimeTeam/greptimedb/pull/4910)
* feat: get row group time range from cached metadata by [@evenyag](https://github.com/evenyag) in [#4869](https://github.com/GreptimeTeam/greptimedb/pull/4869)
* feat: simple limit impl in PartSort by [@waynexia](https://github.com/waynexia) in [#4922](https://github.com/GreptimeTeam/greptimedb/pull/4922)
* feat: heartbeat_flush_threshold option by [@fengjiachun](https://github.com/fengjiachun) in [#4924](https://github.com/GreptimeTeam/greptimedb/pull/4924)
* feat: support to insert json data via grpc protocol by [@WenyXu](https://github.com/WenyXu) in [#4908](https://github.com/GreptimeTeam/greptimedb/pull/4908)
* feat: add more geo functions by [@sunng87](https://github.com/sunng87) in [#4888](https://github.com/GreptimeTeam/greptimedb/pull/4888)
* feat: support filter with windowed sort by [@waynexia](https://github.com/waynexia) in [#4960](https://github.com/GreptimeTeam/greptimedb/pull/4960)
* feat(index): support SQL to specify inverted index columns by [@zhongzc](https://github.com/zhongzc) in [#4929](https://github.com/GreptimeTeam/greptimedb/pull/4929)
* feat(puffin): apply range reader by [@zhongzc](https://github.com/zhongzc) in [#4928](https://github.com/GreptimeTeam/greptimedb/pull/4928)
* feat: alter fulltext options by [@CookiePieWw](https://github.com/CookiePieWw) in [#4952](https://github.com/GreptimeTeam/greptimedb/pull/4952)
* feat: introduce vector type by [@zhongzc](https://github.com/zhongzc) in [#4964](https://github.com/GreptimeTeam/greptimedb/pull/4964)
* feat: refine region state checks and handle stalled requests by [@WenyXu](https://github.com/WenyXu) in [#4971](https://github.com/GreptimeTeam/greptimedb/pull/4971)
* feat: support alter twcs compaction options by [@lyang24](https://github.com/lyang24) in [#4965](https://github.com/GreptimeTeam/greptimedb/pull/4965)
* feat: add distance functions by [@zhongzc](https://github.com/zhongzc) in [#4987](https://github.com/GreptimeTeam/greptimedb/pull/4987)
* feat: implement statement/execution timeout session variable by [@lyang24](https://github.com/lyang24) in [#4792](https://github.com/GreptimeTeam/greptimedb/pull/4792)
* feat: introduce `DynamicTimeoutLayer` by [@WenyXu](https://github.com/WenyXu) in [#5006](https://github.com/GreptimeTeam/greptimedb/pull/5006)
* feat: Loki remote write by [@shuiyisong](https://github.com/shuiyisong) in [#4941](https://github.com/GreptimeTeam/greptimedb/pull/4941)
* feat: make greatest supports timestamp and datetime types by [@killme2008](https://github.com/killme2008) in [#5005](https://github.com/GreptimeTeam/greptimedb/pull/5005)
* feat: update dashboard to v0.6.1 by [@ZonaHex](https://github.com/ZonaHex) in [#5017](https://github.com/GreptimeTeam/greptimedb/pull/5017)
* feat: CREATE OR REPLACE FLOW by [@discord9](https://github.com/discord9) in [#5001](https://github.com/GreptimeTeam/greptimedb/pull/5001)
* feat: also shutdown gracefully on sigterm on unix by [@discord9](https://github.com/discord9) in [#5023](https://github.com/GreptimeTeam/greptimedb/pull/5023)
* feat(vector): remove `simsimd` and use `nalgebra` instead by [@zhongzc](https://github.com/zhongzc) in [#5027](https://github.com/GreptimeTeam/greptimedb/pull/5027)
* feat: reimplement limit in PartSort to reduce memory footprint by [@waynexia](https://github.com/waynexia) in [#5018](https://github.com/GreptimeTeam/greptimedb/pull/5018)
* feat(vector): add conversion between vector and string by [@zhongzc](https://github.com/zhongzc) in [#5029](https://github.com/GreptimeTeam/greptimedb/pull/5029)
* feat: add unset table options support by [@WenyXu](https://github.com/WenyXu) in [#5034](https://github.com/GreptimeTeam/greptimedb/pull/5034)
* feat: alter database ttl by [@CookiePieWw](https://github.com/CookiePieWw) in [#5035](https://github.com/GreptimeTeam/greptimedb/pull/5035)

### 🐛 Bug Fixes

* fix: fix broken import by [@WenyXu](https://github.com/WenyXu) in [#4880](https://github.com/GreptimeTeam/greptimedb/pull/4880)
* fix: pyo3 ut by [@v0y4g3r](https://github.com/v0y4g3r) in [#4894](https://github.com/GreptimeTeam/greptimedb/pull/4894)
* fix(config): update tracing section headers in example TOML files by [@waynexia](https://github.com/waynexia) in [#4898](https://github.com/GreptimeTeam/greptimedb/pull/4898)
* fix: set transaction variables not working in mysql protocol by [@killme2008](https://github.com/killme2008) in [#4912](https://github.com/GreptimeTeam/greptimedb/pull/4912)
* fix: prune batches from memtable by time range by [@evenyag](https://github.com/evenyag) in [#4913](https://github.com/GreptimeTeam/greptimedb/pull/4913)
* fix: typo by [@killme2008](https://github.com/killme2008) in [#4931](https://github.com/GreptimeTeam/greptimedb/pull/4931)
* fix: panic when jsonb corrupted by [@CookiePieWw](https://github.com/CookiePieWw) in [#4919](https://github.com/GreptimeTeam/greptimedb/pull/4919)
* fix: data_length, index_length, table_rows in tables by [@killme2008](https://github.com/killme2008) in [#4927](https://github.com/GreptimeTeam/greptimedb/pull/4927)
* fix: violations of `elided_named_lifetimes` by [@WenyXu](https://github.com/WenyXu) in [#4936](https://github.com/GreptimeTeam/greptimedb/pull/4936)
* fix: database base ttl by [@v0y4g3r](https://github.com/v0y4g3r) in [#4926](https://github.com/GreptimeTeam/greptimedb/pull/4926)
* fix: pprof by [@discord9](https://github.com/discord9) in [#4938](https://github.com/GreptimeTeam/greptimedb/pull/4938)
* fix: the region_stats API will return an error in instance test by [@linyihai](https://github.com/linyihai) in [#4951](https://github.com/GreptimeTeam/greptimedb/pull/4951)
* fix: bugs introduced by alter table options by [@killme2008](https://github.com/killme2008) in [#4953](https://github.com/GreptimeTeam/greptimedb/pull/4953)
* fix: do not pick compacting/expired files by [@evenyag](https://github.com/evenyag) in [#4955](https://github.com/GreptimeTeam/greptimedb/pull/4955)
* fix: round euclidean result in sqlness by [@v0y4g3r](https://github.com/v0y4g3r) in [#4956](https://github.com/GreptimeTeam/greptimedb/pull/4956)
* fix: column already exists by [@waynexia](https://github.com/waynexia) in [#4961](https://github.com/GreptimeTeam/greptimedb/pull/4961)
* fix: json_path_exists null results by [@Kev1n8](https://github.com/Kev1n8) in [#4881](https://github.com/GreptimeTeam/greptimedb/pull/4881)
* fix(otlp): replace otlp trace attr type from string to jsonb by [@paomian](https://github.com/paomian) in [#4918](https://github.com/GreptimeTeam/greptimedb/pull/4918)
* fix: alter table add column id alloc mismatch by [@discord9](https://github.com/discord9) in [#4972](https://github.com/GreptimeTeam/greptimedb/pull/4972)
* fix: physical table statistics info by [@killme2008](https://github.com/killme2008) in [#4975](https://github.com/GreptimeTeam/greptimedb/pull/4975)
* fix: run `install.sh` error by [@zyy17](https://github.com/zyy17) in [#4989](https://github.com/GreptimeTeam/greptimedb/pull/4989)
* fix: obsolete wal entries while opening a migrated region by [@WenyXu](https://github.com/WenyXu) in [#4993](https://github.com/GreptimeTeam/greptimedb/pull/4993)
* fix: ensure Create Or Replace and If Not Exist cannot coexist in create view by [@lyang24](https://github.com/lyang24) in [#5003](https://github.com/GreptimeTeam/greptimedb/pull/5003)
* fix: correct `unset_maintenance_mode` behavior by [@WenyXu](https://github.com/WenyXu) in [#5009](https://github.com/GreptimeTeam/greptimedb/pull/5009)
* fix: distinct respect in range by [@discord9](https://github.com/discord9) in [#5015](https://github.com/GreptimeTeam/greptimedb/pull/5015)
* fix: inverted index constraint to be case-insensitive by [@zhongzc](https://github.com/zhongzc) in [#5020](https://github.com/GreptimeTeam/greptimedb/pull/5020)
* fix: android build failed due to simsimd by [@zhongzc](https://github.com/zhongzc) in [#5019](https://github.com/GreptimeTeam/greptimedb/pull/5019)
* fix: prune memtable/files range independently in each partition by [@evenyag](https://github.com/evenyag) in [#4998](https://github.com/GreptimeTeam/greptimedb/pull/4998)
* fix: find latest window by [@v0y4g3r](https://github.com/v0y4g3r) in [#5037](https://github.com/GreptimeTeam/greptimedb/pull/5037)
* fix: prepare param mismatch by [@CookiePieWw](https://github.com/CookiePieWw) in [#5025](https://github.com/GreptimeTeam/greptimedb/pull/5025)

### 🚜 Refactor

* refactor: json conversion by [@CookiePieWw](https://github.com/CookiePieWw) in [#4893](https://github.com/GreptimeTeam/greptimedb/pull/4893)
* refactor: make use of the "pre_execute" in sql execution interceptor by [@MichaelScofield](https://github.com/MichaelScofield) in [#4875](https://github.com/GreptimeTeam/greptimedb/pull/4875)
* refactor: simplify WeightedChoose by [@WenyXu](https://github.com/WenyXu) in [#4916](https://github.com/GreptimeTeam/greptimedb/pull/4916)
* refactor: refactor alter parser by [@CookiePieWw](https://github.com/CookiePieWw) in [#4933](https://github.com/GreptimeTeam/greptimedb/pull/4933)
* refactor: pass `LogicalPlan` to promql execution interceptor by [@MichaelScofield](https://github.com/MichaelScofield) in [#4937](https://github.com/GreptimeTeam/greptimedb/pull/4937)
* refactor: consolidate `DatanodeClientOptions` by [@linyihai](https://github.com/linyihai) in [#4966](https://github.com/GreptimeTeam/greptimedb/pull/4966)
* refactor: support distinct JSON format and improve type conversions by [@WenyXu](https://github.com/WenyXu) in [#4979](https://github.com/GreptimeTeam/greptimedb/pull/4979)
* refactor(mito): tidy memtable stats by [@v0y4g3r](https://github.com/v0y4g3r) in [#4982](https://github.com/GreptimeTeam/greptimedb/pull/4982)
* refactor: use UNSET instead of enable by [@CookiePieWw](https://github.com/CookiePieWw) in [#4983](https://github.com/GreptimeTeam/greptimedb/pull/4983)
* refactor(grafana): update cluster dashboard by [@zyy17](https://github.com/zyy17) in [#4980](https://github.com/GreptimeTeam/greptimedb/pull/4980)
* refactor: Avoid wrapping Option for CacheManagerRef by [@linyihai](https://github.com/linyihai) in [#4996](https://github.com/GreptimeTeam/greptimedb/pull/4996)
* refactor: introduce `MaintenanceModeManager` by [@WenyXu](https://github.com/WenyXu) in [#4994](https://github.com/GreptimeTeam/greptimedb/pull/4994)
* refactor: split up different stmts by [@CookiePieWw](https://github.com/CookiePieWw) in [#4997](https://github.com/GreptimeTeam/greptimedb/pull/4997)
* refactor: unify mysql execute through cli and protocol by [@CookiePieWw](https://github.com/CookiePieWw) in [#5038](https://github.com/GreptimeTeam/greptimedb/pull/5038)

### 📚 Documentation

* docs: change cpu/mem panel to time-series by [@evenyag](https://github.com/evenyag) in [#4844](https://github.com/GreptimeTeam/greptimedb/pull/4844)
* docs: add TOC to readme by [@killme2008](https://github.com/killme2008) in [#4949](https://github.com/GreptimeTeam/greptimedb/pull/4949)

### 🧪 Testing

* test: add fuzz test for metric region migration by [@WenyXu](https://github.com/WenyXu) in [#4862](https://github.com/GreptimeTeam/greptimedb/pull/4862)
* test: more sqlness tests for flow by [@discord9](https://github.com/discord9) in [#4988](https://github.com/GreptimeTeam/greptimedb/pull/4988)
* test: subquery test migrated from duckdb by [@CookiePieWw](https://github.com/CookiePieWw) in [#4985](https://github.com/GreptimeTeam/greptimedb/pull/4985)
* test: reduce round precision to avoid platform diff by [@zhongzc](https://github.com/zhongzc) in [#5013](https://github.com/GreptimeTeam/greptimedb/pull/5013)

### ⚙️ Miscellaneous Tasks

* chore: bump greptime-meter by [@v0y4g3r](https://github.com/v0y4g3r) in [#4858](https://github.com/GreptimeTeam/greptimedb/pull/4858)
* chore: make pusher log easy to understand by [@fengjiachun](https://github.com/fengjiachun) in [#4841](https://github.com/GreptimeTeam/greptimedb/pull/4841)
* chore: better column schema check for flow by [@discord9](https://github.com/discord9) in [#4855](https://github.com/GreptimeTeam/greptimedb/pull/4855)
* chore: udapte Rust toolchain to 2024-10-19 by [@v0y4g3r](https://github.com/v0y4g3r) in [#4857](https://github.com/GreptimeTeam/greptimedb/pull/4857)
* chore: add schema urls to otlp logs by [@shuiyisong](https://github.com/shuiyisong) in [#4876](https://github.com/GreptimeTeam/greptimedb/pull/4876)
* chore: graceful exit on bind fail by [@discord9](https://github.com/discord9) in [#4882](https://github.com/GreptimeTeam/greptimedb/pull/4882)
* chore: remove struct size assertion by [@v0y4g3r](https://github.com/v0y4g3r) in [#4885](https://github.com/GreptimeTeam/greptimedb/pull/4885)
* ci: install numpy in CI by [@discord9](https://github.com/discord9) in [#4895](https://github.com/GreptimeTeam/greptimedb/pull/4895)
* chore: update proto depend by [@discord9](https://github.com/discord9) in [#4899](https://github.com/GreptimeTeam/greptimedb/pull/4899)
* chore: provide more info in check batch message by [@evenyag](https://github.com/evenyag) in [#4906](https://github.com/GreptimeTeam/greptimedb/pull/4906)
* chore: short desc markdown about change log level by [@discord9](https://github.com/discord9) in [#4921](https://github.com/GreptimeTeam/greptimedb/pull/4921)
* chore: update default cache size to 1Gib by [@killme2008](https://github.com/killme2008) in [#4923](https://github.com/GreptimeTeam/greptimedb/pull/4923)
* chore: minor refactor for weighted choose by [@fengjiachun](https://github.com/fengjiachun) in [#4917](https://github.com/GreptimeTeam/greptimedb/pull/4917)
* chore: fix typos in change log level doc by [@WenyXu](https://github.com/WenyXu) in [#4948](https://github.com/GreptimeTeam/greptimedb/pull/4948)
* chore: add json path for pipeline by [@paomian](https://github.com/paomian) in [#4925](https://github.com/GreptimeTeam/greptimedb/pull/4925)
* chore: paginated query region stats by [@fengjiachun](https://github.com/fengjiachun) in [#4942](https://github.com/GreptimeTeam/greptimedb/pull/4942)
* chore: update cluster dashboard by [@zyy17](https://github.com/zyy17) in [#4995](https://github.com/GreptimeTeam/greptimedb/pull/4995)
* chore: update greptime-proto to e1070a by [@discord9](https://github.com/discord9) in [#4992](https://github.com/GreptimeTeam/greptimedb/pull/4992)
* chore: rename change to modify by [@CookiePieWw](https://github.com/CookiePieWw) in [#5000](https://github.com/GreptimeTeam/greptimedb/pull/5000)
* chore(cli): set default timeout for cli commands by [@WenyXu](https://github.com/WenyXu) in [#5021](https://github.com/GreptimeTeam/greptimedb/pull/5021)
* chore: bump version to 0.10.0 by [@zhongzc](https://github.com/zhongzc) in [#5040](https://github.com/GreptimeTeam/greptimedb/pull/5040)

### Build

* build(deps): switch to upstream jsonb by [@CookiePieWw](https://github.com/CookiePieWw) in [#4986](https://github.com/GreptimeTeam/greptimedb/pull/4986)

## New Contributors

* [@linyihai](https://github.com/linyihai) made their first contribution in [#4996](https://github.com/GreptimeTeam/greptimedb/pull/4996)
* [@ActivePeter](https://github.com/ActivePeter) made their first contribution in [#4782](https://github.com/GreptimeTeam/greptimedb/pull/4782)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@ActivePeter](https://github.com/ActivePeter), [@CookiePieWw](https://github.com/CookiePieWw), [@Kev1n8](https://github.com/Kev1n8), [@MichaelScofield](https://github.com/MichaelScofield), [@WenyXu](https://github.com/WenyXu), [@ZonaHex](https://github.com/ZonaHex), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@killme2008](https://github.com/killme2008), [@linyihai](https://github.com/linyihai), [@lyang24](https://github.com/lyang24), [@paomian](https://github.com/paomian), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@zhongzc](https://github.com/zhongzc), [@zyy17](https://github.com/zyy17)
