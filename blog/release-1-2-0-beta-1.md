---
keywords: [release, GreptimeDB, changelog, v1.2.0-beta.1]
description: GreptimeDB v1.2.0-beta.1 Changelog
date: 2026-07-31
---

# v1.2.0-beta.1

Release date: July 31, 2026

GreptimeDB v1.2.0-beta.1 is the first beta of the v1.2 line. It brings the JSON2 type system to maturity, large query performance improvements via dictionary-encoded series keys, soft-drop table lifecycle management, Prometheus Remote Write v2 native histogram support, and a large set of correctness and stability fixes.

### 👍 Highlights

- **JSON2 type system maturity** — Variant payloads are now encoded as JSONB instead of serde JSON bytes, with type hints, write-time validation (rejecting non-object values and validating append mode), and a fix for selecting whole JSON2 columns ([#8247](https://github.com/GreptimeTeam/greptimedb/pull/8247), [#8381](https://github.com/GreptimeTeam/greptimedb/pull/8381), [#8434](https://github.com/GreptimeTeam/greptimedb/pull/8434), [#8435](https://github.com/GreptimeTeam/greptimedb/pull/8435), [#8683](https://github.com/GreptimeTeam/greptimedb/pull/8683)).

  ```sql
  CREATE TABLE t (id INT, doc JSON2);
  INSERT INTO t VALUES (1, '{"a": 1, "b": [1, 2]}');
  SELECT doc FROM t;  -- returns the full JSON document
  ```

- **Faster queries with dictionary-encoded series keys** — In-memory primary key columns now use dictionary arrays to alleviate series key expansion, gaining ~24% end-to-end query performance ([#8541](https://github.com/GreptimeTeam/greptimedb/pull/8541)); dictionary-encoded regex filters also get correct semantics and the fast path back ([#8688](https://github.com/GreptimeTeam/greptimedb/pull/8688)).

  ```sql
  SELECT * FROM metrics WHERE job = 'node' AND path ~ '/api/.*';
  -- regex filters on dictionary-encoded columns are now semantically correct and fast
  ```

- **Soft-drop table lifecycle with `UNDROP TABLE`** — `DROP TABLE` is now a soft delete: the table enters a recycle bin and can be restored with `UNDROP TABLE` before the retention period expires ([#8546](https://github.com/GreptimeTeam/greptimedb/pull/8546), [#8554](https://github.com/GreptimeTeam/greptimedb/pull/8554)), with retention-based GC ([#8526](https://github.com/GreptimeTeam/greptimedb/pull/8526)), offline cleanup ([#8458](https://github.com/GreptimeTeam/greptimedb/pull/8458)), and WAL retirement ([#8475](https://github.com/GreptimeTeam/greptimedb/pull/8475)).

  ```sql
  DROP TABLE t;  -- soft delete: data is reclaimable instead of immediately physically removed
  ```

- **Prometheus Remote Write v2 with native histograms** — Support for the Remote Write v2 protocol ([#8361](https://github.com/GreptimeTeam/greptimedb/pull/8361)), persistence and validation of native histograms ([#8382](https://github.com/GreptimeTeam/greptimedb/pull/8382), [#8654](https://github.com/GreptimeTeam/greptimedb/pull/8654)), and PromQL native histogram functions ([#8664](https://github.com/GreptimeTeam/greptimedb/pull/8664)).

  ```text
  remote_write:
    - url: http://greptimedb:4000/v1/prometheus/write
  ```

- **RangeSelect projection pruning** — Range queries now prune unused input columns before the RangeSelect plan, reducing scanned columns and I/O ([#8570](https://github.com/GreptimeTeam/greptimedb/pull/8570)).

  ```sql
  EXPLAIN SELECT ts, value FROM metrics WHERE ts > now() - INTERVAL '1 hour';
  -- only the needed columns are scanned
  ```

- **Parallel, resumable export/import v2** — The snapshot-based export/import v2 gained concurrent chunk export (`--chunk-parallelism`), parallel import tasks (`--task-parallelism`), progress reporting (`--progress`), and resume: re-running the same command skips completed chunks and tasks instead of starting over. See the [export/import v2 guide](https://docs.greptime.com/user-guide/deployments-administration/disaster-recovery/export-import-v2).

  ```bash
  greptime cli export --v2 --progress   # parallel chunks with progress reporting
  ```

### Dashboard

The bundled GreptimeDB dashboard was updated to **v0.13.10**:

- Save dashboards as self-contained **snapshots** (time range, variables, and panel data) that open read-only without querying live data sources ([dashboard#627](https://github.com/GreptimeTeam/dashboard/pull/627)).
- Result tables support **column resizing** for easier inspection, including trace queries, with a dedicated table resize mode ([dashboard#628](https://github.com/GreptimeTeam/dashboard/pull/628), [#632](https://github.com/GreptimeTeam/dashboard/pull/632), [#635](https://github.com/GreptimeTeam/dashboard/pull/635), [#636](https://github.com/GreptimeTeam/dashboard/pull/636)).
- New prominent **support menu** and refreshed icon/status styling ([dashboard#629](https://github.com/GreptimeTeam/dashboard/pull/629)).
- PromQL editor fixes (query header, Prometheus plugin sync) and all supported Perses plugins ([dashboard#630](https://github.com/GreptimeTeam/dashboard/pull/630), [#631](https://github.com/GreptimeTeam/dashboard/pull/631), [#633](https://github.com/GreptimeTeam/dashboard/pull/633)).
- Virtual-list logs show a tip for hidden columns; SQL editor executes correctly when the cursor is after a SQL line ([dashboard#637](https://github.com/GreptimeTeam/dashboard/pull/637), [#622](https://github.com/GreptimeTeam/dashboard/pull/622)).

### Breaking changes

* fix!: sandbox SQL local filesystem access by [@fengjiachun](https://github.com/fengjiachun) in [#8708](https://github.com/GreptimeTeam/greptimedb/pull/8708)
* chore!: update promql-parser to v0.10.0, remove `holt_winters` by [@shuiyisong](https://github.com/shuiyisong) in [#8457](https://github.com/GreptimeTeam/greptimedb/pull/8457)
* feat!: remove configuration of sparse_primary_key_encoding by [@sunng87](https://github.com/sunng87) in [#8470](https://github.com/GreptimeTeam/greptimedb/pull/8470)
* fix(pipeline)!: check integer narrowing by [@discord9](https://github.com/discord9) in [#8589](https://github.com/GreptimeTeam/greptimedb/pull/8589)

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
* feat(flow): stabilize eval interval scheduling by [@discord9](https://github.com/discord9) in [#8360](https://github.com/GreptimeTeam/greptimedb/pull/8360)
* feat(json2): type hint by [@fengys1996](https://github.com/fengys1996) in [#8247](https://github.com/GreptimeTeam/greptimedb/pull/8247)
* feat: support table-level auto_flush_interval by [@raphaelroshan](https://github.com/raphaelroshan) in [#8357](https://github.com/GreptimeTeam/greptimedb/pull/8357)
* feat: support structured instruction reply errors by [@WenyXu](https://github.com/WenyXu) in [#8335](https://github.com/GreptimeTeam/greptimedb/pull/8335)
* feat(json2): reject non-object JSON values on write by [@fengys1996](https://github.com/fengys1996) in [#8381](https://github.com/GreptimeTeam/greptimedb/pull/8381)
* feat: stream explain analyze metrics over http by [@discord9](https://github.com/discord9) in [#8380](https://github.com/GreptimeTeam/greptimedb/pull/8380)
* feat: report region query stats in heartbeat by [@WenyXu](https://github.com/WenyXu) in [#8401](https://github.com/GreptimeTeam/greptimedb/pull/8401)
* feat: add query regression perf harness by [@discord9](https://github.com/discord9) in [#8406](https://github.com/GreptimeTeam/greptimedb/pull/8406)
* feat: add soft-drop table recovery procedures by [@v0y4g3r](https://github.com/v0y4g3r) in [#8061](https://github.com/GreptimeTeam/greptimedb/pull/8061)
* feat: persist Prometheus remote write v2 native histograms by [@shuiyisong](https://github.com/shuiyisong) in [#8382](https://github.com/GreptimeTeam/greptimedb/pull/8382)
* feat(query): add runtime provider interface by [@discord9](https://github.com/discord9) in [#8386](https://github.com/GreptimeTeam/greptimedb/pull/8386)
* feat: support ALTER TABLE SET auto_flush_interval by [@srivtx](https://github.com/srivtx) in [#8403](https://github.com/GreptimeTeam/greptimedb/pull/8403)
* feat: add Prom remote-write query regression scenario by [@discord9](https://github.com/discord9) in [#8413](https://github.com/GreptimeTeam/greptimedb/pull/8413)
* feat(json2): validate append mode for tables with JSON2 columns by [@fengys1996](https://github.com/fengys1996) in [#8434](https://github.com/GreptimeTeam/greptimedb/pull/8434)
* feat(json2): encode json2 variant payloads as jsonb by [@fengys1996](https://github.com/fengys1996) in [#8435](https://github.com/GreptimeTeam/greptimedb/pull/8435)
* feat: add fuzz CI failure investigation skill by [@WenyXu](https://github.com/WenyXu) in [#8456](https://github.com/GreptimeTeam/greptimedb/pull/8456)
* feat: add strict CSV header validation by [@QuakeWang](https://github.com/QuakeWang) in [#8426](https://github.com/GreptimeTeam/greptimedb/pull/8426)
* feat: more region lifecycle hooks by [@sunng87](https://github.com/sunng87) in [#8467](https://github.com/GreptimeTeam/greptimedb/pull/8467)
* feat: prepare soft-drop WAL retirement by [@v0y4g3r](https://github.com/v0y4g3r) in [#8475](https://github.com/GreptimeTeam/greptimedb/pull/8475)
* feat: clean up soft-dropped regions offline by [@v0y4g3r](https://github.com/v0y4g3r) in [#8458](https://github.com/GreptimeTeam/greptimedb/pull/8458)
* feat: enlarge file meta cache by [@waynexia](https://github.com/waynexia) in [#8499](https://github.com/GreptimeTeam/greptimedb/pull/8499)
* feat: support per-region write buffer limits by [@evenyag](https://github.com/evenyag) in [#8473](https://github.com/GreptimeTeam/greptimedb/pull/8473)
* feat: support SCRAM auth for Postgres by [@killme2008](https://github.com/killme2008) in [#8304](https://github.com/GreptimeTeam/greptimedb/pull/8304)
* feat(meta): add retention GC for soft-dropped tables by [@v0y4g3r](https://github.com/v0y4g3r) in [#8526](https://github.com/GreptimeTeam/greptimedb/pull/8526)
* feat: support soft-drop recycle bin and UNDROP TABLE by [@v0y4g3r](https://github.com/v0y4g3r) in [#8546](https://github.com/GreptimeTeam/greptimedb/pull/8546)
* feat: support splunk HEC raw endpoint by [@agrawalx](https://github.com/agrawalx) in [#8491](https://github.com/GreptimeTeam/greptimedb/pull/8491)
* feat: enable soft-drop table lifecycle by [@v0y4g3r](https://github.com/v0y4g3r) in [#8554](https://github.com/GreptimeTeam/greptimedb/pull/8554)
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

### 🐛 Bug Fixes

* fix(metric-engine): report query load under physical region id by [@v0y4g3r](https://github.com/v0y4g3r) in [#8355](https://github.com/GreptimeTeam/greptimedb/pull/8355)
* fix(mito): failed to compact memtable with json2 by [@fengys1996](https://github.com/fengys1996) in [#8297](https://github.com/GreptimeTeam/greptimedb/pull/8297)
* fix(flow): bind scheduled now in dist plan by [@discord9](https://github.com/discord9) in [#8389](https://github.com/GreptimeTeam/greptimedb/pull/8389)
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

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@BootstrapperSBL](https://github.com/BootstrapperSBL), [@MichaelScofield](https://github.com/MichaelScofield), [@QuakeWang](https://github.com/QuakeWang), [@WenyXu](https://github.com/WenyXu), [@ZonaHex](https://github.com/ZonaHex), [@agrawalx](https://github.com/agrawalx), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@fengys1996](https://github.com/fengys1996), [@killme2008](https://github.com/killme2008), [@lyang24](https://github.com/lyang24), [@raphaelroshan](https://github.com/raphaelroshan), [@shuiyisong](https://github.com/shuiyisong), [@srivtx](https://github.com/srivtx), [@sunchanglong](https://github.com/sunchanglong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia)
