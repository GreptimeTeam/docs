---
keywords: [release, GreptimeDB, changelog, v1.3.0-alpha.1]
description: GreptimeDB v1.3.0-alpha.1 Changelog
date: 2026-09-03
---

# v1.3.0-alpha.1

Release date: September 03, 2026

GreptimeDB v1.3.0-alpha.1 adds end-to-end Native Histogram support, a telemetry entity-relationships graph, and Dashboard updates for early validation.

### 👍 Highlights

- **Native Histograms.** PromQL now supports Native Histogram selection, range functions, vector operations, aggregations, metadata, and Prometheus HTTP responses. For example:

  ```promql
  sum by (job) (rate(http_request_duration_seconds[5m]))
  ```

- **Telemetry entity relationships graph.** GreptimeDB derives service-call relationships from OTLP traces at query time. To add application entities, declare their identity columns on the source table:

  ```sql
  ALTER TABLE app_metrics SET
    'greptime.semantic.entity.service.id' = 'service_name',
    'greptime.semantic.entity.service.scope' = 'env';
  ```

  To maintain dependencies that traces do not observe, insert a declared edge:

  ```sql
  INSERT INTO greptime_private.semantic_relationships_declared
    (observed_at, src_type, src_id, rel_type, dst_type, dst_id,
     provenance, scope, generation_id, confidence)
  VALUES
    (now(), 'service', 'frontend', 'depends_on', 'service', 'users-db',
     'declared', '', '', 1.0);
  ```

  Query derived and declared relationships together from
  `greptime_private.semantic_relationships`.

- **Dashboard.** Bundled Dashboard v0.13.14 adds full snapshot export and configurable table widths, and updates Perses to v0.54.

### Breaking changes

* refactor!: move native histogram config and `prom_validation_mode` to prom_store by [@shuiyisong](https://github.com/shuiyisong) in [#8744](https://github.com/GreptimeTeam/greptimedb/pull/8744)
* perf(servers)!: speed up Prometheus JSON response building with ryu and per-series entry reuse by [@discord9](https://github.com/discord9) in [#8815](https://github.com/GreptimeTeam/greptimedb/pull/8815)
* feat!: stabilize streaming analyze metrics by [@discord9](https://github.com/discord9) in [#8966](https://github.com/GreptimeTeam/greptimedb/pull/8966)

### 🚀 Features

* feat(query): plan native histogram functions by [@shuiyisong](https://github.com/shuiyisong) in [#8705](https://github.com/GreptimeTeam/greptimedb/pull/8705)
* feat(logging): add enable_file_logging option to disable file logging by [@xhwhis](https://github.com/xhwhis) in [#8721](https://github.com/GreptimeTeam/greptimedb/pull/8721)
* feat(function): add json_object_keys scalar function by [@xhwhis](https://github.com/xhwhis) in [#8722](https://github.com/GreptimeTeam/greptimedb/pull/8722)
* feat: update dashboard to v0.13.11 by [@sunchanglong](https://github.com/sunchanglong) in [#8737](https://github.com/GreptimeTeam/greptimedb/pull/8737)
* feat: add health-aware gRPC client routing by [@WenyXu](https://github.com/WenyXu) in [#8684](https://github.com/GreptimeTeam/greptimedb/pull/8684)
* feat(grafana): add events dashboard by [@WenyXu](https://github.com/WenyXu) in [#8725](https://github.com/GreptimeTeam/greptimedb/pull/8725)
* feat: add admin function registrar by [@fengjiachun](https://github.com/fengjiachun) in [#8762](https://github.com/GreptimeTeam/greptimedb/pull/8762)
* feat(promql): define native histogram semantics by [@shuiyisong](https://github.com/shuiyisong) in [#8758](https://github.com/GreptimeTeam/greptimedb/pull/8758)
* feat: support enabling skip_wal with ALTER TABLE by [@fengjiachun](https://github.com/fengjiachun) in [#8730](https://github.com/GreptimeTeam/greptimedb/pull/8730)
* feat(mito2): add range-based metric series reader by [@evenyag](https://github.com/evenyag) in [#8703](https://github.com/GreptimeTeam/greptimedb/pull/8703)
* feat: read-time entity relationships graph over telemetry (M0+M1) by [@killme2008](https://github.com/killme2008) in [#8614](https://github.com/GreptimeTeam/greptimedb/pull/8614)
* feat(protocol): validate native histogram ingestion by [@shuiyisong](https://github.com/shuiyisong) in [#8775](https://github.com/GreptimeTeam/greptimedb/pull/8775)
* feat: support generic heartbeat response extension accumulation by [@fengjiachun](https://github.com/fengjiachun) in [#8786](https://github.com/GreptimeTeam/greptimedb/pull/8786)
* feat: support old-stage datanode config overlays by [@discord9](https://github.com/discord9) in [#8647](https://github.com/GreptimeTeam/greptimedb/pull/8647)
* feat: update opentelemetry family to 0.32 series by [@sunng87](https://github.com/sunng87) in [#8776](https://github.com/GreptimeTeam/greptimedb/pull/8776)
* feat: add riscv64 cross-build support by [@v0y4g3r](https://github.com/v0y4g3r) in [#8820](https://github.com/GreptimeTeam/greptimedb/pull/8820)
* feat(auth): support HTTP bearer-token authentication by [@sunng87](https://github.com/sunng87) in [#8719](https://github.com/GreptimeTeam/greptimedb/pull/8719)
* feat(promql): support mixed sample ranges by [@shuiyisong](https://github.com/shuiyisong) in [#8784](https://github.com/GreptimeTeam/greptimedb/pull/8784)
* feat: declared edges and the derivation contract for the entity graph by [@killme2008](https://github.com/killme2008) in [#8794](https://github.com/GreptimeTeam/greptimedb/pull/8794)
* feat(servers): stamp prometheus remote write v2 metadata as semantic table options by [@killme2008](https://github.com/killme2008) in [#8797](https://github.com/GreptimeTeam/greptimedb/pull/8797)
* feat(promql): support native histogram vector operators by [@shuiyisong](https://github.com/shuiyisong) in [#8798](https://github.com/GreptimeTeam/greptimedb/pull/8798)
* feat: complete the derived-edge vocabulary of the entity graph by [@killme2008](https://github.com/killme2008) in [#8836](https://github.com/GreptimeTeam/greptimedb/pull/8836)
* feat(servers): expose native histograms over Prometheus HTTP by [@shuiyisong](https://github.com/shuiyisong) in [#8850](https://github.com/GreptimeTeam/greptimedb/pull/8850)
* feat(promql): support native histogram aggregations by [@shuiyisong](https://github.com/shuiyisong) in [#8848](https://github.com/GreptimeTeam/greptimedb/pull/8848)
* feat: embedded convention pack for the entity graph (prom/k8s, gen_ai naming) by [@killme2008](https://github.com/killme2008) in [#8854](https://github.com/GreptimeTeam/greptimedb/pull/8854)
* feat(mito2): introduce two-phase metric series scans by [@evenyag](https://github.com/evenyag) in [#8826](https://github.com/GreptimeTeam/greptimedb/pull/8826)
* feat: add json_object function and use it in the entity-graph derivation by [@killme2008](https://github.com/killme2008) in [#8870](https://github.com/GreptimeTeam/greptimedb/pull/8870)
* feat: update dashboard to v0.13.12 by [@sunchanglong](https://github.com/sunchanglong) in [#8882](https://github.com/GreptimeTeam/greptimedb/pull/8882)
* feat: add incremental primary key index writer by [@evenyag](https://github.com/evenyag) in [#8788](https://github.com/GreptimeTeam/greptimedb/pull/8788)
* feat: manage semantic table options via ALTER TABLE SET/UNSET by [@killme2008](https://github.com/killme2008) in [#8880](https://github.com/GreptimeTeam/greptimedb/pull/8880)
* feat(otlp): report the cause of rejected trace spans by [@killme2008](https://github.com/killme2008) in [#8897](https://github.com/GreptimeTeam/greptimedb/pull/8897)
* feat: otlp duration_nano and trace_flag signed integer coercion by [@sunng87](https://github.com/sunng87) in [#8816](https://github.com/GreptimeTeam/greptimedb/pull/8816)
* feat: support quantile and fraction queries on mixed histograms by [@shuiyisong](https://github.com/shuiyisong) in [#8874](https://github.com/GreptimeTeam/greptimedb/pull/8874)
* feat(otlp): support cumulative exponential histograms by [@shuiyisong](https://github.com/shuiyisong) in [#8900](https://github.com/GreptimeTeam/greptimedb/pull/8900)
* feat(cmd): add parquet development tools by [@evenyag](https://github.com/evenyag) in [#8939](https://github.com/GreptimeTeam/greptimedb/pull/8939)
* feat(mito2): add series index searcher by [@evenyag](https://github.com/evenyag) in [#8926](https://github.com/GreptimeTeam/greptimedb/pull/8926)
* feat(cmd): improve parquet rewrite fidelity and scanbench output by [@evenyag](https://github.com/evenyag) in [#8947](https://github.com/GreptimeTeam/greptimedb/pull/8947)
* feat(function): expose uddsketch rank by [@v0y4g3r](https://github.com/v0y4g3r) in [#8929](https://github.com/GreptimeTeam/greptimedb/pull/8929)
* feat: synthesize OTLP resource descriptor for the semantic entity graph by [@killme2008](https://github.com/killme2008) in [#8904](https://github.com/GreptimeTeam/greptimedb/pull/8904)
* feat(ci): run query regression on ephemeral Aliyun ECS runners by [@paomian](https://github.com/paomian) in [#8937](https://github.com/GreptimeTeam/greptimedb/pull/8937)
* feat: update dashboard to v0.13.14 by [@sunchanglong](https://github.com/sunchanglong) in [#8968](https://github.com/GreptimeTeam/greptimedb/pull/8968)
* feat: harden frontend heartbeat extensions by [@v0y4g3r](https://github.com/v0y4g3r) in [#8803](https://github.com/GreptimeTeam/greptimedb/pull/8803)
* feat(meta): record physical table reconciliation events by [@dhruvxvaishnav](https://github.com/dhruvxvaishnav) in [#8935](https://github.com/GreptimeTeam/greptimedb/pull/8935)
* feat: expose missing SST manifest fields by [@evenyag](https://github.com/evenyag) in [#8965](https://github.com/GreptimeTeam/greptimedb/pull/8965)
* feat: Add built-in daemon mode for standalone service by [@tian1220A](https://github.com/tian1220A) in [#8960](https://github.com/GreptimeTeam/greptimedb/pull/8960)
* feat(pipeline): support table-aware JSON2 transforms by [@shuiyisong](https://github.com/shuiyisong) in [#8964](https://github.com/GreptimeTeam/greptimedb/pull/8964)
* feat: report what the graph derives and fix two duplicate-node bugs by [@killme2008](https://github.com/killme2008) in [#8936](https://github.com/GreptimeTeam/greptimedb/pull/8936)
* feat(function): add mergeable stddev_pop state functions by [@v0y4g3r](https://github.com/v0y4g3r) in [#8972](https://github.com/GreptimeTeam/greptimedb/pull/8972)
* feat(mito2): add SST range index writer by [@evenyag](https://github.com/evenyag) in [#8954](https://github.com/GreptimeTeam/greptimedb/pull/8954)
* feat(query): add experimental DataFusion spill-to-disk controls by [@discord9](https://github.com/discord9) in [#8884](https://github.com/GreptimeTeam/greptimedb/pull/8884)
* feat(mito2): add write cache upload hook by [@v0y4g3r](https://github.com/v0y4g3r) in [#8992](https://github.com/GreptimeTeam/greptimedb/pull/8992)
* feat(flow): add generic delta merge for incremental aggregates by [@discord9](https://github.com/discord9) in [#8938](https://github.com/GreptimeTeam/greptimedb/pull/8938)
* feat: allow widening the time index column's timestamp unit via ALTER TABLE, mito2 table only by [@sunng87](https://github.com/sunng87) in [#8894](https://github.com/GreptimeTeam/greptimedb/pull/8894)
* feat: derive k8s.node from OTLP resource attributes by [@killme2008](https://github.com/killme2008) in [#9002](https://github.com/GreptimeTeam/greptimedb/pull/9002)
* feat(runtime): add weighted workload scheduler by [@discord9](https://github.com/discord9) in [#8736](https://github.com/GreptimeTeam/greptimedb/pull/8736)
* feat(flow): add row inserts to frontend client by [@fengys1996](https://github.com/fengys1996) in [#9006](https://github.com/GreptimeTeam/greptimedb/pull/9006)
* feat(json2): support JSON2 paths in SQL functions by [@MichaelScofield](https://github.com/MichaelScofield) in [#9007](https://github.com/GreptimeTeam/greptimedb/pull/9007)
* feat: preserve row sequences and support exact sequence-range reads by [@discord9](https://github.com/discord9) in [#8865](https://github.com/GreptimeTeam/greptimedb/pull/8865)
* feat(mito2): add SST range index searcher by [@evenyag](https://github.com/evenyag) in [#9003](https://github.com/GreptimeTeam/greptimedb/pull/9003)
* feat(json2): support empty and null JSON2 value by [@fengys1996](https://github.com/fengys1996) in [#9010](https://github.com/GreptimeTeam/greptimedb/pull/9010)
* feat(mito2): pass operation type to write cache upload hook by [@v0y4g3r](https://github.com/v0y4g3r) in [#9012](https://github.com/GreptimeTeam/greptimedb/pull/9012)
* feat(json2): support list indexing for JSON2 columns by [@MichaelScofield](https://github.com/MichaelScofield) in [#9013](https://github.com/GreptimeTeam/greptimedb/pull/9013)

### 🐛 Bug Fixes

* fix(mito2): prioritize newer compaction windows by [@v0y4g3r](https://github.com/v0y4g3r) in [#8714](https://github.com/GreptimeTeam/greptimedb/pull/8714)
* fix(auth): warn when credential load disables Postgres SCRAM or drops a line by [@killme2008](https://github.com/killme2008) in [#8652](https://github.com/GreptimeTeam/greptimedb/pull/8652)
* fix(object-store): skip removed-entry lister test on Windows by [@discord9](https://github.com/discord9) in [#8735](https://github.com/GreptimeTeam/greptimedb/pull/8735)
* fix(query): preserve remote dynamic filter target by [@discord9](https://github.com/discord9) in [#8615](https://github.com/GreptimeTeam/greptimedb/pull/8615)
* fix(operator): invalidate local cache after dropping view by [@WenyXu](https://github.com/WenyXu) in [#8748](https://github.com/GreptimeTeam/greptimedb/pull/8748)
* fix(ci): render query regression bot comment as compact table plus threshold details by [@discord9](https://github.com/discord9) in [#8774](https://github.com/GreptimeTeam/greptimedb/pull/8774)
* fix(object-store): fix unused import on Windows after #8735 by [@discord9](https://github.com/discord9) in [#8752](https://github.com/GreptimeTeam/greptimedb/pull/8752)
* fix(mito2): avoid region worker panic when building a WAL entry fails by [@fengjiachun](https://github.com/fengjiachun) in [#8810](https://github.com/GreptimeTeam/greptimedb/pull/8810)
* fix(ci): identify team members by repository permission by [@killme2008](https://github.com/killme2008) in [#8822](https://github.com/GreptimeTeam/greptimedb/pull/8822)
* fix(tests): make two Windows CI failures deterministic (Nightly CI #8837) by [@discord9](https://github.com/discord9) in [#8840](https://github.com/GreptimeTeam/greptimedb/pull/8840)
* fix(ci): grant pull-requests write and stop counting drafts by [@killme2008](https://github.com/killme2008) in [#8844](https://github.com/GreptimeTeam/greptimedb/pull/8844)
* fix(mito2): publish committed sequence only after rows are installed by [@discord9](https://github.com/discord9) in [#8862](https://github.com/GreptimeTeam/greptimedb/pull/8862)
* fix: cap default runtime sizes to a minimum of 2 threads by [@v0y4g3r](https://github.com/v0y4g3r) in [#8908](https://github.com/GreptimeTeam/greptimedb/pull/8908)
* fix(meta): avoid blocking runtime on stats cache lock by [@WenyXu](https://github.com/WenyXu) in [#8910](https://github.com/GreptimeTeam/greptimedb/pull/8910)
* fix(flow): restore FrontendClient::sql API by [@WenyXu](https://github.com/WenyXu) in [#8963](https://github.com/GreptimeTeam/greptimedb/pull/8963)
* fix(operator): whitelist private system table auto create by [@WenyXu](https://github.com/WenyXu) in [#8930](https://github.com/GreptimeTeam/greptimedb/pull/8930)
* fix(cmd): configure meta client in frontend plugin test by [@v0y4g3r](https://github.com/v0y4g3r) in [#8977](https://github.com/GreptimeTeam/greptimedb/pull/8977)
* fix: increase system disk size to 50 GiB for ECS instances by [@paomian](https://github.com/paomian) in [#8986](https://github.com/GreptimeTeam/greptimedb/pull/8986)
* fix(cmd): gate daemon integration test on Unix by [@discord9](https://github.com/discord9) in [#8987](https://github.com/GreptimeTeam/greptimedb/pull/8987)
* fix(mito2): avoid chained L1 rewrites in TWCS by [@v0y4g3r](https://github.com/v0y4g3r) in [#8981](https://github.com/GreptimeTeam/greptimedb/pull/8981)
* fix: add disk usage logging to GitHub step summary in query regression workflow by [@paomian](https://github.com/paomian) in [#9005](https://github.com/GreptimeTeam/greptimedb/pull/9005)

### 🚜 Refactor

* refactor(mito2): revise compaction trigger behavior by [@v0y4g3r](https://github.com/v0y4g3r) in [#8706](https://github.com/GreptimeTeam/greptimedb/pull/8706)
* refactor: port query regression runner to Rust by [@discord9](https://github.com/discord9) in [#8651](https://github.com/GreptimeTeam/greptimedb/pull/8651)
* refactor(operator): split semantic_graph relationship builders into a submodule by [@killme2008](https://github.com/killme2008) in [#8841](https://github.com/GreptimeTeam/greptimedb/pull/8841)
* refactor: remove trivial tests by [@v0y4g3r](https://github.com/v0y4g3r) in [#8877](https://github.com/GreptimeTeam/greptimedb/pull/8877)
* refactor(udaf): replace uddsketch implementation by [@v0y4g3r](https://github.com/v0y4g3r) in [#8867](https://github.com/GreptimeTeam/greptimedb/pull/8867)
* refactor(mito2): rename pk index to series index by [@evenyag](https://github.com/evenyag) in [#8893](https://github.com/GreptimeTeam/greptimedb/pull/8893)
* refactor: remove open metrics parser by [@sunng87](https://github.com/sunng87) in [#8905](https://github.com/GreptimeTeam/greptimedb/pull/8905)
* refactor(json2): add bounded auto-expansion to the JSON2 vector builder by [@MichaelScofield](https://github.com/MichaelScofield) in [#8909](https://github.com/GreptimeTeam/greptimedb/pull/8909)
* refactor(json2): optimize JSON2 building without auto-expanded paths by [@MichaelScofield](https://github.com/MichaelScofield) in [#8928](https://github.com/GreptimeTeam/greptimedb/pull/8928)
* refactor: centralize native histogram encoding in common-query by [@shuiyisong](https://github.com/shuiyisong) in [#8945](https://github.com/GreptimeTeam/greptimedb/pull/8945)
* refactor(json2): support querying v2 storage layout by [@MichaelScofield](https://github.com/MichaelScofield) in [#8940](https://github.com/GreptimeTeam/greptimedb/pull/8940)
* refactor(flight): add request builder and defer DoGet execution by [@WenyXu](https://github.com/WenyXu) in [#8953](https://github.com/GreptimeTeam/greptimedb/pull/8953)
* refactor(mito2): prioritize file count in TWCS picker by [@v0y4g3r](https://github.com/v0y4g3r) in [#8765](https://github.com/GreptimeTeam/greptimedb/pull/8765)
* refactor: json2 v2 storage layout by [@MichaelScofield](https://github.com/MichaelScofield) in [#8979](https://github.com/GreptimeTeam/greptimedb/pull/8979)

### 📚 Documentation

* docs: rework README release badges, drop star history, fix grpc flag by [@killme2008](https://github.com/killme2008) in [#8743](https://github.com/GreptimeTeam/greptimedb/pull/8743)
* docs: align wal.sync_period documented default with actual fallback (5s) by [@fengjiachun](https://github.com/fengjiachun) in [#8753](https://github.com/GreptimeTeam/greptimedb/pull/8753)
* docs: refine coding agent maps by [@killme2008](https://github.com/killme2008) in [#8790](https://github.com/GreptimeTeam/greptimedb/pull/8790)
* docs: refresh README product copy by [@killme2008](https://github.com/killme2008) in [#8886](https://github.com/GreptimeTeam/greptimedb/pull/8886)

### ⚡ Performance

* perf(promql): avoid repeated scans in sliding range evaluation by [@discord9](https://github.com/discord9) in [#8646](https://github.com/GreptimeTeam/greptimedb/pull/8646)
* perf: reduce ingestion and flat-merge overhead by [@shuiyisong](https://github.com/shuiyisong) in [#8778](https://github.com/GreptimeTeam/greptimedb/pull/8778)
* perf: reduce cold workspace compile time by [@shuiyisong](https://github.com/shuiyisong) in [#8801](https://github.com/GreptimeTeam/greptimedb/pull/8801)
* perf(mito2): optimize dictionary primary key sorting by [@lyang24](https://github.com/lyang24) in [#8767](https://github.com/GreptimeTeam/greptimedb/pull/8767)
* perf(query): choose bounded CTE as hash join build side by [@fengjiachun](https://github.com/fengjiachun) in [#8807](https://github.com/GreptimeTeam/greptimedb/pull/8807)
* perf: optimize Prometheus remote write v2 decoding by [@shuiyisong](https://github.com/shuiyisong) in [#8873](https://github.com/GreptimeTeam/greptimedb/pull/8873)
* avoid cloning final Prometheus remote write row by [@lyang24](https://github.com/lyang24) in [#8733](https://github.com/GreptimeTeam/greptimedb/pull/8733)

### 🧪 Testing

* test(object-store): fix racy SecureFs abort test by [@v0y4g3r](https://github.com/v0y4g3r) in [#8720](https://github.com/GreptimeTeam/greptimedb/pull/8720)
* test: rename internal bug numbers in tests to semantic names by [@discord9](https://github.com/discord9) in [#8779](https://github.com/GreptimeTeam/greptimedb/pull/8779)
* test(mito2): isolate sequence publication barrier by [@discord9](https://github.com/discord9) in [#8876](https://github.com/GreptimeTeam/greptimedb/pull/8876)
* test: renew etcd TLS certificates by [@WenyXu](https://github.com/WenyXu) in [#8956](https://github.com/GreptimeTeam/greptimedb/pull/8956)

### ⚙️ Miscellaneous Tasks

* ci: optimize fuzz and split workflows by [@WenyXu](https://github.com/WenyXu) in [#8710](https://github.com/GreptimeTeam/greptimedb/pull/8710)
* chore: check enterprise-gated files are listed in both license configs by [@killme2008](https://github.com/killme2008) in [#8750](https://github.com/GreptimeTeam/greptimedb/pull/8750)
* ci: automate compatibility version window by [@discord9](https://github.com/discord9) in [#8608](https://github.com/GreptimeTeam/greptimedb/pull/8608)
* chore: bump version to 1.3.0 on default branch by [@sunng87](https://github.com/sunng87) in [#8749](https://github.com/GreptimeTeam/greptimedb/pull/8749)
* ci: stop running enterprise tests in OSS CI by [@v0y4g3r](https://github.com/v0y4g3r) in [#8795](https://github.com/GreptimeTeam/greptimedb/pull/8795)
* chore(ci): warn when a member has too many open pull requests by [@killme2008](https://github.com/killme2008) in [#8813](https://github.com/GreptimeTeam/greptimedb/pull/8813)
* ci: update dev-builder image tag by [@github-actions[bot]](https://github.com/github-actions[bot]) in [#8831](https://github.com/GreptimeTeam/greptimedb/pull/8831)
* ci: update code owners by [@evenyag](https://github.com/evenyag) in [#8843](https://github.com/GreptimeTeam/greptimedb/pull/8843)
* chore: update mysql test drivers and lru by [@sunng87](https://github.com/sunng87) in [#8868](https://github.com/GreptimeTeam/greptimedb/pull/8868)
* chore: add v2 version label to prom metrics by [@shuiyisong](https://github.com/shuiyisong) in [#8885](https://github.com/GreptimeTeam/greptimedb/pull/8885)
* chore(mito2): reduce default auto flush interval by [@evenyag](https://github.com/evenyag) in [#8971](https://github.com/GreptimeTeam/greptimedb/pull/8971)
* chore(deps): bump datafusion to 452cb4b (support Dictionary literals in substrait) by [@discord9](https://github.com/discord9) in [#8839](https://github.com/GreptimeTeam/greptimedb/pull/8839)
* chore(deps): bump postgres-protocol from 0.6.8 to 0.6.12 by [@dependabot](https://github.com/dependabot) in [#8948](https://github.com/GreptimeTeam/greptimedb/pull/8948)
* ci: trigger downstream updates for prereleases by [@WenyXu](https://github.com/WenyXu) in [#9008](https://github.com/GreptimeTeam/greptimedb/pull/9008)
* chore: bump version to 1.3.0-alpha.1 by [@WenyXu](https://github.com/WenyXu) in [#9014](https://github.com/GreptimeTeam/greptimedb/pull/9014)

## New Contributors

* [@tian1220A](https://github.com/tian1220A) made their first contribution in [#8960](https://github.com/GreptimeTeam/greptimedb/pull/8960)
* [@dhruvxvaishnav](https://github.com/dhruvxvaishnav) made their first contribution in [#8935](https://github.com/GreptimeTeam/greptimedb/pull/8935)
* [@xhwhis](https://github.com/xhwhis) made their first contribution in [#8722](https://github.com/GreptimeTeam/greptimedb/pull/8722)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@dhruvxvaishnav](https://github.com/dhruvxvaishnav), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@fengys1996](https://github.com/fengys1996), [@grezzko](https://github.com/grezzko), [@killme2008](https://github.com/killme2008), [@lyang24](https://github.com/lyang24), [@MichaelScofield](https://github.com/MichaelScofield), [@onepizzateam](https://github.com/onepizzateam), [@paomian](https://github.com/paomian), [@shuiyisong](https://github.com/shuiyisong), [@sunchanglong](https://github.com/sunchanglong), [@sunng87](https://github.com/sunng87), [@tian1220A](https://github.com/tian1220A), [@v0y4g3r](https://github.com/v0y4g3r), [@WenyXu](https://github.com/WenyXu), [@wy471x](https://github.com/wy471x), [@xhwhis](https://github.com/xhwhis)
