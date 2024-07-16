# v0.9.0

Release date: July 16, 2024

## 👍 Highlights

* [Log Engine](https://docs.greptime.com/user-guide/logs/overview): GreptimeDB is now a unified time-series database for both metrics, events, and logs (trace in plan).
* [Remote WAL](https://docs.greptime.com/user-guide/operations/remote-wal/quick-start) is significantly improved and is now recommended to turn on.
* Table View: You can now `CREATE VIEW` on tables and treat them as logical table.
* [Short interval literal](https://docs.greptime.com/reference/sql/data-types#interval-type) for user experience.
* InfluxDB Merge Read: You can now use the `merge_mode=last_non_null` table option to allow SELECT result merges all the last non-null fields.
* gRPC TLS: You can now set up the `grpc.tls` config to turn on TLS for gRPC connection.
* Manually Compact: You can now use `SELECT COMPACT_TABLE("monitor", "strict_window", "3600");` to manually schedule a compaction task.

## Breaking changes

* refactor!: unify `FrontendOptions` and `DatanodeOptions` by using `GrpcOptions` by [@realtaobo](https://github.com/realtaobo) in [#4088](https://github.com/GreptimeTeam/greptimedb/pull/4088)
* feat!: reduce sorted runs during compaction by [@v0y4g3r](https://github.com/v0y4g3r) in [#3702](https://github.com/GreptimeTeam/greptimedb/pull/3702)
* fix!: forbid to change information_schema by [@CookiePieWw](https://github.com/CookiePieWw) in [#4233](https://github.com/GreptimeTeam/greptimedb/pull/4233)
* feat!: remove alias `metasrv-addr` by [@discord9](https://github.com/discord9) in [#4239](https://github.com/GreptimeTeam/greptimedb/pull/4239)
* feat!: Set merge mode while creating table in influx handler by [@evenyag](https://github.com/evenyag) in [#4299](https://github.com/GreptimeTeam/greptimedb/pull/4299)

### 🚀 Features

* feat: log ingestion support by [@paomian](https://github.com/paomian) in [#4014](https://github.com/GreptimeTeam/greptimedb/pull/4014)
* feat(pipeline): transform support on_failure by [@yuanbohan](https://github.com/yuanbohan) in [#4123](https://github.com/GreptimeTeam/greptimedb/pull/4123)
* feat(pipeline): gsub prosessor by [@yuanbohan](https://github.com/yuanbohan) in [#4121](https://github.com/GreptimeTeam/greptimedb/pull/4121)
* feat: enable metasrv to accept flownode's heartbeats by [@fengjiachun](https://github.com/fengjiachun) in [#4160](https://github.com/GreptimeTeam/greptimedb/pull/4160)
* feat: update default size of bgworkers, add hbworkers by [@sunng87](https://github.com/sunng87) in [#4129](https://github.com/GreptimeTeam/greptimedb/pull/4129)
* feat: implement the `OrderedBatchProducer` by [@WenyXu](https://github.com/WenyXu) in [#4134](https://github.com/GreptimeTeam/greptimedb/pull/4134)
* feat(flow): support datafusion scalar function by [@discord9](https://github.com/discord9) in [#4142](https://github.com/GreptimeTeam/greptimedb/pull/4142)
* feat: Implement memtable range by [@evenyag](https://github.com/evenyag) in [#4162](https://github.com/GreptimeTeam/greptimedb/pull/4162)
* feat: update dashboard to v0.5.1 by [@ZonaHex](https://github.com/ZonaHex) in [#4171](https://github.com/GreptimeTeam/greptimedb/pull/4171)
* feat: register flow node by [@fengjiachun](https://github.com/fengjiachun) in [#4166](https://github.com/GreptimeTeam/greptimedb/pull/4166)
* feat: show database options by [@killme2008](https://github.com/killme2008) in [#4174](https://github.com/GreptimeTeam/greptimedb/pull/4174)
* feat: use the write runtime to handle the heartbeats by [@fengjiachun](https://github.com/fengjiachun) in [#4177](https://github.com/GreptimeTeam/greptimedb/pull/4177)
* feat: PREPARE and EXECUTE statement from mysql client by [@CookiePieWw](https://github.com/CookiePieWw) in [#4125](https://github.com/GreptimeTeam/greptimedb/pull/4125)
* feat: introduce chaos crds by [@WenyXu](https://github.com/WenyXu) in [#4173](https://github.com/GreptimeTeam/greptimedb/pull/4173)
* feat: add num_rows and num_row_groups to manifest by [@waynexia](https://github.com/waynexia) in [#4183](https://github.com/GreptimeTeam/greptimedb/pull/4183)
* feat: make RegionScanner aware of PartitionRange by [@waynexia](https://github.com/waynexia) in [#4170](https://github.com/GreptimeTeam/greptimedb/pull/4170)
* feat: update dashboard to v0.5.2 by [@ZonaHex](https://github.com/ZonaHex) in [#4185](https://github.com/GreptimeTeam/greptimedb/pull/4185)
* feat(puffin): support lz4 compression for footer by [@zhongzc](https://github.com/zhongzc) in [#4194](https://github.com/GreptimeTeam/greptimedb/pull/4194)
* feat: heartbeat task&peer lookup in proc by [@discord9](https://github.com/discord9) in [#4179](https://github.com/GreptimeTeam/greptimedb/pull/4179)
* feat(puffin): introduce puffin manager trait by [@zhongzc](https://github.com/zhongzc) in [#4195](https://github.com/GreptimeTeam/greptimedb/pull/4195)
* feat(sql): improve interval expression, support shortened version by [@etolbakov](https://github.com/etolbakov) in [#4182](https://github.com/GreptimeTeam/greptimedb/pull/4182)
* feat: Dedup strategy that keeps the last not null field by [@evenyag](https://github.com/evenyag) in [#4184](https://github.com/GreptimeTeam/greptimedb/pull/4184)
* feat(puffin): implement CachedPuffinWriter by [@zhongzc](https://github.com/zhongzc) in [#4203](https://github.com/GreptimeTeam/greptimedb/pull/4203)
* feat: FlownodeClient by [@discord9](https://github.com/discord9) in [#4206](https://github.com/GreptimeTeam/greptimedb/pull/4206)
* feat: bulk memtable codec by [@v0y4g3r](https://github.com/v0y4g3r) in [#4163](https://github.com/GreptimeTeam/greptimedb/pull/4163)
* feat(puffin): implement CachedPuffinReader by [@zhongzc](https://github.com/zhongzc) in [#4209](https://github.com/GreptimeTeam/greptimedb/pull/4209)
* feat: validate partition rule on create table by [@waynexia](https://github.com/waynexia) in [#4213](https://github.com/GreptimeTeam/greptimedb/pull/4213)
* feat(servers): make http timeout and body limit optional by [@fengjiachun](https://github.com/fengjiachun) in [#4217](https://github.com/GreptimeTeam/greptimedb/pull/4217)
* feat(sql): add casting support for shortened intervals by [@etolbakov](https://github.com/etolbakov) in [#4220](https://github.com/GreptimeTeam/greptimedb/pull/4220)
* feat: Implements `merge_mode` region options by [@evenyag](https://github.com/evenyag) in [#4208](https://github.com/GreptimeTeam/greptimedb/pull/4208)
* feat: output multiple partition in MergeScanExec by [@waynexia](https://github.com/waynexia) in [#4227](https://github.com/GreptimeTeam/greptimedb/pull/4227)
* feat: add build info for flow heartbeat task by [@fengjiachun](https://github.com/fengjiachun) in [#4228](https://github.com/GreptimeTeam/greptimedb/pull/4228)
* feat: register & deregister region failure detectors actively by [@WenyXu](https://github.com/WenyXu) in [#4223](https://github.com/GreptimeTeam/greptimedb/pull/4223)
* feat: forgot collect flownode clusterinfo handler by [@fengjiachun](https://github.com/fengjiachun) in [#4236](https://github.com/GreptimeTeam/greptimedb/pull/4236)
* feat: basic implement of `matches` fn by [@waynexia](https://github.com/waynexia) in [#4222](https://github.com/GreptimeTeam/greptimedb/pull/4222)
* feat: flow cli for  distributed by [@discord9](https://github.com/discord9) in [#4226](https://github.com/GreptimeTeam/greptimedb/pull/4226)
* feat(puffin): implement MokaCacheManager by [@zhongzc](https://github.com/zhongzc) in [#4211](https://github.com/GreptimeTeam/greptimedb/pull/4211)
* feat(puffin): complete dir support by [@zhongzc](https://github.com/zhongzc) in [#4240](https://github.com/GreptimeTeam/greptimedb/pull/4240)
* feat: introduce the interface of `RemoteJobScheduler` by [@zyy17](https://github.com/zyy17) in [#4181](https://github.com/GreptimeTeam/greptimedb/pull/4181)
* feat(fulltext_index): introduce creator by [@zhongzc](https://github.com/zhongzc) in [#4249](https://github.com/GreptimeTeam/greptimedb/pull/4249)
* feat: dbeaver mysql compatibility, use statement and information_schema.tables by [@sunng87](https://github.com/sunng87) in [#4218](https://github.com/GreptimeTeam/greptimedb/pull/4218)
* feat: provide a simple way to create metaclient by [@fengjiachun](https://github.com/fengjiachun) in [#4257](https://github.com/GreptimeTeam/greptimedb/pull/4257)
* feat: implement naive fuzz test for region migration by [@WenyXu](https://github.com/WenyXu) in [#4252](https://github.com/GreptimeTeam/greptimedb/pull/4252)
* feat: update dashboard to v0.5.3 by [@ZonaHex](https://github.com/ZonaHex) in [#4262](https://github.com/GreptimeTeam/greptimedb/pull/4262)
* feat: introduce `FlowRouteValue` by [@WenyXu](https://github.com/WenyXu) in [#4263](https://github.com/GreptimeTeam/greptimedb/pull/4263)
* feat(fulltext_index): integrate puffin manager with inverted index applier by [@zhongzc](https://github.com/zhongzc) in [#4266](https://github.com/GreptimeTeam/greptimedb/pull/4266)
* feat: handle AND/OR and priority in matches fn by [@waynexia](https://github.com/waynexia) in [#4270](https://github.com/GreptimeTeam/greptimedb/pull/4270)
* feat: store peer info in `TableFlowValue` by [@WenyXu](https://github.com/WenyXu) in [#4280](https://github.com/GreptimeTeam/greptimedb/pull/4280)
* feat(fuzz): enhance condition check of region migration finish by [@WenyXu](https://github.com/WenyXu) in [#4283](https://github.com/GreptimeTeam/greptimedb/pull/4283)
* feat: delete pipeline by [@shuiyisong](https://github.com/shuiyisong) in [#4156](https://github.com/GreptimeTeam/greptimedb/pull/4156)
* feat: add path prefix label to obejct storage metrics by [@sunng87](https://github.com/sunng87) in [#4277](https://github.com/GreptimeTeam/greptimedb/pull/4277)
* feat: add naive region failover test for metric table by [@WenyXu](https://github.com/WenyXu) in [#4269](https://github.com/GreptimeTeam/greptimedb/pull/4269)
* feat: expose merge_mode option by [@evenyag](https://github.com/evenyag) in [#4289](https://github.com/GreptimeTeam/greptimedb/pull/4289)
* feat: refine scan metrics logging by [@evenyag](https://github.com/evenyag) in [#4296](https://github.com/GreptimeTeam/greptimedb/pull/4296)
* feat: make flow distributed work&tests by [@discord9](https://github.com/discord9) in [#4256](https://github.com/GreptimeTeam/greptimedb/pull/4256)
* feat(remote wal): set default compresion to LZ4 by [@WenyXu](https://github.com/WenyXu) in [#4294](https://github.com/GreptimeTeam/greptimedb/pull/4294)
* feat(sql): add iso-8601 format support for intervals by [@etolbakov](https://github.com/etolbakov) in [#4291](https://github.com/GreptimeTeam/greptimedb/pull/4291)
* feat(fulltext_index): integrate full-text indexer with sst writer by [@zhongzc](https://github.com/zhongzc) in [#4302](https://github.com/GreptimeTeam/greptimedb/pull/4302)
* feat: impl show table status by [@killme2008](https://github.com/killme2008) in [#4303](https://github.com/GreptimeTeam/greptimedb/pull/4303)
* feat: support inserting into binary value through string by [@CookiePieWw](https://github.com/CookiePieWw) in [#4197](https://github.com/GreptimeTeam/greptimedb/pull/4197)
* feat(inverted_index): inverted index cache by [@v0y4g3r](https://github.com/v0y4g3r) in [#4309](https://github.com/GreptimeTeam/greptimedb/pull/4309)
* feat(fulltext_index): allow enable full-text index in SQL and gRPC way by [@zhongzc](https://github.com/zhongzc) in [#4310](https://github.com/GreptimeTeam/greptimedb/pull/4310)
* feat: handle parentheses with unary ops by [@waynexia](https://github.com/waynexia) in [#4290](https://github.com/GreptimeTeam/greptimedb/pull/4290)
* feat: enhanced the retry logic by adding a random noise by [@WenyXu](https://github.com/WenyXu) in [#4320](https://github.com/GreptimeTeam/greptimedb/pull/4320)
* feat: flownode use `Inserter` to write to database by [@discord9](https://github.com/discord9) in [#4323](https://github.com/GreptimeTeam/greptimedb/pull/4323)
* feat: add `TimeSeriesRowSelector` hint by [@evenyag](https://github.com/evenyag) in [#4327](https://github.com/GreptimeTeam/greptimedb/pull/4327)
* feat: show create view and creating view with columns by [@killme2008](https://github.com/killme2008) in [#4086](https://github.com/GreptimeTeam/greptimedb/pull/4086)
* feat: customize copy to parquet parameter by [@v0y4g3r](https://github.com/v0y4g3r) in [#4328](https://github.com/GreptimeTeam/greptimedb/pull/4328)
* feat: impl drop view by [@killme2008](https://github.com/killme2008) in [#4231](https://github.com/GreptimeTeam/greptimedb/pull/4231)
* feat: support `text/plain` format for log ingestion by [@shuiyisong](https://github.com/shuiyisong) in [#4300](https://github.com/GreptimeTeam/greptimedb/pull/4300)
* feat: impl optimizer rule to handle last_value case by [@waynexia](https://github.com/waynexia) in [#4357](https://github.com/GreptimeTeam/greptimedb/pull/4357)
* feat: Implement reader that returns the last row of each series by [@evenyag](https://github.com/evenyag) in [#4354](https://github.com/GreptimeTeam/greptimedb/pull/4354)
* feat(index): distinguish different types of index metrics by [@zhongzc](https://github.com/zhongzc) in [#4337](https://github.com/GreptimeTeam/greptimedb/pull/4337)
* feat: adding information_schema.views table by [@lyang24](https://github.com/lyang24) in [#4342](https://github.com/GreptimeTeam/greptimedb/pull/4342)
* feat: support show views statement by [@lyang24](https://github.com/lyang24) in [#4360](https://github.com/GreptimeTeam/greptimedb/pull/4360)
* feat: tweak error and status codes by [@killme2008](https://github.com/killme2008) in [#4359](https://github.com/GreptimeTeam/greptimedb/pull/4359)
* feat(fulltext_index): integrate full-text indexer with parquet reader by [@zhongzc](https://github.com/zhongzc) in [#4348](https://github.com/GreptimeTeam/greptimedb/pull/4348)
* feat: flow perf&fix df func call by [@discord9](https://github.com/discord9) in [#4347](https://github.com/GreptimeTeam/greptimedb/pull/4347)
* feat: add a cache for last value result in row group by [@evenyag](https://github.com/evenyag) in [#4369](https://github.com/GreptimeTeam/greptimedb/pull/4369)
* feat:  add PruneReader for optimized row filtering by [@v0y4g3r](https://github.com/v0y4g3r) in [#4370](https://github.com/GreptimeTeam/greptimedb/pull/4370)
* feat: introduce 'pg_catalog.pg_type' by [@J0HN50N133](https://github.com/J0HN50N133) in [#4332](https://github.com/GreptimeTeam/greptimedb/pull/4332)
* feat: improve datafusion external error and mysql error by [@killme2008](https://github.com/killme2008) in [#4362](https://github.com/GreptimeTeam/greptimedb/pull/4362)
* feat: Add caching for last row reader and expose cache manager by [@v0y4g3r](https://github.com/v0y4g3r) in [#4375](https://github.com/GreptimeTeam/greptimedb/pull/4375)

### 🐛 Bug Fixes

* fix(sqlness): catch different format timestamp by [@WenyXu](https://github.com/WenyXu) in [#4149](https://github.com/GreptimeTeam/greptimedb/pull/4149)
* fix: region logical regions after catching up by [@WenyXu](https://github.com/WenyXu) in [#4176](https://github.com/GreptimeTeam/greptimedb/pull/4176)
* fix(flow): fix call df func bug&sqlness test by [@discord9](https://github.com/discord9) in [#4165](https://github.com/GreptimeTeam/greptimedb/pull/4165)
* fix: `region_peers` returns same region_id for multi logical tables by [@realtaobo](https://github.com/realtaobo) in [#4190](https://github.com/GreptimeTeam/greptimedb/pull/4190)
* fix(sql): improve compound signed number processing by [@etolbakov](https://github.com/etolbakov) in [#4200](https://github.com/GreptimeTeam/greptimedb/pull/4200)
* fix: align workflows again for the troublesome GHA by [@waynexia](https://github.com/waynexia) in [#4196](https://github.com/GreptimeTeam/greptimedb/pull/4196)
* fix: format error correctly by [@WenyXu](https://github.com/WenyXu) in [#4204](https://github.com/GreptimeTeam/greptimedb/pull/4204)
* fix: wrong frontend registration address by [@killme2008](https://github.com/killme2008) in [#4199](https://github.com/GreptimeTeam/greptimedb/pull/4199)
* fix: add `serialize_ignore_column_ids()` to fix deserialize region options failed from json string by [@zyy17](https://github.com/zyy17) in [#4229](https://github.com/GreptimeTeam/greptimedb/pull/4229)
* fix(puffin): fix dependency by [@v0y4g3r](https://github.com/v0y4g3r) in [#4267](https://github.com/GreptimeTeam/greptimedb/pull/4267)
* fix(fuzz): generate valid string by [@WenyXu](https://github.com/WenyXu) in [#4281](https://github.com/GreptimeTeam/greptimedb/pull/4281)
* fix: enhance ColumnOption::DefaultValue formatting for string values by [@WenyXu](https://github.com/WenyXu) in [#4287](https://github.com/GreptimeTeam/greptimedb/pull/4287)
* fix: enable space string in yaml value by [@shuiyisong](https://github.com/shuiyisong) in [#4286](https://github.com/GreptimeTeam/greptimedb/pull/4286)
* fix: align pre-commit config with make file by [@shuiyisong](https://github.com/shuiyisong) in [#4292](https://github.com/GreptimeTeam/greptimedb/pull/4292)
* fix: call df_func with literal by [@discord9](https://github.com/discord9) in [#4265](https://github.com/GreptimeTeam/greptimedb/pull/4265)
* fix: prepare inserting with column defaults not work, #4244 by [@killme2008](https://github.com/killme2008) in [#4272](https://github.com/GreptimeTeam/greptimedb/pull/4272)
* fix: deregister failure detector in region migration by [@WenyXu](https://github.com/WenyXu) in [#4293](https://github.com/GreptimeTeam/greptimedb/pull/4293)
* fix(ci): remove sqlness state in success by [@waynexia](https://github.com/waynexia) in [#4313](https://github.com/GreptimeTeam/greptimedb/pull/4313)
* fix: test_fulltext_intm_path by [@zhongzc](https://github.com/zhongzc) in [#4314](https://github.com/GreptimeTeam/greptimedb/pull/4314)
* fix: error on show databases in non-default catalog by [@sunng87](https://github.com/sunng87) in [#4316](https://github.com/GreptimeTeam/greptimedb/pull/4316)
* fix: panic while reading information_schema. KEY_COLUMN_USAGE by [@killme2008](https://github.com/killme2008) in [#4318](https://github.com/GreptimeTeam/greptimedb/pull/4318)
* fix: support unary operator in default value, partition rule and prepare statement by [@waynexia](https://github.com/waynexia) in [#4301](https://github.com/GreptimeTeam/greptimedb/pull/4301)
* fix(sqlness): relax start time regex to match various precisions by [@waynexia](https://github.com/waynexia) in [#4326](https://github.com/GreptimeTeam/greptimedb/pull/4326)
* fix: permission denied is 403 by [@sunng87](https://github.com/sunng87) in [#4350](https://github.com/GreptimeTeam/greptimedb/pull/4350)
* fix(config): enable file engine by default by [@WenyXu](https://github.com/WenyXu) in [#4345](https://github.com/GreptimeTeam/greptimedb/pull/4345)
* fix: build info should use build time env var  by [@tisonkun](https://github.com/tisonkun) in [#4343](https://github.com/GreptimeTeam/greptimedb/pull/4343)
* fix: remove path label for cache store by [@sunng87](https://github.com/sunng87) in [#4336](https://github.com/GreptimeTeam/greptimedb/pull/4336)
* fix: scan hint checks order asc by [@evenyag](https://github.com/evenyag) in [#4365](https://github.com/GreptimeTeam/greptimedb/pull/4365)

### 🚜 Refactor

* refactor: add `Compactor` trait to abstract the compaction by [@zyy17](https://github.com/zyy17) in [#4097](https://github.com/GreptimeTeam/greptimedb/pull/4097)
* refactor: make region manifest checkpoint ran in background by [@MichaelScofield](https://github.com/MichaelScofield) in [#4133](https://github.com/GreptimeTeam/greptimedb/pull/4133)
* refactor: Decouple dedup and merge by [@evenyag](https://github.com/evenyag) in [#4139](https://github.com/GreptimeTeam/greptimedb/pull/4139)
* refactor: make `RegionOptions` and `MergeOutput` serializable by [@zyy17](https://github.com/zyy17) in [#4180](https://github.com/GreptimeTeam/greptimedb/pull/4180)
* refactor: add `region_dir` in CompactionRegion by [@zyy17](https://github.com/zyy17) in [#4187](https://github.com/GreptimeTeam/greptimedb/pull/4187)
* refactor: migrate region failover implementation to region migration by [@WenyXu](https://github.com/WenyXu) in [#4172](https://github.com/GreptimeTeam/greptimedb/pull/4172)
* refactor: add `SerializedPickerOutput` and field modification of `CompactorRequest` by [@zyy17](https://github.com/zyy17) in [#4198](https://github.com/GreptimeTeam/greptimedb/pull/4198)
* refactor(flow): make `from_substrait_*` async& worker handle refactor by [@discord9](https://github.com/discord9) in [#4210](https://github.com/GreptimeTeam/greptimedb/pull/4210)
* refactor: expose `DatanodeBuilder::build_object_store_manager()` and `MitoConfig::sanitize()` by [@zyy17](https://github.com/zyy17) in [#4212](https://github.com/GreptimeTeam/greptimedb/pull/4212)
* refactor: use ObjectStoreManagerRef type in open_compaction_region() and add related unit test by [@zyy17](https://github.com/zyy17) in [#4238](https://github.com/GreptimeTeam/greptimedb/pull/4238)
* refactor: add interceptor after Influxdb lines are converted to grpc row insert by [@MichaelScofield](https://github.com/MichaelScofield) in [#4225](https://github.com/GreptimeTeam/greptimedb/pull/4225)
* refactor: add `RemoteCompaction` error by [@zyy17](https://github.com/zyy17) in [#4251](https://github.com/GreptimeTeam/greptimedb/pull/4251)
* refactor: change InvertedIndexWriter method signature to offsets to f… by [@v0y4g3r](https://github.com/v0y4g3r) in [#4250](https://github.com/GreptimeTeam/greptimedb/pull/4250)
* refactor(puffin): adjust generic parameters by [@zhongzc](https://github.com/zhongzc) in [#4279](https://github.com/GreptimeTeam/greptimedb/pull/4279)
* refactor: use rwlock for modifiable session data by [@sunng87](https://github.com/sunng87) in [#4232](https://github.com/GreptimeTeam/greptimedb/pull/4232)
* refactor(inverted_index): integrate puffin manager with sst indexer by [@zhongzc](https://github.com/zhongzc) in [#4285](https://github.com/GreptimeTeam/greptimedb/pull/4285)
* refactor: split match arms in prom_expr_to_plan into smaller methods by [@waynexia](https://github.com/waynexia) in [#4317](https://github.com/GreptimeTeam/greptimedb/pull/4317)
* refactor: do not print error log on PlanQuery error by [@sunng87](https://github.com/sunng87) in [#4322](https://github.com/GreptimeTeam/greptimedb/pull/4322)
* refactor: Remove the StandaloneKafkaConfig struct by [@irenjj](https://github.com/irenjj) in [#4253](https://github.com/GreptimeTeam/greptimedb/pull/4253)
* refactor: LastRowReader to use LastRowSelector by [@v0y4g3r](https://github.com/v0y4g3r) in [#4374](https://github.com/GreptimeTeam/greptimedb/pull/4374)

### 📚 Documentation

* docs: add guide for tsbs benchmark by [@waynexia](https://github.com/waynexia) in [#4151](https://github.com/GreptimeTeam/greptimedb/pull/4151)
* docs: remove outdated docs by [@evenyag](https://github.com/evenyag) in [#4205](https://github.com/GreptimeTeam/greptimedb/pull/4205)
* docs: remove cargo test workspace command by [@waynexia](https://github.com/waynexia) in [#4325](https://github.com/GreptimeTeam/greptimedb/pull/4325)
* docs(config): add enable_region_failover option to configuration by [@WenyXu](https://github.com/WenyXu) in [#4355](https://github.com/GreptimeTeam/greptimedb/pull/4355)

### ⚡ Performance

* perf: optimize RecordBatch to HttpOutput conversion by [@waynexia](https://github.com/waynexia) in [#4178](https://github.com/GreptimeTeam/greptimedb/pull/4178)
* perf(puffin): not to stage uncompressed blob by [@zhongzc](https://github.com/zhongzc) in [#4333](https://github.com/GreptimeTeam/greptimedb/pull/4333)
* perf: fine–tuned plan steps by [@waynexia](https://github.com/waynexia) in [#4258](https://github.com/GreptimeTeam/greptimedb/pull/4258)

### 🧪 Testing

* test: wait until checkpoint finish by [@evenyag](https://github.com/evenyag) in [#4202](https://github.com/GreptimeTeam/greptimedb/pull/4202)
* test: add e2e test for region failover by [@WenyXu](https://github.com/WenyXu) in [#4188](https://github.com/GreptimeTeam/greptimedb/pull/4188)
* test: replace unstable output of last value test by [@evenyag](https://github.com/evenyag) in [#4371](https://github.com/GreptimeTeam/greptimedb/pull/4371)
* test: more sleep when flow insert makes it serial by [@discord9](https://github.com/discord9) in [#4373](https://github.com/GreptimeTeam/greptimedb/pull/4373)
* test(flow): ignore flow tests for now by [@discord9](https://github.com/discord9) in [#4377](https://github.com/GreptimeTeam/greptimedb/pull/4377)

### ⚙️ Miscellaneous Tasks

* ci: align docs with develop by [@waynexia](https://github.com/waynexia) in [#4152](https://github.com/GreptimeTeam/greptimedb/pull/4152)
* chore: bump datafusion version to fix `last_value` regression by [@MichaelScofield](https://github.com/MichaelScofield) in [#4169](https://github.com/GreptimeTeam/greptimedb/pull/4169)
* chore: enhance add pipeline http api return data by [@paomian](https://github.com/paomian) in [#4167](https://github.com/GreptimeTeam/greptimedb/pull/4167)
* chore: highlight our committers in CONTRIBUTING.md by [@tisonkun](https://github.com/tisonkun) in [#4189](https://github.com/GreptimeTeam/greptimedb/pull/4189)
* chore: add AUTHOR.md file by [@tisonkun](https://github.com/tisonkun) in [#4241](https://github.com/GreptimeTeam/greptimedb/pull/4241)
* ci: update centos yum source and specify cargo-binstall version by [@zyy17](https://github.com/zyy17) in [#4248](https://github.com/GreptimeTeam/greptimedb/pull/4248)
* chore: reduce insertion size of fuzz test by [@WenyXu](https://github.com/WenyXu) in [#4243](https://github.com/GreptimeTeam/greptimedb/pull/4243)
* chore(ci): add timeout (60min) for fuzz tests by [@WenyXu](https://github.com/WenyXu) in [#4255](https://github.com/GreptimeTeam/greptimedb/pull/4255)
* ci: push latest greptimedb nigthly build image by [@zyy17](https://github.com/zyy17) in [#4260](https://github.com/GreptimeTeam/greptimedb/pull/4260)
* chore: add missing s for `--metasrv-addr` by [@discord9](https://github.com/discord9) in [#4278](https://github.com/GreptimeTeam/greptimedb/pull/4278)
* ci: retry on error during installing operator by [@WenyXu](https://github.com/WenyXu) in [#4295](https://github.com/GreptimeTeam/greptimedb/pull/4295)
* chore: remove original region failover implementation by [@WenyXu](https://github.com/WenyXu) in [#4237](https://github.com/GreptimeTeam/greptimedb/pull/4237)
* chore: bump OpenDAL to 0.47.2 by [@WenyXu](https://github.com/WenyXu) in [#4297](https://github.com/GreptimeTeam/greptimedb/pull/4297)
* ci: retry on error or timeout during installing operator by [@WenyXu](https://github.com/WenyXu) in [#4308](https://github.com/GreptimeTeam/greptimedb/pull/4308)
* chore: disable TraceLayer on_failure log by [@paomian](https://github.com/paomian) in [#4315](https://github.com/GreptimeTeam/greptimedb/pull/4315)
* ci: add flownode in docker compose by [@zyy17](https://github.com/zyy17) in [#4306](https://github.com/GreptimeTeam/greptimedb/pull/4306)
* chore: update project slogan by [@tisonkun](https://github.com/tisonkun) in [#4361](https://github.com/GreptimeTeam/greptimedb/pull/4361)
* chore: bump version to v0.9.0 by [@evenyag](https://github.com/evenyag) in [#4376](https://github.com/GreptimeTeam/greptimedb/pull/4376)

### ◀️ Revert

* revert: lz4 compression by [@WenyXu](https://github.com/WenyXu) in [#4329](https://github.com/GreptimeTeam/greptimedb/pull/4329)

### Build

* build(deps): Upgrade OpenDAL to 0.47 by [@tisonkun](https://github.com/tisonkun) in [#4224](https://github.com/GreptimeTeam/greptimedb/pull/4224)
* build(deps): upgrade opendal to 0.47.3 by [@tisonkun](https://github.com/tisonkun) in [#4307](https://github.com/GreptimeTeam/greptimedb/pull/4307)
* build(deps): switch to upstream by [@tisonkun](https://github.com/tisonkun) in [#4319](https://github.com/GreptimeTeam/greptimedb/pull/4319)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@CookiePieWw](https://github.com/CookiePieWw), [@J0HN50N133](https://github.com/J0HN50N133), [@MichaelScofield](https://github.com/MichaelScofield), [@WenyXu](https://github.com/WenyXu), [@ZonaHex](https://github.com/ZonaHex), [@discord9](https://github.com/discord9), [@etolbakov](https://github.com/etolbakov), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@irenjj](https://github.com/irenjj), [@killme2008](https://github.com/killme2008), [@lyang24](https://github.com/lyang24), [@paomian](https://github.com/paomian), [@realtaobo](https://github.com/realtaobo), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@tisonkun](https://github.com/tisonkun), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@yuanbohan](https://github.com/yuanbohan), [@zhongzc](https://github.com/zhongzc), [@zyy17](https://github.com/zyy17)
