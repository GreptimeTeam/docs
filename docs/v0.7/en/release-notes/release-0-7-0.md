# v0.7.0

Release date: March 12, 2024

This is a feature release, read [the release blog](https://www.greptime.com/blogs/2024-03-07-greptimedb-v0.7) to learn more detail about the feature and performance updates.

v0.7 represents a crucial leap toward achieving production readiness; it implements production-ready features for cloud-native monitoring scenarios.

**Highlights**

* Metric Engine: handles a large number of small tables, making it particularly suitable for cloud-native monitoring.
* Region Migration: enhances the user experience and simplifies region migrations with straightforward SQL commands.
* Inverted Index: dramatically improves the efficiency of locating data segments relevant to user queries, significantly reducing the IO operations needed for scanning data files and thus accelerating the query process.

## Breaking changes

* Switch prom remote write to metric engine by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3198
* Rename `initialize_region_in_background` to `init_regions_in_background` by @WenyXu in https://github.com/GreptimeTeam/greptimedb/pull/3216
* New partition grammar in SQL parser by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3347

## Bug fixes

* fix: change back `GREPTIME_DB_HEADER_NAME` header key name by @shuiyisong in https://github.com/GreptimeTeam/greptimedb/pull/3184
* fix(index): S3 `EntityTooSmall` error by @zhongzc in https://github.com/GreptimeTeam/greptimedb/pull/3192
* fix: remove __name__ matcher from processed matcher list by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3213
* fix: fix default value cannot accept negative number by @WenyXu in https://github.com/GreptimeTeam/greptimedb/pull/3217
* fix: only register region keeper while creating physical table by @WenyXu in https://github.com/GreptimeTeam/greptimedb/pull/3223
* fix: fix MockInstance rebuild issue by @WenyXu in https://github.com/GreptimeTeam/greptimedb/pull/3218
* fix: security update for shlex and h2 by @sunng87 in https://github.com/GreptimeTeam/greptimedb/pull/3227
* fix: fix create table ddl return incorrect table id by @WenyXu in https://github.com/GreptimeTeam/greptimedb/pull/3232
* fix: init parquet reader metrics twice by @evenyag in https://github.com/GreptimeTeam/greptimedb/pull/3242
* fix: IntermediateWriter closes underlying writer twice by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3248
* fix: decouple columns in projection and prune by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3253
* fix(Copy From): fix incorrect type casts by @WenyXu in https://github.com/GreptimeTeam/greptimedb/pull/3264
* fix: SQL insertion and column default constraint aware of timezone by @killme2008 in https://github.com/GreptimeTeam/greptimedb/pull/3266
* fix: cli export database default value by @tisonkun in https://github.com/GreptimeTeam/greptimedb/pull/3259
* fix: use `fe_opts` after `setup_frontend_plugins` in standalone by @shuiyisong in https://github.com/GreptimeTeam/greptimedb/pull/3275
* fix: fix incorrect StatusCode parsing by @WenyXu in https://github.com/GreptimeTeam/greptimedb/pull/3281
* fix(util): join_path function should not trim leading `/` by @dalprahcd in https://github.com/GreptimeTeam/greptimedb/pull/3280
* fix: correct the case sensitivity behavior for PromQL by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3296
* fix: $TARGET_BIN not found when docker run the image  by @daviderli614 in https://github.com/GreptimeTeam/greptimedb/pull/3297
* fix(index): sanitize S3 upload buffer size by @zhongzc in https://github.com/GreptimeTeam/greptimedb/pull/3300
* fix: commit_short sqlness test case  by @tisonkun in https://github.com/GreptimeTeam/greptimedb/pull/3313
* fix: bump libgit2-sys from 0.16.1+1.7.1 to 0.16.2+1.7.2 by @dependabot in https://github.com/GreptimeTeam/greptimedb/pull/3316
* fix: split write metadata request by @fengjiachun in https://github.com/GreptimeTeam/greptimedb/pull/3311
* fix(index): encode string type to original data to enable fst regex to work by @zhongzc in https://github.com/GreptimeTeam/greptimedb/pull/3324
* fix: disable ansi contorl char when stdout is redirected by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3332
* fix: typo in lint config by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3358
* fix: treat "0" and "1" as valid boolean values. by @MichaelScofield in https://github.com/GreptimeTeam/greptimedb/pull/3370
* fix: remove unused imports in memtable_util.rs by @v0y4g3r in https://github.com/GreptimeTeam/greptimedb/pull/3376
* fix: resets dict builder keys counter and avoid unnecessary pruning by @evenyag in https://github.com/GreptimeTeam/greptimedb/pull/3386
* fix: throw errors instead of panic by @WenyXu in https://github.com/GreptimeTeam/greptimedb/pull/3391
* fix: some read metrics by @v0y4g3r in https://github.com/GreptimeTeam/greptimedb/pull/3404
* fix: partition region id by @fengjiachun in https://github.com/GreptimeTeam/greptimedb/pull/3414
* fix: show table names not complete from information_schema by @killme2008 in https://github.com/GreptimeTeam/greptimedb/pull/3417
* fix: mitigate memory spike during startup by @niebayes in https://github.com/GreptimeTeam/greptimedb/pull/3418
* fix: complete interceptors for all frontend entry by @shuiyisong in https://github.com/GreptimeTeam/greptimedb/pull/3428

## Performance Improvement

* feat: add modulo function by @etolbakov in https://github.com/GreptimeTeam/greptimedb/pull/3147
* feat: support HTTP&gRPC&pg set timezone by @Taylor-lagrange in https://github.com/GreptimeTeam/greptimedb/pull/3125
* feat(mito): enable inverted index by @zhongzc in https://github.com/GreptimeTeam/greptimedb/pull/3158
* feat: upgrade pgwire to 0.19 by @sunng87 in https://github.com/GreptimeTeam/greptimedb/pull/3157
* feat: let tables API return a stream by @fengjiachun in https://github.com/GreptimeTeam/greptimedb/pull/3170
* feat: add tests-fuzz crate by @WenyXu in https://github.com/GreptimeTeam/greptimedb/pull/3173
* feat: tables stream with CatalogManager by @fengjiachun in https://github.com/GreptimeTeam/greptimedb/pull/3180
* feat: adds date_format function by @killme2008 in https://github.com/GreptimeTeam/greptimedb/pull/3167
* feat: auto config cache size according to memory size by @QuenKar in https://github.com/GreptimeTeam/greptimedb/pull/3165
* feat: precise filter for mito parquet reader by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3178
* feat: adds parse options for SQL parser by @killme2008 in https://github.com/GreptimeTeam/greptimedb/pull/3193
* feat(tests-fuzz): add CreateTableExprGenerator & AlterTableExprGenerator by @WenyXu in https://github.com/GreptimeTeam/greptimedb/pull/3182
* feat: make procedure able to return output by @WenyXu in https://github.com/GreptimeTeam/greptimedb/pull/3201
* feat: copy database from by @v0y4g3r in https://github.com/GreptimeTeam/greptimedb/pull/3164
* feat: introduce information schema provider cache by @WenyXu in https://github.com/GreptimeTeam/greptimedb/pull/3208
* feat: lazy initialize vector builder on write by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3210
* feat: make query be aware of timezone setting by @killme2008 in https://github.com/GreptimeTeam/greptimedb/pull/3175
* feat: add create alter table expr translator by @WenyXu in https://github.com/GreptimeTeam/greptimedb/pull/3203
* feat: read column and region info from state cache by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3222
* feat: enable concurrent write by @WenyXu in https://github.com/GreptimeTeam/greptimedb/pull/3214
* feat: add Arrow IPC output format for http rest api by @sunng87 in https://github.com/GreptimeTeam/greptimedb/pull/3177
* feat: change Range Query’s default align behavior aware of timezone by @killme2008 in https://github.com/GreptimeTeam/greptimedb/pull/3219
* feat: update dashboard to v0.4.7 by @ZonaHex in https://github.com/GreptimeTeam/greptimedb/pull/3229
* feat: http sql api return schema on empty resultset by @sunng87 in https://github.com/GreptimeTeam/greptimedb/pull/3237
* feat: add pg create alter table expr translator by @WenyXu in https://github.com/GreptimeTeam/greptimedb/pull/3206
* feat: read metadata from write cache by @QuenKar in https://github.com/GreptimeTeam/greptimedb/pull/3224
* feat: batch create ddl by @fengjiachun in https://github.com/GreptimeTeam/greptimedb/pull/3194
* feat: add insert/select generator & translator by @WenyXu in https://github.com/GreptimeTeam/greptimedb/pull/3240
* feat: return request outdated error on handling alter by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3239
* feat: don't map semantic type in metric engine by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3243
* feat: create tables in batch on prom write by @fengjiachun in https://github.com/GreptimeTeam/greptimedb/pull/3246
* feat: Only allow inserts and deletes operations to be executed in parallel by @fengjiachun in https://github.com/GreptimeTeam/greptimedb/pull/3257
* feat: basic types for Dataflow Framework by @discord9 in https://github.com/GreptimeTeam/greptimedb/pull/3186
* feat: initial configuration for grafana dashboard by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3263
* feat: support fraction part in timestamp by @discord9 in https://github.com/GreptimeTeam/greptimedb/pull/3272
* feat: use simple filter to prune memtable  by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3269
* feat: Basic Definitions for Expression&Functions for Dataflow by @discord9 in https://github.com/GreptimeTeam/greptimedb/pull/3267
* feat: support cache for batch_get in CachedMetaKvBackend by @fengys1996 in https://github.com/GreptimeTeam/greptimedb/pull/3277
* feat: put all filter exprs in a filter plan separately by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3288
* feat: administration functions by @killme2008 in https://github.com/GreptimeTeam/greptimedb/pull/3236
* feat(mito): adjust seg size of inverted index to finer granularity instead of row group level by @zhongzc in https://github.com/GreptimeTeam/greptimedb/pull/3289
* feat(mito): add options to ignore building index for specific column ids by @zhongzc in https://github.com/GreptimeTeam/greptimedb/pull/3295
* feat: organize tracing on query path by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3310
* feat: impl partitions and region_peers information schema by @killme2008 in https://github.com/GreptimeTeam/greptimedb/pull/3278
* feat: batch get physical table routes by @fengjiachun in https://github.com/GreptimeTeam/greptimedb/pull/3319
* feat: Defines structs in the merge tree memtable by @evenyag in https://github.com/GreptimeTeam/greptimedb/pull/3326
* feat(metric-engine): set index options for data region by @zhongzc in https://github.com/GreptimeTeam/greptimedb/pull/3330
* feat: data buffer and related structs by @v0y4g3r in https://github.com/GreptimeTeam/greptimedb/pull/3329
* feat: Implement KeyDictBuilder for the merge tree memtable by @evenyag in https://github.com/GreptimeTeam/greptimedb/pull/3334
* feat: replace pk index with pk_weight during freeze by @v0y4g3r in https://github.com/GreptimeTeam/greptimedb/pull/3343
* feat: merge tree data parts  by @v0y4g3r in https://github.com/GreptimeTeam/greptimedb/pull/3346
* feat: Defines more structs and methods for a partitioned merge tree by @evenyag in https://github.com/GreptimeTeam/greptimedb/pull/3348
* feat(flow): impl ScalarExpr&Scalar Function by @discord9 in https://github.com/GreptimeTeam/greptimedb/pull/3283
* feat: impl migrate_region and procedure_state SQL function by @killme2008 in https://github.com/GreptimeTeam/greptimedb/pull/3325
* feat: add isnull function by @KKould in https://github.com/GreptimeTeam/greptimedb/pull/3360
* feat: skip filling NULL for put and delete requests by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3364
* feat: impl merge reader for DataParts by @v0y4g3r in https://github.com/GreptimeTeam/greptimedb/pull/3361
* feat: Implement write and fork for the new memtable by @evenyag in https://github.com/GreptimeTeam/greptimedb/pull/3357
* feat: distinguish between different read paths by @v0y4g3r in https://github.com/GreptimeTeam/greptimedb/pull/3369
* feat: Add freeze and fork method to the memtable by @evenyag in https://github.com/GreptimeTeam/greptimedb/pull/3374
* feat: merge tree dedup reader by @v0y4g3r in https://github.com/GreptimeTeam/greptimedb/pull/3375
* feat: Implement iter for the new memtable by @evenyag in https://github.com/GreptimeTeam/greptimedb/pull/3373
* feat: Implement dedup for the new memtable and expose the config by @evenyag in https://github.com/GreptimeTeam/greptimedb/pull/3377
* feat: change how region id maps to region worker by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3384
* feat: make tls certificates/keys reloadable (part 1) by @sunng87 in https://github.com/GreptimeTeam/greptimedb/pull/3335
* feat(grafana): enable shared tooltip, add raft engine throughput by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3387
* feat: Implement partition eviction and only add value size to write buffer size by @evenyag in https://github.com/GreptimeTeam/greptimedb/pull/3393
* feat: enable zstd compression and encodings in merge tree data part by @v0y4g3r in https://github.com/GreptimeTeam/greptimedb/pull/3380
* feat(flow): impl for MapFilterProject by @discord9 in https://github.com/GreptimeTeam/greptimedb/pull/3359
* feat: flush or compact table and region functions by @killme2008 in https://github.com/GreptimeTeam/greptimedb/pull/3363
* feat: Use a partition level map to look up pk index by @evenyag in https://github.com/GreptimeTeam/greptimedb/pull/3400
* feat(index): measure memory usage in global instead of single-column and add metrics by @zhongzc in https://github.com/GreptimeTeam/greptimedb/pull/3383
* feat: enable ArrowFlight compression by @tisonkun in https://github.com/GreptimeTeam/greptimedb/pull/3403
* feat: zero copy on split rows by @fengjiachun in https://github.com/GreptimeTeam/greptimedb/pull/3407
* feat: Support automatic DNS lookup for kafka bootstrap servers by @J0HN50N133 in https://github.com/GreptimeTeam/greptimedb/pull/3379
* feat: add configuration for tls watch option by @sunng87 in https://github.com/GreptimeTeam/greptimedb/pull/3395
* feat: employ sparse key encoding for shard lookup by @v0y4g3r in https://github.com/GreptimeTeam/greptimedb/pull/3410
* feat: support `Create Table ... Like` by @KKould in https://github.com/GreptimeTeam/greptimedb/pull/3372
* feat: tableref cache by @fengjiachun in https://github.com/GreptimeTeam/greptimedb/pull/3420
* feat: add verbose support for tql explain/analyze by @etolbakov in https://github.com/GreptimeTeam/greptimedb/pull/3390
* feat: reduce a clone of string by @fengjiachun in https://github.com/GreptimeTeam/greptimedb/pull/3422
* feat: Correct server metrics and add more metrics for scan by @evenyag in https://github.com/GreptimeTeam/greptimedb/pull/3426
* feat: support tracing rule sampler by @Taylor-lagrange in https://github.com/GreptimeTeam/greptimedb/pull/3405
* feat: decode prom requests to grpc by @v0y4g3r in https://github.com/GreptimeTeam/greptimedb/pull/3425
* feat: implement multi-dim partition rule by @waynexia in https://github.com/GreptimeTeam/greptimedb/pull/3409

## Contributors

We would like to thank the following contributors from the GreptimeDB community:

Cancai Cai, Eugene Tolbakov, Hudson C. Dalprá, JeremyHi, JohnsonLee, Kould, LFC, Lei HUANG, Ning Sun, Ruihang Xia, SteveLauC, WU Jingdi, Wei, Weny Xu, Yingwen, Yiran, Zhenchi, ZonaHe, dennis zhuang, dimbtp, discord9, fys, liyang, niebayes, shuiyisong, tison
