---
keywords: [release, GreptimeDB, changelog, v1.3.0-beta.1]
description: GreptimeDB v1.3.0-beta.1 Changelog
date: 2026-09-29
---

# v1.3.0-beta.1

Release date: September 29, 2026


GreptimeDB v1.3.0-beta.1 is the first beta of the 1.3 release. This changelog covers changes since v1.3.0-alpha.1.

### 👍 Highlights

#### Native histogram ingestion enabled by default

GreptimeDB now accepts Prometheus Remote Write v2 native histograms and cumulative OTLP/HTTP exponential histograms without experimental configuration switches. For Prometheus that already collects native histograms, select Remote Write 2.0 in `prometheus.yml`:

```yaml
remote_write:
  - url: http://localhost:4000/v1/prometheus/write?db=public
    protobuf_message: io.prometheus.write.v2.Request
```

Query the stored histograms through GreptimeDB's PromQL API. This release also fixes histogram reads from SSTs and scalar batch writes to physical tables shared with histogram metrics. Remote Write v1 native histograms, native histogram Remote Read, and OTel Arrow exponential histograms remain unsupported. See [#9301](https://github.com/GreptimeTeam/greptimedb/pull/9301) and [#9321](https://github.com/GreptimeTeam/greptimedb/pull/9321).

#### Series index preview (experimental)

This release introduces an experimental series index for discovering candidate time series in indexed SSTs. See [#9085](https://github.com/GreptimeTeam/greptimedb/pull/9085).

To try it in a non-production environment, set `experimental_enable_series_index = true` in the Mito engine configuration of your standalone instance or datanodes, then restart the affected instances. Update the existing Mito engine entry if one is already configured:

```toml
[[region_engine]]
[region_engine.mito]
experimental_enable_series_index = true
```

**Series index is at a very early experimental stage and is unstable. Future releases may introduce breaking changes. It is not recommended for production use.**

#### Trace V2: JSON2 attributes with Jaeger and Semantic Graph support

The opt-in `greptime_trace_v2` pipeline stores span, scope, and resource attributes in three JSON2 columns instead of adding a SQL column for every attribute. Its 19-column schema also preserves span events and links as JSON arrays. Jaeger queries and Semantic Graph derivation support the new model.

Select `greptime_trace_v2` with the `x-greptime-pipeline-name` header on OTLP trace ingestion requests and use a separate destination table from Trace V1. After ingesting into a table named `traces_v2`, query typed attributes directly:

```sql
SELECT
    trace_id,
    span_attributes."http.status_code"::BIGINT AS http_status,
    resource_attributes."service.name"::STRING AS service_name
FROM traces_v2;
```

Existing Trace V1 tables are not automatically migrated. Events and links use JSON in this release; `ARRAY(JSON2)` is deferred. See [#9192](https://github.com/GreptimeTeam/greptimedb/pull/9192), [#9232](https://github.com/GreptimeTeam/greptimedb/pull/9232), [#9257](https://github.com/GreptimeTeam/greptimedb/pull/9257), and [#9278](https://github.com/GreptimeTeam/greptimedb/pull/9278).

#### Improved compaction algorithms and TWCS tuning

The multiway merge used by compaction now uses a winner tree for its active input streams, reducing comparison work when merging overlapping sorted data. TWCS also applies different selection policies to active and inactive time windows: active windows favor separate merges of newly flushed and previously compacted files to avoid repeated rewrites, while inactive windows have additional consolidation paths. Serial automatic compaction selects one output at a time and replans against the updated SST state before selecting further work.

Three new tuning options accompany the renamed active-window file-count trigger. The following example sets the table-level options to their defaults:

```sql
ALTER TABLE my_table SET
    'compaction.twcs.active_window.trigger_file_num' = '4',
    'compaction.twcs.active_window.l1_merge_trigger' = '16',
    'compaction.twcs.inactive_window.trigger_file_num' = '2',
    'compaction.twcs.inactive_window.l1_merge_trigger' = '8';
```

The existing `compaction.twcs.trigger_file_num` option remains accepted as an alias for `compaction.twcs.active_window.trigger_file_num`; inactive windows now use their own thresholds. See [#8989](https://github.com/GreptimeTeam/greptimedb/pull/8989), [#9064](https://github.com/GreptimeTeam/greptimedb/pull/9064), and [#9011](https://github.com/GreptimeTeam/greptimedb/pull/9011).

### Dashboard

The bundled dashboard advances to v0.13.15. JSON result columns gain a per-column action to show or hide null fields, and the metric query input layout handles overflowing content. See dashboard [#653](https://github.com/GreptimeTeam/dashboard/pull/653) and [#652](https://github.com/GreptimeTeam/dashboard/pull/652).

### Upgrade notes

- **SQL results:** The query engine moves to DataFusion 55.1.0. Integer-input `median`, `approx_median`, and `approx_percentile_cont` return floating-point results; exact median interpolates even-sized inputs. Review consumers with fixed result schemas, including views and Flow sinks. `REPLACE(s, '', replacement)` now returns `s` unchanged, generated struct `unnest` column names change, and approximate cardinality estimates can differ. PostgreSQL metadata now honors OID-alias annotations. See [#8555](https://github.com/GreptimeTeam/greptimedb/pull/8555) and [#9177](https://github.com/GreptimeTeam/greptimedb/pull/9177).
- **JSON2 type hints:** Remove `nullable` and `default` options from SQL DDL and pipeline configuration. Hinted fields now always allow null, and missing hinted fields become null. See [#9213](https://github.com/GreptimeTeam/greptimedb/pull/9213).
- **Native histograms:** Prometheus Remote Write v2 native histograms and cumulative OTLP/HTTP exponential histograms are accepted by default. The removed `experimental_enable_prometheus_native_histogram` and `experimental_enable_exponential_histogram` options are ignored, including when set to `false`. Remote Write v1 native histograms, native histogram Remote Read, and OTel Arrow exponential histograms remain unsupported. See [#9301](https://github.com/GreptimeTeam/greptimedb/pull/9301).

### Breaking changes

* feat!: upgrade DataFusion to 55 by [@discord9](https://github.com/discord9) in [#8555](https://github.com/GreptimeTeam/greptimedb/pull/8555)
* feat(json2)!: remove nullable and default type hint options by [@fengys1996](https://github.com/fengys1996) in [#9213](https://github.com/GreptimeTeam/greptimedb/pull/9213)
* feat!: upgrade DataFusion fork to 55.1.0 by [@discord9](https://github.com/discord9) in [#9177](https://github.com/GreptimeTeam/greptimedb/pull/9177)

### 🚀 Features

* feat: support raw OTLP delta metrics by [@shuiyisong](https://github.com/shuiyisong) in [#8970](https://github.com/GreptimeTeam/greptimedb/pull/8970)
* feat(flow): support eval schedule offsets by [@discord9](https://github.com/discord9) in [#8878](https://github.com/GreptimeTeam/greptimedb/pull/8878)
* feat(client): compress insert transport by [@v0y4g3r](https://github.com/v0y4g3r) in [#9036](https://github.com/GreptimeTeam/greptimedb/pull/9036)
* feat: add scanbench query suites and structured results by [@evenyag](https://github.com/evenyag) in [#9050](https://github.com/GreptimeTeam/greptimedb/pull/9050)
* feat(meta): record logical-table reconciliation events by [@dhruvxvaishnav](https://github.com/dhruvxvaishnav) in [#8941](https://github.com/GreptimeTeam/greptimedb/pull/8941)
* feat: update dashboard to v0.13.15 by [@sunchanglong](https://github.com/sunchanglong) in [#9051](https://github.com/GreptimeTeam/greptimedb/pull/9051)
* feat(auth): support bearer token authentication over SQL protocols by [@shuiyisong](https://github.com/shuiyisong) in [#8899](https://github.com/GreptimeTeam/greptimedb/pull/8899)
* feat(mito2): adapt bulk memtable encode threshold to write buffer size by [@v0y4g3r](https://github.com/v0y4g3r) in [#9056](https://github.com/GreptimeTeam/greptimedb/pull/9056)
* feat(telemetry): add log directory size retention by [@WenyXu](https://github.com/WenyXu) in [#8997](https://github.com/GreptimeTeam/greptimedb/pull/8997)
* feat(mito2): add series index catalog and lifecycle foundation by [@evenyag](https://github.com/evenyag) in [#9053](https://github.com/GreptimeTeam/greptimedb/pull/9053)
* feat(auth): support per-user MySQL authentication methods by [@shuiyisong](https://github.com/shuiyisong) in [#9078](https://github.com/GreptimeTeam/greptimedb/pull/9078)
* feat: make the series index resilient to time index unit widening by [@sunng87](https://github.com/sunng87) in [#8996](https://github.com/GreptimeTeam/greptimedb/pull/8996)
* feat(mito2): introduce TWCS active window compaction by [@v0y4g3r](https://github.com/v0y4g3r) in [#9011](https://github.com/GreptimeTeam/greptimedb/pull/9011)
* feat: add repartition partition count hint by [@WenyXu](https://github.com/WenyXu) in [#9080](https://github.com/GreptimeTeam/greptimedb/pull/9080)
* feat(json2): support ALTER syntax for JSON column settings by [@fengys1996](https://github.com/fengys1996) in [#9094](https://github.com/GreptimeTeam/greptimedb/pull/9094)
* feat: support request-level insert WAL skipping by [@WenyXu](https://github.com/WenyXu) in [#9088](https://github.com/GreptimeTeam/greptimedb/pull/9088)
* feat(meta): record catalog and database reconciliation events by [@dhruvxvaishnav](https://github.com/dhruvxvaishnav) in [#8896](https://github.com/GreptimeTeam/greptimedb/pull/8896)
* feat(mito2): add series index planning and builders by [@evenyag](https://github.com/evenyag) in [#9085](https://github.com/GreptimeTeam/greptimedb/pull/9085)
* feat(pprof): switch CPU profiler to framehop unwinder by [@v0y4g3r](https://github.com/v0y4g3r) in [#9125](https://github.com/GreptimeTeam/greptimedb/pull/9125)
* feat: support request-level WAL skipping for bulk inserts by [@WenyXu](https://github.com/WenyXu) in [#9110](https://github.com/GreptimeTeam/greptimedb/pull/9110)
* feat(mito2): add opt-in byte-stream-split encoding for float SST fields by [@discord9](https://github.com/discord9) in [#9069](https://github.com/GreptimeTeam/greptimedb/pull/9069)
* feat(mito2): reconcile series indexes in background by [@evenyag](https://github.com/evenyag) in [#9086](https://github.com/GreptimeTeam/greptimedb/pull/9086)
* feat: export logical tables from Metric physical scans by [@fengjiachun](https://github.com/fengjiachun) in [#9159](https://github.com/GreptimeTeam/greptimedb/pull/9159)
* feat: allow re-enabling WAL after disabling by [@dhruvxvaishnav](https://github.com/dhruvxvaishnav) in [#9130](https://github.com/GreptimeTeam/greptimedb/pull/9130)
* feat: use exact sequence ranges for incremental Flow reads by [@discord9](https://github.com/discord9) in [#9165](https://github.com/GreptimeTeam/greptimedb/pull/9165)
* feat: add prepared batch write primitives by [@WenyXu](https://github.com/WenyXu) in [#9186](https://github.com/GreptimeTeam/greptimedb/pull/9186)
* feat(wal): add the object store WAL provider identity and configuration by [@fengjiachun](https://github.com/fengjiachun) in [#9203](https://github.com/GreptimeTeam/greptimedb/pull/9203)
* feat: add ordinary table batching workers by [@WenyXu](https://github.com/WenyXu) in [#9187](https://github.com/GreptimeTeam/greptimedb/pull/9187)
* feat(log-store): add the object store WAL object format by [@fengjiachun](https://github.com/fengjiachun) in [#9200](https://github.com/GreptimeTeam/greptimedb/pull/9200)
* feat: batch ordinary table writes across HTTP protocols by [@WenyXu](https://github.com/WenyXu) in [#9115](https://github.com/GreptimeTeam/greptimedb/pull/9115)
* feat(otlp): add trace v2 ingestion with JSON2 attributes by [@MichaelScofield](https://github.com/MichaelScofield) in [#9192](https://github.com/GreptimeTeam/greptimedb/pull/9192)
* feat(ci): add observability benchmark and lifecycle summaries by [@WenyXu](https://github.com/WenyXu) in [#9215](https://github.com/GreptimeTeam/greptimedb/pull/9215)
* feat: prepare and execute database Metric exports by [@fengjiachun](https://github.com/fengjiachun) in [#9180](https://github.com/GreptimeTeam/greptimedb/pull/9180)
* feat(ci): add long-range metrics benchmark on ECS by [@WenyXu](https://github.com/WenyXu) in [#9218](https://github.com/GreptimeTeam/greptimedb/pull/9218)
* feat(flow): expose extension-owned batching execution hooks by [@discord9](https://github.com/discord9) in [#9171](https://github.com/GreptimeTeam/greptimedb/pull/9171)
* feat(function): add mergeable binary average states by [@discord9](https://github.com/discord9) in [#9062](https://github.com/GreptimeTeam/greptimedb/pull/9062)
* feat(log-store): add the object store WAL batch, catalog and I/O by [@fengjiachun](https://github.com/fengjiachun) in [#9216](https://github.com/GreptimeTeam/greptimedb/pull/9216)
* feat(otlp): preserve trace v2 events and links as JSON (follow-up to #9192) by [@MichaelScofield](https://github.com/MichaelScofield) in [#9232](https://github.com/GreptimeTeam/greptimedb/pull/9232)
* feat(flow): admit mergeable average states in incremental plans by [@discord9](https://github.com/discord9) in [#9235](https://github.com/GreptimeTeam/greptimedb/pull/9235)
* feat(log-store): add object store WAL store construction and recovery by [@fengjiachun](https://github.com/fengjiachun) in [#9238](https://github.com/GreptimeTeam/greptimedb/pull/9238)
* feat: expose region min/max timestamp in region_statistics by [@sainad2222](https://github.com/sainad2222) in [#9060](https://github.com/GreptimeTeam/greptimedb/pull/9060)
* feat: add status label to datanode failed-insert metric by [@dhruvxvaishnav](https://github.com/dhruvxvaishnav) in [#9191](https://github.com/GreptimeTeam/greptimedb/pull/9191)
* feat(mito2): make range index reads and builds opt-in by [@evenyag](https://github.com/evenyag) in [#9219](https://github.com/GreptimeTeam/greptimedb/pull/9219)
* feat(json2): respect type hints during JSON2 type concretization by [@fengys1996](https://github.com/fengys1996) in [#9222](https://github.com/GreptimeTeam/greptimedb/pull/9222)
* feat(mito2): split SWCS output files by size threshold by [@v0y4g3r](https://github.com/v0y4g3r) in [#9259](https://github.com/GreptimeTeam/greptimedb/pull/9259)
* feat(trace): support Jaeger queries for Trace V2 and optimize writes (follow-up to #9192) by [@MichaelScofield](https://github.com/MichaelScofield) in [#9257](https://github.com/GreptimeTeam/greptimedb/pull/9257)
* feat: update pgwire to 0.41 by [@sunng87](https://github.com/sunng87) in [#9025](https://github.com/GreptimeTeam/greptimedb/pull/9025)
* feat: add database ingestion admission through metering by [@shuiyisong](https://github.com/shuiyisong) in [#9239](https://github.com/GreptimeTeam/greptimedb/pull/9239)
* feat: add experimental Metric export to V2 snapshots by [@fengjiachun](https://github.com/fengjiachun) in [#9233](https://github.com/GreptimeTeam/greptimedb/pull/9233)
* feat: restore packed metric snapshots by [@fengjiachun](https://github.com/fengjiachun) in [#9250](https://github.com/GreptimeTeam/greptimedb/pull/9250)
* feat(trace): support Semantic Graph for Trace V2 (follow-up to #9192) by [@MichaelScofield](https://github.com/MichaelScofield) in [#9278](https://github.com/GreptimeTeam/greptimedb/pull/9278)
* feat: add experimental Jev SQL filtering by [@v0y4g3r](https://github.com/v0y4g3r) in [#9265](https://github.com/GreptimeTeam/greptimedb/pull/9265)
* feat(log-store): add object store WAL reads and obsolete watermarks by [@fengjiachun](https://github.com/fengjiachun) in [#9248](https://github.com/GreptimeTeam/greptimedb/pull/9248)
* feat(json2): support altering JSON2 settings by [@fengys1996](https://github.com/fengys1996) in [#9029](https://github.com/GreptimeTeam/greptimedb/pull/9029)
* feat: add AI matching, classification, and scoring functions by [@v0y4g3r](https://github.com/v0y4g3r) in [#9300](https://github.com/GreptimeTeam/greptimedb/pull/9300)
* feat: share logical table batching with OTLP metrics by [@WenyXu](https://github.com/WenyXu) in [#9288](https://github.com/GreptimeTeam/greptimedb/pull/9288)
* feat(flow): allow execution hook to rewrite completed plans by [@discord9](https://github.com/discord9) in [#9290](https://github.com/GreptimeTeam/greptimedb/pull/9290)
* feat: support pending rows batching for MySQL and PostgreSQL by [@WenyXu](https://github.com/WenyXu) in [#9302](https://github.com/GreptimeTeam/greptimedb/pull/9302)
* feat: expose region open failure metrics by [@evenyag](https://github.com/evenyag) in [#9283](https://github.com/GreptimeTeam/greptimedb/pull/9283)
* feat(flow): freeze recovery windows and retention bounds for incremental flows by [@discord9](https://github.com/discord9) in [#9312](https://github.com/GreptimeTeam/greptimedb/pull/9312)
* feat: add schema metadata stream to SchemaManager by [@shuiyisong](https://github.com/shuiyisong) in [#9325](https://github.com/GreptimeTeam/greptimedb/pull/9325)
* feat: enable native histogram ingestion by default by [@shuiyisong](https://github.com/shuiyisong) in [#9301](https://github.com/GreptimeTeam/greptimedb/pull/9301)
* feat(mito): limit approximate series index disk usage by [@evenyag](https://github.com/evenyag) in [#9313](https://github.com/GreptimeTeam/greptimedb/pull/9313)
* feat(log-store): chain object store WAL objects and recover the latest chain by [@fengjiachun](https://github.com/fengjiachun) in [#9334](https://github.com/GreptimeTeam/greptimedb/pull/9334)
* feat(otlp): add histogram rejection metrics and compact zero buckets by [@shuiyisong](https://github.com/shuiyisong) in [#9321](https://github.com/GreptimeTeam/greptimedb/pull/9321)
* feat: add manual series index reconciliation by [@evenyag](https://github.com/evenyag) in [#9323](https://github.com/GreptimeTeam/greptimedb/pull/9323)
* feat(log-store): add the object store WAL durable write path by [@fengjiachun](https://github.com/fengjiachun) in [#9320](https://github.com/GreptimeTeam/greptimedb/pull/9320)
* feat: allow customized time index unit for metric engine table by [@sunng87](https://github.com/sunng87) in [#9236](https://github.com/GreptimeTeam/greptimedb/pull/9236)
* feat: add HDFS object storage backend by [@Minghan2005](https://github.com/Minghan2005) in [#8701](https://github.com/GreptimeTeam/greptimedb/pull/8701)
* feat(log-store): add the enqueued acknowledgement mode to the object store WAL by [@fengjiachun](https://github.com/fengjiachun) in [#9358](https://github.com/GreptimeTeam/greptimedb/pull/9358)
* feat(query): implement PromQL @ modifier on vector and matrix selectors by [@discord9](https://github.com/discord9) in [#9224](https://github.com/GreptimeTeam/greptimedb/pull/9224)
* feat: support non-millisecond time index units in the logical batcher by [@sunng87](https://github.com/sunng87) in [#9346](https://github.com/GreptimeTeam/greptimedb/pull/9346)
* feat: export Metric snapshots with packed Parquet objects by [@fengjiachun](https://github.com/fengjiachun) in [#9382](https://github.com/GreptimeTeam/greptimedb/pull/9382)

### 🐛 Bug Fixes

* fix(client): isolate query and control transports by [@discord9](https://github.com/discord9) in [#8990](https://github.com/GreptimeTeam/greptimedb/pull/8990)
* fix(pipeline): coalesce concurrent pipeline cache misses by [@killme2008](https://github.com/killme2008) in [#9022](https://github.com/GreptimeTeam/greptimedb/pull/9022)
* fix(json2): keep empty structs in remainder by [@MichaelScofield](https://github.com/MichaelScofield) in [#9027](https://github.com/GreptimeTeam/greptimedb/pull/9027)
* fix(wal): bound Kafka requests and extend latency buckets by [@WenyXu](https://github.com/WenyXu) in [#9026](https://github.com/GreptimeTeam/greptimedb/pull/9026)
* fix: match system schema names case-insensitively by [@killme2008](https://github.com/killme2008) in [#9040](https://github.com/GreptimeTeam/greptimedb/pull/9040)
* fix(frontend): isolate internal Flight authentication by [@discord9](https://github.com/discord9) in [#9045](https://github.com/GreptimeTeam/greptimedb/pull/9045)
* fix: re-scan stream-backed tables in recursive CTEs by [@killme2008](https://github.com/killme2008) in [#9039](https://github.com/GreptimeTeam/greptimedb/pull/9039)
* fix(cli): sanitize store_addrs in kvbackend build log by [@LiuQhahah](https://github.com/LiuQhahah) in [#8967](https://github.com/GreptimeTeam/greptimedb/pull/8967)
* fix(mito2): harden flat merge and use winner_tree by [@v0y4g3r](https://github.com/v0y4g3r) in [#9064](https://github.com/GreptimeTeam/greptimedb/pull/9064)
* fix: prevent catalog testing feature from leaking into production builds by [@evenyag](https://github.com/evenyag) in [#9063](https://github.com/GreptimeTeam/greptimedb/pull/9063)
* fix(ci): avoid cross-references in PR limit comments by [@evenyag](https://github.com/evenyag) in [#9065](https://github.com/GreptimeTeam/greptimedb/pull/9065)
* fix(prometheus): align batch flush deadline with creation by [@v0y4g3r](https://github.com/v0y4g3r) in [#8802](https://github.com/GreptimeTeam/greptimedb/pull/8802)
* fix(servers): return text[] for SELECT array[null] in PostgreSQL protocol by [@Tyagiquamar](https://github.com/Tyagiquamar) in [#9058](https://github.com/GreptimeTeam/greptimedb/pull/9058)
* fix(ci): strip pre-release extension when creating nightly release version by [@sunng87](https://github.com/sunng87) in [#9081](https://github.com/GreptimeTeam/greptimedb/pull/9081)
* fix(flow): drain frontend probe response before selecting peer by [@discord9](https://github.com/discord9) in [#9082](https://github.com/GreptimeTeam/greptimedb/pull/9082)
* fix(promql): correct counter reset accumulation in rate windows by [@killme2008](https://github.com/killme2008) in [#9089](https://github.com/GreptimeTeam/greptimedb/pull/9089)
* fix(query): prevent incomplete aggregate dynamic filtering by [@discord9](https://github.com/discord9) in [#9102](https://github.com/GreptimeTeam/greptimedb/pull/9102)
* fix: bump jemalloc crates to 0.7 and patch tikv-jemalloc-sys with tcache init fix by [@v0y4g3r](https://github.com/v0y4g3r) in [#9103](https://github.com/GreptimeTeam/greptimedb/pull/9103)
* fix(ci): check Windows test targets before merge by [@WenyXu](https://github.com/WenyXu) in [#9116](https://github.com/GreptimeTeam/greptimedb/pull/9116)
* fix(ci): increase query regression ECS disk to 80 GiB by [@discord9](https://github.com/discord9) in [#9123](https://github.com/GreptimeTeam/greptimedb/pull/9123)
* fix(mito): preserve mixed JSON2 types during compaction by [@v0y4g3r](https://github.com/v0y4g3r) in [#9135](https://github.com/GreptimeTeam/greptimedb/pull/9135)
* fix(mito2): prevent JSON2 SWCS data loss from misaligned Parquet statistics due to projection by [@v0y4g3r](https://github.com/v0y4g3r) in [#9129](https://github.com/GreptimeTeam/greptimedb/pull/9129)
* fix(promql): preserve native timestamps through sample selection by [@discord9](https://github.com/discord9) in [#9070](https://github.com/GreptimeTeam/greptimedb/pull/9070)
* fix(promql): skip NULL samples and fix counter extrapolation order by [@killme2008](https://github.com/killme2008) in [#9118](https://github.com/GreptimeTeam/greptimedb/pull/9118)
* fix: configure series indexes with an enable flag by [@evenyag](https://github.com/evenyag) in [#9141](https://github.com/GreptimeTeam/greptimedb/pull/9141)
* fix(mito2): deliver complete WAL entries without waiting for next input by [@discord9](https://github.com/discord9) in [#8916](https://github.com/GreptimeTeam/greptimedb/pull/8916)
* fix(servers): resolve port from IPv6 bind addresses by [@immanuwell](https://github.com/immanuwell) in [#9142](https://github.com/GreptimeTeam/greptimedb/pull/9142)
* fix(mito2): preserve effective sequences during compaction by [@v0y4g3r](https://github.com/v0y4g3r) in [#9147](https://github.com/GreptimeTeam/greptimedb/pull/9147)
* fix: preserve count correctness after repartition by [@WenyXu](https://github.com/WenyXu) in [#9154](https://github.com/GreptimeTeam/greptimedb/pull/9154)
* fix(mysql): strip leading comments before the federated statement filter by [@killme2008](https://github.com/killme2008) in [#9156](https://github.com/GreptimeTeam/greptimedb/pull/9156)
* fix: support native JSON2 row inserts over gRPC by [@MichaelScofield](https://github.com/MichaelScofield) in [#9145](https://github.com/GreptimeTeam/greptimedb/pull/9145)
* fix: register region migration procedures before returning IDs by [@fengjiachun](https://github.com/fengjiachun) in [#9163](https://github.com/GreptimeTeam/greptimedb/pull/9163)
* fix: preserve structured query errors through distributed execution by [@discord9](https://github.com/discord9) in [#9161](https://github.com/GreptimeTeam/greptimedb/pull/9161)
* fix(promql): skip empty batches in SeriesDivide stream by [@discord9](https://github.com/discord9) in [#9178](https://github.com/GreptimeTeam/greptimedb/pull/9178)
* fix(ci): rerun semantic PR checks after pushes by [@evenyag](https://github.com/evenyag) in [#9190](https://github.com/GreptimeTeam/greptimedb/pull/9190)
* fix(mito2): preserve last-non-null values across compaction by [@v0y4g3r](https://github.com/v0y4g3r) in [#9169](https://github.com/GreptimeTeam/greptimedb/pull/9169)
* fix: support exact sequence ranges in two-phase series scans by [@discord9](https://github.com/discord9) in [#9096](https://github.com/GreptimeTeam/greptimedb/pull/9096)
* fix(ci): repair agent observability dispatch and runner cleanup by [@WenyXu](https://github.com/WenyXu) in [#9204](https://github.com/GreptimeTeam/greptimedb/pull/9204)
* fix(json): fix JSONPath panic with jsonb 0.5.6 (follow-up to #9192) by [@MichaelScofield](https://github.com/MichaelScofield) in [#9228](https://github.com/GreptimeTeam/greptimedb/pull/9228)
* fix(servers): merge duplicate timeseries across RecordBatches in Prometheus remote read by [@Tyagiquamar](https://github.com/Tyagiquamar) in [#9032](https://github.com/GreptimeTeam/greptimedb/pull/9032)
* fix(prometheus): honor label matchers in __name__ values query by [@killme2008](https://github.com/killme2008) in [#9134](https://github.com/GreptimeTeam/greptimedb/pull/9134)
* fix(mito2): hold the bulk compact permit for the whole blocking task by [@killme2008](https://github.com/killme2008) in [#9252](https://github.com/GreptimeTeam/greptimedb/pull/9252)
* fix: make database export assertions portable on Windows by [@fengjiachun](https://github.com/fengjiachun) in [#9256](https://github.com/GreptimeTeam/greptimedb/pull/9256)
* fix(mito2): cancel cache construction for incomplete scans by [@killme2008](https://github.com/killme2008) in [#9254](https://github.com/GreptimeTeam/greptimedb/pull/9254)
* fix(mito2): compare primary key ranges across schema versions by [@v0y4g3r](https://github.com/v0y4g3r) in [#9205](https://github.com/GreptimeTeam/greptimedb/pull/9205)
* fix(query): insert MergeScan into nested scalar subqueries by [@discord9](https://github.com/discord9) in [#9261](https://github.com/GreptimeTeam/greptimedb/pull/9261)
* fix(ci): stabilize long-range benchmark execution and artifact collection by [@WenyXu](https://github.com/WenyXu) in [#9241](https://github.com/GreptimeTeam/greptimedb/pull/9241)
* fix(promql): keep value-field grouping labels out of matching filter propagation by [@discord9](https://github.com/discord9) in [#9242](https://github.com/GreptimeTeam/greptimedb/pull/9242)
* fix: release completed SST write buffers during compaction by [@v0y4g3r](https://github.com/v0y4g3r) in [#9243](https://github.com/GreptimeTeam/greptimedb/pull/9243)
* fix: fail startup on duplicate region engine configs by [@v0y4g3r](https://github.com/v0y4g3r) in [#9281](https://github.com/GreptimeTeam/greptimedb/pull/9281)
* fix(query): stop encoding oversized dynamic filters by [@killme2008](https://github.com/killme2008) in [#9267](https://github.com/GreptimeTeam/greptimedb/pull/9267)
* fix(meta): populate physical metric table column ids by [@dhruvxvaishnav](https://github.com/dhruvxvaishnav) in [#9286](https://github.com/GreptimeTeam/greptimedb/pull/9286)
* fix(postgres): return empty responses for comment-only SQL by [@houyuwushang](https://github.com/houyuwushang) in [#9295](https://github.com/GreptimeTeam/greptimedb/pull/9295)
* fix(ci): build tests-integration lib with meta-srv/mock by [@killme2008](https://github.com/killme2008) in [#9299](https://github.com/GreptimeTeam/greptimedb/pull/9299)
* fix: keep compaction pruning, metadata, and index work on compact runtime by [@v0y4g3r](https://github.com/v0y4g3r) in [#9304](https://github.com/GreptimeTeam/greptimedb/pull/9304)
* fix: serialize struct to json in postgres by [@sunng87](https://github.com/sunng87) in [#9170](https://github.com/GreptimeTeam/greptimedb/pull/9170)
* fix: address Windows test failures and run full Windows CI by [@WenyXu](https://github.com/WenyXu) in [#9305](https://github.com/GreptimeTeam/greptimedb/pull/9305)
* fix(json2): restrict JSON2 type hints by [@fengys1996](https://github.com/fengys1996) in [#9316](https://github.com/GreptimeTeam/greptimedb/pull/9316)
* fix(ci): repair draft PR command dispatch by [@WenyXu](https://github.com/WenyXu) in [#9271](https://github.com/GreptimeTeam/greptimedb/pull/9271)
* fix(promql): derive vector matching result labels and reject ambiguous matchings by [@killme2008](https://github.com/killme2008) in [#9306](https://github.com/GreptimeTeam/greptimedb/pull/9306)
* fix(ci): grant PR write permission for CI command replies by [@WenyXu](https://github.com/WenyXu) in [#9331](https://github.com/GreptimeTeam/greptimedb/pull/9331)
* fix: merge every state row in geo_path and json_encode_path by [@killme2008](https://github.com/killme2008) in [#9339](https://github.com/GreptimeTeam/greptimedb/pull/9339)
* fix: only push down aggregates grouped by the partition columns themselves by [@killme2008](https://github.com/killme2008) in [#9337](https://github.com/GreptimeTeam/greptimedb/pull/9337)
* fix: align ordered aggregate state type with the accumulator output by [@killme2008](https://github.com/killme2008) in [#9340](https://github.com/GreptimeTeam/greptimedb/pull/9340)
* fix(query): keep count_values generated label in enclosing expressions by [@discord9](https://github.com/discord9) in [#9223](https://github.com/GreptimeTeam/greptimedb/pull/9223)
* fix: make vector aggregates work with GROUP BY and partial aggregation by [@killme2008](https://github.com/killme2008) in [#9338](https://github.com/GreptimeTeam/greptimedb/pull/9338)
* fix: preserve primary key order when syncing columns by [@WenyXu](https://github.com/WenyXu) in [#9189](https://github.com/GreptimeTeam/greptimedb/pull/9189)
* fix(mito2): stop parallel flat scan tasks once the receiver is dropped by [@killme2008](https://github.com/killme2008) in [#9368](https://github.com/GreptimeTeam/greptimedb/pull/9368)
* fix(query): preserve global limits with DataFusion optimizer fixes by [@discord9](https://github.com/discord9) in [#9071](https://github.com/GreptimeTeam/greptimedb/pull/9071)
* fix(auth): follow symlink chains in watch_file_user_provider by [@DeviousCardi](https://github.com/DeviousCardi) in [#9365](https://github.com/GreptimeTeam/greptimedb/pull/9365)
* fix(client): complete transport lane isolation by [@discord9](https://github.com/discord9) in [#9030](https://github.com/GreptimeTeam/greptimedb/pull/9030)
* fix(ci): teach check-builder-rust-version.sh to handle stable channels by [@sunng87](https://github.com/sunng87) in [#9369](https://github.com/GreptimeTeam/greptimedb/pull/9369)
* fix(ci): update the shared Actions runner to v2.337.0 by [@WenyXu](https://github.com/WenyXu) in [#9376](https://github.com/GreptimeTeam/greptimedb/pull/9376)
* fix(meta-srv): use NoTls for disabled and Unix socket Postgres KV backends by [@Tyagiquamar](https://github.com/Tyagiquamar) in [#9059](https://github.com/GreptimeTeam/greptimedb/pull/9059)

### 🚜 Refactor

* refactor(json2): concretize JSON2 schemas at merge scan boundaries by [@MichaelScofield](https://github.com/MichaelScofield) in [#9016](https://github.com/GreptimeTeam/greptimedb/pull/9016)
* refactor: support plugin-backed admin functions by [@v0y4g3r](https://github.com/v0y4g3r) in [#9083](https://github.com/GreptimeTeam/greptimedb/pull/9083)
* refactor: remove constant vector and replicate operation by [@evenyag](https://github.com/evenyag) in [#8999](https://github.com/GreptimeTeam/greptimedb/pull/8999)
* refactor(json2): JSON2 parquet projection and schema alignment by [@fengys1996](https://github.com/fengys1996) in [#9137](https://github.com/GreptimeTeam/greptimedb/pull/9137)
* refactor: reuse common batching components in Prom ingestion by [@WenyXu](https://github.com/WenyXu) in [#9114](https://github.com/GreptimeTeam/greptimedb/pull/9114)
* refactor(flow): execute streaming flows with DataFusion by [@discord9](https://github.com/discord9) in [#8976](https://github.com/GreptimeTeam/greptimedb/pull/8976)
* refactor: migrate partition_statistics to statistics_from_inputs by [@discord9](https://github.com/discord9) in [#9175](https://github.com/GreptimeTeam/greptimedb/pull/9175)
* refactor: reorganize logical table batching and isolate encoding by [@WenyXu](https://github.com/WenyXu) in [#9210](https://github.com/GreptimeTeam/greptimedb/pull/9210)
* refactor: isolate logical batch scheduling and flushing by [@WenyXu](https://github.com/WenyXu) in [#9211](https://github.com/GreptimeTeam/greptimedb/pull/9211)
* refactor: isolate logical table preparation and reuse Flow notifications by [@WenyXu](https://github.com/WenyXu) in [#9212](https://github.com/GreptimeTeam/greptimedb/pull/9212)
* refactor: remove experimental vector index by [@killme2008](https://github.com/killme2008) in [#9345](https://github.com/GreptimeTeam/greptimedb/pull/9345)
* refactor(promql): split planner into focused modules by [@discord9](https://github.com/discord9) in [#9354](https://github.com/GreptimeTeam/greptimedb/pull/9354)

### 📚 Documentation

* docs: fix README canary release badge resolving to stable version by [@sunng87](https://github.com/sunng87) in [#9109](https://github.com/GreptimeTeam/greptimedb/pull/9109)
* docs: restructure README and add a cross-signal SQL example by [@killme2008](https://github.com/killme2008) in [#9136](https://github.com/GreptimeTeam/greptimedb/pull/9136)
* docs: propose Metric export and import optimizations by [@fengjiachun](https://github.com/fengjiachun) in [#9121](https://github.com/GreptimeTeam/greptimedb/pull/9121)
* docs: refine Rust style guide by [@WenyXu](https://github.com/WenyXu) in [#9220](https://github.com/GreptimeTeam/greptimedb/pull/9220)
* docs(agents): clarify the documentation-update checklist item by [@killme2008](https://github.com/killme2008) in [#9255](https://github.com/GreptimeTeam/greptimedb/pull/9255)
* docs: make packed snapshots part of the Metric export/import RFC by [@fengjiachun](https://github.com/fengjiachun) in [#9247](https://github.com/GreptimeTeam/greptimedb/pull/9247)

### ⚡ Performance

* Perf/http sql limit materialization by [@lyang24](https://github.com/lyang24) in [#9148](https://github.com/GreptimeTeam/greptimedb/pull/9148)

* perf(mito2): postpone covered time index filters by [@evenyag](https://github.com/evenyag) in [#8998](https://github.com/GreptimeTeam/greptimedb/pull/8998)
* perf(mito2): blazing-fast tournament tree merger by [@v0y4g3r](https://github.com/v0y4g3r) in [#8989](https://github.com/GreptimeTeam/greptimedb/pull/8989)
* perf(promql): push down last row for instant queries by [@discord9](https://github.com/discord9) in [#9034](https://github.com/GreptimeTeam/greptimedb/pull/9034)
* perf(table): filter decoded rows with dynamic predicates by [@discord9](https://github.com/discord9) in [#9004](https://github.com/GreptimeTeam/greptimedb/pull/9004)
* perf(servers): defer Prometheus sample value formatting to serialization by [@killme2008](https://github.com/killme2008) in [#9091](https://github.com/GreptimeTeam/greptimedb/pull/9091)
* perf(servers): drop the output sort for Prometheus range queries by [@killme2008](https://github.com/killme2008) in [#9090](https://github.com/GreptimeTeam/greptimedb/pull/9090)
* perf(mito2): skip proven all-match prefilters by [@discord9](https://github.com/discord9) in [#9066](https://github.com/GreptimeTeam/greptimedb/pull/9066)
* perf(promql): avoid per-window allocations in simple range functions by [@discord9](https://github.com/discord9) in [#9104](https://github.com/GreptimeTeam/greptimedb/pull/9104)
* perf(query): check Substrait encodability once per plan by [@killme2008](https://github.com/killme2008) in [#9095](https://github.com/GreptimeTeam/greptimedb/pull/9095)
* perf(gc): pack file reference exchange by [@discord9](https://github.com/discord9) in [#9009](https://github.com/GreptimeTeam/greptimedb/pull/9009)
* perf: avoid directory listing for explicit COPY input files by [@fengjiachun](https://github.com/fengjiachun) in [#9126](https://github.com/GreptimeTeam/greptimedb/pull/9126)
* perf(servers): group Prometheus response rows by label runs by [@killme2008](https://github.com/killme2008) in [#9092](https://github.com/GreptimeTeam/greptimedb/pull/9092)
* perf(metric-engine): avoid deep-cloning physical column metadata in verify_rows by [@v0y4g3r](https://github.com/v0y4g3r) in [#9162](https://github.com/GreptimeTeam/greptimedb/pull/9162)
* perf(servers): avoid rebuilding JSON records payload by [@discord9](https://github.com/discord9) in [#9160](https://github.com/GreptimeTeam/greptimedb/pull/9160)
* perf(mito2): lazily extract sparse primary key index values by [@v0y4g3r](https://github.com/v0y4g3r) in [#9176](https://github.com/GreptimeTeam/greptimedb/pull/9176)
* perf(mito2): optimize materialized column index updates by [@v0y4g3r](https://github.com/v0y4g3r) in [#9182](https://github.com/GreptimeTeam/greptimedb/pull/9182)
* perf(promql): reuse sliding min and max candidates by [@discord9](https://github.com/discord9) in [#9099](https://github.com/GreptimeTeam/greptimedb/pull/9099)
* perf(servers): coalesce ready Flight record batches by [@discord9](https://github.com/discord9) in [#9167](https://github.com/GreptimeTeam/greptimedb/pull/9167)
* perf(mito2): use series and range indexes in two-phase series scans by [@evenyag](https://github.com/evenyag) in [#9153](https://github.com/GreptimeTeam/greptimedb/pull/9153)
* perf(promql): avoid concatenating constant series tags by [@discord9](https://github.com/discord9) in [#9108](https://github.com/GreptimeTeam/greptimedb/pull/9108)
* perf(mito2): lazily materialize sparse primary key tags by [@v0y4g3r](https://github.com/v0y4g3r) in [#9199](https://github.com/GreptimeTeam/greptimedb/pull/9199)
* perf: add flight coalesce regression case with high-cardinality aggregations by [@discord9](https://github.com/discord9) in [#9214](https://github.com/GreptimeTeam/greptimedb/pull/9214)
* perf(promql): propagate matching-label filters between binary operands by [@killme2008](https://github.com/killme2008) in [#9202](https://github.com/GreptimeTeam/greptimedb/pull/9202)
* perf(mito-codec): streamline sparse label extraction and buffer sizing by [@v0y4g3r](https://github.com/v0y4g3r) in [#9217](https://github.com/GreptimeTeam/greptimedb/pull/9217)
* perf(otlp): share trace resource and scope attributes by [@killme2008](https://github.com/killme2008) in [#9253](https://github.com/GreptimeTeam/greptimedb/pull/9253)
* perf(servers): reduce temporary memory in protocol handling by [@killme2008](https://github.com/killme2008) in [#9249](https://github.com/GreptimeTeam/greptimedb/pull/9249)
* perf(servers): stream Prometheus HTTP responses incrementally by [@discord9](https://github.com/discord9) in [#9229](https://github.com/GreptimeTeam/greptimedb/pull/9229)
* perf(telemetry): remove the shared lock from TraceLayer by [@killme2008](https://github.com/killme2008) in [#9269](https://github.com/GreptimeTeam/greptimedb/pull/9269)
* perf(promql): push label filters into grouped join inputs by [@killme2008](https://github.com/killme2008) in [#9280](https://github.com/GreptimeTeam/greptimedb/pull/9280)
* perf(mito2): lazily decode dense primary key columns by [@v0y4g3r](https://github.com/v0y4g3r) in [#9226](https://github.com/GreptimeTeam/greptimedb/pull/9226)
* perf: bound concurrent Metric export writers by [@fengjiachun](https://github.com/fengjiachun) in [#9296](https://github.com/GreptimeTeam/greptimedb/pull/9296)
* perf(index): batch bloom filter searches across row groups by [@killme2008](https://github.com/killme2008) in [#9361](https://github.com/GreptimeTeam/greptimedb/pull/9361)
* perf(mito2): batch index page loads and share cached bloom metadata by [@killme2008](https://github.com/killme2008) in [#9360](https://github.com/GreptimeTeam/greptimedb/pull/9360)
* perf(index): cut allocations when building bloom and inverted indexes by [@killme2008](https://github.com/killme2008) in [#9359](https://github.com/GreptimeTeam/greptimedb/pull/9359)

### 🧪 Testing

* test: cover request-level insert WAL skipping end to end by [@WenyXu](https://github.com/WenyXu) in [#9093](https://github.com/GreptimeTeam/greptimedb/pull/9093)
* test: regenerate expired TLS certificates for integration fixtures by [@discord9](https://github.com/discord9) in [#9196](https://github.com/GreptimeTeam/greptimedb/pull/9196)
* test(flow): stabilize FLUSH_FLOW assertions after async source-table mirrors by [@discord9](https://github.com/discord9) in [#9230](https://github.com/GreptimeTeam/greptimedb/pull/9230)
* test: exclude testing feature completely by [@sunng87](https://github.com/sunng87) in [#9072](https://github.com/GreptimeTeam/greptimedb/pull/9072)
* test: make export chunk deletion failure deterministic by [@fengjiachun](https://github.com/fengjiachun) in [#9291](https://github.com/GreptimeTeam/greptimedb/pull/9291)
* test: cut integration test time and make the storage matrix meaningful by [@killme2008](https://github.com/killme2008) in [#9308](https://github.com/GreptimeTeam/greptimedb/pull/9308)
* test(sqlness): run environments concurrently and drop redundant restarts and sleeps by [@killme2008](https://github.com/killme2008) in [#9333](https://github.com/GreptimeTeam/greptimedb/pull/9333)
* test: remove unused legacy compatibility test suites by [@killme2008](https://github.com/killme2008) in [#9378](https://github.com/GreptimeTeam/greptimedb/pull/9378)

### ⚙️ Miscellaneous Tasks

* ci: add workflow to auto-create backport PRs from backport labels by [@sunng87](https://github.com/sunng87) in [#9028](https://github.com/GreptimeTeam/greptimedb/pull/9028)
* ci: skip bumping helm charts and homebrew and downstream repository for pre-releases by [@daviderli614](https://github.com/daviderli614) in [#9031](https://github.com/GreptimeTeam/greptimedb/pull/9031)
* chore(ci): Implement /query-regression command handling and admission workflow by [@paomian](https://github.com/paomian) in [#8975](https://github.com/GreptimeTeam/greptimedb/pull/8975)
* ci(backport): fix issue creation on cherry-pick conflict by [@sunng87](https://github.com/sunng87) in [#9048](https://github.com/GreptimeTeam/greptimedb/pull/9048)
* ci(backport): label backport PRs with their version name by [@sunng87](https://github.com/sunng87) in [#9073](https://github.com/GreptimeTeam/greptimedb/pull/9073)
* chore(ci): update compatibility versions by [@MichaelScofield](https://github.com/MichaelScofield) in [#9075](https://github.com/GreptimeTeam/greptimedb/pull/9075)
* chore: select cmd package when building greptime by [@fengys1996](https://github.com/fengys1996) in [#9113](https://github.com/GreptimeTeam/greptimedb/pull/9113)
* chore: bump tikv-jemalloc-sys patch to jemalloc dev (ff80bf2d) by [@v0y4g3r](https://github.com/v0y4g3r) in [#9119](https://github.com/GreptimeTeam/greptimedb/pull/9119)
* ci(backport): assign backport-failure issue to the original PR author by [@sunng87](https://github.com/sunng87) in [#9122](https://github.com/GreptimeTeam/greptimedb/pull/9122)
* chore(ci): update compatibility test window to v1.2.1 by [@discord9](https://github.com/discord9) in [#9193](https://github.com/GreptimeTeam/greptimedb/pull/9193)
* ci: add manual agent observability benchmarks on Aliyun ECS by [@WenyXu](https://github.com/WenyXu) in [#9179](https://github.com/GreptimeTeam/greptimedb/pull/9179)
* chore: reduce duplicate table auto-creation logs by [@shuiyisong](https://github.com/shuiyisong) in [#9188](https://github.com/GreptimeTeam/greptimedb/pull/9188)
* ci: gate draft PR checks behind slash commands by [@WenyXu](https://github.com/WenyXu) in [#9221](https://github.com/GreptimeTeam/greptimedb/pull/9221)
* ci: pin crate-ci/typos to v1.50.2 by [@killme2008](https://github.com/killme2008) in [#9246](https://github.com/GreptimeTeam/greptimedb/pull/9246)
* ci: use mold in dev-builder by [@sunng87](https://github.com/sunng87) in [#9262](https://github.com/GreptimeTeam/greptimedb/pull/9262)
* ci: update dev-builder image tag by [@github-actions[bot]](https://github.com/github-actions[bot]) in [#9270](https://github.com/GreptimeTeam/greptimedb/pull/9270)
* ci: create docs follow-up issue on PR merge instead of on label by [@sunng87](https://github.com/sunng87) in [#9237](https://github.com/GreptimeTeam/greptimedb/pull/9237)
* ci: update cargo fuzz command to use nightly toolchain explicitly by [@sunng87](https://github.com/sunng87) in [#9298](https://github.com/GreptimeTeam/greptimedb/pull/9298)
* ci: add optional AWS runners for observability benchmarks by [@WenyXu](https://github.com/WenyXu) in [#9322](https://github.com/GreptimeTeam/greptimedb/pull/9322)
* chore(toolchain): switch to stable Rust 1.96.1 and remove all nightly feature gates by [@sunng87](https://github.com/sunng87) in [#9303](https://github.com/GreptimeTeam/greptimedb/pull/9303)
* ci: update dev-builder image tag by [@github-actions[bot]](https://github.com/github-actions[bot]) in [#9355](https://github.com/GreptimeTeam/greptimedb/pull/9355)
* ci: deploy MinIO chart with Silo images by [@killme2008](https://github.com/killme2008) in [#9362](https://github.com/GreptimeTeam/greptimedb/pull/9362)
* ci: add manually triggered tracesbench workflow by [@WenyXu](https://github.com/WenyXu) in [#9372](https://github.com/GreptimeTeam/greptimedb/pull/9372)
* ci(query-regression): bump RUNNER_IMAGE_EPOCH to 6 by [@MichaelScofield](https://github.com/MichaelScofield) in [#9381](https://github.com/GreptimeTeam/greptimedb/pull/9381)
* chore: remove leftover flow worker config docs and unused flow metrics by [@killme2008](https://github.com/killme2008) in [#9375](https://github.com/GreptimeTeam/greptimedb/pull/9375)
* chore: remove dead code left behind by removed features by [@killme2008](https://github.com/killme2008) in [#9377](https://github.com/GreptimeTeam/greptimedb/pull/9377)
* chore: disable unstable rustfmt features by [@sunng87](https://github.com/sunng87) in [#9379](https://github.com/GreptimeTeam/greptimedb/pull/9379)
* chore: add cargo min-publish-age of 7 days by [@killme2008](https://github.com/killme2008) in [#9384](https://github.com/GreptimeTeam/greptimedb/pull/9384)
* revert(ci): pin the query-regression runner toolchain to nightly-2026-03-21 by [@sunng87](https://github.com/sunng87) in [#9389](https://github.com/GreptimeTeam/greptimedb/pull/9389)
* chore: add mold back to nix flake by [@sunng87](https://github.com/sunng87) in [#9388](https://github.com/GreptimeTeam/greptimedb/pull/9388)
* chore: bump version to 1.3.0-beta.1 by [@WenyXu](https://github.com/WenyXu) in [#9392](https://github.com/GreptimeTeam/greptimedb/pull/9392)

## New Contributors

* [@Tyagiquamar](https://github.com/Tyagiquamar) made their first contribution in [#9059](https://github.com/GreptimeTeam/greptimedb/pull/9059)
* [@Minghan2005](https://github.com/Minghan2005) made their first contribution in [#8701](https://github.com/GreptimeTeam/greptimedb/pull/8701)
* [@DeviousCardi](https://github.com/DeviousCardi) made their first contribution in [#9365](https://github.com/GreptimeTeam/greptimedb/pull/9365)
* [@houyuwushang](https://github.com/houyuwushang) made their first contribution in [#9295](https://github.com/GreptimeTeam/greptimedb/pull/9295)
* [@sainad2222](https://github.com/sainad2222) made their first contribution in [#9060](https://github.com/GreptimeTeam/greptimedb/pull/9060)
* [@immanuwell](https://github.com/immanuwell) made their first contribution in [#9142](https://github.com/GreptimeTeam/greptimedb/pull/9142)
* [@LiuQhahah](https://github.com/LiuQhahah) made their first contribution in [#8967](https://github.com/GreptimeTeam/greptimedb/pull/8967)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@DeviousCardi](https://github.com/DeviousCardi), [@LiuQhahah](https://github.com/LiuQhahah), [@MichaelScofield](https://github.com/MichaelScofield), [@Minghan2005](https://github.com/Minghan2005), [@Tyagiquamar](https://github.com/Tyagiquamar), [@WenyXu](https://github.com/WenyXu), [@daviderli614](https://github.com/daviderli614), [@dhruvxvaishnav](https://github.com/dhruvxvaishnav), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@fengys1996](https://github.com/fengys1996), [@houyuwushang](https://github.com/houyuwushang), [@immanuwell](https://github.com/immanuwell), [@killme2008](https://github.com/killme2008), [@lyang24](https://github.com/lyang24), [@paomian](https://github.com/paomian), [@sainad2222](https://github.com/sainad2222), [@shuiyisong](https://github.com/shuiyisong), [@sunchanglong](https://github.com/sunchanglong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r)
