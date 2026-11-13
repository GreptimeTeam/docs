---
keywords: [release, GreptimeDB, changelog, v1.3.1]
description: GreptimeDB v1.3.1 Changelog
date: 2026-11-13
---
# v1.3.1

Release date: November 13, 2026

GreptimeDB v1.3.1 fixes write durability, database authorization, credential exposure, and query correctness issues. It also bundles Dashboard v0.14.6.

### 👍 Highlights

#### Write durability

Fixes potential data loss during repartition rollback or datanode restart, and restores periodic local WAL sync with the default `sync_write = false` setting. ([#10253](https://github.com/GreptimeTeam/greptimedb/pull/10253), [#9715](https://github.com/GreptimeTeam/greptimedb/pull/9715))

#### Database authorization and credential protection

Database selection through HTTP, MySQL, and PostgreSQL checks access permissions, and administrative functions require `ADMIN` privileges even through `SELECT`. Diagnostic configuration and startup logs redact credentials. ([#10378](https://github.com/GreptimeTeam/greptimedb/pull/10378), [#10382](https://github.com/GreptimeTeam/greptimedb/pull/10382), [#10120](https://github.com/GreptimeTeam/greptimedb/pull/10120), [#10115](https://github.com/GreptimeTeam/greptimedb/pull/10115), [#10381](https://github.com/GreptimeTeam/greptimedb/pull/10381))

#### Prepared query correctness

Fixes incorrect results from MySQL and PostgreSQL prepared statements after partition columns change, including incorrect rows written by prepared `INSERT ... SELECT` statements. ([#10244](https://github.com/GreptimeTeam/greptimedb/pull/10244))

#### Dashboard v0.14.6

**Table Query** and **Metrics Query** paginate their sidebars, and table pickers search by name. The SQL builder preserves the selected database, while log and trace views retain column-display preferences. ([Dashboard #673](https://github.com/GreptimeTeam/dashboard/pull/673), [Dashboard #674](https://github.com/GreptimeTeam/dashboard/pull/674))

### Upgrade and compatibility notes

- **Prometheus Remote Read:** Tables with non-string label columns now return an error; timestamp and sample-value columns are exempt. Label matching follows Prometheus semantics: regular expressions match the full string, and missing or NULL labels match as empty strings. ([#9633](https://github.com/GreptimeTeam/greptimedb/pull/9633))
- **Database selection:** MySQL connections without a usable default database must select an authorized database before running statements that require one (error 1046). PostgreSQL `SET search_path` selects the first authorized, existing database and clears the selection if none qualifies. ([#10382](https://github.com/GreptimeTeam/greptimedb/pull/10382))
- **JSON log ingestion:** Malformed escapes, out-of-range numbers, and nesting deeper than 1,024 levels are rejected under the configured `ignore_errors` policy. Invalid UTF-8 remains recoverable. ([#10245](https://github.com/GreptimeTeam/greptimedb/pull/10245), [#10302](https://github.com/GreptimeTeam/greptimedb/pull/10302))
- **OTLP log tables:** Direct OTLP ingestion auto-creates tables with the `greptime_log_v1` schema; use a new destination table to adopt it, as existing tables retain their schema. During a rolling upgrade, avoid concurrent creation of the same destination table by old and new frontends; pipeline-defined tables are unchanged. ([#10207](https://github.com/GreptimeTeam/greptimedb/pull/10207))
- **Distributed deployments:** Keep datanode clocks synchronized and stop the old process before reusing its node ID; process fencing takes full effect after all metasrv nodes are upgraded. A write whose leader lease expires during WAL append can return a retryable error after being applied, so retries can duplicate rows in append-only tables. ([#9878](https://github.com/GreptimeTeam/greptimedb/pull/9878), [#9984](https://github.com/GreptimeTeam/greptimedb/pull/9984), [#9904](https://github.com/GreptimeTeam/greptimedb/pull/9904))
- **Manually configured sparse encoding:** Before upgrading, check tables with `primary_key_encoding = 'sparse'` or the legacy `memtable.partition_tree.primary_key_encoding` setting against the requirements in [#10020](https://github.com/GreptimeTeam/greptimedb/pull/10020); unsupported schemas can fail validation and are not migrated automatically. Tables created normally by the metric engine and ordinary dense tables are unaffected.

### 🚀 Features

* feat(otlp): add v1 schema for auto-created OTLP log tables by [@killme2008](https://github.com/killme2008) in [#10207](https://github.com/GreptimeTeam/greptimedb/pull/10207)
* feat: update dashboard to v0.14.5 by [@sunchanglong](https://github.com/sunchanglong) in [#10270](https://github.com/GreptimeTeam/greptimedb/pull/10270)
* feat: update dashboard to v0.14.6 by [@sunchanglong](https://github.com/sunchanglong) in [#10365](https://github.com/GreptimeTeam/greptimedb/pull/10365)
* feat(query): serialize remote dynamic membership by [@discord9](https://github.com/discord9) in [#10341](https://github.com/GreptimeTeam/greptimedb/pull/10341)

### 🐛 Bug Fixes

* fix!: enforce sparse primary key schema by [@shuiyisong](https://github.com/shuiyisong) in [#10020](https://github.com/GreptimeTeam/greptimedb/pull/10020)
* fix(config)!: redact credentials from diagnostic TOML by [@killme2008](https://github.com/killme2008) in [#10381](https://github.com/GreptimeTeam/greptimedb/pull/10381)
* fix: bound metric snapshot memory and reduce export overhead by [@fengjiachun](https://github.com/fengjiachun) in [#9505](https://github.com/GreptimeTeam/greptimedb/pull/9505)
* fix(prom): align remote read label matcher semantics by [@fengys1996](https://github.com/fengys1996) in [#9633](https://github.com/GreptimeTeam/greptimedb/pull/9633)
* fix(mito2): restore source splitting for cross-range series merges by [@WenyXu](https://github.com/WenyXu) in [#9818](https://github.com/GreptimeTeam/greptimedb/pull/9818)
* fix(mito2): pick TWCS L1 merges by closed units so compaction terminates by [@v0y4g3r](https://github.com/v0y4g3r) in [#9741](https://github.com/GreptimeTeam/greptimedb/pull/9741)
* fix: reclaim HDFS temporary files left behind by a datanode crash by [@lczllx](https://github.com/lczllx) in [#9616](https://github.com/GreptimeTeam/greptimedb/pull/9616)
* fix(meta): fence datanode processes replaced by a newer process by [@fengjiachun](https://github.com/fengjiachun) in [#9878](https://github.com/GreptimeTeam/greptimedb/pull/9878)
* fix: acknowledge writes only within the region's leader lease by [@fengjiachun](https://github.com/fengjiachun) in [#9904](https://github.com/GreptimeTeam/greptimedb/pull/9904)
* fix(mito): preserve SST lifetime across index replacement by [@v0y4g3r](https://github.com/v0y4g3r) in [#9950](https://github.com/GreptimeTeam/greptimedb/pull/9950)
* fix(meta): exclude route followers from failover targets by [@fengjiachun](https://github.com/fengjiachun) in [#10001](https://github.com/GreptimeTeam/greptimedb/pull/10001)
* fix(log-store): make raft-engine periodic WAL sync actually fsync by [@BootstrapperSBL](https://github.com/BootstrapperSBL) in [#9715](https://github.com/GreptimeTeam/greptimedb/pull/9715)
* fix(catalog): propagate frontend process-list failures by [@Byte-Naut](https://github.com/Byte-Naut) in [#9999](https://github.com/GreptimeTeam/greptimedb/pull/9999)
* fix(log-store): skip records with unparsable keys instead of aborting the read by [@lczllx](https://github.com/lczllx) in [#9749](https://github.com/GreptimeTeam/greptimedb/pull/9749)
* fix(meta): register failure detectors for regions switched before a rollback by [@fengjiachun](https://github.com/fengjiachun) in [#9989](https://github.com/GreptimeTeam/greptimedb/pull/9989)
* fix: ignore stale leader grants after a region is downgraded by [@fengjiachun](https://github.com/fengjiachun) in [#9987](https://github.com/GreptimeTeam/greptimedb/pull/9987)
* fix(mito2): preserve live index files across remote compactions by [@v0y4g3r](https://github.com/v0y4g3r) in [#10046](https://github.com/GreptimeTeam/greptimedb/pull/10046)
* fix(datanode): pick a node epoch above the recorded one by [@fengjiachun](https://github.com/fengjiachun) in [#9984](https://github.com/GreptimeTeam/greptimedb/pull/9984)
* fix(promql): collapse duplicate samples at one timestamp before range functions by [@discord9](https://github.com/discord9) in [#10069](https://github.com/GreptimeTeam/greptimedb/pull/10069)
* fix(auth): preserve physical metric table targets by [@shuiyisong](https://github.com/shuiyisong) in [#10084](https://github.com/GreptimeTeam/greptimedb/pull/10084)
* fix: include peer context in distributed query errors by [@WenyXu](https://github.com/WenyXu) in [#10118](https://github.com/GreptimeTeam/greptimedb/pull/10118)
* fix(auth): redact inline user-provider credentials by [@shuiyisong](https://github.com/shuiyisong) in [#10115](https://github.com/GreptimeTeam/greptimedb/pull/10115)
* fix: register trigger procedure loaders through DdlManager by [@fengys1996](https://github.com/fengys1996) in [#10123](https://github.com/GreptimeTeam/greptimedb/pull/10123)
* fix(time): parse zero-hour timezone offsets correctly by [@fallintoplace](https://github.com/fallintoplace) in [#10091](https://github.com/GreptimeTeam/greptimedb/pull/10091)
* fix(ci): increase nightly JSONBench runner root volume by [@MichaelScofield](https://github.com/MichaelScofield) in [#10146](https://github.com/GreptimeTeam/greptimedb/pull/10146)
* fix: test fixture by [@shuiyisong](https://github.com/shuiyisong) in [#10149](https://github.com/GreptimeTeam/greptimedb/pull/10149)
* fix(meta): invalidate all datanode tables on address change by [@florissmit10](https://github.com/florissmit10) in [#9986](https://github.com/GreptimeTeam/greptimedb/pull/9986)
* fix(function): require ADMIN statement privileges to execute admin functions by [@sunng87](https://github.com/sunng87) in [#10120](https://github.com/GreptimeTeam/greptimedb/pull/10120)
* fix(catalog): use advertised peer address as process identity by [@v0y4g3r](https://github.com/v0y4g3r) in [#10153](https://github.com/GreptimeTeam/greptimedb/pull/10153)
* fix(ci): prepare Ubuntu build runners and default EC2 disks to 500 GiB by [@WenyXu](https://github.com/WenyXu) in [#10156](https://github.com/GreptimeTeam/greptimedb/pull/10156)
* fix(mito): use stored recovery-set bytes for manifest size by [@WenyXu](https://github.com/WenyXu) in [#10142](https://github.com/GreptimeTeam/greptimedb/pull/10142)
* fix(grpc): propagate cancellation for read query execution by [@MichaelScofield](https://github.com/MichaelScofield) in [#10166](https://github.com/GreptimeTeam/greptimedb/pull/10166)
* fix(datatypes): escape object keys when rendering jsonb as text by [@BootstrapperSBL](https://github.com/BootstrapperSBL) in [#10112](https://github.com/GreptimeTeam/greptimedb/pull/10112)
* fix(mito2): share bulk memtable compaction dispatcher across workers by [@luckysxx](https://github.com/luckysxx) in [#10022](https://github.com/GreptimeTeam/greptimedb/pull/10022)
* fix(mito): decode cached manifest payloads by [@WenyXu](https://github.com/WenyXu) in [#10179](https://github.com/GreptimeTeam/greptimedb/pull/10179)
* fix(meta-srv): acquire remote WAL read lock once before upgrade retries by [@andrewmains12](https://github.com/andrewmains12) in [#10205](https://github.com/GreptimeTeam/greptimedb/pull/10205)
* fix: prioritize region ALTER over queued edits by [@evenyag](https://github.com/evenyag) in [#10193](https://github.com/GreptimeTeam/greptimedb/pull/10193)
* fix(meta-srv): invalidate leader cache on transaction errors by [@WenyXu](https://github.com/WenyXu) in [#10219](https://github.com/GreptimeTeam/greptimedb/pull/10219)
* fix(mito2): avoid reporting reader filter metrics twice by [@killme2008](https://github.com/killme2008) in [#10222](https://github.com/GreptimeTeam/greptimedb/pull/10222)
* fix: tolerate invalid UTF-8 in JSON log ingestion by [@shuiyisong](https://github.com/shuiyisong) in [#10245](https://github.com/GreptimeTeam/greptimedb/pull/10245)
* fix(promql): bound scatter time filter expression depth by [@evenyag](https://github.com/evenyag) in [#10272](https://github.com/GreptimeTeam/greptimedb/pull/10272)
* fix(query): use current partition columns in prepared plans by [@fengjiachun](https://github.com/fengjiachun) in [#10244](https://github.com/GreptimeTeam/greptimedb/pull/10244)
* fix(time): avoid i32 overflow when converting an out-of-range date by [@arpitjain099](https://github.com/arpitjain099) in [#10299](https://github.com/GreptimeTeam/greptimedb/pull/10299)
* fix(mito2): keep rows written during staging in the WAL by [@fengjiachun](https://github.com/fengjiachun) in [#10253](https://github.com/GreptimeTeam/greptimedb/pull/10253)
* fix: backport the pgwire TLS security fix using pgwire 0.41.2 by [@sunng87](https://github.com/sunng87) in [#10300](https://github.com/GreptimeTeam/greptimedb/pull/10300)
* fix: restrict JSON retries to invalid UTF-8 errors by [@shuiyisong](https://github.com/shuiyisong) in [#10302](https://github.com/GreptimeTeam/greptimedb/pull/10302)
* fix(query): backport DataFusion join, NULL-bound, timestamp-pruning, and spill fixes by [@discord9](https://github.com/discord9) in [#10324](https://github.com/GreptimeTeam/greptimedb/pull/10324)
* fix(datatypes): render jsonb stored as JSON text without panics or wrong values by [@killme2008](https://github.com/killme2008) in [#10197](https://github.com/GreptimeTeam/greptimedb/pull/10197)
* fix(promql): resolve the OR right operand's time-index column from its schema by [@discord9](https://github.com/discord9) in [#10335](https://github.com/GreptimeTeam/greptimedb/pull/10335)
* fix: redact credential table options in user-visible output by [@killme2008](https://github.com/killme2008) in [#10346](https://github.com/GreptimeTeam/greptimedb/pull/10346)
* fix(servers): authorize HTTP database overrides by [@killme2008](https://github.com/killme2008) in [#10378](https://github.com/GreptimeTeam/greptimedb/pull/10378)
* fix(function): handle unaligned binary vector literals by [@killme2008](https://github.com/killme2008) in [#10380](https://github.com/GreptimeTeam/greptimedb/pull/10380)
* fix(frontend): classify physical entity graph sources by [@killme2008](https://github.com/killme2008) in [#10383](https://github.com/GreptimeTeam/greptimedb/pull/10383)
* fix(auth): secure MySQL and PostgreSQL database selection by [@killme2008](https://github.com/killme2008) in [#10382](https://github.com/GreptimeTeam/greptimedb/pull/10382)

### ⚡ Performance

* perf(mito2): reuse static manifest checks across row groups by [@killme2008](https://github.com/killme2008) in [#10220](https://github.com/GreptimeTeam/greptimedb/pull/10220)
* perf(query): push column projections through MergeScan by [@killme2008](https://github.com/killme2008) in [#10221](https://github.com/GreptimeTeam/greptimedb/pull/10221)
* perf(mito2): prefilter single-column dynamic filters by [@discord9](https://github.com/discord9) in [#10340](https://github.com/GreptimeTeam/greptimedb/pull/10340)

### ⚙️ Miscellaneous Tasks

* chore(ci): update compatibility versions by [@MichaelScofield](https://github.com/MichaelScofield) in [#10051](https://github.com/GreptimeTeam/greptimedb/pull/10051)

## New Contributors

* [@Byte-Naut](https://github.com/Byte-Naut) made their first contribution in [#9999](https://github.com/GreptimeTeam/greptimedb/pull/9999)
* [@andrewmains12](https://github.com/andrewmains12) made their first contribution in [#10205](https://github.com/GreptimeTeam/greptimedb/pull/10205)
* [@arpitjain099](https://github.com/arpitjain099) made their first contribution in [#10299](https://github.com/GreptimeTeam/greptimedb/pull/10299)
* [@fallintoplace](https://github.com/fallintoplace) made their first contribution in [#10091](https://github.com/GreptimeTeam/greptimedb/pull/10091)
* [@florissmit10](https://github.com/florissmit10) made their first contribution in [#9986](https://github.com/GreptimeTeam/greptimedb/pull/9986)
* [@luckysxx](https://github.com/luckysxx) made their first contribution in [#10022](https://github.com/GreptimeTeam/greptimedb/pull/10022)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@BootstrapperSBL](https://github.com/BootstrapperSBL), [@Byte-Naut](https://github.com/Byte-Naut), [@MichaelScofield](https://github.com/MichaelScofield), [@WenyXu](https://github.com/WenyXu), [@andrewmains12](https://github.com/andrewmains12), [@arpitjain099](https://github.com/arpitjain099), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fallintoplace](https://github.com/fallintoplace), [@fengjiachun](https://github.com/fengjiachun), [@fengys1996](https://github.com/fengys1996), [@florissmit10](https://github.com/florissmit10), [@killme2008](https://github.com/killme2008), [@lczllx](https://github.com/lczllx), [@luckysxx](https://github.com/luckysxx), [@shuiyisong](https://github.com/shuiyisong), [@sunchanglong](https://github.com/sunchanglong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r)
