---
keywords: [release, GreptimeDB, changelog, v1.2.0]
description: GreptimeDB v1.2.0 Changelog
date: 2026-09-08
---
# v1.2.0

Release date: September 8, 2026

GreptimeDB v1.2.0 adds new structural stored JSON data type ("`JSON2`") and query capabilities, Prometheus Remote Write v2 ingestion, Flow runtime observability, and dashboard updates, alongside query and ingestion improvements.

### 👍 Highlights

**New structural stored JSON data type and dot-style SQL access.** JSON data can be stored as structs, instead of as a whole blob (JSONB). Featured with SQL paths and functions, list indexing, empty and null handling, and table-aware pipelines ([#8909](https://github.com/GreptimeTeam/greptimedb/pull/8909), [#8928](https://github.com/GreptimeTeam/greptimedb/pull/8928), [#8940](https://github.com/GreptimeTeam/greptimedb/pull/8940), [#8979](https://github.com/GreptimeTeam/greptimedb/pull/8979), [#9007](https://github.com/GreptimeTeam/greptimedb/pull/9007), [#9010](https://github.com/GreptimeTeam/greptimedb/pull/9010), [#9013](https://github.com/GreptimeTeam/greptimedb/pull/9013), [#9027](https://github.com/GreptimeTeam/greptimedb/pull/9027), and [#8964](https://github.com/GreptimeTeam/greptimedb/pull/8964)). For example, JSON2 fields can be accessed with dot paths or `json_get`:

```sql
CREATE TABLE application_logs (
    ts TIMESTAMP TIME INDEX,
    attrs JSON2
) WITH (
    'append_mode' = 'true'
);
INSERT INTO application_logs VALUES
    (1, '{"http":{"status":200,"path":"/api/orders"}}');
SELECT
    attrs.http.status::BIGINT AS status,
    json_get(attrs, 'http.path')::STRING AS path
FROM application_logs;
```

**Prometheus Remote Write v2 and experimental native histograms.** GreptimeDB can ingest Prometheus Remote Write v2 requests and query native histograms through PromQL ([#8361](https://github.com/GreptimeTeam/greptimedb/pull/8361), [#8382](https://github.com/GreptimeTeam/greptimedb/pull/8382), [#8654](https://github.com/GreptimeTeam/greptimedb/pull/8654), [#8664](https://github.com/GreptimeTeam/greptimedb/pull/8664), and [#8693](https://github.com/GreptimeTeam/greptimedb/pull/8693)). Native-histogram ingestion is experimental and disabled by default. To enable it in GreptimeDB:

```toml
[http]
experimental_enable_prometheus_native_histogram = true
```

Configure Prometheus to use `protobuf_message: io.prometheus.write.v2.Request`:

```yaml
remote_write:
  - url: http://greptimedb:4000/v1/prometheus/write
    protobuf_message: io.prometheus.write.v2.Request
```

**More efficient series queries.** Dictionary-encoded series keys, correct regex filtering on dictionary-encoded columns, and RangeSelect projection pruning improve query efficiency ([#8541](https://github.com/GreptimeTeam/greptimedb/pull/8541), [#8688](https://github.com/GreptimeTeam/greptimedb/pull/8688), and [#8570](https://github.com/GreptimeTeam/greptimedb/pull/8570)).

**Splunk HEC ingestion.** Send structured events or raw logs directly to `/v1/splunk/services/collector/event` or `/v1/splunk/services/collector/raw` using Splunk HEC-compatible clients ([#8321](https://github.com/GreptimeTeam/greptimedb/pull/8321) and [#8491](https://github.com/GreptimeTeam/greptimedb/pull/8491)).

**Flow runtime status.** `SHOW FLOW STATUS` and `information_schema.flow_statistics` expose Flow runtime statistics ([#8392](https://github.com/GreptimeTeam/greptimedb/pull/8392)); distributed Flow reports `start_time` and `uptime_seconds` as `NULL` in this release. [#8729](https://github.com/GreptimeTeam/greptimedb/pull/8729) fixes Flow statistics aggregation and quoting.

```sql
SHOW FLOW STATUS LIKE 'my%';
SELECT * FROM information_schema.flow_statistics;
```

### Dashboard

The bundled GreptimeDB dashboard is updated from **v0.12.2** (bundled with v1.1.0) to **v0.13.13**. The update includes:

- Dashboard snapshots ([dashboard#627](https://github.com/GreptimeTeam/dashboard/pull/627)).
- Resizable and expandable tables, and full-screen query results ([dashboard#638](https://github.com/GreptimeTeam/dashboard/pull/638) and [dashboard#639](https://github.com/GreptimeTeam/dashboard/pull/639)).
- Trace-table selection and edition/build information ([dashboard#640](https://github.com/GreptimeTeam/dashboard/pull/640) and [dashboard#641](https://github.com/GreptimeTeam/dashboard/pull/641)).
- A command palette and reconnection after changing hosts ([dashboard#642](https://github.com/GreptimeTeam/dashboard/pull/642) and [dashboard#644](https://github.com/GreptimeTeam/dashboard/pull/644)).

Dashboard integration updates are included in [#8687](https://github.com/GreptimeTeam/greptimedb/pull/8687) and [#8898](https://github.com/GreptimeTeam/greptimedb/pull/8898).

### Breaking changes

- **Local SQL filesystem access is sandboxed.** In standalone deployments, local `COPY` and external-table paths are limited to the copy root; in distributed deployments, those local paths are disabled. Before upgrading, follow the [local SQL file access migration guide](https://docs.greptime.com/1.2/user-guide/deployments-administration/migrate-local-sql-file-access) to move data, set a dedicated copy root, or move the workflow to object storage ([#8708](https://github.com/GreptimeTeam/greptimedb/pull/8708)) by [@fengjiachun](https://github.com/fengjiachun).
- **`holt_winters` was removed.** Use `double_exponential_smoothing` instead ([#8457](https://github.com/GreptimeTeam/greptimedb/pull/8457)) by [@shuiyisong](https://github.com/shuiyisong).
- **`sparse_primary_key_encoding` was removed.** Metric-engine data regions default to sparse primary-key encoding. Existing configurations still load, but this option is ignored. Remove it when updating configuration ([#8470](https://github.com/GreptimeTeam/greptimedb/pull/8470)) by [@sunng87](https://github.com/sunng87).
- **Out-of-range pipeline integer conversions no longer silently wrap.** Integer narrowing now checks the target range and follows the configured `on_failure` behavior when a value does not fit ([#8589](https://github.com/GreptimeTeam/greptimedb/pull/8589)) by [@discord9](https://github.com/discord9).
- **Soft-drop and recovery are Enterprise Edition features.** In beta1, these operations were available in OSS; from beta2 onward, an OSS metasrv rejects `gc.experimental_soft_drop.enable = true`. Before upgrading from beta1, recover any soft-dropped tables you need. OSS cannot recover or purge tables already soft-dropped in beta1 and does not clean up their expired tombstones; Enterprise Edition is required to continue that lifecycle ([#8747](https://github.com/GreptimeTeam/greptimedb/pull/8747)) by [@v0y4g3r](https://github.com/v0y4g3r).
- **Native histogram persisted fields changed signedness.** Span-length list elements changed from `UInt32` to `Int32`; integer count fields changed from `UInt64` to `Int64`, with `count_u64`/`zero_count_u64` renamed to `count_i64`/`zero_count_i64`. Native-histogram Struct data written by earlier betas with the old schema may be unreadable. This caveat concerns the experimental beta feature, not ordinary v1.1 metric tables. There is no migration, downgrade, or mixed-version compatibility layer; plan migration or reingestion before upgrading ([#8824](https://github.com/GreptimeTeam/greptimedb/pull/8824)) by [@sunng87](https://github.com/sunng87).
- **Legacy JSON2 tables require upgrade testing.** Existing non-append tables using the legacy `greptime.json` type can fail during flush or compaction after upgrade. This known limitation is not fixed in v1.2.0. For affected tables, defer the upgrade, or logically export data from a compatible old-version environment and import it into a newly created v1.2.0 table. Do not copy old table directories or metadata. Retain a backup; validate completeness and perform an actual flush and compaction on the new table before cutover. Test the migration with representative data. Setting `append_mode` alone is not a guaranteed remedy.

The changelog below covers changes since v1.1.0, excluding those already shipped in v1.1.1–v1.1.4. Earlier soft-drop work is listed for attribution but is Enterprise-only in this release.

### 🚀 Features

* feat(cli): add export-v2 chunk parallelism by [@fengjiachun](https://github.com/fengjiachun) in [#8292](https://github.com/GreptimeTeam/greptimedb/pull/8292)
* feat: pass Kafka pruned entry id when creating regions by [@WenyXu](https://github.com/WenyXu) in [#8282](https://github.com/GreptimeTeam/greptimedb/pull/8282)
* feat(cli): add export-v2 progress reporting by [@fengjiachun](https://github.com/fengjiachun) in [#8294](https://github.com/GreptimeTeam/greptimedb/pull/8294)
* feat(cli): add import-v2 task parallelism by [@fengjiachun](https://github.com/fengjiachun) in [#8300](https://github.com/GreptimeTeam/greptimedb/pull/8300)
* feat: update dashboard to v0.13.1 by [@ZonaHex](https://github.com/ZonaHex) in [#8306](https://github.com/GreptimeTeam/greptimedb/pull/8306)
* feat: add repartition column hint by [@WenyXu](https://github.com/WenyXu) in [#8291](https://github.com/GreptimeTeam/greptimedb/pull/8291)
* feat(cli): allow overriding import-v2 state path by [@fengjiachun](https://github.com/fengjiachun) in [#8302](https://github.com/GreptimeTeam/greptimedb/pull/8302)
* feat: decouple error retryability from status codes by [@WenyXu](https://github.com/WenyXu) in [#8301](https://github.com/GreptimeTeam/greptimedb/pull/8301)
* feat: expose region read load metrics by [@v0y4g3r](https://github.com/v0y4g3r) in [#8316](https://github.com/GreptimeTeam/greptimedb/pull/8316)
* feat: add flow batching metrics to grafana dashboard by [@evenyag](https://github.com/evenyag) in [#8353](https://github.com/GreptimeTeam/greptimedb/pull/8353)
* feat: add remote dynamic filter metrics by [@discord9](https://github.com/discord9) in [#8309](https://github.com/GreptimeTeam/greptimedb/pull/8309)
* feat: Add support for splunk HEC endpoints by [@agrawalx](https://github.com/agrawalx) in [#8321](https://github.com/GreptimeTeam/greptimedb/pull/8321)
* feat: `prw_v2` initial commit with sample ingestion by [@shuiyisong](https://github.com/shuiyisong) in [#8361](https://github.com/GreptimeTeam/greptimedb/pull/8361)
* feat: accept x-greptime-pipeline-name header on /events/logs by [@BootstrapperSBL](https://github.com/BootstrapperSBL) in [#8371](https://github.com/GreptimeTeam/greptimedb/pull/8371)
* feat(json2): type hint by [@fengys1996](https://github.com/fengys1996) in [#8247](https://github.com/GreptimeTeam/greptimedb/pull/8247)
* feat: support table-level auto_flush_interval by [@raphaelroshan](https://github.com/raphaelroshan) in [#8357](https://github.com/GreptimeTeam/greptimedb/pull/8357)
* feat: support structured instruction reply errors by [@WenyXu](https://github.com/WenyXu) in [#8335](https://github.com/GreptimeTeam/greptimedb/pull/8335)
* feat(json2): reject non-object JSON values on write by [@fengys1996](https://github.com/fengys1996) in [#8381](https://github.com/GreptimeTeam/greptimedb/pull/8381)
* feat: stream explain analyze metrics over http by [@discord9](https://github.com/discord9) in [#8380](https://github.com/GreptimeTeam/greptimedb/pull/8380)
* feat: report region query stats in heartbeat by [@WenyXu](https://github.com/WenyXu) in [#8401](https://github.com/GreptimeTeam/greptimedb/pull/8401)
* feat: add query regression perf harness by [@discord9](https://github.com/discord9) in [#8406](https://github.com/GreptimeTeam/greptimedb/pull/8406)
* feat: add soft-drop table recovery procedures by [@v0y4g3r](https://github.com/v0y4g3r) in [#8061](https://github.com/GreptimeTeam/greptimedb/pull/8061) (Enterprise-only in v1.2.0; see upgrade notes.)
* feat: persist Prometheus remote write v2 native histograms by [@shuiyisong](https://github.com/shuiyisong) in [#8382](https://github.com/GreptimeTeam/greptimedb/pull/8382)
* feat(query): add runtime provider interface by [@discord9](https://github.com/discord9) in [#8386](https://github.com/GreptimeTeam/greptimedb/pull/8386)
* feat: support ALTER TABLE SET auto_flush_interval by [@srivtx](https://github.com/srivtx) in [#8403](https://github.com/GreptimeTeam/greptimedb/pull/8403)
* feat: add Prom remote-write query regression scenario by [@discord9](https://github.com/discord9) in [#8413](https://github.com/GreptimeTeam/greptimedb/pull/8413)
* feat(json2): validate append mode for tables with JSON2 columns by [@fengys1996](https://github.com/fengys1996) in [#8434](https://github.com/GreptimeTeam/greptimedb/pull/8434)
* feat(json2): encode json2 variant payloads as jsonb by [@fengys1996](https://github.com/fengys1996) in [#8435](https://github.com/GreptimeTeam/greptimedb/pull/8435)
* feat: add fuzz CI failure investigation skill by [@WenyXu](https://github.com/WenyXu) in [#8456](https://github.com/GreptimeTeam/greptimedb/pull/8456)
* feat: add strict CSV header validation by [@QuakeWang](https://github.com/QuakeWang) in [#8426](https://github.com/GreptimeTeam/greptimedb/pull/8426)
* feat: more region lifecycle hooks by [@sunng87](https://github.com/sunng87) in [#8467](https://github.com/GreptimeTeam/greptimedb/pull/8467)
* feat: prepare soft-drop WAL retirement by [@v0y4g3r](https://github.com/v0y4g3r) in [#8475](https://github.com/GreptimeTeam/greptimedb/pull/8475) (Enterprise-only in v1.2.0; see upgrade notes.)
* feat: clean up soft-dropped regions offline by [@v0y4g3r](https://github.com/v0y4g3r) in [#8458](https://github.com/GreptimeTeam/greptimedb/pull/8458) (Enterprise-only in v1.2.0; see upgrade notes.)
* feat: enlarge file meta cache by [@waynexia](https://github.com/waynexia) in [#8499](https://github.com/GreptimeTeam/greptimedb/pull/8499)
* feat: support per-region write buffer limits by [@evenyag](https://github.com/evenyag) in [#8473](https://github.com/GreptimeTeam/greptimedb/pull/8473)
* feat: support SCRAM auth for Postgres by [@killme2008](https://github.com/killme2008) in [#8304](https://github.com/GreptimeTeam/greptimedb/pull/8304)
* feat(meta): add retention GC for soft-dropped tables by [@v0y4g3r](https://github.com/v0y4g3r) in [#8526](https://github.com/GreptimeTeam/greptimedb/pull/8526) (Enterprise-only in v1.2.0; see upgrade notes.)
* feat: support soft-drop recycle bin and UNDROP TABLE by [@v0y4g3r](https://github.com/v0y4g3r) in [#8546](https://github.com/GreptimeTeam/greptimedb/pull/8546) (Enterprise-only in v1.2.0; see upgrade notes.)
* feat: support splunk HEC raw endpoint by [@agrawalx](https://github.com/agrawalx) in [#8491](https://github.com/GreptimeTeam/greptimedb/pull/8491)
* feat: enable soft-drop table lifecycle by [@v0y4g3r](https://github.com/v0y4g3r) in [#8554](https://github.com/GreptimeTeam/greptimedb/pull/8554) (Enterprise-only in v1.2.0; see upgrade notes.)
* feat: allow unknown PluginOptions with a warning message by [@sunng87](https://github.com/sunng87) in [#8550](https://github.com/GreptimeTeam/greptimedb/pull/8550)
* feat(mito2): expose adaptive batch APIs by [@evenyag](https://github.com/evenyag) in [#8578](https://github.com/GreptimeTeam/greptimedb/pull/8578)
* feat: grant creators access to newly created databases by [@shuiyisong](https://github.com/shuiyisong) in [#8566](https://github.com/GreptimeTeam/greptimedb/pull/8566)
* feat(flow): handle time_ranges in DirtyWindowRequest by [@v0y4g3r](https://github.com/v0y4g3r) in [#8582](https://github.com/GreptimeTeam/greptimedb/pull/8582)
* feat: add mysql object store backend by [@fengys1996](https://github.com/fengys1996) in [#8560](https://github.com/GreptimeTeam/greptimedb/pull/8560)
* feat: add a region hook for gc cleanup by [@sunng87](https://github.com/sunng87) in [#8547](https://github.com/GreptimeTeam/greptimedb/pull/8547)
* feat(json2): support JSON2 nested path fallback reads by [@fengys1996](https://github.com/fengys1996) in [#8540](https://github.com/GreptimeTeam/greptimedb/pull/8540)
* feat: update flow windows after metric batch flush by [@v0y4g3r](https://github.com/v0y4g3r) in [#8544](https://github.com/GreptimeTeam/greptimedb/pull/8544)
* feat: make parquet row group size configurable by [@evenyag](https://github.com/evenyag) in [#8446](https://github.com/GreptimeTeam/greptimedb/pull/8446)
* feat(mito): add candidate series scanner by [@evenyag](https://github.com/evenyag) in [#8586](https://github.com/GreptimeTeam/greptimedb/pull/8586)
* feat: invoke gc hook for offline region cleanup by [@sunng87](https://github.com/sunng87) in [#8613](https://github.com/GreptimeTeam/greptimedb/pull/8613)
* feat(procedure): support trigger-aware procedure events by [@WenyXu](https://github.com/WenyXu) in [#8549](https://github.com/GreptimeTeam/greptimedb/pull/8549)
* feat(event-recorder): configure lifecycle event recording by [@WenyXu](https://github.com/WenyXu) in [#8648](https://github.com/GreptimeTeam/greptimedb/pull/8648)
* feat: add database DDL procedure events by [@WenyXu](https://github.com/WenyXu) in [#8623](https://github.com/GreptimeTeam/greptimedb/pull/8623)
* feat(common-query): add native histogram runtime model by [@shuiyisong](https://github.com/shuiyisong) in [#8656](https://github.com/GreptimeTeam/greptimedb/pull/8656)
* feat: add procedure events for Flow DDL by [@WenyXu](https://github.com/WenyXu) in [#8632](https://github.com/GreptimeTeam/greptimedb/pull/8632)
* feat: update dashboard to v0.13.8 by [@sunchanglong](https://github.com/sunchanglong) in [#8666](https://github.com/GreptimeTeam/greptimedb/pull/8666)
* feat: add extra http router provider in metasrv plugin by [@MichaelScofield](https://github.com/MichaelScofield) in [#8662](https://github.com/GreptimeTeam/greptimedb/pull/8662)
* feat(promql): add native histogram functions by [@shuiyisong](https://github.com/shuiyisong) in [#8664](https://github.com/GreptimeTeam/greptimedb/pull/8664)
* feat: add events for create and drop view by [@WenyXu](https://github.com/WenyXu) in [#8626](https://github.com/GreptimeTeam/greptimedb/pull/8626)
* feat: add a dedicated http api server port by [@sunng87](https://github.com/sunng87) in [#8657](https://github.com/GreptimeTeam/greptimedb/pull/8657)
* feat: record metrics for timed out explain analyze by [@v0y4g3r](https://github.com/v0y4g3r) in [#8668](https://github.com/GreptimeTeam/greptimedb/pull/8668)
* feat: update dashboard to v0.13.9 by [@sunchanglong](https://github.com/sunchanglong) in [#8674](https://github.com/GreptimeTeam/greptimedb/pull/8674)
* feat(metasrv): add repartition lifecycle events by [@WenyXu](https://github.com/WenyXu) in [#8665](https://github.com/GreptimeTeam/greptimedb/pull/8665)
* feat: support time range in manual compaction by [@v0y4g3r](https://github.com/v0y4g3r) in [#8669](https://github.com/GreptimeTeam/greptimedb/pull/8669)
* feat: update dashboard to v0.13.10 by [@sunchanglong](https://github.com/sunchanglong) in [#8687](https://github.com/GreptimeTeam/greptimedb/pull/8687)
* feat: add table DDL procedure events by [@WenyXu](https://github.com/WenyXu) in [#8627](https://github.com/GreptimeTeam/greptimedb/pull/8627)
* feat: expose MitoRegion::all_manifest_files for metadata rebuild by [@sunng87](https://github.com/sunng87) in [#8680](https://github.com/GreptimeTeam/greptimedb/pull/8680)
* feat(metasrv): record WAL prune procedure events by [@WenyXu](https://github.com/WenyXu) in [#8677](https://github.com/GreptimeTeam/greptimedb/pull/8677)
* feat(query): add native histogram result plumbing by [@shuiyisong](https://github.com/shuiyisong) in [#8693](https://github.com/GreptimeTeam/greptimedb/pull/8693)
* feat(metasrv): add batch GC lifecycle events by [@WenyXu](https://github.com/WenyXu) in [#8673](https://github.com/GreptimeTeam/greptimedb/pull/8673)
* feat(mito2): support cancelling flush jobs by [@evenyag](https://github.com/evenyag) in [#8685](https://github.com/GreptimeTeam/greptimedb/pull/8685)
* feat: support enabling skip_wal with ALTER TABLE by [@evenyag](https://github.com/evenyag) in [#8817](https://github.com/GreptimeTeam/greptimedb/pull/8817)
* feat: make frontend heartbeat extensible and lifecycle-safe by [@fengjiachun](https://github.com/fengjiachun) in [#8726](https://github.com/GreptimeTeam/greptimedb/pull/8726)
* feat(mito2): discard unflushed region data safely by [@evenyag](https://github.com/evenyag) in [#8600](https://github.com/GreptimeTeam/greptimedb/pull/8600)
* feat: add admin function to discard unflushed data by [@evenyag](https://github.com/evenyag) in [#8768](https://github.com/GreptimeTeam/greptimedb/pull/8768)
* feat(flow): add information_schema.flow_statistics and SHOW FLOW STATUS (distributed start_time/uptime_seconds are NULL) by [@onepizzateam](https://github.com/onepizzateam) in [#8392](https://github.com/GreptimeTeam/greptimedb/pull/8392)
* feat: update to pgwire 0.40.7 by [@sunng87](https://github.com/sunng87) in [#8860](https://github.com/GreptimeTeam/greptimedb/pull/8860)
* feat: update dashboard to v0.13.13 by [@sunchanglong](https://github.com/sunchanglong) in [#8898](https://github.com/GreptimeTeam/greptimedb/pull/8898)
* feat(event): add event context to procedure events by [@WenyXu](https://github.com/WenyXu) in [#8734](https://github.com/GreptimeTeam/greptimedb/pull/8734)
* feat(event): record admin function executions by [@WenyXu](https://github.com/WenyXu) in [#8835](https://github.com/GreptimeTeam/greptimedb/pull/8835)
* feat(procedure): record event actor by [@WenyXu](https://github.com/WenyXu) in [#8849](https://github.com/GreptimeTeam/greptimedb/pull/8849)
* feat(mito2): adapt bulk memtable encode threshold to write buffer size [Backport release/v1.2] by [@MichaelScofield](https://github.com/MichaelScofield) in [#9061](https://github.com/GreptimeTeam/greptimedb/pull/9061)
* feat(pipeline): support table-aware JSON2 transforms by [@shuiyisong](https://github.com/shuiyisong) in [#8964](https://github.com/GreptimeTeam/greptimedb/pull/8964)
* feat(json2): support JSON2 paths in SQL functions by [@MichaelScofield](https://github.com/MichaelScofield) in [#9007](https://github.com/GreptimeTeam/greptimedb/pull/9007)
* feat(json2): support empty and null JSON2 value by [@fengys1996](https://github.com/fengys1996) in [#9010](https://github.com/GreptimeTeam/greptimedb/pull/9010)
* feat(json2): support list indexing for JSON2 columns by [@MichaelScofield](https://github.com/MichaelScofield) in [#9013](https://github.com/GreptimeTeam/greptimedb/pull/9013)

### 🐛 Bug Fixes

* fix(metric-engine): report query load under physical region id by [@v0y4g3r](https://github.com/v0y4g3r) in [#8355](https://github.com/GreptimeTeam/greptimedb/pull/8355)
* fix(mito): failed to compact memtable with json2 by [@fengys1996](https://github.com/fengys1996) in [#8297](https://github.com/GreptimeTeam/greptimedb/pull/8297)
* fix(mito): honor unknown file lingering time by [@discord9](https://github.com/discord9) in [#8365](https://github.com/GreptimeTeam/greptimedb/pull/8365)
* fix(meta): configure heartbeat message size by [@discord9](https://github.com/discord9) in [#8411](https://github.com/GreptimeTeam/greptimedb/pull/8411)
* fix(flow): rebind stale snapshot fence by [@discord9](https://github.com/discord9) in [#8409](https://github.com/GreptimeTeam/greptimedb/pull/8409)
* fix: spawn read operations on query runtime by [@v0y4g3r](https://github.com/v0y4g3r) in [#8433](https://github.com/GreptimeTeam/greptimedb/pull/8433)
* fix: collect lightweight query-load metrics by [@v0y4g3r](https://github.com/v0y4g3r) in [#8437](https://github.com/GreptimeTeam/greptimedb/pull/8437)
* fix: preserve close-time flush responses by [@fengjiachun](https://github.com/fengjiachun) in [#8443](https://github.com/GreptimeTeam/greptimedb/pull/8443)
* fix: pause GC during maintenance mode by [@discord9](https://github.com/discord9) in [#8450](https://github.com/GreptimeTeam/greptimedb/pull/8450)
* fix: compare all LoggingOptions fields in PartialEq by [@raphaelroshan](https://github.com/raphaelroshan) in [#8449](https://github.com/GreptimeTeam/greptimedb/pull/8449)
* fix: Use prepared file locations for CSV strict headers integration test by [@evenyag](https://github.com/evenyag) in [#8493](https://github.com/GreptimeTeam/greptimedb/pull/8493)
* fix: disable WAL index creation by default by [@WenyXu](https://github.com/WenyXu) in [#8505](https://github.com/GreptimeTeam/greptimedb/pull/8505)
* fix: require metasrv GC for repartition by [@WenyXu](https://github.com/WenyXu) in [#8497](https://github.com/GreptimeTeam/greptimedb/pull/8497)
* fix: reject datanode startup on GC config mismatch by [@discord9](https://github.com/discord9) in [#8509](https://github.com/GreptimeTeam/greptimedb/pull/8509)
* fix: close database ACL gaps in permission checks by [@shuiyisong](https://github.com/shuiyisong) in [#8492](https://github.com/GreptimeTeam/greptimedb/pull/8492)
* fix(promql): preserve ordinary NaN samples by [@discord9](https://github.com/discord9) in [#8494](https://github.com/GreptimeTeam/greptimedb/pull/8494)
* fix(promql): handle missing labels in or matching by [@discord9](https://github.com/discord9) in [#8504](https://github.com/GreptimeTeam/greptimedb/pull/8504)
* fix(ci): harden query regression runner by [@discord9](https://github.com/discord9) in [#8534](https://github.com/GreptimeTeam/greptimedb/pull/8534)
* fix: count Postgres SCRAM auth failures and correct auth config docs by [@killme2008](https://github.com/killme2008) in [#8538](https://github.com/GreptimeTeam/greptimedb/pull/8538)
* fix(ci): summarize query regression in one table by [@discord9](https://github.com/discord9) in [#8536](https://github.com/GreptimeTeam/greptimedb/pull/8536)
* fix(mito2): adapt batch size for wide rows by [@evenyag](https://github.com/evenyag) in [#8543](https://github.com/GreptimeTeam/greptimedb/pull/8543)
* fix: stream remote analyze metrics while pending by [@discord9](https://github.com/discord9) in [#8405](https://github.com/GreptimeTeam/greptimedb/pull/8405)
* fix: enforce table-aware permissions across query and ingest protocols by [@shuiyisong](https://github.com/shuiyisong) in [#8552](https://github.com/GreptimeTeam/greptimedb/pull/8552)
* fix: stabilize remote analyze stage ordering by [@discord9](https://github.com/discord9) in [#8584](https://github.com/GreptimeTeam/greptimedb/pull/8584)
* fix: bind Prom remote read schema per query by [@discord9](https://github.com/discord9) in [#8591](https://github.com/GreptimeTeam/greptimedb/pull/8591)
* fix: convert literals in joins and subqueries by [@discord9](https://github.com/discord9) in [#8501](https://github.com/GreptimeTeam/greptimedb/pull/8501)
* fix(query): harden range time conversion by [@discord9](https://github.com/discord9) in [#8515](https://github.com/GreptimeTeam/greptimedb/pull/8515)
* fix(json2): treat empty object as null when insert by [@MichaelScofield](https://github.com/MichaelScofield) in [#8602](https://github.com/GreptimeTeam/greptimedb/pull/8602)
* fix(json2): encode deeply nested values as jsonb by [@fengys1996](https://github.com/fengys1996) in [#8612](https://github.com/GreptimeTeam/greptimedb/pull/8612)
* fix: enforce COPY FROM row limit by [@discord9](https://github.com/discord9) in [#8551](https://github.com/GreptimeTeam/greptimedb/pull/8551)
* fix(flow): avoid duplicate incremental planning warnings by [@discord9](https://github.com/discord9) in [#8611](https://github.com/GreptimeTeam/greptimedb/pull/8611)
* fix: fail closed on malformed password assignments by [@fengjiachun](https://github.com/fengjiachun) in [#8622](https://github.com/GreptimeTeam/greptimedb/pull/8622)
* fix(metric-engine): validate logical projection indices by [@discord9](https://github.com/discord9) in [#8535](https://github.com/GreptimeTeam/greptimedb/pull/8535)
* fix(datatypes): replicate nested list and struct vectors by [@shuiyisong](https://github.com/shuiyisong) in [#8638](https://github.com/GreptimeTeam/greptimedb/pull/8638)
* fix: honor default prefix for all metric columns by [@shuiyisong](https://github.com/shuiyisong) in [#8640](https://github.com/GreptimeTeam/greptimedb/pull/8640)
* fix(servers): validate remote write native histograms by [@shuiyisong](https://github.com/shuiyisong) in [#8654](https://github.com/GreptimeTeam/greptimedb/pull/8654)
* fix(promql): preserve query-aligned range tail by [@discord9](https://github.com/discord9) in [#8650](https://github.com/GreptimeTeam/greptimedb/pull/8650)
* fix(partition): avoid panic on missing route columns by [@discord9](https://github.com/discord9) in [#8645](https://github.com/GreptimeTeam/greptimedb/pull/8645)
* fix(prometheus): make remote write timeout retryable by [@v0y4g3r](https://github.com/v0y4g3r) in [#8639](https://github.com/GreptimeTeam/greptimedb/pull/8639)
* fix: configure datanode client gRPC message limits by [@evenyag](https://github.com/evenyag) in [#8642](https://github.com/GreptimeTeam/greptimedb/pull/8642)
* fix: scope live analyze metrics to streaming requests by [@discord9](https://github.com/discord9) in [#8644](https://github.com/GreptimeTeam/greptimedb/pull/8644)
* fix(mito2): suppress empty compaction skip logs by [@v0y4g3r](https://github.com/v0y4g3r) in [#8667](https://github.com/GreptimeTeam/greptimedb/pull/8667)
* fix(mysql): fail closed on unrepresentable timestamps by [@discord9](https://github.com/discord9) in [#8580](https://github.com/GreptimeTeam/greptimedb/pull/8580)
* fix: enforce permissions for restricted HTTP endpoints by [@shuiyisong](https://github.com/shuiyisong) in [#8672](https://github.com/GreptimeTeam/greptimedb/pull/8672)
* fix(repartition): enforce GC across lifecycle by [@killme2008](https://github.com/killme2008) in [#8678](https://github.com/GreptimeTeam/greptimedb/pull/8678)
* fix(json2): standardize widening and projection cast semantics by [@fengys1996](https://github.com/fengys1996) in [#8661](https://github.com/GreptimeTeam/greptimedb/pull/8661)
* fix: preserve dictionary regex filter semantics by [@discord9](https://github.com/discord9) in [#8688](https://github.com/GreptimeTeam/greptimedb/pull/8688)
* fix(query): use physical partition types for metric route pruning by [@discord9](https://github.com/discord9) in [#8590](https://github.com/GreptimeTeam/greptimedb/pull/8590)
* fix(query): handle empty operands in PromQL or by [@discord9](https://github.com/discord9) in [#8502](https://github.com/GreptimeTeam/greptimedb/pull/8502)
* fix(mito2): make async index publication conditional by [@killme2008](https://github.com/killme2008) in [#8676](https://github.com/GreptimeTeam/greptimedb/pull/8676)
* fix(metric-engine): prevent stale metadata cache fills by [@shuiyisong](https://github.com/shuiyisong) in [#8699](https://github.com/GreptimeTeam/greptimedb/pull/8699)
* fix(mito2): fence async index builds by schema generation by [@killme2008](https://github.com/killme2008) in [#8697](https://github.com/GreptimeTeam/greptimedb/pull/8697)
* fix: make select whole json2 column worked by [@MichaelScofield](https://github.com/MichaelScofield) in [#8683](https://github.com/GreptimeTeam/greptimedb/pull/8683)
* fix(meta): preserve legacy WAL options compatibility by [@WenyXu](https://github.com/WenyXu) in [#8707](https://github.com/GreptimeTeam/greptimedb/pull/8707)
* fix: add public constructor for compactor by [@sunng87](https://github.com/sunng87) in [#8724](https://github.com/GreptimeTeam/greptimedb/pull/8724)
* fix: backport Prometheus and skip_wal fixes to v1.2 by [@evenyag](https://github.com/evenyag) in [#8838](https://github.com/GreptimeTeam/greptimedb/pull/8838)
* fix(mito2): limit compaction picker threads by [@v0y4g3r](https://github.com/v0y4g3r) in [#8704](https://github.com/GreptimeTeam/greptimedb/pull/8704)
* fix: clear pooled Prometheus Remote Write decoder state by [@shuiyisong](https://github.com/shuiyisong) in [#8921](https://github.com/GreptimeTeam/greptimedb/pull/8921)
* fix(flow): fix flow stats aggregation and df_plan_to_sql quoting by [@discord9](https://github.com/discord9) in [#8729](https://github.com/GreptimeTeam/greptimedb/pull/8729)
* fix(frontend): remove gRPC DDL panics for DropView and non-timestamp time index by [@discord9](https://github.com/discord9) in [#8739](https://github.com/GreptimeTeam/greptimedb/pull/8739)
* fix(prometheus): custom column remote reads by [@grezzko](https://github.com/grezzko) in [#8659](https://github.com/GreptimeTeam/greptimedb/pull/8659)
* fix(query): avoid unsafe count wildcard rewrites by [@discord9](https://github.com/discord9) in [#8522](https://github.com/GreptimeTeam/greptimedb/pull/8522)
* fix(query): validate merge scan remote schema by [@discord9](https://github.com/discord9) in [#8579](https://github.com/GreptimeTeam/greptimedb/pull/8579)
* fix(mito2): fail open when Bloom IN predicate has non-literal or unencodable members by [@discord9](https://github.com/discord9) in [#8709](https://github.com/GreptimeTeam/greptimedb/pull/8709)
* fix(mito): re-encode bulk WAL entry after filling missing columns by [@fengjiachun](https://github.com/fengjiachun) in [#8808](https://github.com/GreptimeTeam/greptimedb/pull/8808)
* fix(mito2): keep deletion markers when compacting part of a window by [@fengjiachun](https://github.com/fengjiachun) in [#8872](https://github.com/GreptimeTeam/greptimedb/pull/8872)
* fix(query): respect query timezone in timestamp casts by [@fzlzjerry](https://github.com/fzlzjerry) in [#8859](https://github.com/GreptimeTeam/greptimedb/pull/8859)
* fix(query): preserve timestamp literal semantics in inserts by [@killme2008](https://github.com/killme2008) in [#8889](https://github.com/GreptimeTeam/greptimedb/pull/8889)
* fix(metric-engine): handle Utf8View tag/label columns without panicking by [@discord9](https://github.com/discord9) in [#8772](https://github.com/GreptimeTeam/greptimedb/pull/8772)
* fix: cache physical table metadata lookups by [@shuiyisong](https://github.com/shuiyisong) in [#8777](https://github.com/GreptimeTeam/greptimedb/pull/8777)
* fix: harden permission checks and process visibility by [@shuiyisong](https://github.com/shuiyisong) in [#8852](https://github.com/GreptimeTeam/greptimedb/pull/8852)
* fix(event): preserve procedure lifecycle locators by [@WenyXu](https://github.com/WenyXu) in [#8787](https://github.com/GreptimeTeam/greptimedb/pull/8787)
* fix(meta): release region guards after drop rollback by [@WenyXu](https://github.com/WenyXu) in [#8751](https://github.com/GreptimeTeam/greptimedb/pull/8751)
* fix(object-store): fix unused import on Windows after #8735 by [@discord9](https://github.com/discord9) in [#8752](https://github.com/GreptimeTeam/greptimedb/pull/8752)
* fix(frontend): isolate internal Flight authentication by [@discord9](https://github.com/discord9) in [#9045](https://github.com/GreptimeTeam/greptimedb/pull/9045)
* fix: match system schema names case-insensitively [Backport release/v1.2] by [@MichaelScofield](https://github.com/MichaelScofield) in [#9041](https://github.com/GreptimeTeam/greptimedb/pull/9041)
* fix: re-scan stream-backed tables in recursive CTEs [Backport release/v1.2] by [@MichaelScofield](https://github.com/MichaelScofield) in [#9052](https://github.com/GreptimeTeam/greptimedb/pull/9052)
* fix(pipeline): coalesce concurrent pipeline cache misses and restore cache TTL configuration for v1.2 by [@killme2008](https://github.com/killme2008) in [#9022](https://github.com/GreptimeTeam/greptimedb/pull/9022) The release also retains configurable `pipeline.cache_ttl` (default `10s`).
* fix(mito2): fence checkpoints during region transitions by [@WenyXu](https://github.com/WenyXu) in [#8847](https://github.com/GreptimeTeam/greptimedb/pull/8847)
* fix(mito2): split SSTs at primary key series boundaries by [@v0y4g3r](https://github.com/v0y4g3r) in [#8888](https://github.com/GreptimeTeam/greptimedb/pull/8888)
* fix(query): keep INSERT timestamp conversion out of the source query by [@killme2008](https://github.com/killme2008) in [#8911](https://github.com/GreptimeTeam/greptimedb/pull/8911)
* fix(mysql): interpret prepared statement datetime params in session timezone by [@wy471x](https://github.com/wy471x) in [#8923](https://github.com/GreptimeTeam/greptimedb/pull/8923)
* fix(meta): allow manual migration from offline datanodes by [@WenyXu](https://github.com/WenyXu) in [#8934](https://github.com/GreptimeTeam/greptimedb/pull/8934)
* fix(flight): bound DoGet response wait by [@WenyXu](https://github.com/WenyXu) in [#8943](https://github.com/GreptimeTeam/greptimedb/pull/8943)
* fix(mito2): use target sequence for foreign SSTs by [@discord9](https://github.com/discord9) in [#8946](https://github.com/GreptimeTeam/greptimedb/pull/8946)
* fix: update tokio-postgres and correct explain/fetch cursor output schema by [@sunng87](https://github.com/sunng87) in [#8955](https://github.com/GreptimeTeam/greptimedb/pull/8955)
* fix: postgres describe for more statements by [@sunng87](https://github.com/sunng87) in [#8974](https://github.com/GreptimeTeam/greptimedb/pull/8974)
* fix(promql): resolve derived labels in aggregation arithmetic by [@shuiyisong](https://github.com/shuiyisong) in [#8994](https://github.com/GreptimeTeam/greptimedb/pull/8994)
* fix(json2): keep empty structs in remainder by [@MichaelScofield](https://github.com/MichaelScofield) in [#9027](https://github.com/GreptimeTeam/greptimedb/pull/9027)

### 🚜 Refactor

* refactor(meta): centralize backend retry classification by [@WenyXu](https://github.com/WenyXu) in [#8333](https://github.com/GreptimeTeam/greptimedb/pull/8333)
* refactor: try best to make sure hook is called on manifest update by [@sunng87](https://github.com/sunng87) in [#8329](https://github.com/GreptimeTeam/greptimedb/pull/8329)
* refactor: extract region hook function for extension by [@sunng87](https://github.com/sunng87) in [#8375](https://github.com/GreptimeTeam/greptimedb/pull/8375)
* refactor: optimize json2 write by [@MichaelScofield](https://github.com/MichaelScofield) in [#8393](https://github.com/GreptimeTeam/greptimedb/pull/8393)
* refactor: model distributed inspect fan-in as exec by [@fengjiachun](https://github.com/fengjiachun) in [#8447](https://github.com/GreptimeTeam/greptimedb/pull/8447)
* refactor: suppress region hook notifications for staging-only manifest writes by [@sunng87](https://github.com/sunng87) in [#8471](https://github.com/GreptimeTeam/greptimedb/pull/8471)
* refactor: optimize json2 write, again by [@MichaelScofield](https://github.com/MichaelScofield) in [#8498](https://github.com/GreptimeTeam/greptimedb/pull/8498)
* refactor: reconcile OTLP trace schemas request-wide by [@shuiyisong](https://github.com/shuiyisong) in [#8485](https://github.com/GreptimeTeam/greptimedb/pull/8485)
* refactor: add field id and extension type to histogram by [@sunng87](https://github.com/sunng87) in [#8528](https://github.com/GreptimeTeam/greptimedb/pull/8528)
* refactor: simplify scan projection to root column indices by [@fengys1996](https://github.com/fengys1996) in [#8629](https://github.com/GreptimeTeam/greptimedb/pull/8629)
* refactor(mito2): add prerequisites for range-based series reads by [@evenyag](https://github.com/evenyag) in [#8679](https://github.com/GreptimeTeam/greptimedb/pull/8679)
* refactor: replace endpoint permission variants with named actions by [@shuiyisong](https://github.com/shuiyisong) in [#8692](https://github.com/GreptimeTeam/greptimedb/pull/8692)
* refactor(mito2): split compaction scheduler modules by [@v0y4g3r](https://github.com/v0y4g3r) in [#8698](https://github.com/GreptimeTeam/greptimedb/pull/8698)
* refactor(event): store procedure trigger as JSONB by [@WenyXu](https://github.com/WenyXu) in [#8700](https://github.com/GreptimeTeam/greptimedb/pull/8700)
* refactor: separate a json2 extension type by [@MichaelScofield](https://github.com/MichaelScofield) in [#8745](https://github.com/GreptimeTeam/greptimedb/pull/8745)
* refactor(json2): push down json2 type hints to parquet reads by [@fengys1996](https://github.com/fengys1996) in [#8833](https://github.com/GreptimeTeam/greptimedb/pull/8833)
* refactor(procedure): centralize event context handling by [@WenyXu](https://github.com/WenyXu) in [#8834](https://github.com/GreptimeTeam/greptimedb/pull/8834)
* refactor(event): separate procedure submission context by [@WenyXu](https://github.com/WenyXu) in [#8856](https://github.com/GreptimeTeam/greptimedb/pull/8856)
* refactor(json2): support JSON2 storage layout settings in DDL by [@MichaelScofield](https://github.com/MichaelScofield) in [#8895](https://github.com/GreptimeTeam/greptimedb/pull/8895)
* refactor(json2): add JSON2 v2 physical layout primitives by [@MichaelScofield](https://github.com/MichaelScofield) in [#8901](https://github.com/GreptimeTeam/greptimedb/pull/8901)
* refactor(json2): add bounded auto-expansion to the JSON2 vector builder by [@MichaelScofield](https://github.com/MichaelScofield) in [#8909](https://github.com/GreptimeTeam/greptimedb/pull/8909)
* refactor(json2): optimize JSON2 building without auto-expanded paths by [@MichaelScofield](https://github.com/MichaelScofield) in [#8928](https://github.com/GreptimeTeam/greptimedb/pull/8928)
* refactor(json2): support querying v2 storage layout by [@MichaelScofield](https://github.com/MichaelScofield) in [#8940](https://github.com/GreptimeTeam/greptimedb/pull/8940)
* refactor: json2 v2 storage layout by [@MichaelScofield](https://github.com/MichaelScofield) in [#8979](https://github.com/GreptimeTeam/greptimedb/pull/8979)
* refactor(json2): concretize JSON2 schemas at merge scan boundaries by [@MichaelScofield](https://github.com/MichaelScofield) in [#9016](https://github.com/GreptimeTeam/greptimedb/pull/9016)

### 📚 Documentation

* docs(agents): add per-crate guides, architecture invariants, and generated-files list by [@killme2008](https://github.com/killme2008) in [#8346](https://github.com/GreptimeTeam/greptimedb/pull/8346)
* docs: add project-level AGENTS.md as the shared agent guide by [@killme2008](https://github.com/killme2008) in [#8358](https://github.com/GreptimeTeam/greptimedb/pull/8358)
* docs: add entity relationships and graph query RFC by [@killme2008](https://github.com/killme2008) in [#8605](https://github.com/GreptimeTeam/greptimedb/pull/8605)

### ⚡ Performance

* perf: reduce parquet metadata cache footprint by [@waynexia](https://github.com/waynexia) in [#8527](https://github.com/GreptimeTeam/greptimedb/pull/8527)
* perf: preserve dictionary-encoded query labels by [@waynexia](https://github.com/waynexia) in [#8541](https://github.com/GreptimeTeam/greptimedb/pull/8541)
* perf: optimize OTLP trace ingestion by [@shuiyisong](https://github.com/shuiyisong) in [#8604](https://github.com/GreptimeTeam/greptimedb/pull/8604)
* perf(servers): optimize PromQL read conversion by [@lyang24](https://github.com/lyang24) in [#8587](https://github.com/GreptimeTeam/greptimedb/pull/8587)
* perf(mito2): make compaction picker asynchronous to avoid blocking the region worker by [@v0y4g3r](https://github.com/v0y4g3r) in [#8624](https://github.com/GreptimeTeam/greptimedb/pull/8624)
* perf(query): prune RangeSelect input projections by [@discord9](https://github.com/discord9) in [#8570](https://github.com/GreptimeTeam/greptimedb/pull/8570)

### 🧪 Testing

* test(cli): harden export/import-v2 e2e roundtrip by [@fengjiachun](https://github.com/fengjiachun) in [#8310](https://github.com/GreptimeTeam/greptimedb/pull/8310)
* test(cli): add import-v2 resume e2e coverage by [@fengjiachun](https://github.com/fengjiachun) in [#8311](https://github.com/GreptimeTeam/greptimedb/pull/8311)
* test(cli): harden import-v2 schema filter e2e by [@fengjiachun](https://github.com/fengjiachun) in [#8312](https://github.com/GreptimeTeam/greptimedb/pull/8312)
* test(cli): harden incomplete import-v2 snapshot e2e by [@fengjiachun](https://github.com/fengjiachun) in [#8313](https://github.com/GreptimeTeam/greptimedb/pull/8313)
* test(cli): add minio export-import v2 e2e by [@fengjiachun](https://github.com/fengjiachun) in [#8314](https://github.com/GreptimeTeam/greptimedb/pull/8314)
* test: add sqlness compatibility runner by [@discord9](https://github.com/discord9) in [#8334](https://github.com/GreptimeTeam/greptimedb/pull/8334)
* test: choose compat runner cli args by version by [@discord9](https://github.com/discord9) in [#8376](https://github.com/GreptimeTeam/greptimedb/pull/8376)
* test: add recent sqlness compat cases by [@discord9](https://github.com/discord9) in [#8395](https://github.com/GreptimeTeam/greptimedb/pull/8395)
* test: add flow scheduled now compat case by [@discord9](https://github.com/discord9) in [#8400](https://github.com/GreptimeTeam/greptimedb/pull/8400)
* test: add comment metadata compat case by [@discord9](https://github.com/discord9) in [#8402](https://github.com/GreptimeTeam/greptimedb/pull/8402)
* test: add ssts limit compat case by [@discord9](https://github.com/discord9) in [#8427](https://github.com/GreptimeTeam/greptimedb/pull/8427)
* test: add auto flush interval compat case by [@discord9](https://github.com/discord9) in [#8448](https://github.com/GreptimeTeam/greptimedb/pull/8448)
* test(perf): add remote write storage inspection by [@discord9](https://github.com/discord9) in [#8444](https://github.com/GreptimeTeam/greptimedb/pull/8444)
* test: add json2 variant payload compat case by [@discord9](https://github.com/discord9) in [#8459](https://github.com/GreptimeTeam/greptimedb/pull/8459)
* test: add legacy JSON2 non-append compat case by [@discord9](https://github.com/discord9) in [#8513](https://github.com/GreptimeTeam/greptimedb/pull/8513)
* test: gate pluginoption test for oss repo only by [@sunng87](https://github.com/sunng87) in [#8569](https://github.com/GreptimeTeam/greptimedb/pull/8569)
* test: stabilize ttl instant sqlness case by [@v0y4g3r](https://github.com/v0y4g3r) in [#8595](https://github.com/GreptimeTeam/greptimedb/pull/8595)
* test: stabilize remote dynamic filter left join e2e by [@discord9](https://github.com/discord9) in [#8711](https://github.com/GreptimeTeam/greptimedb/pull/8711)
* test: fix unknown channel event context expectation by [@WenyXu](https://github.com/WenyXu) in [#8832](https://github.com/GreptimeTeam/greptimedb/pull/8832)
* test: renew etcd TLS certificates by [@WenyXu](https://github.com/WenyXu) in [#8956](https://github.com/GreptimeTeam/greptimedb/pull/8956)

### ⚙️ Miscellaneous Tasks

* chore: add release runbook skills for maintainers by [@evenyag](https://github.com/evenyag) in [#8296](https://github.com/GreptimeTeam/greptimedb/pull/8296)
* ci: compare jsonbench insert results by [@MichaelScofield](https://github.com/MichaelScofield) in [#8326](https://github.com/GreptimeTeam/greptimedb/pull/8326)
* ci: add remote WAL logical pruning fuzz by [@WenyXu](https://github.com/WenyXu) in [#8307](https://github.com/GreptimeTeam/greptimedb/pull/8307)
* chore: share agent release skills by [@evenyag](https://github.com/evenyag) in [#8336](https://github.com/GreptimeTeam/greptimedb/pull/8336)
* chore: bump version to 1.2.0 by [@evenyag](https://github.com/evenyag) in [#8344](https://github.com/GreptimeTeam/greptimedb/pull/8344)
* ci: tune jsonbench runner by [@MichaelScofield](https://github.com/MichaelScofield) in [#8345](https://github.com/GreptimeTeam/greptimedb/pull/8345)
* chore: declare GreptimeDB Enterprise License for enterprise-gated sources by [@killme2008](https://github.com/killme2008) in [#8364](https://github.com/GreptimeTeam/greptimedb/pull/8364)
* ci: add cargo.lock changeset size check by [@sunng87](https://github.com/sunng87) in [#8348](https://github.com/GreptimeTeam/greptimedb/pull/8348)
* ci: add sqlness compat smoke by [@discord9](https://github.com/discord9) in [#8370](https://github.com/GreptimeTeam/greptimedb/pull/8370)
* chore: pin datafusion to merged branch commit by [@discord9](https://github.com/discord9) in [#8422](https://github.com/GreptimeTeam/greptimedb/pull/8422)
* ci: run query regression on self-hosted runners by [@discord9](https://github.com/discord9) in [#8423](https://github.com/GreptimeTeam/greptimedb/pull/8423)
* chore: add sqlness regression for timestamp precision comparison by [@fengys1996](https://github.com/fengys1996) in [#8424](https://github.com/GreptimeTeam/greptimedb/pull/8424)
* chore(ci): stabilize remote wal fuzz tests by [@WenyXu](https://github.com/WenyXu) in [#8436](https://github.com/GreptimeTeam/greptimedb/pull/8436)
* ci: check kafka readiness before fuzz tests by [@WenyXu](https://github.com/WenyXu) in [#8461](https://github.com/GreptimeTeam/greptimedb/pull/8461)
* chore: update star history link by [@killme2008](https://github.com/killme2008) in [#8483](https://github.com/GreptimeTeam/greptimedb/pull/8483)
* ci: increase Kafka resource requests by [@WenyXu](https://github.com/WenyXu) in [#8482](https://github.com/GreptimeTeam/greptimedb/pull/8482)
* chore: add development Docker image skill by [@WenyXu](https://github.com/WenyXu) in [#8477](https://github.com/GreptimeTeam/greptimedb/pull/8477)
* chore(skill): Add ca-certificates to Dockerfile by [@WenyXu](https://github.com/WenyXu) in [#8507](https://github.com/GreptimeTeam/greptimedb/pull/8507)
* ci: add persistent query regression cache by [@discord9](https://github.com/discord9) in [#8474](https://github.com/GreptimeTeam/greptimedb/pull/8474)
* ci: nightly jsonbench test 100m dataset by [@MichaelScofield](https://github.com/MichaelScofield) in [#8529](https://github.com/GreptimeTeam/greptimedb/pull/8529)
* chore: ignore mysql connection reset error by [@shuiyisong](https://github.com/shuiyisong) in [#8556](https://github.com/GreptimeTeam/greptimedb/pull/8556)
* ci: split export import v2 e2e test by [@WenyXu](https://github.com/WenyXu) in [#8564](https://github.com/GreptimeTeam/greptimedb/pull/8564)
* ci: gate releases on compat and query regression by [@discord9](https://github.com/discord9) in [#8469](https://github.com/GreptimeTeam/greptimedb/pull/8469)
* chore: pin DataFusion cardinality effect by [@discord9](https://github.com/discord9) in [#8562](https://github.com/GreptimeTeam/greptimedb/pull/8562)
* chore: enlarge fuzz failover test timeout waiting for datanodes online by [@v0y4g3r](https://github.com/v0y4g3r) in [#8633](https://github.com/GreptimeTeam/greptimedb/pull/8633)
* Support unquoted postgres intervalstyle by [@yimeng](https://github.com/yimeng) in [#8637](https://github.com/GreptimeTeam/greptimedb/pull/8637)
* ci: add OTLP trace ingestion regression testing by [@shuiyisong](https://github.com/shuiyisong) in [#8631](https://github.com/GreptimeTeam/greptimedb/pull/8631)
* ci: add heavy query regression label by [@discord9](https://github.com/discord9) in [#8619](https://github.com/GreptimeTeam/greptimedb/pull/8619)
* ci: keep prereleases off stable release channels by [@discord9](https://github.com/discord9) in [#8653](https://github.com/GreptimeTeam/greptimedb/pull/8653)
* chore: update nix flake to 26.05 by [@sunng87](https://github.com/sunng87) in [#8681](https://github.com/GreptimeTeam/greptimedb/pull/8681)
* ci: limit fuzz test parallelism by [@WenyXu](https://github.com/WenyXu) in [#8690](https://github.com/GreptimeTeam/greptimedb/pull/8690)
* chore: update flake to use zlib by [@sunng87](https://github.com/sunng87) in [#8691](https://github.com/GreptimeTeam/greptimedb/pull/8691)
* chore: remove iceberg read by [@shuiyisong](https://github.com/shuiyisong) in [#8858](https://github.com/GreptimeTeam/greptimedb/pull/8858)
* chore: bump release version to v1.2.0 by [@discord9](https://github.com/discord9) in [#9054](https://github.com/GreptimeTeam/greptimedb/pull/9054)

## New Contributors

* [@agrawalx](https://github.com/agrawalx) made their first contribution in [#8321](https://github.com/GreptimeTeam/greptimedb/pull/8321)
* [@raphaelroshan](https://github.com/raphaelroshan) made their first contribution in [#8357](https://github.com/GreptimeTeam/greptimedb/pull/8357)
* [@srivtx](https://github.com/srivtx) made their first contribution in [#8403](https://github.com/GreptimeTeam/greptimedb/pull/8403)
* [@yimeng](https://github.com/yimeng) made their first contribution in [#8637](https://github.com/GreptimeTeam/greptimedb/pull/8637)
* [@grezzko](https://github.com/grezzko) made their first contribution in [#8659](https://github.com/GreptimeTeam/greptimedb/pull/8659)
* [@fzlzjerry](https://github.com/fzlzjerry) made their first contribution in [#8859](https://github.com/GreptimeTeam/greptimedb/pull/8859)
* [@wy471x](https://github.com/wy471x) made their first contribution in [#8923](https://github.com/GreptimeTeam/greptimedb/pull/8923)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@agrawalx](https://github.com/agrawalx), [@BootstrapperSBL](https://github.com/BootstrapperSBL), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@fengys1996](https://github.com/fengys1996), [@fzlzjerry](https://github.com/fzlzjerry), [@grezzko](https://github.com/grezzko), [@killme2008](https://github.com/killme2008), [@lyang24](https://github.com/lyang24), [@MichaelScofield](https://github.com/MichaelScofield), [@onepizzateam](https://github.com/onepizzateam), [@QuakeWang](https://github.com/QuakeWang), [@raphaelroshan](https://github.com/raphaelroshan), [@shuiyisong](https://github.com/shuiyisong), [@srivtx](https://github.com/srivtx), [@sunchanglong](https://github.com/sunchanglong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@WenyXu](https://github.com/WenyXu), [@wy471x](https://github.com/wy471x), [@yimeng](https://github.com/yimeng), [@ZonaHex](https://github.com/ZonaHex)

**Full Changelog**: https://github.com/GreptimeTeam/greptimedb/compare/v1.1.0...v1.2.0
