---
keywords: [release, GreptimeDB, changelog, v1.0.0-beta.1]
description: GreptimeDB v1.0.0-beta.1 Changelog
date: 2025-11-12
---

# v1.0.0-beta.1

Release date: November 11, 2025

### 🚨 Breaking changes

* refactor(pipeline)!: change dispatch table name format by [@paomian](https://github.com/paomian) in [#6901](https://github.com/GreptimeTeam/greptimedb/pull/6901)
* feat!: improve `greptime_identity` pipeline behavior by [@waynexia](https://github.com/waynexia) in [#6932](https://github.com/GreptimeTeam/greptimedb/pull/6932)
* refactor!: add `enable_read_cache` config to support disable read cache explicitly by [@zyy17](https://github.com/zyy17) in [#6834](https://github.com/GreptimeTeam/greptimedb/pull/6834)
* refactor!: remove pb_value to json conversion, keep json output consistent by [@sunng87](https://github.com/sunng87) in [#7063](https://github.com/GreptimeTeam/greptimedb/pull/7063)
* refactor!: unify the API of getting total cpu and memory by [@zyy17](https://github.com/zyy17) in [#7049](https://github.com/GreptimeTeam/greptimedb/pull/7049)
* refactor!: add a `opentelemetry_traces_operations` table to aggregate `(service_name, span_name, span_kind)` to improve query performance by [@zyy17](https://github.com/zyy17) in [#7144](https://github.com/GreptimeTeam/greptimedb/pull/7144)
* feat(metric)!: enable sparse primary key encoding by default by [@WenyXu](https://github.com/WenyXu) in [#7195](https://github.com/GreptimeTeam/greptimedb/pull/7195)

### 👍 Highlights
#### Bulk Memtable
For scenarios with high-cardinality primary keys, this release introduces the experimental Bulk Memtable and a new data organization format (flat format). Both must be used together. Bulk Memtable provides more stable performance and lower memory usage when dealing with high-cardinality primary keys. Currently, Bulk Memtable performs better with larger batch sizes, and we recommend users set larger batch sizes when using Bulk Memtable. Additionally, the new data organization format offers better query performance in high-cardinality scenarios compared to the original format.

Users can enable the new data format and Bulk Memtable by specifying `sst_format` as `flat` when creating tables.
```sql
CREATE TABLE flat_format_table(
    request_id STRING,
    content STRING,
    greptime_timestamp TIMESTAMP TIME INDEX,
PRIMARY KEY (request_id))
WITH ('sst_format' = 'flat');
```

Additionally, for tables using the old format, you can switch to the flat format and Bulk Memtable using an ALTER statement.
```sql
ALTER TABLE old_format_table SET 'sst_format' = 'flat';
```

Tables using the flat format cannot be converted back to the old format. We will gradually switch the default format to the new format in future releases.

#### Independent Index File Caching
This release implements independent local caching for index files on object storage, allowing index files to be cached in local disk cache as much as possible, reducing the probability of accessing object storage during index queries. By default, the database allocates 20% of disk cache space to index files. Users can adjust this ratio by setting the `index_cache_percent` parameter.

In previous versions, when users increased the local disk cache size, only newly generated data files could enter the local write cache, providing limited improvement for querying historical data. In this version, the database loads index files from object storage to local storage in the background after startup, reducing the time required for historical data queries.

#### TQL Supports Value Aliasing
This release adds `AS` alias syntax to `TQL EVAL / EXPLAIN / ANALYZE`, allowing naming of value columns in results, making query result fields clearer and more readable. It also makes using TQL results in SQL (especially in CTE and JOIN scenarios) more convenient, particularly suitable for complex PromQL functions or aggregation queries.

Examples
```sql
TQL EVAL (0, 30, '10s') http_requests_total AS requests;
TQL EVAL (0, 10, '5s') count by (k) (test) AS count_value;
```

CTE Example
```sql
WITH r AS (
    TQL EVAL (0, 40, '10s') rate(metric[20s]) AS rate_per_sec
)
SELECT * FROM r WHERE rate_per_sec > 5;
```

New objbench Subcommand (Datanode)

This release adds the `greptime datanode objbench` subcommand for conducting read/write performance benchmarks on specified SST files in object storage. This tool can be used to analyze storage layer performance, troubleshoot slow queries or I/O latency issues, and supports generating flame graphs for deeper performance diagnostics.
Main Features
- Perform read/write performance tests on individual SST files
- Support detailed output (-v/--verbose)
- Support generating SVG flame graphs (--pprof-file)
- Can load datanode configuration files (--config)
```bash
# Basic test
greptime datanode objbench --config datanode.toml --source <path>.parquet

# Generate flame graph
greptime datanode objbench --config datanode.toml --source <path>.parquet --pprof-file flamegraph.svg

```

### 🚀 Features

* feat: Update parquet writer and indexer to support the flat format by [@evenyag](https://github.com/evenyag) in [#6866](https://github.com/GreptimeTeam/greptimedb/pull/6866)
* feat: unify FlushRegions instructions by [@aaraujo](https://github.com/aaraujo) in [#6819](https://github.com/GreptimeTeam/greptimedb/pull/6819)
* feat: implement basic write/read methods for bulk memtable by [@evenyag](https://github.com/evenyag) in [#6888](https://github.com/GreptimeTeam/greptimedb/pull/6888)
* feat: Supports flat format in SeqScan and UnorderedScan by [@evenyag](https://github.com/evenyag) in [#6905](https://github.com/GreptimeTeam/greptimedb/pull/6905)
* feat: put sqlness into a separated dir by [@waynexia](https://github.com/waynexia) in [#6911](https://github.com/GreptimeTeam/greptimedb/pull/6911)
* feat: humanize analyze numbers by [@waynexia](https://github.com/waynexia) in [#6889](https://github.com/GreptimeTeam/greptimedb/pull/6889)
* feat: file ref mgr by [@discord9](https://github.com/discord9) in [#6844](https://github.com/GreptimeTeam/greptimedb/pull/6844)
* feat: add `written_bytes_since_open` column to `region_statistics` table by [@WenyXu](https://github.com/WenyXu) in [#6904](https://github.com/GreptimeTeam/greptimedb/pull/6904)
* feat: support function alias by [@MichaelScofield](https://github.com/MichaelScofield) in [#6917](https://github.com/GreptimeTeam/greptimedb/pull/6917)
* feat: add CPU, memory and node status info to `cluster_info` by [@WenyXu](https://github.com/WenyXu) in [#6897](https://github.com/GreptimeTeam/greptimedb/pull/6897)
* feat: add udtf (table function) registration by [@sunng87](https://github.com/sunng87) in [#6922](https://github.com/GreptimeTeam/greptimedb/pull/6922)
* feat(pipeline): generate create table sql from pipeline config by [@shuiyisong](https://github.com/shuiyisong) in [#6930](https://github.com/GreptimeTeam/greptimedb/pull/6930)
* feat(mito): backfill partition expr on region open by [@zhongzc](https://github.com/zhongzc) in [#6862](https://github.com/GreptimeTeam/greptimedb/pull/6862)
* feat: add InformationExtension.inspect_datanode for datanode inspection by [@zhongzc](https://github.com/zhongzc) in [#6921](https://github.com/GreptimeTeam/greptimedb/pull/6921)
* feat: Implements compaction for bulk memtable by [@evenyag](https://github.com/evenyag) in [#6923](https://github.com/GreptimeTeam/greptimedb/pull/6923)
* feat: add origin_region_id and node_id to sst entry by [@zhongzc](https://github.com/zhongzc) in [#6937](https://github.com/GreptimeTeam/greptimedb/pull/6937)
* feat: store partition expr per file in region manifest by [@waynexia](https://github.com/waynexia) in [#6849](https://github.com/GreptimeTeam/greptimedb/pull/6849)
* feat: exiting staging mode on success case by [@waynexia](https://github.com/waynexia) in [#6913](https://github.com/GreptimeTeam/greptimedb/pull/6913)
* feat: expose workload filter to selector options by [@WenyXu](https://github.com/WenyXu) in [#6951](https://github.com/GreptimeTeam/greptimedb/pull/6951)
* feat: support flat format for SeriesScan by [@evenyag](https://github.com/evenyag) in [#6938](https://github.com/GreptimeTeam/greptimedb/pull/6938)
* feat: support flush and compact flat format files by [@evenyag](https://github.com/evenyag) in [#6949](https://github.com/GreptimeTeam/greptimedb/pull/6949)
* feat: add visible to sst entry for staging mode by [@zhongzc](https://github.com/zhongzc) in [#6964](https://github.com/GreptimeTeam/greptimedb/pull/6964)
* feat: add an flag to enable the experimental flat format by [@evenyag](https://github.com/evenyag) in [#6976](https://github.com/GreptimeTeam/greptimedb/pull/6976)
* feat: add TLS support for mysql backend by [@WenyXu](https://github.com/WenyXu) in [#6979](https://github.com/GreptimeTeam/greptimedb/pull/6979)
* feat: datanode side local gc worker by [@discord9](https://github.com/discord9) in [#6940](https://github.com/GreptimeTeam/greptimedb/pull/6940)
* feat: extract standalone functionality and introduce plugin-based router configuration by [@WenyXu](https://github.com/WenyXu) in [#7002](https://github.com/GreptimeTeam/greptimedb/pull/7002)
* feat: update dashboard to v0.11.5 by [@ZonaHex](https://github.com/ZonaHex) in [#7001](https://github.com/GreptimeTeam/greptimedb/pull/7001)
* feat: add ssts related system table by [@zhongzc](https://github.com/zhongzc) in [#6924](https://github.com/GreptimeTeam/greptimedb/pull/6924)
* feat: refine failure detector by [@waynexia](https://github.com/waynexia) in [#7005](https://github.com/GreptimeTeam/greptimedb/pull/7005)
* feat(copy_to_csv): add `date_format`/`timestamp_format`/`time_format`. by [@linyihai](https://github.com/linyihai) in [#6995](https://github.com/GreptimeTeam/greptimedb/pull/6995)
* feat: sql parse about show create trigger  by [@fengys1996](https://github.com/fengys1996) in [#7016](https://github.com/GreptimeTeam/greptimedb/pull/7016)
* feat: supports permission mode for static user provider by [@killme2008](https://github.com/killme2008) in [#7017](https://github.com/GreptimeTeam/greptimedb/pull/7017)
* feat: upgraded pg_catalog support by [@sunng87](https://github.com/sunng87) in [#6918](https://github.com/GreptimeTeam/greptimedb/pull/6918)
* feat: converts batches in old format to the flat format in query time by [@evenyag](https://github.com/evenyag) in [#6987](https://github.com/GreptimeTeam/greptimedb/pull/6987)
* feat: supports expression in TQL params by [@killme2008](https://github.com/killme2008) in [#7014](https://github.com/GreptimeTeam/greptimedb/pull/7014)
* feat: update dashboard to v0.11.6 by [@ZonaHex](https://github.com/ZonaHex) in [#7026](https://github.com/GreptimeTeam/greptimedb/pull/7026)
* feat: add `max_connection_age` config to grpc server by [@MichaelScofield](https://github.com/MichaelScofield) in [#7031](https://github.com/GreptimeTeam/greptimedb/pull/7031)
* feat: enable zstd for bulk memtable encoded parts by [@evenyag](https://github.com/evenyag) in [#7045](https://github.com/GreptimeTeam/greptimedb/pull/7045)
* feat: pgwire 0.33 update by [@sunng87](https://github.com/sunng87) in [#7048](https://github.com/GreptimeTeam/greptimedb/pull/7048)
* feat: able to pass external service for sqlness test by [@MichaelScofield](https://github.com/MichaelScofield) in [#7032](https://github.com/GreptimeTeam/greptimedb/pull/7032)
* feat: introduce IndexBuildTask for async index build by [@SNC123](https://github.com/SNC123) in [#6927](https://github.com/GreptimeTeam/greptimedb/pull/6927)
* feat: align influxdb line timestamp with table time index by [@MichaelScofield](https://github.com/MichaelScofield) in [#7057](https://github.com/GreptimeTeam/greptimedb/pull/7057)
* feat: struct value and vector by [@sunng87](https://github.com/sunng87) in [#7033](https://github.com/GreptimeTeam/greptimedb/pull/7033)
* feat: supports value aliasing in TQL by [@killme2008](https://github.com/killme2008) in [#7041](https://github.com/GreptimeTeam/greptimedb/pull/7041)
* feat: divide subtasks from old/new partition rules by [@waynexia](https://github.com/waynexia) in [#7003](https://github.com/GreptimeTeam/greptimedb/pull/7003)
* feat: explain custom statement by [@discord9](https://github.com/discord9) in [#7058](https://github.com/GreptimeTeam/greptimedb/pull/7058)
* feat: remap SST files for partition change by [@waynexia](https://github.com/waynexia) in [#7071](https://github.com/GreptimeTeam/greptimedb/pull/7071)
* feat: apply region partition expr to region scan by [@waynexia](https://github.com/waynexia) in [#7067](https://github.com/GreptimeTeam/greptimedb/pull/7067)
* feat: support setting sst_format in table options by [@evenyag](https://github.com/evenyag) in [#7068](https://github.com/GreptimeTeam/greptimedb/pull/7068)
* feat: conversion between struct, value and json by [@sunng87](https://github.com/sunng87) in [#7052](https://github.com/GreptimeTeam/greptimedb/pull/7052)
* feat(parser): ALTER TABLE ... REPARTITION ... by [@waynexia](https://github.com/waynexia) in [#7082](https://github.com/GreptimeTeam/greptimedb/pull/7082)
* feat: add updated_on to tablemeta with a default of created_on by [@Standing-Man](https://github.com/Standing-Man) in [#7072](https://github.com/GreptimeTeam/greptimedb/pull/7072)
* feat: add Value::Json value type by [@sunng87](https://github.com/sunng87) in [#7083](https://github.com/GreptimeTeam/greptimedb/pull/7083)
* feat: manual compaction parallelism by [@v0y4g3r](https://github.com/v0y4g3r) in [#7086](https://github.com/GreptimeTeam/greptimedb/pull/7086)
* feat: memtable seq range read by [@discord9](https://github.com/discord9) in [#6950](https://github.com/GreptimeTeam/greptimedb/pull/6950)
* feat: supports large string by [@killme2008](https://github.com/killme2008) in [#7097](https://github.com/GreptimeTeam/greptimedb/pull/7097)
* feat: add index cache eviction support by [@zhongzc](https://github.com/zhongzc) in [#7064](https://github.com/GreptimeTeam/greptimedb/pull/7064)
* feat(trigger): support "for" and "keep_firing_for" by [@fengys1996](https://github.com/fengys1996) in [#7087](https://github.com/GreptimeTeam/greptimedb/pull/7087)
* feat: new create table syntax for new json datatype by [@MichaelScofield](https://github.com/MichaelScofield) in [#7103](https://github.com/GreptimeTeam/greptimedb/pull/7103)
* feat(mito2): expose puffin index metadata by [@zhongzc](https://github.com/zhongzc) in [#7042](https://github.com/GreptimeTeam/greptimedb/pull/7042)
* feat: introduce the Noop WAL provider for datanode by [@WenyXu](https://github.com/WenyXu) in [#7105](https://github.com/GreptimeTeam/greptimedb/pull/7105)
* feat: expose SST index metadata via information schema by [@zhongzc](https://github.com/zhongzc) in [#7044](https://github.com/GreptimeTeam/greptimedb/pull/7044)
* feat: implement three build types for async index build by [@SNC123](https://github.com/SNC123) in [#7029](https://github.com/GreptimeTeam/greptimedb/pull/7029)
* feat: 14 days PRs review reminder by [@fengjiachun](https://github.com/fengjiachun) in [#7123](https://github.com/GreptimeTeam/greptimedb/pull/7123)
* feat: introduce `OpenRegions` and `CloseRegions` instructions to support batch region operations by [@WenyXu](https://github.com/WenyXu) in [#7122](https://github.com/GreptimeTeam/greptimedb/pull/7122)
* feat: update pgwire to 0.34 for a critical issue on accepting connection by [@sunng87](https://github.com/sunng87) in [#7127](https://github.com/GreptimeTeam/greptimedb/pull/7127)
* feat: writer mem limiter for http and grpc service by [@fengjiachun](https://github.com/fengjiachun) in [#7092](https://github.com/GreptimeTeam/greptimedb/pull/7092)
* feat: pr review reminder frequency by [@fengjiachun](https://github.com/fengjiachun) in [#7129](https://github.com/GreptimeTeam/greptimedb/pull/7129)
* feat: create table with new json datatype by [@MichaelScofield](https://github.com/MichaelScofield) in [#7128](https://github.com/GreptimeTeam/greptimedb/pull/7128)
* feat: add `cpu_usage_millicores` and `memory_usage_bytes` in `information_schema.cluster_info` table. by [@zyy17](https://github.com/zyy17) in [#7051](https://github.com/GreptimeTeam/greptimedb/pull/7051)
* feat: add a missing pg_catalog function current_database by [@sunng87](https://github.com/sunng87) in [#7138](https://github.com/GreptimeTeam/greptimedb/pull/7138)
* feat: store estimated series num in file meta by [@evenyag](https://github.com/evenyag) in [#7126](https://github.com/GreptimeTeam/greptimedb/pull/7126)
* feat: adds regex_extract function and more type tests by [@killme2008](https://github.com/killme2008) in [#7107](https://github.com/GreptimeTeam/greptimedb/pull/7107)
* feat: add HTTP endpoint to control prof.gdump feature by [@v0y4g3r](https://github.com/v0y4g3r) in [#6999](https://github.com/GreptimeTeam/greptimedb/pull/6999)
* feat: merge json datatype by [@MichaelScofield](https://github.com/MichaelScofield) in [#7142](https://github.com/GreptimeTeam/greptimedb/pull/7142)
* feat: prefix option for timestamp index and value column by [@shuiyisong](https://github.com/shuiyisong) in [#7125](https://github.com/GreptimeTeam/greptimedb/pull/7125)
* feat: part sort provide dyn filter by [@discord9](https://github.com/discord9) in [#7140](https://github.com/GreptimeTeam/greptimedb/pull/7140)
* feat: update datafusion-pg-catalog for better dbeaver support by [@sunng87](https://github.com/sunng87) in [#7143](https://github.com/GreptimeTeam/greptimedb/pull/7143)
* feat: gc worker heartbeat instruction by [@discord9](https://github.com/discord9) in [#7118](https://github.com/GreptimeTeam/greptimedb/pull/7118)
* feat: objbench sub command for datanode by [@v0y4g3r](https://github.com/v0y4g3r) in [#7114](https://github.com/GreptimeTeam/greptimedb/pull/7114)
* feat(mito): Optimize async index building with priority-based batching by [@SNC123](https://github.com/SNC123) in [#7034](https://github.com/GreptimeTeam/greptimedb/pull/7034)
* feat: json vector builder by [@MichaelScofield](https://github.com/MichaelScofield) in [#7151](https://github.com/GreptimeTeam/greptimedb/pull/7151)
* feat: update dashboard to v0.11.7 by [@ZonaHex](https://github.com/ZonaHex) in [#7170](https://github.com/GreptimeTeam/greptimedb/pull/7170)
* feat: BulkMemtable stores small fragments in another buffer by [@evenyag](https://github.com/evenyag) in [#7164](https://github.com/GreptimeTeam/greptimedb/pull/7164)
* feat: allow creating logical table with same partition rule with physical table's by [@waynexia](https://github.com/waynexia) in [#7177](https://github.com/GreptimeTeam/greptimedb/pull/7177)
* feat: add greptime's arrow json extension type by [@sunng87](https://github.com/sunng87) in [#7168](https://github.com/GreptimeTeam/greptimedb/pull/7168)
* feat: import backup data from local files by [@waynexia](https://github.com/waynexia) in [#7180](https://github.com/GreptimeTeam/greptimedb/pull/7180)
* feat(expr): support avg functions on vector by [@Standing-Man](https://github.com/Standing-Man) in [#7146](https://github.com/GreptimeTeam/greptimedb/pull/7146)
* feat: disable default compression for `__op_type` column by [@waynexia](https://github.com/waynexia) in [#7196](https://github.com/GreptimeTeam/greptimedb/pull/7196)
* feat: allow fuzz input override through env var by [@v0y4g3r](https://github.com/v0y4g3r) in [#7208](https://github.com/GreptimeTeam/greptimedb/pull/7208)
* feat: report scanner metrics by [@waynexia](https://github.com/waynexia) in [#7200](https://github.com/GreptimeTeam/greptimedb/pull/7200)
* feat: query mem limiter by [@fengjiachun](https://github.com/fengjiachun) in [#7078](https://github.com/GreptimeTeam/greptimedb/pull/7078)
* feat: tracks index files in another cache and preloads them by [@evenyag](https://github.com/evenyag) in [#7181](https://github.com/GreptimeTeam/greptimedb/pull/7181)
* feat: support altering sst format for a table by [@evenyag](https://github.com/evenyag) in [#7206](https://github.com/GreptimeTeam/greptimedb/pull/7206)

### 🐛 Bug Fixes

* fix: staging mode with proper region edit operations by [@waynexia](https://github.com/waynexia) in [#6962](https://github.com/GreptimeTeam/greptimedb/pull/6962)
* fix: print the output message of the error in admin fn macro by [@evenyag](https://github.com/evenyag) in [#6994](https://github.com/GreptimeTeam/greptimedb/pull/6994)
* fix: make EXPIRE (keyword) parsing case-insensitive, when creating flow by [@Shyamnatesan](https://github.com/Shyamnatesan) in [#6997](https://github.com/GreptimeTeam/greptimedb/pull/6997)
* fix: promql range function has incorrect timestamps by [@waynexia](https://github.com/waynexia) in [#7006](https://github.com/GreptimeTeam/greptimedb/pull/7006)
* fix: incorrect timestamp resolution in information_schema.partitions table by [@waynexia](https://github.com/waynexia) in [#7004](https://github.com/GreptimeTeam/greptimedb/pull/7004)
* fix: match promql column reference in case sensitive way by [@waynexia](https://github.com/waynexia) in [#7013](https://github.com/GreptimeTeam/greptimedb/pull/7013)
* fix: group by expr not as column in step aggr by [@discord9](https://github.com/discord9) in [#7008](https://github.com/GreptimeTeam/greptimedb/pull/7008)
* fix(cli): fix FS object store handling of absolute paths by [@WenyXu](https://github.com/WenyXu) in [#7018](https://github.com/GreptimeTeam/greptimedb/pull/7018)
* fix: skip placeholder when partition columns by [@discord9](https://github.com/discord9) in [#7020](https://github.com/GreptimeTeam/greptimedb/pull/7020)
* fix: not step when aggr have order by/filter by [@discord9](https://github.com/discord9) in [#7015](https://github.com/GreptimeTeam/greptimedb/pull/7015)
* fix: step aggr merge phase not order nor filter by [@discord9](https://github.com/discord9) in [#6998](https://github.com/GreptimeTeam/greptimedb/pull/6998)
* fix: fix test_resolve_relative_path_relative on windows by [@paomian](https://github.com/paomian) in [#7039](https://github.com/GreptimeTeam/greptimedb/pull/7039)
* fix: fix panic and limit concurrency in flat format by [@evenyag](https://github.com/evenyag) in [#7035](https://github.com/GreptimeTeam/greptimedb/pull/7035)
* fix: use instance labels to fetch `greptime_memory_limit_in_bytes` and `greptime_cpu_limit_in_millicores` metrics by [@zyy17](https://github.com/zyy17) in [#7043](https://github.com/GreptimeTeam/greptimedb/pull/7043)
* fix: various typos reported by CI by [@sunng87](https://github.com/sunng87) in [#7047](https://github.com/GreptimeTeam/greptimedb/pull/7047)
* fix: build_grpc_server visibility by [@sunng87](https://github.com/sunng87) in [#7054](https://github.com/GreptimeTeam/greptimedb/pull/7054)
* fix: only skips auto convert when encoding is sparse by [@evenyag](https://github.com/evenyag) in [#7056](https://github.com/GreptimeTeam/greptimedb/pull/7056)
* fix: show proper error msg, when executing non-admin functions as admin functions by [@Shyamnatesan](https://github.com/Shyamnatesan) in [#7061](https://github.com/GreptimeTeam/greptimedb/pull/7061)
* fix: support dictionary in regex match by [@evenyag](https://github.com/evenyag) in [#7055](https://github.com/GreptimeTeam/greptimedb/pull/7055)
* fix: correct impl Clear for &[u8] by [@v0y4g3r](https://github.com/v0y4g3r) in [#7081](https://github.com/GreptimeTeam/greptimedb/pull/7081)
* fix: part cols not in projection by [@discord9](https://github.com/discord9) in [#7090](https://github.com/GreptimeTeam/greptimedb/pull/7090)
* fix: fix build warnings by [@WenyXu](https://github.com/WenyXu) in [#7099](https://github.com/GreptimeTeam/greptimedb/pull/7099)
* fix: list inner type for json and valueref, refactor type to ref for struct/list by [@sunng87](https://github.com/sunng87) in [#7113](https://github.com/GreptimeTeam/greptimedb/pull/7113)
* fix: prom ql logical plan use column index not name by [@discord9](https://github.com/discord9) in [#7109](https://github.com/GreptimeTeam/greptimedb/pull/7109)
* fix: unit test about trigger parser by [@fengys1996](https://github.com/fengys1996) in [#7132](https://github.com/GreptimeTeam/greptimedb/pull/7132)
* fix: fix index and tag filtering for flat format by [@evenyag](https://github.com/evenyag) in [#7121](https://github.com/GreptimeTeam/greptimedb/pull/7121)
* fix: correct test_index_build_type_compact by [@SNC123](https://github.com/SNC123) in [#7137](https://github.com/GreptimeTeam/greptimedb/pull/7137)
* fix: count_state use stat to eval&predicate w/out region by [@discord9](https://github.com/discord9) in [#7116](https://github.com/GreptimeTeam/greptimedb/pull/7116)
* fix: add delays in reconcile tests for async cache invalidation by [@WenyXu](https://github.com/WenyXu) in [#7147](https://github.com/GreptimeTeam/greptimedb/pull/7147)
* fix: cache estimate methods by [@waynexia](https://github.com/waynexia) in [#7157](https://github.com/GreptimeTeam/greptimedb/pull/7157)
* fix: missing flamegraph feature in pprof dependency by [@WenyXu](https://github.com/WenyXu) in [#7158](https://github.com/GreptimeTeam/greptimedb/pull/7158)
* fix: memtable value push result was ignored by [@MichaelScofield](https://github.com/MichaelScofield) in [#7136](https://github.com/GreptimeTeam/greptimedb/pull/7136)
* fix: initializer container not work by [@daviderli614](https://github.com/daviderli614) in [#7152](https://github.com/GreptimeTeam/greptimedb/pull/7152)
* fix: avoid filtering rows with delete op by fields under merge mode by [@evenyag](https://github.com/evenyag) in [#7154](https://github.com/GreptimeTeam/greptimedb/pull/7154)
* fix: potential failure in tests by [@killme2008](https://github.com/killme2008) in [#7167](https://github.com/GreptimeTeam/greptimedb/pull/7167)
* fix: stabilize test results by [@shuiyisong](https://github.com/shuiyisong) in [#7182](https://github.com/GreptimeTeam/greptimedb/pull/7182)
* fix(mito): append mode in flat format not working by [@v0y4g3r](https://github.com/v0y4g3r) in [#7186](https://github.com/GreptimeTeam/greptimedb/pull/7186)
* fix(mito): avoid shortcut in picking multi window files by [@v0y4g3r](https://github.com/v0y4g3r) in [#7174](https://github.com/GreptimeTeam/greptimedb/pull/7174)
* fix: add serde defaults for `MetasrvNodeInfo` by [@WenyXu](https://github.com/WenyXu) in [#7204](https://github.com/GreptimeTeam/greptimedb/pull/7204)
* fix: allow case-insensitive timezone settings by [@sunng87](https://github.com/sunng87) in [#7207](https://github.com/GreptimeTeam/greptimedb/pull/7207)
* fix: correct leader state reset and region migration locking consistency by [@WenyXu](https://github.com/WenyXu) in [#7199](https://github.com/GreptimeTeam/greptimedb/pull/7199)
* fix(mito): allow region edit in writable state by [@v0y4g3r](https://github.com/v0y4g3r) in [#7201](https://github.com/GreptimeTeam/greptimedb/pull/7201)
* fix: deregister failure detectors on rollback and improve timeout handling by [@WenyXu](https://github.com/WenyXu) in [#7212](https://github.com/GreptimeTeam/greptimedb/pull/7212)

### 🚜 Refactor

* refactor: use DataFusion's Signature directly in UDF by [@MichaelScofield](https://github.com/MichaelScofield) in [#6908](https://github.com/GreptimeTeam/greptimedb/pull/6908)
* refactor: use DataFusion's return_type in our function trait directly by [@MichaelScofield](https://github.com/MichaelScofield) in [#6935](https://github.com/GreptimeTeam/greptimedb/pull/6935)
* refactor: refactor `PeerLookupService` and simplify `Selector` implementations by [@WenyXu](https://github.com/WenyXu) in [#6939](https://github.com/GreptimeTeam/greptimedb/pull/6939)
* refactor: rewrite h3 functions to DataFusion style by [@MichaelScofield](https://github.com/MichaelScofield) in [#6942](https://github.com/GreptimeTeam/greptimedb/pull/6942)
* refactor: region follower management with unified interface by [@WenyXu](https://github.com/WenyXu) in [#6986](https://github.com/GreptimeTeam/greptimedb/pull/6986)
* refactor: put FileId to store-api by [@discord9](https://github.com/discord9) in [#6988](https://github.com/GreptimeTeam/greptimedb/pull/6988)
* refactor: rewrite some UDFs to DataFusion style (part 2) by [@MichaelScofield](https://github.com/MichaelScofield) in [#6967](https://github.com/GreptimeTeam/greptimedb/pull/6967)
* refactor: rewrite some UDFs to DataFusion style (part 3) by [@MichaelScofield](https://github.com/MichaelScofield) in [#6990](https://github.com/GreptimeTeam/greptimedb/pull/6990)
* refactor(cli): refactor object storage config by [@WenyXu](https://github.com/WenyXu) in [#7009](https://github.com/GreptimeTeam/greptimedb/pull/7009)
* refactor: rewrite some UDFs to DataFusion style (part 4) by [@MichaelScofield](https://github.com/MichaelScofield) in [#7011](https://github.com/GreptimeTeam/greptimedb/pull/7011)
* refactor: cleanup datafusion-pg-catalog dependencies by [@sunng87](https://github.com/sunng87) in [#7025](https://github.com/GreptimeTeam/greptimedb/pull/7025)
* refactor: rewrite some UDFs to DataFusion style (final part) by [@MichaelScofield](https://github.com/MichaelScofield) in [#7023](https://github.com/GreptimeTeam/greptimedb/pull/7023)
* refactor: make `Function` trait a simple shim of DataFusion UDF by [@MichaelScofield](https://github.com/MichaelScofield) in [#7036](https://github.com/GreptimeTeam/greptimedb/pull/7036)
* refactor: add cgroup metrics collector by [@zyy17](https://github.com/zyy17) in [#7038](https://github.com/GreptimeTeam/greptimedb/pull/7038)
* refactor: remove duplicated valueref to json by [@sunng87](https://github.com/sunng87) in [#7062](https://github.com/GreptimeTeam/greptimedb/pull/7062)
* refactor: restructure sqlness to support multiple envs and extract common utils by [@WenyXu](https://github.com/WenyXu) in [#7066](https://github.com/GreptimeTeam/greptimedb/pull/7066)
* refactor: remove unused grpc-expr module and pb conversions by [@sunng87](https://github.com/sunng87) in [#7085](https://github.com/GreptimeTeam/greptimedb/pull/7085)
* refactor: add `peer_hostname` field in `information_schema.cluster_info` table by [@zyy17](https://github.com/zyy17) in [#7050](https://github.com/GreptimeTeam/greptimedb/pull/7050)
* refactor: update valueref coerce function name based on its semantics by [@sunng87](https://github.com/sunng87) in [#7098](https://github.com/GreptimeTeam/greptimedb/pull/7098)
* refactor: convert to mysql values directly from arrow by [@MichaelScofield](https://github.com/MichaelScofield) in [#7096](https://github.com/GreptimeTeam/greptimedb/pull/7096)
* refactor: convert to postgres values directly from arrow by [@MichaelScofield](https://github.com/MichaelScofield) in [#7131](https://github.com/GreptimeTeam/greptimedb/pull/7131)
* refactor: refactor instruction handler and adds support for batch region downgrade operations by [@WenyXu](https://github.com/WenyXu) in [#7130](https://github.com/GreptimeTeam/greptimedb/pull/7130)
* refactor: use generic for heartbeat instruction handler by [@discord9](https://github.com/discord9) in [#7149](https://github.com/GreptimeTeam/greptimedb/pull/7149)
* refactor: add test feature gate to numbers table by [@shuiyisong](https://github.com/shuiyisong) in [#7148](https://github.com/GreptimeTeam/greptimedb/pull/7148)
* refactor: convert to prometheus values directly from arrow by [@MichaelScofield](https://github.com/MichaelScofield) in [#7153](https://github.com/GreptimeTeam/greptimedb/pull/7153)
* refactor: add support for batch region upgrade operations part1 by [@WenyXu](https://github.com/WenyXu) in [#7155](https://github.com/GreptimeTeam/greptimedb/pull/7155)
* refactor: add support for batch region upgrade operations part2 by [@WenyXu](https://github.com/WenyXu) in [#7160](https://github.com/GreptimeTeam/greptimedb/pull/7160)
* refactor: convert to influxdb values directly from arrow by [@MichaelScofield](https://github.com/MichaelScofield) in [#7163](https://github.com/GreptimeTeam/greptimedb/pull/7163)

### 📚 Documentation

* docs: update memory profiling description doc by [@sunng87](https://github.com/sunng87) in [#6960](https://github.com/GreptimeTeam/greptimedb/pull/6960)
* docs: laminar flow rfc by [@discord9](https://github.com/discord9) in [#6928](https://github.com/GreptimeTeam/greptimedb/pull/6928)

### 🧪 Testing

* test: add upgrade compatibility tests by [@WaterWhisperer](https://github.com/WaterWhisperer) in [#6863](https://github.com/GreptimeTeam/greptimedb/pull/6863)
* test: migrate aggregation tests from duckdb, part4 by [@killme2008](https://github.com/killme2008) in [#6965](https://github.com/GreptimeTeam/greptimedb/pull/6965)
* test: update unit test by passing extra sort columns by [@discord9](https://github.com/discord9) in [#7030](https://github.com/GreptimeTeam/greptimedb/pull/7030)
* test: run engine unit tests for flat format by [@evenyag](https://github.com/evenyag) in [#7119](https://github.com/GreptimeTeam/greptimedb/pull/7119)
* test: add sqlness for delete and filter by [@evenyag](https://github.com/evenyag) in [#7171](https://github.com/GreptimeTeam/greptimedb/pull/7171)
* test: run sqlness for flat format by [@evenyag](https://github.com/evenyag) in [#7178](https://github.com/GreptimeTeam/greptimedb/pull/7178)
* test: add a unit test to scan data from memtable in append mode by [@evenyag](https://github.com/evenyag) in [#7193](https://github.com/GreptimeTeam/greptimedb/pull/7193)
* test: only set ttl to forever in fuzz alter test by [@evenyag](https://github.com/evenyag) in [#7202](https://github.com/GreptimeTeam/greptimedb/pull/7202)

### ⚙️ Miscellaneous Tasks

* chore: bump main branch version to 0.18 by [@WenyXu](https://github.com/WenyXu) in [#6890](https://github.com/GreptimeTeam/greptimedb/pull/6890)
* chore: clean up `FlowEngine` trait by [@discord9](https://github.com/discord9) in [#6934](https://github.com/GreptimeTeam/greptimedb/pull/6934)
* chore: add tests for postgre backend with tls by [@WenyXu](https://github.com/WenyXu) in [#6973](https://github.com/GreptimeTeam/greptimedb/pull/6973)
* chore: bump sequence on region edit by [@v0y4g3r](https://github.com/v0y4g3r) in [#6947](https://github.com/GreptimeTeam/greptimedb/pull/6947)
* chore: unset tz env in test by [@v0y4g3r](https://github.com/v0y4g3r) in [#6984](https://github.com/GreptimeTeam/greptimedb/pull/6984)
* chore: modify  LogExpr AggrFunc by [@paomian](https://github.com/paomian) in [#6948](https://github.com/GreptimeTeam/greptimedb/pull/6948)
* chore: improve error logging in WAL prune manager by [@WenyXu](https://github.com/WenyXu) in [#6993](https://github.com/GreptimeTeam/greptimedb/pull/6993)
* chore: update proto by [@discord9](https://github.com/discord9) in [#6992](https://github.com/GreptimeTeam/greptimedb/pull/6992)
* chore: add function for getting started on metasrv by [@shuiyisong](https://github.com/shuiyisong) in [#7022](https://github.com/GreptimeTeam/greptimedb/pull/7022)
* chore: add some trace logs in fetching data from cache and object store by [@zyy17](https://github.com/zyy17) in [#6877](https://github.com/GreptimeTeam/greptimedb/pull/6877)
* chore: disable file not exist on watch_file_user_provider by [@shuiyisong](https://github.com/shuiyisong) in [#7028](https://github.com/GreptimeTeam/greptimedb/pull/7028)
* chore: not warning by [@discord9](https://github.com/discord9) in [#7037](https://github.com/GreptimeTeam/greptimedb/pull/7037)
* chore: improve create trigger display by [@fengys1996](https://github.com/fengys1996) in [#7027](https://github.com/GreptimeTeam/greptimedb/pull/7027)
* chore: rename the default ts column name to `greptime_timestamp` for influxdb line protocol by [@shuiyisong](https://github.com/shuiyisong) in [#7046](https://github.com/GreptimeTeam/greptimedb/pull/7046)
* chore: add trigger querier factory trait by [@fengys1996](https://github.com/fengys1996) in [#7053](https://github.com/GreptimeTeam/greptimedb/pull/7053)
* chore: update rust to nightly 2025-10-01 by [@MichaelScofield](https://github.com/MichaelScofield) in [#7069](https://github.com/GreptimeTeam/greptimedb/pull/7069)
* chore: add information extension to the plugins in standalone by [@shuiyisong](https://github.com/shuiyisong) in [#7079](https://github.com/GreptimeTeam/greptimedb/pull/7079)
* ci: update dev-builder image tag by [@github-actions[bot]](https://github.com/github-actions[bot]) in [#7073](https://github.com/GreptimeTeam/greptimedb/pull/7073)
* chore: pub route_prometheus function by [@v0y4g3r](https://github.com/v0y4g3r) in [#7101](https://github.com/GreptimeTeam/greptimedb/pull/7101)
* chore: remove unused deps by [@fengys1996](https://github.com/fengys1996) in [#7108](https://github.com/GreptimeTeam/greptimedb/pull/7108)
* chore: pr review reminder by [@fengjiachun](https://github.com/fengjiachun) in [#7120](https://github.com/GreptimeTeam/greptimedb/pull/7120)
* chore: update datafusion to 50 by [@MichaelScofield](https://github.com/MichaelScofield) in [#7076](https://github.com/GreptimeTeam/greptimedb/pull/7076)
* chore: set default catalog using build env by [@shuiyisong](https://github.com/shuiyisong) in [#7156](https://github.com/GreptimeTeam/greptimedb/pull/7156)
* chore: unify initialization of channel manager by [@shuiyisong](https://github.com/shuiyisong) in [#7159](https://github.com/GreptimeTeam/greptimedb/pull/7159)
* chore: fix typo by [@sunng87](https://github.com/sunng87) in [#7169](https://github.com/GreptimeTeam/greptimedb/pull/7169)
* chore: improve search traces and jaeger resp by [@shuiyisong](https://github.com/shuiyisong) in [#7166](https://github.com/GreptimeTeam/greptimedb/pull/7166)
* chore(metrics): add region server requests failures count metrics by [@v0y4g3r](https://github.com/v0y4g3r) in [#7173](https://github.com/GreptimeTeam/greptimedb/pull/7173)
* chore: update readme by [@sunng87](https://github.com/sunng87) in [#7187](https://github.com/GreptimeTeam/greptimedb/pull/7187)
* chore: remove unnecessary code related to triggers by [@fengys1996](https://github.com/fengys1996) in [#7192](https://github.com/GreptimeTeam/greptimedb/pull/7192)
* chore: print root cause in opendal logging interceptor by [@evenyag](https://github.com/evenyag) in [#7183](https://github.com/GreptimeTeam/greptimedb/pull/7183)
* chore: remove ttl option if presents in trace meta table by [@shuiyisong](https://github.com/shuiyisong) in [#7197](https://github.com/GreptimeTeam/greptimedb/pull/7197)
* chore: bump main branch version to 1.0.0-beta.1 by [@discord9](https://github.com/discord9) in [#7191](https://github.com/GreptimeTeam/greptimedb/pull/7191)

### Build

* build: bump rust edition to 2024 by [@waynexia](https://github.com/waynexia) in [#6920](https://github.com/GreptimeTeam/greptimedb/pull/6920)

## New Contributors

* [@Standing-Man](https://github.com/Standing-Man) made their first contribution in [#7146](https://github.com/GreptimeTeam/greptimedb/pull/7146)
* [@Shyamnatesan](https://github.com/Shyamnatesan) made their first contribution in [#7061](https://github.com/GreptimeTeam/greptimedb/pull/7061)
* [@cscnk52](https://github.com/cscnk52) made their first contribution in [#6946](https://github.com/GreptimeTeam/greptimedb/pull/6946)
* [@WaterWhisperer](https://github.com/WaterWhisperer) made their first contribution in [#6863](https://github.com/GreptimeTeam/greptimedb/pull/6863)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@MichaelScofield](https://github.com/MichaelScofield), [@SNC123](https://github.com/SNC123), [@Shyamnatesan](https://github.com/Shyamnatesan), [@Standing-Man](https://github.com/Standing-Man), [@WaterWhisperer](https://github.com/WaterWhisperer), [@WenyXu](https://github.com/WenyXu), [@ZonaHex](https://github.com/ZonaHex), [@aaraujo](https://github.com/aaraujo), [@cscnk52](https://github.com/cscnk52), [@daviderli614](https://github.com/daviderli614), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@fengys1996](https://github.com/fengys1996), [@github-actions[bot]](https://github.com/github-actions[bot]), [@killme2008](https://github.com/killme2008), [@linyihai](https://github.com/linyihai), [@paomian](https://github.com/paomian), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@zhongzc](https://github.com/zhongzc), [@zyy17](https://github.com/zyy17)


