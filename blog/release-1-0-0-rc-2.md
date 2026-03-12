---
keywords: [release, GreptimeDB, changelog, v1.0.0-rc.2]
description: GreptimeDB v1.0.0-rc.2 Changelog
date: 2026-03-11
---

# v1.0.0-rc.2

Release date: March 11, 2026

This release also includes several important bug fixes for repartition:
- Reject writes to deallocating regions during region merge
- Ensure entering the staging phase waits for compaction to complete

Upgrading to this version is recommended.

### 👍 Highlights

**Performance Improvements**

- **Dynamic filter pushdown for TopK:** Runtime dynamic filters are propagated from DataFusion into Mito region scans to reduce unnecessary IO/CPU; in [#7545](https://github.com/GreptimeTeam/greptimedb/pull/7545), `ORDER BY end_time DESC LIMIT 10` improved from ~28.86s to ~0.21s on non-indexed timestamps.
- **Pruning improvements:** Shared partition pruning and extension-range filter improvements improve scan selectivity by [#7635](https://github.com/GreptimeTeam/greptimedb/pull/7635) and [#7693](https://github.com/GreptimeTeam/greptimedb/pull/7693).
- **Ingestion and scan path optimization:** Prometheus decode and remote-write decode are optimized by [#7737](https://github.com/GreptimeTeam/greptimedb/pull/7737) and [#7761](https://github.com/GreptimeTeam/greptimedb/pull/7761), and Mito2 Parquet scan is accelerated via min-max caches by [#7708](https://github.com/GreptimeTeam/greptimedb/pull/7708).

**Key New Features**

- **PostgreSQL COPY support for ADBC-postgres path:** GreptimeDB supports `COPY (query) TO STDOUT WITH (format binary)` on the PostgreSQL interface, enabling the ADBC-postgres COPY-optimized query path by [#7709](https://github.com/GreptimeTeam/greptimedb/pull/7709).
- **Flow TQL CTE support:** `CREATE FLOW` supports simple TQL CTE patterns, improving flow authoring while preserving predictable execution semantics by [#7702](https://github.com/GreptimeTeam/greptimedb/pull/7702).
- **Prometheus 3.x behavior alignment:** Selector, lookback, and matrix-selector behavior are aligned for more predictable upgrades and query compatibility by [#7671](https://github.com/GreptimeTeam/greptimedb/pull/7671) and [#7688](https://github.com/GreptimeTeam/greptimedb/pull/7688).

**Notable Bug Fixes**

- **Repartition safety during region merge:** Reject writes to deallocating regions during region merge by [#7694](https://github.com/GreptimeTeam/greptimedb/pull/7694).
- **Staging transition correctness:** Ensure entering the staging phase waits for compaction to complete by [#7776](https://github.com/GreptimeTeam/greptimedb/pull/7776).

**Dashboard Updates**

- **Query experience:** Added table query sidebar and toolbar/editor UI, with refined pagination.
- **SQL and table-name handling:** Improved SQL quoting and parsing for quoted/prefixed table names.
- **Usability and stability:** Added database selector support, log export limits, and bigint handling fixes.


### 🚀 Features

* feat: reduce unit test suite wall time by [@waynexia](https://github.com/waynexia) in [#7657](https://github.com/GreptimeTeam/greptimedb/pull/7657)
* feat: support group by op in promql by [@waynexia](https://github.com/waynexia) in [#7663](https://github.com/GreptimeTeam/greptimedb/pull/7663)
* feat(copy_to_json): add `date_format`/`timestamp_format`/`time_format` for JSON format copy by [@linyihai](https://github.com/linyihai) in [#7633](https://github.com/GreptimeTeam/greptimedb/pull/7633)
* feat: Implement a shared pruner for partitions in the same scanner by [@evenyag](https://github.com/evenyag) in [#7635](https://github.com/GreptimeTeam/greptimedb/pull/7635)
* feat: adapt prometheus 3.x matrix selector behavior change by [@waynexia](https://github.com/waynexia) in [#7671](https://github.com/GreptimeTeam/greptimedb/pull/7671)
* feat: partition rule version validation for writes and staging by [@WenyXu](https://github.com/WenyXu) in [#7628](https://github.com/GreptimeTeam/greptimedb/pull/7628)
* feat: cli tool to repair partition columns mismatch by [@MichaelScofield](https://github.com/MichaelScofield) in [#7605](https://github.com/GreptimeTeam/greptimedb/pull/7605)
* feat: adapt prometheus 3.x selector and lookback behavior by [@waynexia](https://github.com/waynexia) in [#7688](https://github.com/GreptimeTeam/greptimedb/pull/7688)
* feat: track flow source tables for TQL and info schema by [@waynexia](https://github.com/waynexia) in [#7697](https://github.com/GreptimeTeam/greptimedb/pull/7697)
* feat: report flow stats from streaming and batching engines by [@waynexia](https://github.com/waynexia) in [#7701](https://github.com/GreptimeTeam/greptimedb/pull/7701)
* feat: update dashboard to v0.11.12 by [@ZonaHex](https://github.com/ZonaHex) in [#7707](https://github.com/GreptimeTeam/greptimedb/pull/7707)
* feat: add a fallback parameter type inference by reading cast type by [@sunng87](https://github.com/sunng87) in [#7712](https://github.com/GreptimeTeam/greptimedb/pull/7712)
* feat: support changing table's append_mode to true by [@evenyag](https://github.com/evenyag) in [#7669](https://github.com/GreptimeTeam/greptimedb/pull/7669)
* feat: implements anomaly_score_iqr, anomaly_score_mad  etc. by [@killme2008](https://github.com/killme2008) in [#7681](https://github.com/GreptimeTeam/greptimedb/pull/7681)
* feat: implement postgres copy to stdout by [@sunng87](https://github.com/sunng87) in [#7709](https://github.com/GreptimeTeam/greptimedb/pull/7709)
* feat: add a subcommand to bench scan by [@evenyag](https://github.com/evenyag) in [#7722](https://github.com/GreptimeTeam/greptimedb/pull/7722)
* feat(tracing): propagate mailbox trace context and refine procedure spans by [@WenyXu](https://github.com/WenyXu) in [#7726](https://github.com/GreptimeTeam/greptimedb/pull/7726)
* feat: add extension range api for flat format by [@evenyag](https://github.com/evenyag) in [#7730](https://github.com/GreptimeTeam/greptimedb/pull/7730)
* feat: pull meta config in frontend during startup by [@shuiyisong](https://github.com/shuiyisong) in [#7727](https://github.com/GreptimeTeam/greptimedb/pull/7727)
* feat: improve filter support for scanbench by [@evenyag](https://github.com/evenyag) in [#7736](https://github.com/GreptimeTeam/greptimedb/pull/7736)
* feat: add COPY support for GCS/Azblob with OSS/GCS/Azblob integration coverage by [@WenyXu](https://github.com/WenyXu) in [#7743](https://github.com/GreptimeTeam/greptimedb/pull/7743)
* feat: adapt new name of holt winters fn by [@waynexia](https://github.com/waynexia) in [#7700](https://github.com/GreptimeTeam/greptimedb/pull/7700)
* feat: flow tql cte by [@discord9](https://github.com/discord9) in [#7702](https://github.com/GreptimeTeam/greptimedb/pull/7702)
* feat: gc batch delete files by [@discord9](https://github.com/discord9) in [#7733](https://github.com/GreptimeTeam/greptimedb/pull/7733)
* feat: admin gc table/regions by [@discord9](https://github.com/discord9) in [#7619](https://github.com/GreptimeTeam/greptimedb/pull/7619)
* feat: implement last row cache reader for flat format by [@evenyag](https://github.com/evenyag) in [#7757](https://github.com/GreptimeTeam/greptimedb/pull/7757)
* feat: update dashboard to v0.11.13 by [@ZonaHex](https://github.com/ZonaHex) in [#7763](https://github.com/GreptimeTeam/greptimedb/pull/7763)
* feat: add function rewrite rule for json_get with cast by [@sunng87](https://github.com/sunng87) in [#7631](https://github.com/GreptimeTeam/greptimedb/pull/7631)
* feat: fast path for empty selection files by [@waynexia](https://github.com/waynexia) in [#7780](https://github.com/GreptimeTeam/greptimedb/pull/7780)
* feat: flat read path support primary_key format memtables by [@evenyag](https://github.com/evenyag) in [#7759](https://github.com/GreptimeTeam/greptimedb/pull/7759)
* feat: replace shadow-rs with self-maintained version info by [@waynexia](https://github.com/waynexia) in [#7782](https://github.com/GreptimeTeam/greptimedb/pull/7782)
* feat: use dyn filter by [@discord9](https://github.com/discord9) in [#7545](https://github.com/GreptimeTeam/greptimedb/pull/7545)

### 🐛 Bug Fixes

* fix: incorrect column statistics of promql plans by [@waynexia](https://github.com/waynexia) in [#7662](https://github.com/GreptimeTeam/greptimedb/pull/7662)
* fix: drop rhs columns on promql filter join by [@waynexia](https://github.com/waynexia) in [#7665](https://github.com/GreptimeTeam/greptimedb/pull/7665)
* fix(meta-srv): force close postgres client on reset to release advisory l… by [@YZL0v3ZZ](https://github.com/YZL0v3ZZ) in [#7673](https://github.com/GreptimeTeam/greptimedb/pull/7673)
* fix: cargo nextest run -p query --features enterprise by [@fengys1996](https://github.com/fengys1996) in [#7683](https://github.com/GreptimeTeam/greptimedb/pull/7683)
* fix: bump prometheus to 0.14 by [@evenyag](https://github.com/evenyag) in [#7686](https://github.com/GreptimeTeam/greptimedb/pull/7686)
* fix: panic when querying slowlog by [@MichaelScofield](https://github.com/MichaelScofield) in [#7689](https://github.com/GreptimeTeam/greptimedb/pull/7689)
* fix(mito2): filter extension ranges in pruner by [@fengys1996](https://github.com/fengys1996) in [#7693](https://github.com/GreptimeTeam/greptimedb/pull/7693)
* fix(mito2): introduce `PartitionExprChange` in staging flow and keep memtables on metadata-only updates by [@WenyXu](https://github.com/WenyXu) in [#7695](https://github.com/GreptimeTeam/greptimedb/pull/7695)
* fix: incorrect-tql-explain result by [@fengys1996](https://github.com/fengys1996) in [#7675](https://github.com/GreptimeTeam/greptimedb/pull/7675)
* fix: use full DDL of flow in information_schema.flows.flow_definition by [@sunng87](https://github.com/sunng87) in [#7704](https://github.com/GreptimeTeam/greptimedb/pull/7704)
* fix: handle scalar result in MultiDimPartitionRule by [@v0y4g3r](https://github.com/v0y4g3r) in [#7715](https://github.com/GreptimeTeam/greptimedb/pull/7715)
* fix(repartition): reject writes on deallocating regions during region merge by [@WenyXu](https://github.com/WenyXu) in [#7694](https://github.com/GreptimeTeam/greptimedb/pull/7694)
* fix: gc schd parallel send hb instr by [@discord9](https://github.com/discord9) in [#7716](https://github.com/GreptimeTeam/greptimedb/pull/7716)
* fix: Install uv to avoid failure while creating databases by [@v0y4g3r](https://github.com/v0y4g3r) in [#7741](https://github.com/GreptimeTeam/greptimedb/pull/7741)
* fix: preserve the order of primary key indices as defined in the original table info by [@WenyXu](https://github.com/WenyXu) in [#7740](https://github.com/GreptimeTeam/greptimedb/pull/7740)
* fix: null first for part expr as logical expr by [@discord9](https://github.com/discord9) in [#7747](https://github.com/GreptimeTeam/greptimedb/pull/7747)
* fix: Allow overriding sequence when writing flat SSTs by [@evenyag](https://github.com/evenyag) in [#7764](https://github.com/GreptimeTeam/greptimedb/pull/7764)
* fix(mito2): avoid parquet redownload when write cache already contains file by [@WenyXu](https://github.com/WenyXu) in [#7777](https://github.com/GreptimeTeam/greptimedb/pull/7777)
* fix(meta): remap route addresses when reading full table info by [@WenyXu](https://github.com/WenyXu) in [#7778](https://github.com/GreptimeTeam/greptimedb/pull/7778)
* fix(mito2): ensure enter staging waits for compaction by [@WenyXu](https://github.com/WenyXu) in [#7776](https://github.com/GreptimeTeam/greptimedb/pull/7776)

### 🚜 Refactor

* refactor(vector-index): use protobuf for metadata and align code by [@killme2008](https://github.com/killme2008) in [#7648](https://github.com/GreptimeTeam/greptimedb/pull/7648)
* refactor: remove the `RawTableMeta` and `RawTableInfo` to make codes more concise by [@MichaelScofield](https://github.com/MichaelScofield) in [#7626](https://github.com/GreptimeTeam/greptimedb/pull/7626)
* refactor: rename partition rule version to partition expr version by [@WenyXu](https://github.com/WenyXu) in [#7696](https://github.com/GreptimeTeam/greptimedb/pull/7696)
* refactor: remove session from common meta by [@sunng87](https://github.com/sunng87) in [#7698](https://github.com/GreptimeTeam/greptimedb/pull/7698)
* refactor: remote write related code by [@v0y4g3r](https://github.com/v0y4g3r) in [#7775](https://github.com/GreptimeTeam/greptimedb/pull/7775)

### 📚 Documentation

* docs: update project status and description by [@killme2008](https://github.com/killme2008) in [#7731](https://github.com/GreptimeTeam/greptimedb/pull/7731)
* docs: add o11y 2.0 link and .net ingester sdk by [@killme2008](https://github.com/killme2008) in [#7765](https://github.com/GreptimeTeam/greptimedb/pull/7765)

### ⚡ Performance

* perf: prom decode by [@v0y4g3r](https://github.com/v0y4g3r) in [#7737](https://github.com/GreptimeTeam/greptimedb/pull/7737)
* perf(remote-write): optimize decode prom  by [@v0y4g3r](https://github.com/v0y4g3r) in [#7761](https://github.com/GreptimeTeam/greptimedb/pull/7761)
* perf(mito2): speed up parquet scan via minmax caches by [@waynexia](https://github.com/waynexia) in [#7708](https://github.com/GreptimeTeam/greptimedb/pull/7708)

### 🧪 Testing

* test: adds sqlness test for vector index by [@killme2008](https://github.com/killme2008) in [#7634](https://github.com/GreptimeTeam/greptimedb/pull/7634)
* test: add repartition fuzz target with partition IR and translators by [@WenyXu](https://github.com/WenyXu) in [#7666](https://github.com/GreptimeTeam/greptimedb/pull/7666)
* test(fuzz): repartition validation and add dedicated CI GC profile by [@WenyXu](https://github.com/WenyXu) in [#7703](https://github.com/GreptimeTeam/greptimedb/pull/7703)
* test: fix unstable index meta list test by [@evenyag](https://github.com/evenyag) in [#7774](https://github.com/GreptimeTeam/greptimedb/pull/7774)

### ⚙️ Miscellaneous Tasks

* chore: use forked sqlness by [@discord9](https://github.com/discord9) in [#7664](https://github.com/GreptimeTeam/greptimedb/pull/7664)
* chore: bump rsasl version by [@evenyag](https://github.com/evenyag) in [#7713](https://github.com/GreptimeTeam/greptimedb/pull/7713)
* chore: more gc metrics by [@discord9](https://github.com/discord9) in [#7661](https://github.com/GreptimeTeam/greptimedb/pull/7661)
* chore: tracing for gc by [@discord9](https://github.com/discord9) in [#7723](https://github.com/GreptimeTeam/greptimedb/pull/7723)
* chore: remove dependency on "atty" by [@MichaelScofield](https://github.com/MichaelScofield) in [#7725](https://github.com/GreptimeTeam/greptimedb/pull/7725)
* chore: remove old substrait dependency by [@fengys1996](https://github.com/fengys1996) in [#7724](https://github.com/GreptimeTeam/greptimedb/pull/7724)
* chore(ci): collect monitor logs and traces on fuzz test failures by [@WenyXu](https://github.com/WenyXu) in [#7728](https://github.com/GreptimeTeam/greptimedb/pull/7728)
* chore(version): refresh build info on demand by [@v0y4g3r](https://github.com/v0y4g3r) in [#7738](https://github.com/GreptimeTeam/greptimedb/pull/7738)
* ci: refactor monitor artifact export and include otel trace derived tables by [@WenyXu](https://github.com/WenyXu) in [#7742](https://github.com/GreptimeTeam/greptimedb/pull/7742)
* chore: upgrade DataFusion family, again by [@MichaelScofield](https://github.com/MichaelScofield) in [#7578](https://github.com/GreptimeTeam/greptimedb/pull/7578)
* chore: upgrade arrow 57.2 to 57.3 by [@fengys1996](https://github.com/fengys1996) in [#7744](https://github.com/GreptimeTeam/greptimedb/pull/7744)
* chore: remove dependency on "fast-float" by [@MichaelScofield](https://github.com/MichaelScofield) in [#7729](https://github.com/GreptimeTeam/greptimedb/pull/7729)
* chore: grouping batch open region logs by [@waynexia](https://github.com/waynexia) in [#7758](https://github.com/GreptimeTeam/greptimedb/pull/7758)
* chore: update dependency "keccak" by [@MichaelScofield](https://github.com/MichaelScofield) in [#7760](https://github.com/GreptimeTeam/greptimedb/pull/7760)
* chore: update dependency "tracing-subscriber" by [@MichaelScofield](https://github.com/MichaelScofield) in [#7766](https://github.com/GreptimeTeam/greptimedb/pull/7766)
* chore: update oneshot by [@sunng87](https://github.com/sunng87) in [#7770](https://github.com/GreptimeTeam/greptimedb/pull/7770)
* chore: mark datafusion minor version as fixed by [@sunng87](https://github.com/sunng87) in [#7769](https://github.com/GreptimeTeam/greptimedb/pull/7769)
* chore: bump version rc.2 by [@WenyXu](https://github.com/WenyXu) in [#7788](https://github.com/GreptimeTeam/greptimedb/pull/7788)

## New Contributors

* [@YZL0v3ZZ](https://github.com/YZL0v3ZZ) made their first contribution in [#7673](https://github.com/GreptimeTeam/greptimedb/pull/7673)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@MichaelScofield](https://github.com/MichaelScofield), [@WenyXu](https://github.com/WenyXu), [@YZL0v3ZZ](https://github.com/YZL0v3ZZ), [@ZonaHex](https://github.com/ZonaHex), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengys1996](https://github.com/fengys1996), [@killme2008](https://github.com/killme2008), [@linyihai](https://github.com/linyihai), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia)


