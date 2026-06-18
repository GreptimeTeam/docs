---
keywords: [release, GreptimeDB, changelog, v1.1.0]
description: GreptimeDB v1.1.0 Changelog
date: 2026-06-14
---

# v1.1.0

Release date: June 14, 2026

v1.1.0 adds online partitioning for previously unpartitioned tables, experimental incremental
reads for batching flows, the experimental table semantic layer, and new CSV import options,
along with performance and stability fixes.

:::warning

v1.1.0 contains a critical JSON compatibility bug that affects users upgrading from v1.0.x when using the JSON data type. We strongly recommend users on v1.1.0 who use the JSON data type upgrade to [v1.1.1](./release-1-1-1.md) or later.

:::

### 👍 Highlights

**Partition an existing table.** Previously only tables created with `PARTITION ON COLUMNS`
could be repartitioned, via `SPLIT PARTITION` and `MERGE PARTITION`. v1.1.0 supports
partitioning a table that has no partition rules, splitting its single region into multiple
partitions with `ALTER TABLE ... PARTITION ON COLUMNS`:

```sql
ALTER TABLE sensor_readings PARTITION ON COLUMNS (device_id, area) (
  device_id < 100 AND area < 'South',
  device_id < 100 AND area >= 'South',
  device_id >= 100 AND area <= 'East',
  device_id >= 100 AND area > 'East'
);
```

The layout can then be adjusted further with `SPLIT PARTITION` and `MERGE PARTITION`.
Repartitioning requires a distributed cluster with shared object storage and GC enabled.

**Experimental incremental read for flows.** Batching flows re-execute the full source query
on every evaluation. With incremental read enabled, a flow only reads source rows appended
since its last run, lowering overhead for large append-only sources. It is disabled by
default; enable it in the flownode config:

```toml
[flow.batching_mode]
experimental_enable_incremental_read = true
```

It can also be set per flow with `WITH (experimental_enable_incremental_read = 'true')`. The
source table must be append-only (`append_mode = 'true'`); otherwise the flow falls back to
full-snapshot queries.

**Table semantic layer.** The experimental table semantic layer lets tables carry
`greptime.semantic.*` metadata, such as signal type, source, metric type, unit, temporality,
and ingestion pipeline. GreptimeDB stamps this metadata automatically on supported ingestion
paths, and you can also set it manually with `CREATE TABLE ... WITH (...)`. Consumers can
query `information_schema.table_semantics` to understand what each table represents without
guessing from table or column names.

#### MCP Server v0.5.0

GreptimeDB MCP Server v0.5.0 uses table semantic metadata in `describe_table`, so AI
assistants can understand metrics, logs, and traces more directly. It also expands the tool
set for SQL, TQL, RANGE queries, pipelines, and dashboards, with stdio/SSE/Streamable HTTP
transports, read-only defaults, masking, and audit logging.

#### Query performance improvements

- **PromQL execution.** Range functions such as `rate` and `increase` run faster, with
  benchmarks showing up to 97% lower execution time. Metric joins also improve through
  TSID-based joins and narrow binary join collection. Overall, compared to v1.0, v1.1 reduces
  average PromQL query time by 20% to 40%.
- **Scan pruning.** Parquet prefiltering, prefilter-result caching, and remote dynamic
  filters on datanode scans reduce unnecessary row reads. The TSBS `cpu-max-all-8` query was
  4.5x faster with prefiltering.
- **Read efficiency.** Page-index reads and range-cache reuse reduce storage reads for
  scan-heavy queries. Page-index reads reduced SST bytes fetched by 93.2% on one workload.

#### Dashboard

- The built-in Perses dashboard now supports trace visualization: a trace list and a
  per-trace detail/Gantt view from the trace table, using the GreptimeDB Perses data-source
  plugin.

#### CSV import options

`COPY FROM` adds `SKIP_BAD_RECORDS = 'true'` for skipping invalid rows and `HEADERS = 'false'`
for importing headerless CSV files:

```sql
COPY tbl FROM '/path/to/file.csv' WITH (
  FORMAT = 'csv',
  SKIP_BAD_RECORDS = 'true',
  HEADERS = 'false'
);
```

### Breaking changes

* fix!: align gRPC CLI option names with config naming by [@QuakeWang](https://github.com/QuakeWang) in [#8021](https://github.com/GreptimeTeam/greptimedb/pull/8021)
* refactor(mito2)!: remove PartitionTreeMemtable by [@evenyag](https://github.com/evenyag) in [#8080](https://github.com/GreptimeTeam/greptimedb/pull/8080)
* fix!: correct information_schema index metadata by [@killme2008](https://github.com/killme2008) in [#8275](https://github.com/GreptimeTeam/greptimedb/pull/8275)
* fix!: fence scoped flow repair snapshots by [@discord9](https://github.com/discord9) in [#8277](https://github.com/GreptimeTeam/greptimedb/pull/8277)

### 🚀 Features

* feat: tune constants by [@waynexia](https://github.com/waynexia) in [#7851](https://github.com/GreptimeTeam/greptimedb/pull/7851)
* feat: execution timeout for prepared statement by [@sunng87](https://github.com/sunng87) in [#7932](https://github.com/GreptimeTeam/greptimedb/pull/7932)
* feat: add parquet nested leaf projection by [@fengys1996](https://github.com/fengys1996) in [#7900](https://github.com/GreptimeTeam/greptimedb/pull/7900)
* feat: use partition range cache in scan by [@evenyag](https://github.com/evenyag) in [#7873](https://github.com/GreptimeTeam/greptimedb/pull/7873)
* feat: allow customizing trace table partitions by [@sunng87](https://github.com/sunng87) in [#7944](https://github.com/GreptimeTeam/greptimedb/pull/7944)
* feat(cli): implement import-v2 data import pipeline by [@fengjiachun](https://github.com/fengjiachun) in [#7898](https://github.com/GreptimeTeam/greptimedb/pull/7898)
* feat: implement trace type whitelist by [@shuiyisong](https://github.com/shuiyisong) in [#7930](https://github.com/GreptimeTeam/greptimedb/pull/7930)
* feat: introducing "JSON2" type by [@MichaelScofield](https://github.com/MichaelScofield) in [#7965](https://github.com/GreptimeTeam/greptimedb/pull/7965)
* feat: update dashboard to v0.12.1 by [@ZonaHex](https://github.com/ZonaHex) in [#7969](https://github.com/GreptimeTeam/greptimedb/pull/7969)
* feat: add more range check and test for parsing postgres parameters by [@sunng87](https://github.com/sunng87) in [#7962](https://github.com/GreptimeTeam/greptimedb/pull/7962)
* feat(flow): inc query scan bind seq by [@discord9](https://github.com/discord9) in [#7879](https://github.com/GreptimeTeam/greptimedb/pull/7879)
* feat: json2 insert by [@MichaelScofield](https://github.com/MichaelScofield) in [#7981](https://github.com/GreptimeTeam/greptimedb/pull/7981)
* feat(mito2): add PK-range-aware TWCS overlap handling by [@v0y4g3r](https://github.com/v0y4g3r) in [#7954](https://github.com/GreptimeTeam/greptimedb/pull/7954)
* feat: prune bulk memtable parts by first tag by [@evenyag](https://github.com/evenyag) in [#7911](https://github.com/GreptimeTeam/greptimedb/pull/7911)
* feat: expose flownode addrs in information_schema flows by [@QuakeWang](https://github.com/QuakeWang) in [#7992](https://github.com/GreptimeTeam/greptimedb/pull/7992)
* feat: update dashboard to v0.12.2 by [@ZonaHex](https://github.com/ZonaHex) in [#8010](https://github.com/GreptimeTeam/greptimedb/pull/8010)
* feat: json2 flush by [@MichaelScofield](https://github.com/MichaelScofield) in [#8011](https://github.com/GreptimeTeam/greptimedb/pull/8011)
* feat(cli): add metadata put key and table commands by [@WenyXu](https://github.com/WenyXu) in [#7989](https://github.com/GreptimeTeam/greptimedb/pull/7989)
* feat(cli): add retry and import state foundations by [@fengjiachun](https://github.com/fengjiachun) in [#8007](https://github.com/GreptimeTeam/greptimedb/pull/8007)
* feat: tune range cache by [@evenyag](https://github.com/evenyag) in [#8006](https://github.com/GreptimeTeam/greptimedb/pull/8006)
* feat: support gRPC-Web on frontend gRPC server by [@onepizzateam](https://github.com/onepizzateam) in [#8027](https://github.com/GreptimeTeam/greptimedb/pull/8027)
* feat: add seq watermark in record batch metrics by [@discord9](https://github.com/discord9) in [#8015](https://github.com/GreptimeTeam/greptimedb/pull/8015)
* feat(flow): parse defer on miss src table by [@discord9](https://github.com/discord9) in [#7980](https://github.com/GreptimeTeam/greptimedb/pull/7980)
* feat: allow detailed index config in pipeline by [@QuakeWang](https://github.com/QuakeWang) in [#8036](https://github.com/GreptimeTeam/greptimedb/pull/8036)
* feat(meta): add dropped table tombstone metadata helpers by [@v0y4g3r](https://github.com/v0y4g3r) in [#8040](https://github.com/GreptimeTeam/greptimedb/pull/8040)
* feat: add read column abstraction by [@fengys1996](https://github.com/fengys1996) in [#8038](https://github.com/GreptimeTeam/greptimedb/pull/8038)
* feat: support prefiltering any columns in flat format by [@evenyag](https://github.com/evenyag) in [#7972](https://github.com/GreptimeTeam/greptimedb/pull/7972)
* feat: persist our column_id to parquet field_id by [@sunng87](https://github.com/sunng87) in [#8032](https://github.com/GreptimeTeam/greptimedb/pull/8032)
* feat: json expr planner by [@MichaelScofield](https://github.com/MichaelScofield) in [#8066](https://github.com/GreptimeTeam/greptimedb/pull/8066)
* feat(operator): allow last_row merge mode with append mode by [@v0y4g3r](https://github.com/v0y4g3r) in [#8065](https://github.com/GreptimeTeam/greptimedb/pull/8065)
* feat: support nested projection in mito2 read path by [@fengys1996](https://github.com/fengys1996) in [#7959](https://github.com/GreptimeTeam/greptimedb/pull/7959)
* feat: support env vars in heartbeat by [@v0y4g3r](https://github.com/v0y4g3r) in [#8064](https://github.com/GreptimeTeam/greptimedb/pull/8064)
* feat: concretize json type from query by [@MichaelScofield](https://github.com/MichaelScofield) in [#8081](https://github.com/GreptimeTeam/greptimedb/pull/8081)
* feat: flow inc query terminal metrics transport by [@discord9](https://github.com/discord9) in [#8045](https://github.com/GreptimeTeam/greptimedb/pull/8045)
* feat: import resume part2 by [@fengjiachun](https://github.com/fengjiachun) in [#8070](https://github.com/GreptimeTeam/greptimedb/pull/8070)
* feat: add export-v2 snapshot listing by [@fengjiachun](https://github.com/fengjiachun) in [#8096](https://github.com/GreptimeTeam/greptimedb/pull/8096)
* feat: some optimistic paths for instant manipulate by [@waynexia](https://github.com/waynexia) in [#7812](https://github.com/GreptimeTeam/greptimedb/pull/7812)
* feat: remote dyn filter basics by [@discord9](https://github.com/discord9) in [#7979](https://github.com/GreptimeTeam/greptimedb/pull/7979)
* feat: bump datafusion to 53 by [@waynexia](https://github.com/waynexia) in [#8107](https://github.com/GreptimeTeam/greptimedb/pull/8107)
* feat: start environments in parallel by [@waynexia](https://github.com/waynexia) in [#8101](https://github.com/GreptimeTeam/greptimedb/pull/8101)
* feat: expose node info for placement selectors by [@v0y4g3r](https://github.com/v0y4g3r) in [#8095](https://github.com/GreptimeTeam/greptimedb/pull/8095)
* feat: add otlp to prometheus naming translation options by [@shuiyisong](https://github.com/shuiyisong) in [#8113](https://github.com/GreptimeTeam/greptimedb/pull/8113)
* feat: add export-v2 snapshot verification by [@fengjiachun](https://github.com/fengjiachun) in [#8111](https://github.com/GreptimeTeam/greptimedb/pull/8111)
* feat: add InfluxDB default merge mode config by [@v0y4g3r](https://github.com/v0y4g3r) in [#8134](https://github.com/GreptimeTeam/greptimedb/pull/8134)
* feat: show sst primary key range in information_schema by [@MichaelScofield](https://github.com/MichaelScofield) in [#8137](https://github.com/GreptimeTeam/greptimedb/pull/8137)
* feat(meta-srv): add selector factory plugin hook by [@v0y4g3r](https://github.com/v0y4g3r) in [#8140](https://github.com/GreptimeTeam/greptimedb/pull/8140)
* feat: use and cache page index from sst meta  by [@waynexia](https://github.com/waynexia) in [#8139](https://github.com/GreptimeTeam/greptimedb/pull/8139)
* feat: inc query join rewrite helper by [@discord9](https://github.com/discord9) in [#8108](https://github.com/GreptimeTeam/greptimedb/pull/8108)
* feat: compact json2 data by [@MichaelScofield](https://github.com/MichaelScofield) in [#8103](https://github.com/GreptimeTeam/greptimedb/pull/8103)
* feat: merge files to add in one region edit by [@MichaelScofield](https://github.com/MichaelScofield) in [#8141](https://github.com/GreptimeTeam/greptimedb/pull/8141)
* feat: implement a cache for the prefilter by [@evenyag](https://github.com/evenyag) in [#8102](https://github.com/GreptimeTeam/greptimedb/pull/8102)
* feat: update some interceptor to carry more information by [@sunng87](https://github.com/sunng87) in [#8090](https://github.com/GreptimeTeam/greptimedb/pull/8090)
* feat(cli): add export-v2 delete command by [@fengjiachun](https://github.com/fengjiachun) in [#8162](https://github.com/GreptimeTeam/greptimedb/pull/8162)
* feat: initial implementation for range cache with time filters by [@evenyag](https://github.com/evenyag) in [#8130](https://github.com/GreptimeTeam/greptimedb/pull/8130)
* feat: add flow query-context plumbing for terminal watermarks by [@discord9](https://github.com/discord9) in [#8154](https://github.com/GreptimeTeam/greptimedb/pull/8154)
* feat: support alter table partition syntax by [@WenyXu](https://github.com/WenyXu) in [#8177](https://github.com/GreptimeTeam/greptimedb/pull/8177)
* feat: update project status and architecture by [@killme2008](https://github.com/killme2008) in [#8182](https://github.com/GreptimeTeam/greptimedb/pull/8182)
* feat(meta-srv): support repartition for unpartitioned tables by [@WenyXu](https://github.com/WenyXu) in [#8186](https://github.com/GreptimeTeam/greptimedb/pull/8186)
* feat(flow): support incremental read checkpoints by [@discord9](https://github.com/discord9) in [#8179](https://github.com/GreptimeTeam/greptimedb/pull/8179)
* feat: support pending flow metadata with defer_on_missing_source by [@discord9](https://github.com/discord9) in [#8124](https://github.com/GreptimeTeam/greptimedb/pull/8124)
* feat: global switch for creating tables automatically by [@killme2008](https://github.com/killme2008) in [#8203](https://github.com/GreptimeTeam/greptimedb/pull/8203)
* feat: table semantic layer identity (Phase 1) by [@killme2008](https://github.com/killme2008) in [#8210](https://github.com/GreptimeTeam/greptimedb/pull/8210)
* feat: check open region requirements by [@WenyXu](https://github.com/WenyXu) in [#8194](https://github.com/GreptimeTeam/greptimedb/pull/8194)
* feat(datanode): hold query permit for stream and expose limiter timeout by [@evenyag](https://github.com/evenyag) in [#8215](https://github.com/GreptimeTeam/greptimedb/pull/8215)
* feat: validate batching flow sink schema on create by [@discord9](https://github.com/discord9) in [#8176](https://github.com/GreptimeTeam/greptimedb/pull/8176)
* feat: support CSV copy skip bad records by [@QuakeWang](https://github.com/QuakeWang) in [#8198](https://github.com/GreptimeTeam/greptimedb/pull/8198)
* feat: look up cache with range calculation by [@waynexia](https://github.com/waynexia) in [#8123](https://github.com/GreptimeTeam/greptimedb/pull/8123)
* feat: join simplifier for promql binary op by [@waynexia](https://github.com/waynexia) in [#8211](https://github.com/GreptimeTeam/greptimedb/pull/8211)
* feat: support headerless CSV copy from by [@QuakeWang](https://github.com/QuakeWang) in [#8233](https://github.com/GreptimeTeam/greptimedb/pull/8233)
* feat: add remote dynamic filter frontend registration by [@discord9](https://github.com/discord9) in [#8148](https://github.com/GreptimeTeam/greptimedb/pull/8148)
* feat: table semantic layer per-table enrichment (Phase 2) by [@killme2008](https://github.com/killme2008) in [#8218](https://github.com/GreptimeTeam/greptimedb/pull/8218)
* feat: table semantic layer information_schema view (Phase 3) by [@killme2008](https://github.com/killme2008) in [#8240](https://github.com/GreptimeTeam/greptimedb/pull/8240)
* feat: identify noneffective binary modifiers by [@waynexia](https://github.com/waynexia) in [#8230](https://github.com/GreptimeTeam/greptimedb/pull/8230)
* feat: introduce plugin setup functions with richer context by [@sunng87](https://github.com/sunng87) in [#8256](https://github.com/GreptimeTeam/greptimedb/pull/8256)
* feat: pgwire 0.40 by [@sunng87](https://github.com/sunng87) in [#8257](https://github.com/GreptimeTeam/greptimedb/pull/8257)
* feat: fan out remote dynamic filter updates from FE by [@discord9](https://github.com/discord9) in [#8241](https://github.com/GreptimeTeam/greptimedb/pull/8241)
* feat: add information_schema statistics table by [@killme2008](https://github.com/killme2008) in [#8253](https://github.com/GreptimeTeam/greptimedb/pull/8253)
* feat: add tools for development by [@evenyag](https://github.com/evenyag) in [#8260](https://github.com/GreptimeTeam/greptimedb/pull/8260)
* feat: separate datanode query and ingestion runtimes by [@v0y4g3r](https://github.com/v0y4g3r) in [#8246](https://github.com/GreptimeTeam/greptimedb/pull/8246)
* feat: support remote WAL logical pruning by [@WenyXu](https://github.com/WenyXu) in [#8259](https://github.com/GreptimeTeam/greptimedb/pull/8259)
* feat: decouple region edit and compaction by [@MichaelScofield](https://github.com/MichaelScofield) in [#8272](https://github.com/GreptimeTeam/greptimedb/pull/8272)
* feat(cli): add export import progress abstraction by [@fengjiachun](https://github.com/fengjiachun) in [#8270](https://github.com/GreptimeTeam/greptimedb/pull/8270)
* feat: apply remote dynamic filters on datanode scans by [@discord9](https://github.com/discord9) in [#8262](https://github.com/GreptimeTeam/greptimedb/pull/8262)
* feat: json2 field access pushdown to parquet by [@MichaelScofield](https://github.com/MichaelScofield) in [#8267](https://github.com/GreptimeTeam/greptimedb/pull/8267)
* feat: pass snapshot read bounds over flight by [@discord9](https://github.com/discord9) in [#8279](https://github.com/GreptimeTeam/greptimedb/pull/8279)
* feat(security): add password verifier formats by [@killme2008](https://github.com/killme2008) in [#8251](https://github.com/GreptimeTeam/greptimedb/pull/8251)
* feat: flush hook extension point by [@sunng87](https://github.com/sunng87) in [#8145](https://github.com/GreptimeTeam/greptimedb/pull/8145)
* feat: add field_id for internal fields by [@sunng87](https://github.com/sunng87) in [#8284](https://github.com/GreptimeTeam/greptimedb/pull/8284)
* feat(cli): add import-v2 progress mode by [@fengjiachun](https://github.com/fengjiachun) in [#8283](https://github.com/GreptimeTeam/greptimedb/pull/8283)
* feat: support repartition with target partition columns by [@WenyXu](https://github.com/WenyXu) in [#8278](https://github.com/GreptimeTeam/greptimedb/pull/8278)
* feat(cli): add import-v2 progress UI by [@fengjiachun](https://github.com/fengjiachun) in [#8289](https://github.com/GreptimeTeam/greptimedb/pull/8289)
* feat: support create region requirements by [@WenyXu](https://github.com/WenyXu) in [#8281](https://github.com/GreptimeTeam/greptimedb/pull/8281)
* feat: add per-partition timings to merge scan partition metrics by [@evenyag](https://github.com/evenyag) in [#8293](https://github.com/GreptimeTeam/greptimedb/pull/8293)
* feat: add password hash generation command by [@killme2008](https://github.com/killme2008) in [#8288](https://github.com/GreptimeTeam/greptimedb/pull/8288)

### 🐛 Bug Fixes

* fix: nested projection missing roots by [@fengys1996](https://github.com/fengys1996) in [#7993](https://github.com/GreptimeTeam/greptimedb/pull/7993)
* fix: make sure interceptor is called for plan execution by [@sunng87](https://github.com/sunng87) in [#8041](https://github.com/GreptimeTeam/greptimedb/pull/8041)
* fix: win cli lock by [@fengjiachun](https://github.com/fengjiachun) in [#8049](https://github.com/GreptimeTeam/greptimedb/pull/8049)
* fix(mito): queue writes during region edit by [@v0y4g3r](https://github.com/v0y4g3r) in [#8079](https://github.com/GreptimeTeam/greptimedb/pull/8079)
* fix: revoke meta kv writes outside metasrv leader by [@QuakeWang](https://github.com/QuakeWang) in [#8060](https://github.com/GreptimeTeam/greptimedb/pull/8060)
* fix: remove unparsed [heartbeat] sections from node example configs by [@kimjune01](https://github.com/kimjune01) in [#8092](https://github.com/GreptimeTeam/greptimedb/pull/8092)
* fix(mito2): schema-safe inverted index pruning by [@fengys1996](https://github.com/fengys1996) in [#8089](https://github.com/GreptimeTeam/greptimedb/pull/8089)
* fix: add standalone flag in standalone tests by [@shuiyisong](https://github.com/shuiyisong) in [#8100](https://github.com/GreptimeTeam/greptimedb/pull/8100)
* fix: expose flight timestamp range metadata by [@v0y4g3r](https://github.com/v0y4g3r) in [#8104](https://github.com/GreptimeTeam/greptimedb/pull/8104)
* fix: stabilize ssts sqlness datetime redaction by [@fengjiachun](https://github.com/fengjiachun) in [#8110](https://github.com/GreptimeTeam/greptimedb/pull/8110)
* fix(mito): allow compaction publish during editing by [@v0y4g3r](https://github.com/v0y4g3r) in [#8097](https://github.com/GreptimeTeam/greptimedb/pull/8097)
* fix: classify WAL prune Kafka retry errors by [@WenyXu](https://github.com/WenyXu) in [#8119](https://github.com/GreptimeTeam/greptimedb/pull/8119)
* fix: optimize sorted run picking by [@v0y4g3r](https://github.com/v0y4g3r) in [#8128](https://github.com/GreptimeTeam/greptimedb/pull/8128)
* fix: flaky sqlness result ordering by [@fengys1996](https://github.com/fengys1996) in [#8136](https://github.com/GreptimeTeam/greptimedb/pull/8136)
* fix: skip flush when closing follower region by [@v0y4g3r](https://github.com/v0y4g3r) in [#8143](https://github.com/GreptimeTeam/greptimedb/pull/8143)
* fix: track INSERT SELECT in process manager by [@QuakeWang](https://github.com/QuakeWang) in [#8138](https://github.com/GreptimeTeam/greptimedb/pull/8138)
* fix: skip sst cache preload for staging manifest by [@WenyXu](https://github.com/WenyXu) in [#8147](https://github.com/GreptimeTeam/greptimedb/pull/8147)
* fix(mysql): infer LIMIT placeholders in prepare by [@discord9](https://github.com/discord9) in [#8149](https://github.com/GreptimeTeam/greptimedb/pull/8149)
* fix: reject physical metric table writes by [@WenyXu](https://github.com/WenyXu) in [#8153](https://github.com/GreptimeTeam/greptimedb/pull/8153)
* fix(mysql): keep unknown prepare placeholders by [@discord9](https://github.com/discord9) in [#8150](https://github.com/GreptimeTeam/greptimedb/pull/8150)
* fix: close heartbeat streams on metasrv leader stepdown by [@WenyXu](https://github.com/WenyXu) in [#8156](https://github.com/GreptimeTeam/greptimedb/pull/8156)
* fix: qualify HistogramFold schema by [@evenyag](https://github.com/evenyag) in [#8157](https://github.com/GreptimeTeam/greptimedb/pull/8157)
* fix: faster jieba by [@yihong0618](https://github.com/yihong0618) in [#8158](https://github.com/GreptimeTeam/greptimedb/pull/8158)
* fix(mito2): schema-safe skipping index pruning by [@fengys1996](https://github.com/fengys1996) in [#8122](https://github.com/GreptimeTeam/greptimedb/pull/8122)
* fix: update RPC bind address in README by [@rogierlommers](https://github.com/rogierlommers) in [#8168](https://github.com/GreptimeTeam/greptimedb/pull/8168)
* fix: divide series for subquery output by [@evenyag](https://github.com/evenyag) in [#8173](https://github.com/GreptimeTeam/greptimedb/pull/8173)
* fix: reset procedure manager state on stop by [@WenyXu](https://github.com/WenyXu) in [#8174](https://github.com/GreptimeTeam/greptimedb/pull/8174)
* fix(mito): count owned SSTs in region stats by [@WenyXu](https://github.com/WenyXu) in [#8191](https://github.com/GreptimeTeam/greptimedb/pull/8191)
* fix: classify InsertInto as write request by [@waynexia](https://github.com/waynexia) in [#8200](https://github.com/GreptimeTeam/greptimedb/pull/8200)
* fix(flow): harden incremental read correctness by [@discord9](https://github.com/discord9) in [#8196](https://github.com/GreptimeTeam/greptimedb/pull/8196)
* fix: nightly jsonbench test by [@MichaelScofield](https://github.com/MichaelScofield) in [#8212](https://github.com/GreptimeTeam/greptimedb/pull/8212)
* fix: format detected IPv6 grpc address by [@WenyXu](https://github.com/WenyXu) in [#8221](https://github.com/GreptimeTeam/greptimedb/pull/8221)
* fix: run eval-interval flow without time window by [@discord9](https://github.com/discord9) in [#8231](https://github.com/GreptimeTeam/greptimedb/pull/8231)
* fix: align bulk insert schema handling by [@v0y4g3r](https://github.com/v0y4g3r) in [#8222](https://github.com/GreptimeTeam/greptimedb/pull/8222)
* fix: improve remote WAL replay checkpoint handling by [@WenyXu](https://github.com/WenyXu) in [#8225](https://github.com/GreptimeTeam/greptimedb/pull/8225)
* fix: avoid stale metadata cache after invalidation by [@WenyXu](https://github.com/WenyXu) in [#8235](https://github.com/GreptimeTeam/greptimedb/pull/8235)
* fix: reset region detector after migration by [@WenyXu](https://github.com/WenyXu) in [#8234](https://github.com/GreptimeTeam/greptimedb/pull/8234)
* fix: accept JSONB OTLP logs against existing schema by [@v0y4g3r](https://github.com/v0y4g3r) in [#8250](https://github.com/GreptimeTeam/greptimedb/pull/8250)
* fix(flow): support complex SQL full-query flows by [@discord9](https://github.com/discord9) in [#8242](https://github.com/GreptimeTeam/greptimedb/pull/8242)
* fix(config): align scan memory limit default with code by [@fengjiachun](https://github.com/fengjiachun) in [#8228](https://github.com/GreptimeTeam/greptimedb/pull/8228)
* fix(ci): retry repartition chaos row validation by [@WenyXu](https://github.com/WenyXu) in [#8271](https://github.com/GreptimeTeam/greptimedb/pull/8271)
* fix: pin tonic below 0.14.5 to avoid max connection age panic (#8265) by [@evenyag](https://github.com/evenyag) in [#8287](https://github.com/GreptimeTeam/greptimedb/pull/8287)
* fix(mito): collect index apply metrics in pruner verbose mode by [@evenyag](https://github.com/evenyag) in [#8290](https://github.com/GreptimeTeam/greptimedb/pull/8290)

### 🚜 Refactor

* refactor(mito2): remove dead scan code by [@evenyag](https://github.com/evenyag) in [#7925](https://github.com/GreptimeTeam/greptimedb/pull/7925)
* refactor: introduce the ProjectInput structure by [@fengys1996](https://github.com/fengys1996) in [#7908](https://github.com/GreptimeTeam/greptimedb/pull/7908)
* refactor(mito): remove `Compactor::compact` method by [@v0y4g3r](https://github.com/v0y4g3r) in [#7968](https://github.com/GreptimeTeam/greptimedb/pull/7968)
* refactor(mito2): remove PrimaryKey variants by [@evenyag](https://github.com/evenyag) in [#7982](https://github.com/GreptimeTeam/greptimedb/pull/7982)
* refactor: update SqlPlan for more cleaner variants by [@sunng87](https://github.com/sunng87) in [#7966](https://github.com/GreptimeTeam/greptimedb/pull/7966)
* refactor: unify frontend discovery with active peer discovery by [@WenyXu](https://github.com/WenyXu) in [#8031](https://github.com/GreptimeTeam/greptimedb/pull/8031)
* refactor(mito2): reshape extension range API by [@evenyag](https://github.com/evenyag) in [#8004](https://github.com/GreptimeTeam/greptimedb/pull/8004)
* refactor: make InsertForwarder use shared metasrv database operator by [@WenyXu](https://github.com/WenyXu) in [#8033](https://github.com/GreptimeTeam/greptimedb/pull/8033)
* refactor: make `json_get` adapted with JSON2 by [@MichaelScofield](https://github.com/MichaelScofield) in [#8043](https://github.com/GreptimeTeam/greptimedb/pull/8043)
* refactor: propagate flush reasons through FlushRegions path by [@QuakeWang](https://github.com/QuakeWang) in [#8051](https://github.com/GreptimeTeam/greptimedb/pull/8051)
* refactor: extract functions for building mysql/pg's kvbackend and electionref by [@shuiyisong](https://github.com/shuiyisong) in [#8076](https://github.com/GreptimeTeam/greptimedb/pull/8076)
* refactor: store the schema of flat source by [@MichaelScofield](https://github.com/MichaelScofield) in [#8091](https://github.com/GreptimeTeam/greptimedb/pull/8091)
* refactor: remove async file reader adapter layer by [@waynexia](https://github.com/waynexia) in [#8120](https://github.com/GreptimeTeam/greptimedb/pull/8120)
* refactor: use node info for active discovery by [@WenyXu](https://github.com/WenyXu) in [#8121](https://github.com/GreptimeTeam/greptimedb/pull/8121)
* refactor: clarify region flush reasons by [@WenyXu](https://github.com/WenyXu) in [#8146](https://github.com/GreptimeTeam/greptimedb/pull/8146)
* refactor: use structured pusher key by [@WenyXu](https://github.com/WenyXu) in [#8155](https://github.com/GreptimeTeam/greptimedb/pull/8155)
* refactor: split repartition region descriptors by [@WenyXu](https://github.com/WenyXu) in [#8172](https://github.com/GreptimeTeam/greptimedb/pull/8172)
* refactor: use last compaction scheduled time instead of finished time by [@MichaelScofield](https://github.com/MichaelScofield) in [#8190](https://github.com/GreptimeTeam/greptimedb/pull/8190)
* refactor: optimize compaction's pick time by [@MichaelScofield](https://github.com/MichaelScofield) in [#8197](https://github.com/GreptimeTeam/greptimedb/pull/8197)
* refactor: give instance to start plugin functions by [@sunng87](https://github.com/sunng87) in [#8208](https://github.com/GreptimeTeam/greptimedb/pull/8208)
* refactor(cli): split export-v2 verify into plan/scan/reconcile by [@fengjiachun](https://github.com/fengjiachun) in [#8206](https://github.com/GreptimeTeam/greptimedb/pull/8206)
* refactor: streamline pipeline ingestion row building by [@shuiyisong](https://github.com/shuiyisong) in [#8236](https://github.com/GreptimeTeam/greptimedb/pull/8236)
* refactor: loki ingestion by [@shuiyisong](https://github.com/shuiyisong) in [#8266](https://github.com/GreptimeTeam/greptimedb/pull/8266)
* refactor(cli): stream export-v2 verify data listing by [@fengjiachun](https://github.com/fengjiachun) in [#8268](https://github.com/GreptimeTeam/greptimedb/pull/8268)
* refactor: skip prefilter for expr with functions by [@MichaelScofield](https://github.com/MichaelScofield) in [#8280](https://github.com/GreptimeTeam/greptimedb/pull/8280)

### 📚 Documentation

* docs: rfc for remote dyn filter by [@discord9](https://github.com/discord9) in [#7931](https://github.com/GreptimeTeam/greptimedb/pull/7931)
* docs: update project status by [@killme2008](https://github.com/killme2008) in [#7976](https://github.com/GreptimeTeam/greptimedb/pull/7976)

### ⚡ Performance

* perf: optimize extrapolated rate op family by [@waynexia](https://github.com/waynexia) in [#7880](https://github.com/GreptimeTeam/greptimedb/pull/7880)
* perf: join metrics tables on the tsid key whenever possible by [@waynexia](https://github.com/waynexia) in [#7927](https://github.com/GreptimeTeam/greptimedb/pull/7927)
* perf(mito-codec): optimize SparseValues decode and lookup by [@evenyag](https://github.com/evenyag) in [#8057](https://github.com/GreptimeTeam/greptimedb/pull/8057)
* perf(mito): split record batches on equal timestamps by [@evenyag](https://github.com/evenyag) in [#8163](https://github.com/GreptimeTeam/greptimedb/pull/8163)
* perf: collect narrow binary join by [@waynexia](https://github.com/waynexia) in [#8193](https://github.com/GreptimeTeam/greptimedb/pull/8193)
* perf: read primary key as binary if it overflows the dictionary by [@evenyag](https://github.com/evenyag) in [#8187](https://github.com/GreptimeTeam/greptimedb/pull/8187)
* perf(mito): cached-size single-pass WAL entry encoder by [@lyang24](https://github.com/lyang24) in [#8254](https://github.com/GreptimeTeam/greptimedb/pull/8254)

### 🧪 Testing

* test: add repartition chaos target by [@WenyXu](https://github.com/WenyXu) in [#7924](https://github.com/GreptimeTeam/greptimedb/pull/7924)
* test(cli): harden import state lock test by [@fengjiachun](https://github.com/fengjiachun) in [#8030](https://github.com/GreptimeTeam/greptimedb/pull/8030)
* test: use standalone flag in test by [@shuiyisong](https://github.com/shuiyisong) in [#8068](https://github.com/GreptimeTeam/greptimedb/pull/8068)
* test: cover standalone user provider config by [@Detachm](https://github.com/Detachm) in [#8067](https://github.com/GreptimeTeam/greptimedb/pull/8067)
* test: verify KILL cancels INSERT SELECT by [@QuakeWang](https://github.com/QuakeWang) in [#8151](https://github.com/GreptimeTeam/greptimedb/pull/8151)
* test: add jsonbench tests by [@MichaelScofield](https://github.com/MichaelScofield) in [#8165](https://github.com/GreptimeTeam/greptimedb/pull/8165)
* test: fuzz unpartitioned repartition by [@WenyXu](https://github.com/WenyXu) in [#8195](https://github.com/GreptimeTeam/greptimedb/pull/8195)
* test: move CSV skip bad records coverage to integration by [@WenyXu](https://github.com/WenyXu) in [#8237](https://github.com/GreptimeTeam/greptimedb/pull/8237)
* test: add rebuild index coverage by [@discord9](https://github.com/discord9) in [#8175](https://github.com/GreptimeTeam/greptimedb/pull/8175)
* test: redact dynamic filter in order_by sqlness by [@discord9](https://github.com/discord9) in [#8286](https://github.com/GreptimeTeam/greptimedb/pull/8286)

### ⚙️ Miscellaneous Tasks

* chore: move Tantivy fulltext search to blocking thread pool by [@lyang24](https://github.com/lyang24) in [#7919](https://github.com/GreptimeTeam/greptimedb/pull/7919)
* ci: add standalone workflows for bumping helm charts and homebrew by [@evenyag](https://github.com/evenyag) in [#7941](https://github.com/GreptimeTeam/greptimedb/pull/7941)
* chore: add build info in panic message by [@v0y4g3r](https://github.com/v0y4g3r) in [#8000](https://github.com/GreptimeTeam/greptimedb/pull/8000)
* chore: update the opendal to 0.56 rc2 by [@shuiyisong](https://github.com/shuiyisong) in [#8003](https://github.com/GreptimeTeam/greptimedb/pull/8003)
* chore: sqlness redact datetime by [@discord9](https://github.com/discord9) in [#8058](https://github.com/GreptimeTeam/greptimedb/pull/8058)
* chore: add trait for creating meta kvbackend in standalone by [@shuiyisong](https://github.com/shuiyisong) in [#8063](https://github.com/GreptimeTeam/greptimedb/pull/8063)
* chore: update opendal's version to official 0.56 by [@shuiyisong](https://github.com/shuiyisong) in [#8069](https://github.com/GreptimeTeam/greptimedb/pull/8069)
* chore: wrap standalone runtime with trait by [@shuiyisong](https://github.com/shuiyisong) in [#8083](https://github.com/GreptimeTeam/greptimedb/pull/8083)
* chore: update dashboard by [@WenyXu](https://github.com/WenyXu) in [#8098](https://github.com/GreptimeTeam/greptimedb/pull/8098)
* chore: update dashboards by [@WenyXu](https://github.com/WenyXu) in [#8106](https://github.com/GreptimeTeam/greptimedb/pull/8106)
* chore: use opendal main branch by [@shuiyisong](https://github.com/shuiyisong) in [#8118](https://github.com/GreptimeTeam/greptimedb/pull/8118)
* chore: bump version to v1.1.0 by [@evenyag](https://github.com/evenyag) in [#8131](https://github.com/GreptimeTeam/greptimedb/pull/8131)
* chore: pub some functions by [@MichaelScofield](https://github.com/MichaelScofield) in [#8133](https://github.com/GreptimeTeam/greptimedb/pull/8133)
* chore: introduce user cache invalidation api by [@shuiyisong](https://github.com/shuiyisong) in [#8129](https://github.com/GreptimeTeam/greptimedb/pull/8129)
* ci: add PostgreSQL and MySQL dependency setup steps to sqlness job by [@Copilot](https://github.com/Copilot) in [#8185](https://github.com/GreptimeTeam/greptimedb/pull/8185)
* chore: add `LeaderServicesContext` control to standalone by [@shuiyisong](https://github.com/shuiyisong) in [#8164](https://github.com/GreptimeTeam/greptimedb/pull/8164)
* chore: expose region info inspection table by [@v0y4g3r](https://github.com/v0y4g3r) in [#8178](https://github.com/GreptimeTeam/greptimedb/pull/8178)
* ci: add nightly jsonbench test by [@MichaelScofield](https://github.com/MichaelScofield) in [#7750](https://github.com/GreptimeTeam/greptimedb/pull/7750)
* chore: update opendal to 0.57 by [@shuiyisong](https://github.com/shuiyisong) in [#8204](https://github.com/GreptimeTeam/greptimedb/pull/8204)
* chore: update vrl to 0.33 by [@shuiyisong](https://github.com/shuiyisong) in [#8219](https://github.com/GreptimeTeam/greptimedb/pull/8219)
* chore: remove `HttpConfigurator` by [@shuiyisong](https://github.com/shuiyisong) in [#8224](https://github.com/GreptimeTeam/greptimedb/pull/8224)
* ci: update arm64 runner by [@daviderli614](https://github.com/daviderli614) in [#8226](https://github.com/GreptimeTeam/greptimedb/pull/8226)
* chore: align OTLP logs with existing table schemas by [@shuiyisong](https://github.com/shuiyisong) in [#8229](https://github.com/GreptimeTeam/greptimedb/pull/8229)
* ci: revert arm64 runner default to 4xlarge by [@evenyag](https://github.com/evenyag) in [#8243](https://github.com/GreptimeTeam/greptimedb/pull/8243)
* chore: remove auth in flownode by [@shuiyisong](https://github.com/shuiyisong) in [#8244](https://github.com/GreptimeTeam/greptimedb/pull/8244)
* chore: add repartition debug logs by [@WenyXu](https://github.com/WenyXu) in [#8245](https://github.com/GreptimeTeam/greptimedb/pull/8245)
* chore: Increase GreptimeDB cluster setup timeout for distributed fuzz CI by [@Copilot](https://github.com/Copilot) in [#8263](https://github.com/GreptimeTeam/greptimedb/pull/8263)
* ci: notify jsonbench result by [@MichaelScofield](https://github.com/MichaelScofield) in [#8273](https://github.com/GreptimeTeam/greptimedb/pull/8273)
* chore: load page index in opener by [@evenyag](https://github.com/evenyag) in [#8269](https://github.com/GreptimeTeam/greptimedb/pull/8269)

### RFC

* RFC: Table Semantic Layer by [@killme2008](https://github.com/killme2008) in [#8199](https://github.com/GreptimeTeam/greptimedb/pull/8199)

## New Contributors

* [@QuakeWang](https://github.com/QuakeWang) made their first contribution in [#8233](https://github.com/GreptimeTeam/greptimedb/pull/8233)
* [@rogierlommers](https://github.com/rogierlommers) made their first contribution in [#8168](https://github.com/GreptimeTeam/greptimedb/pull/8168)
* [@kimjune01](https://github.com/kimjune01) made their first contribution in [#8092](https://github.com/GreptimeTeam/greptimedb/pull/8092)
* [@Detachm](https://github.com/Detachm) made their first contribution in [#8067](https://github.com/GreptimeTeam/greptimedb/pull/8067)
* [@onepizzateam](https://github.com/onepizzateam) made their first contribution in [#8027](https://github.com/GreptimeTeam/greptimedb/pull/8027)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@Copilot](https://github.com/Copilot), [@daviderli614](https://github.com/daviderli614), [@Detachm](https://github.com/Detachm), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@fengys1996](https://github.com/fengys1996), [@killme2008](https://github.com/killme2008), [@kimjune01](https://github.com/kimjune01), [@lyang24](https://github.com/lyang24), [@MichaelScofield](https://github.com/MichaelScofield), [@onepizzateam](https://github.com/onepizzateam), [@QuakeWang](https://github.com/QuakeWang), [@rogierlommers](https://github.com/rogierlommers), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@WenyXu](https://github.com/WenyXu), [@yihong0618](https://github.com/yihong0618), [@ZonaHex](https://github.com/ZonaHex)
