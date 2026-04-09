---
keywords: [release, GreptimeDB, changelog, v1.0.0]
description: GreptimeDB v1.0.0 Changelog
date: 2026-04-08
---

# v1.0.0

Release date: April 08, 2026

GreptimeDB v1.0.0 switches the default SST format to flat for better performance under high-cardinality workloads, improves metric engine ingestion with bulk inserts, adds partial success support for trace ingestion, and includes several PostgreSQL compatibility fixes.

### 👍 Highlights

**Flat SST is now the default storage format.** New tables use the flat format by default. Existing tables using `primary_key` format continue to work, and the flat scan path supports both formats. To explicitly use the old format:
  ```sql
  ALTER TABLE my_table SET 'sst_format' = 'primary_key';
  ```
  Or via HTTP ingestion header:
  ```
  x-greptime-hints: sst_format=primary_key
  ```

**OTLP**

- **Partial success in trace ingestion** so partial errors no longer fail the entire batch.
- **Auto alter table during trace ingestion** from int to float types.


**PostgreSQL Compatibility**

- Fix extended query optimization and format issues.
- Fix `ParameterDescription` size limit handling.
- Fix 8-bit int mapped to `smallint`.
- Fix sync cleanup issues with PostgreSQL format.


### Breaking changes

* feat!: switch default sst format to flat by [@evenyag](https://github.com/evenyag) in [#7909](https://github.com/GreptimeTeam/greptimedb/pull/7909)
* refactor!: update arrow-ipc output to stream format by [@sunng87](https://github.com/sunng87) in [#7922](https://github.com/GreptimeTeam/greptimedb/pull/7922)

### 🚀 Features

* feat(procedure): detect potential deadlock when parent/child procedures share lock keys by [@YZL0v3ZZ](https://github.com/YZL0v3ZZ) in [#7752](https://github.com/GreptimeTeam/greptimedb/pull/7752)
* feat: introduce APIs for storing perses dashboard definition by [@sunng87](https://github.com/sunng87) in [#7791](https://github.com/GreptimeTeam/greptimedb/pull/7791)
* feat: track unlimited usage in memory manager by [@fengjiachun](https://github.com/fengjiachun) in [#7811](https://github.com/GreptimeTeam/greptimedb/pull/7811)
* feat(http): improve error logging with client IP by [@maximk777](https://github.com/maximk777) in [#7503](https://github.com/GreptimeTeam/greptimedb/pull/7503)
* feat(mito2): add partition range cache infrastructure by [@evenyag](https://github.com/evenyag) in [#7798](https://github.com/GreptimeTeam/greptimedb/pull/7798)
* feat: add flat last row reader to the final stream by [@evenyag](https://github.com/evenyag) in [#7818](https://github.com/GreptimeTeam/greptimedb/pull/7818)
* feat(metric-engine): support bulk inserts with put fallback by [@v0y4g3r](https://github.com/v0y4g3r) in [#7792](https://github.com/GreptimeTeam/greptimedb/pull/7792)
* feat: update dashboard to v0.12.0 by [@ZonaHex](https://github.com/ZonaHex) in [#7823](https://github.com/GreptimeTeam/greptimedb/pull/7823)
* feat: cache decoded region metadata alone with parquet metadata by [@waynexia](https://github.com/waynexia) in [#7813](https://github.com/GreptimeTeam/greptimedb/pull/7813)
* feat: export import v2 pr1 by [@fengjiachun](https://github.com/fengjiachun) in [#7785](https://github.com/GreptimeTeam/greptimedb/pull/7785)
* feat(mito): flat scan for time series memtable by [@v0y4g3r](https://github.com/v0y4g3r) in [#7814](https://github.com/GreptimeTeam/greptimedb/pull/7814)
* feat: avoid some vector-array conversions on flat projection by [@waynexia](https://github.com/waynexia) in [#7804](https://github.com/GreptimeTeam/greptimedb/pull/7804)
* feat: supports sst_format for x-greptime-hints and database options by [@killme2008](https://github.com/killme2008) in [#7843](https://github.com/GreptimeTeam/greptimedb/pull/7843)
* feat: add parquet pk prefilter helpers by [@evenyag](https://github.com/evenyag) in [#7850](https://github.com/GreptimeTeam/greptimedb/pull/7850)
* feat: implement partition range cache stream by [@evenyag](https://github.com/evenyag) in [#7842](https://github.com/GreptimeTeam/greptimedb/pull/7842)
* feat: use ArrowReaderBuilder instead of the RowGroups API by [@evenyag](https://github.com/evenyag) in [#7853](https://github.com/GreptimeTeam/greptimedb/pull/7853)
* feat: simplify nested aggr inside count query by [@waynexia](https://github.com/waynexia) in [#7859](https://github.com/GreptimeTeam/greptimedb/pull/7859)
* feat: update postgres ParameterDescription size limit by [@sunng87](https://github.com/sunng87) in [#7861](https://github.com/GreptimeTeam/greptimedb/pull/7861)
* feat: add incremental read context and scan boundaries by [@discord9](https://github.com/discord9) in [#7848](https://github.com/GreptimeTeam/greptimedb/pull/7848)
* feat: add common_version customization  by [@sunng87](https://github.com/sunng87) in [#7869](https://github.com/GreptimeTeam/greptimedb/pull/7869)
* feat: pending rows batching for metrics by [@v0y4g3r](https://github.com/v0y4g3r) in [#7831](https://github.com/GreptimeTeam/greptimedb/pull/7831)
* feat(partition): add expression split utility by [@WenyXu](https://github.com/WenyXu) in [#7822](https://github.com/GreptimeTeam/greptimedb/pull/7822)
* feat: implement prefilter framework and primary key prefilter by [@evenyag](https://github.com/evenyag) in [#7862](https://github.com/GreptimeTeam/greptimedb/pull/7862)
* feat: implement export-v2 chunked data export flow by [@fengjiachun](https://github.com/fengjiachun) in [#7841](https://github.com/GreptimeTeam/greptimedb/pull/7841)
* feat: auto-align Prometheus schemas in pending rows batching by [@v0y4g3r](https://github.com/v0y4g3r) in [#7877](https://github.com/GreptimeTeam/greptimedb/pull/7877)
* feat: implement prefilter for bulk memtable by [@evenyag](https://github.com/evenyag) in [#7895](https://github.com/GreptimeTeam/greptimedb/pull/7895)
* feat: partial success in trace ingestion by [@shuiyisong](https://github.com/shuiyisong) in [#7892](https://github.com/GreptimeTeam/greptimedb/pull/7892)
* feat: always use flat scan path for both format by [@evenyag](https://github.com/evenyag) in [#7901](https://github.com/GreptimeTeam/greptimedb/pull/7901)
* feat: auto alter table during trace ingestion from int to float by [@shuiyisong](https://github.com/shuiyisong) in [#7871](https://github.com/GreptimeTeam/greptimedb/pull/7871)

### 🐛 Bug Fixes

* fix: make pipeline table ttl forever by [@sunng87](https://github.com/sunng87) in [#7795](https://github.com/GreptimeTeam/greptimedb/pull/7795)
* fix: rm useless analyzer by [@discord9](https://github.com/discord9) in [#7797](https://github.com/GreptimeTeam/greptimedb/pull/7797)
* fix: allow empty string for env values by [@killme2008](https://github.com/killme2008) in [#7803](https://github.com/GreptimeTeam/greptimedb/pull/7803)
* fix: correct unicode representation for jsonb_to_string by [@sunng87](https://github.com/sunng87) in [#7810](https://github.com/GreptimeTeam/greptimedb/pull/7810)
* fix: resolve optimization issue for extended query by [@sunng87](https://github.com/sunng87) in [#7824](https://github.com/GreptimeTeam/greptimedb/pull/7824)
* fix: windows file path by [@fengjiachun](https://github.com/fengjiachun) in [#7839](https://github.com/GreptimeTeam/greptimedb/pull/7839)
* fix: prevent stale in-flight cache refill after invalidation in CacheContainer by [@WenyXu](https://github.com/WenyXu) in [#7825](https://github.com/GreptimeTeam/greptimedb/pull/7825)
* fix: prom cast to f64 by [@discord9](https://github.com/discord9) in [#7840](https://github.com/GreptimeTeam/greptimedb/pull/7840)
* fix: update 8-bit int to smallint in postgres by [@sunng87](https://github.com/sunng87) in [#7854](https://github.com/GreptimeTeam/greptimedb/pull/7854)
* fix(mito2): accept post-truncate flush for skip-wal tables by [@v0y4g3r](https://github.com/v0y4g3r) in [#7858](https://github.com/GreptimeTeam/greptimedb/pull/7858)
* fix: nested views not working by [@Boudewijn26](https://github.com/Boudewijn26) in [#7857](https://github.com/GreptimeTeam/greptimedb/pull/7857)
* fix: fix SeriesScan verbose mode missing metrics by [@evenyag](https://github.com/evenyag) in [#7872](https://github.com/GreptimeTeam/greptimedb/pull/7872)
* fix(datatypes): correct ConstantVector rhs comparison in vector equality by [@cuiweixie](https://github.com/cuiweixie) in [#7866](https://github.com/GreptimeTeam/greptimedb/pull/7866)
* fix: correct app-name for dashboard by [@sunng87](https://github.com/sunng87) in [#7884](https://github.com/GreptimeTeam/greptimedb/pull/7884)
* fix: allow auto type upscale conversion in trace ingestion by [@shuiyisong](https://github.com/shuiyisong) in [#7870](https://github.com/GreptimeTeam/greptimedb/pull/7870)
* fix: avoid cloning serialized view plans on resolve by [@ynachi](https://github.com/ynachi) in [#7882](https://github.com/GreptimeTeam/greptimedb/pull/7882)
* fix: incorrect prefilter check by [@evenyag](https://github.com/evenyag) in [#7886](https://github.com/GreptimeTeam/greptimedb/pull/7886)
* fix: return empty when promql gets non-exist label name by [@shuiyisong](https://github.com/shuiyisong) in [#7899](https://github.com/GreptimeTeam/greptimedb/pull/7899)
* fix: windows ci by [@fengjiachun](https://github.com/fengjiachun) in [#7905](https://github.com/GreptimeTeam/greptimedb/pull/7905)
* fix: add overflow check before interleave() by [@evenyag](https://github.com/evenyag) in [#7921](https://github.com/GreptimeTeam/greptimedb/pull/7921)
* fix: resolve postgres format and sync cleanup issues by [@sunng87](https://github.com/sunng87) in [#7928](https://github.com/GreptimeTeam/greptimedb/pull/7928)
* fix(repartition): harden repartition rollback paths by [@WenyXu](https://github.com/WenyXu) in [#7918](https://github.com/GreptimeTeam/greptimedb/pull/7918)

### 🚜 Refactor

* refactor: customize standalone instance build by [@MichaelScofield](https://github.com/MichaelScofield) in [#7807](https://github.com/GreptimeTeam/greptimedb/pull/7807)
* refactor: unify flush and compaction to always use FlatSource by [@evenyag](https://github.com/evenyag) in [#7799](https://github.com/GreptimeTeam/greptimedb/pull/7799)
* refactor: remove Memtable::iter by [@v0y4g3r](https://github.com/v0y4g3r) in [#7809](https://github.com/GreptimeTeam/greptimedb/pull/7809)
* refactor: move election trait and implementations to the `common-meta` crate by [@shuiyisong](https://github.com/shuiyisong) in [#7820](https://github.com/GreptimeTeam/greptimedb/pull/7820)
* refactor: simplify scan memory tracking by [@fengjiachun](https://github.com/fengjiachun) in [#7827](https://github.com/GreptimeTeam/greptimedb/pull/7827)
* refactor(metric-engine): Refactor PendingRowsBatcher for better testability and benchmarking by [@v0y4g3r](https://github.com/v0y4g3r) in [#7902](https://github.com/GreptimeTeam/greptimedb/pull/7902)
* refactor: extract otel helper by [@shuiyisong](https://github.com/shuiyisong) in [#7910](https://github.com/GreptimeTeam/greptimedb/pull/7910)

### 📚 Documentation

* docs: update year to 2026 by [@yihong0618](https://github.com/yihong0618) in [#7787](https://github.com/GreptimeTeam/greptimedb/pull/7787)
* docs: flow inc query rfc by [@discord9](https://github.com/discord9) in [#7816](https://github.com/GreptimeTeam/greptimedb/pull/7816)
* docs(metric-engine): update prom_store example configs by [@v0y4g3r](https://github.com/v0y4g3r) in [#7920](https://github.com/GreptimeTeam/greptimedb/pull/7920)

### ⚡ Performance

* perf: support group accumulators for state wrapper by [@waynexia](https://github.com/waynexia) in [#7826](https://github.com/GreptimeTeam/greptimedb/pull/7826)
* perf: optimize promql range functions by [@waynexia](https://github.com/waynexia) in [#7878](https://github.com/GreptimeTeam/greptimedb/pull/7878)
* perf: no longer window sort when limit by [@discord9](https://github.com/discord9) in [#7912](https://github.com/GreptimeTeam/greptimedb/pull/7912)

### 🧪 Testing

* test(fuzz): add metric table repartition fuzz target by [@WenyXu](https://github.com/WenyXu) in [#7754](https://github.com/GreptimeTeam/greptimedb/pull/7754)
* test: filter on region_peers table by [@waynexia](https://github.com/waynexia) in [#7864](https://github.com/GreptimeTeam/greptimedb/pull/7864)

### ⚙️ Miscellaneous Tasks

* ci: upload artifacts use s3 proxy by [@daviderli614](https://github.com/daviderli614) in [#7800](https://github.com/GreptimeTeam/greptimedb/pull/7800)
* chore: update visibility of BatchToRecordBatchAdapter::new by [@sunng87](https://github.com/sunng87) in [#7817](https://github.com/GreptimeTeam/greptimedb/pull/7817)
* chore: remove GrpcQueryHandler::put_record_batch by [@v0y4g3r](https://github.com/v0y4g3r) in [#7844](https://github.com/GreptimeTeam/greptimedb/pull/7844)
* ci: remove redundant directory level when uploading artifacts to S3 by [@daviderli614](https://github.com/daviderli614) in [#7852](https://github.com/GreptimeTeam/greptimedb/pull/7852)
* chore: remove unused rexpect dev-dependency by [@fengys1996](https://github.com/fengys1996) in [#7865](https://github.com/GreptimeTeam/greptimedb/pull/7865)
* chore: refine track memory metrics semantics by [@fengjiachun](https://github.com/fengjiachun) in [#7874](https://github.com/GreptimeTeam/greptimedb/pull/7874)
* chore: update rust toolchain to 2026-03-21 by [@sunng87](https://github.com/sunng87) in [#7849](https://github.com/GreptimeTeam/greptimedb/pull/7849)
* chore: update ignore list for AI related by [@shuiyisong](https://github.com/shuiyisong) in [#7896](https://github.com/GreptimeTeam/greptimedb/pull/7896)
* chore: Update Dockerfile by [@daviderli614](https://github.com/daviderli614) in [#7893](https://github.com/GreptimeTeam/greptimedb/pull/7893)
* ci: update dev-builder image tag by [@github-actions[bot]](https://github.com/github-actions[bot]) in [#7894](https://github.com/GreptimeTeam/greptimedb/pull/7894)
* chore: remove unused deps using udeps by [@shuiyisong](https://github.com/shuiyisong) in [#7906](https://github.com/GreptimeTeam/greptimedb/pull/7906)
* chore: memory limit comment by [@fengjiachun](https://github.com/fengjiachun) in [#7914](https://github.com/GreptimeTeam/greptimedb/pull/7914)
* chore: bump version to 1.0.0 by [@evenyag](https://github.com/evenyag) in [#7935](https://github.com/GreptimeTeam/greptimedb/pull/7935)

## New Contributors

* [@ynachi](https://github.com/ynachi) made their first contribution in [#7882](https://github.com/GreptimeTeam/greptimedb/pull/7882)
* [@cuiweixie](https://github.com/cuiweixie) made their first contribution in [#7866](https://github.com/GreptimeTeam/greptimedb/pull/7866)
* [@Boudewijn26](https://github.com/Boudewijn26) made their first contribution in [#7857](https://github.com/GreptimeTeam/greptimedb/pull/7857)
* [@maximk777](https://github.com/maximk777) made their first contribution in [#7503](https://github.com/GreptimeTeam/greptimedb/pull/7503)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@Boudewijn26](https://github.com/Boudewijn26), [@MichaelScofield](https://github.com/MichaelScofield), [@WenyXu](https://github.com/WenyXu), [@YZL0v3ZZ](https://github.com/YZL0v3ZZ), [@ZonaHex](https://github.com/ZonaHex), [@cuiweixie](https://github.com/cuiweixie), [@daviderli614](https://github.com/daviderli614), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@fengys1996](https://github.com/fengys1996), [@github-actions[bot]](https://github.com/github-actions[bot]), [@killme2008](https://github.com/killme2008), [@maximk777](https://github.com/maximk777), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@yihong0618](https://github.com/yihong0618), [@ynachi](https://github.com/ynachi)
