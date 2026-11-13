---
keywords: [release, GreptimeDB, changelog, v1.3.1]
description: GreptimeDB v1.3.1 Changelog
date: 2026-11-13
---
# v1.3.1

Release date: November 13, 2026

GreptimeDB v1.3.1 fixes write durability, region recovery, database authorization, credential exposure, and SQL and PromQL correctness issues. It also reduces repeated storage reads and bundles Dashboard v0.14.6.

### 👍 Highlights

#### Preserve writes during repartition staging

Rows written while a region is staging remain in the WAL until staging ends. This prevents those rows from being lost when a staging operation rolls back, the region is downgraded, or the datanode restarts. Staging writes remain readable from memory; pressure limits and manual flushes can return retryable errors while staging is active. ([#10253](https://github.com/GreptimeTeam/greptimedb/pull/10253))

#### Restore periodic local WAL durability

Periodic raft-engine WAL sync now performs an actual filesystem sync when `sync_write = false`, the default. Previously, the raft-engine empty-batch path returned before syncing, so the periodic task did not provide the intended durability. The configured `wal.sync_period` continues to control the interval. ([#9715](https://github.com/GreptimeTeam/greptimedb/pull/9715))

#### Check permissions when selecting a database

HTTP database overrides and MySQL/PostgreSQL database selection authorize the destination before using it. Administrative functions require `ADMIN` privileges even when invoked through `SELECT`; deployments without a configured permission checker retain their existing behavior. ([#10378](https://github.com/GreptimeTeam/greptimedb/pull/10378), [#10382](https://github.com/GreptimeTeam/greptimedb/pull/10382), [#10120](https://github.com/GreptimeTeam/greptimedb/pull/10120))

#### Keep prepared queries correct after partition changes

MySQL and PostgreSQL prepared statements use current partition-column information when deciding whether aggregates, sorting, and limits can run on individual regions. This prevents incorrect results after partition columns change, including incorrect rows written by prepared `INSERT ... SELECT` statements. ([#10244](https://github.com/GreptimeTeam/greptimedb/pull/10244))

#### Dashboard v0.14.6

**Table Query** and **Metrics Query** paginate their sidebars instead of loading every table or metric at once. Table pickers search names, the SQL builder preserves the selected database across resets and mode changes, and **Logs Query** defaults to a multi-column layout. Log and trace views retain column-display preferences, with the timestamp pinned in log tables. ([Dashboard #673](https://github.com/GreptimeTeam/dashboard/pull/673), [Dashboard #674](https://github.com/GreptimeTeam/dashboard/pull/674))

### Upgrade notes

- Keep datanode clocks synchronized and stop an old process before starting another with the same node ID. Process fencing takes full effect after all metasrv nodes are upgraded; datanode startup now reads the recorded epoch and fails if that metadata read fails. ([#9878](https://github.com/GreptimeTeam/greptimedb/pull/9878), [#9984](https://github.com/GreptimeTeam/greptimedb/pull/9984))
- A distributed write whose leader lease expires during the WAL append can return a retryable error even though it was applied. Retrying can duplicate rows in append-only tables; standalone behavior is unchanged. ([#9904](https://github.com/GreptimeTeam/greptimedb/pull/9904))
- Diagnostic configuration and startup logs redact or omit credentials, including inline user-provider passwords, Kafka passwords, OTLP headers, metadata-store credentials, and Azure SAS tokens. Keep the original configuration and secrets separately; serialized diagnostic output is not a credential backup. ([#10115](https://github.com/GreptimeTeam/greptimedb/pull/10115), [#10381](https://github.com/GreptimeTeam/greptimedb/pull/10381))
- Newly auto-created direct-OTLP log tables use the `greptime_log_v1` schema, with a `service_name` tag, a skipping index on `trace_id`, and `event_name` and `observed_timestamp` fields. Existing legacy tables and pipeline-defined tables are unchanged in the normal path; use a new destination table to adopt the schema, and avoid concurrent legacy-table creation by older frontends during a rolling upgrade. ([#10207](https://github.com/GreptimeTeam/greptimedb/pull/10207))
- Compressed manifest cache entries from older versions are evicted and refetched when decoding fails; no manual cache clearing is required. The payload portion of `manifest_cache_size` now consistently accounts for stored, compressed bytes when compression is enabled. ([#10179](https://github.com/GreptimeTeam/greptimedb/pull/10179))
- Background bulk-memtable compaction now shares one engine-wide `max_background_compactions` budget instead of one budget per worker. Review ingestion behavior under sustained load; SST compaction retains a separate budget. ([#10022](https://github.com/GreptimeTeam/greptimedb/pull/10022))
- Cluster-wide `SHOW PROCESSLIST` reports an error if a frontend management RPC fails instead of returning a partial list. With a dedicated internal gRPC listener, process identifiers use the advertised internal address; configure the management listener on each frontend. ([#9999](https://github.com/GreptimeTeam/greptimedb/pull/9999), [#10153](https://github.com/GreptimeTeam/greptimedb/pull/10153))
- Downstream Rust integrations must update permission-checker interfaces and retain one `CompactionRegionOpener` per exclusively owned auxiliary directory for the remote executor's lifetime. Creating an opener for each compaction request does not provide the file-lifetime fix. ([#10084](https://github.com/GreptimeTeam/greptimedb/pull/10084), [#10046](https://github.com/GreptimeTeam/greptimedb/pull/10046))

### Breaking changes

- Manually configured sparse primary keys must follow the metric-engine schema contract, including reserved column IDs, types, and primary-key order. Audit tables using `primary_key_encoding = 'sparse'` or the legacy `memtable.partition_tree.primary_key_encoding` setting before upgrading; this release does not migrate unsupported schemas, and metadata-rebuilding operations can reject them. ([#10020](https://github.com/GreptimeTeam/greptimedb/pull/10020))
- Prometheus Remote Read rejects non-string label columns, excluding timestamp and sample-value columns from that restriction. It also uses full-string regular-expression matching and treats missing or NULL labels as empty strings. ([#9633](https://github.com/GreptimeTeam/greptimedb/pull/9633))
- JSON log ingestion rejects malformed escapes, out-of-range numbers, and nesting deeper than 1,024 levels that older parsers could accept. Invalid UTF-8 is repaired before retrying; other errors continue to follow the configured `ignore_errors` policy. ([#10245](https://github.com/GreptimeTeam/greptimedb/pull/10245), [#10302](https://github.com/GreptimeTeam/greptimedb/pull/10302))
- MySQL clients that omit a database can connect without a selected schema when the default is missing or unauthorized; statements requiring one return error 1046 until an authorized database is selected. PostgreSQL `SET search_path` selects the first authorized, existing candidate and clears the current schema if none is usable; GreptimeDB still keeps one effective schema rather than a PostgreSQL-style search list. ([#10382](https://github.com/GreptimeTeam/greptimedb/pull/10382))

* fix!: enforce sparse primary key schema by [@shuiyisong](https://github.com/shuiyisong) in [#10020](https://github.com/GreptimeTeam/greptimedb/pull/10020)
* fix(config)!: redact credentials from diagnostic TOML by [@killme2008](https://github.com/killme2008) in [#10381](https://github.com/GreptimeTeam/greptimedb/pull/10381)

### 🚀 Features

* feat(otlp): add v1 schema for auto-created OTLP log tables by [@killme2008](https://github.com/killme2008) in [#10207](https://github.com/GreptimeTeam/greptimedb/pull/10207)
* feat: update dashboard to v0.14.5 by [@sunchanglong](https://github.com/sunchanglong) in [#10270](https://github.com/GreptimeTeam/greptimedb/pull/10270)
* feat: update dashboard to v0.14.6 by [@sunchanglong](https://github.com/sunchanglong) in [#10365](https://github.com/GreptimeTeam/greptimedb/pull/10365)
* feat(query): serialize remote dynamic membership by [@discord9](https://github.com/discord9) in [#10341](https://github.com/GreptimeTeam/greptimedb/pull/10341)

### 🐛 Bug Fixes

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
