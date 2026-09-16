---
keywords: [release, GreptimeDB, changelog, v1.2.1]
description: GreptimeDB v1.2.1 Changelog
date: 2026-09-16
---
# v1.2.1

Release date: September 16, 2026

GreptimeDB v1.2.1 is a maintenance release that fixes a JSON2 data-loss issue during compaction, several query-correctness bugs in PromQL and aggregations, MySQL-protocol compatibility with JDBC clients such as DataGrip, and stability issues in memory allocation and CPU profiling.

We recommend users on v1.2.0 upgrade to v1.2.1.

### 👍 Highlights

- **JSON2 data-loss prevention.** Misaligned Parquet statistics under projection could incorrectly prune JSON2 data during reads and cause data loss during strict-window compaction ([#9129](https://github.com/GreptimeTeam/greptimedb/pull/9129)); mixed JSON2 types are now preserved during compaction ([#9135](https://github.com/GreptimeTeam/greptimedb/pull/9135)), and native JSON2 row inserts over gRPC handle SQL NULL correctly ([#9145](https://github.com/GreptimeTeam/greptimedb/pull/9145)).
- **Query correctness.** `count(*)` stays correct after online repartition or SPLIT PARTITION ([#9154](https://github.com/GreptimeTeam/greptimedb/pull/9154)); PromQL rate windows accumulate counter resets correctly ([#9089](https://github.com/GreptimeTeam/greptimedb/pull/9089)) and skip NULL samples with fixed extrapolation order ([#9118](https://github.com/GreptimeTeam/greptimedb/pull/9118)); mixed MIN/MAX aggregates no longer apply incomplete dynamic filters ([#9102](https://github.com/GreptimeTeam/greptimedb/pull/9102)).
- **MySQL compatibility.** SQL statements with leading comments are now handled before federated statement filtering, so JDBC clients that prefix statements with comments (such as DataGrip) can introspect and query the database ([#9156](https://github.com/GreptimeTeam/greptimedb/pull/9156)).
- **Stability.** jemalloc is updated to the 0.7 crate series with a pinned fix for thread-cache initialization crashes ([#9103](https://github.com/GreptimeTeam/greptimedb/pull/9103), [#9119](https://github.com/GreptimeTeam/greptimedb/pull/9119)), and CPU profiling switches to the framehop unwinder to address profiling-related crashes ([#9125](https://github.com/GreptimeTeam/greptimedb/pull/9125)).

### 🐛 Bug Fixes

* fix(query): prevent incomplete aggregate dynamic filtering by [@discord9](https://github.com/discord9) in [#9102](https://github.com/GreptimeTeam/greptimedb/pull/9102)
* fix(promql): correct counter reset accumulation in rate windows by [@killme2008](https://github.com/killme2008) in [#9089](https://github.com/GreptimeTeam/greptimedb/pull/9089)
* fix(mito2): prevent JSON2 SWCS data loss from misaligned Parquet statistics due to projection by [@v0y4g3r](https://github.com/v0y4g3r) in [#9129](https://github.com/GreptimeTeam/greptimedb/pull/9129)
* fix: bump jemalloc crates to 0.7 and patch tikv-jemalloc-sys with tcache init fix by [@v0y4g3r](https://github.com/v0y4g3r) in [#9103](https://github.com/GreptimeTeam/greptimedb/pull/9103)
* fix(promql): skip NULL samples and fix counter extrapolation order by [@killme2008](https://github.com/killme2008) in [#9118](https://github.com/GreptimeTeam/greptimedb/pull/9118)
* fix(mito): preserve mixed JSON2 types during compaction by [@v0y4g3r](https://github.com/v0y4g3r) in [#9135](https://github.com/GreptimeTeam/greptimedb/pull/9135)
* fix: support native JSON2 row inserts over gRPC by [@MichaelScofield](https://github.com/MichaelScofield) in [#9145](https://github.com/GreptimeTeam/greptimedb/pull/9145)
* fix: preserve count correctness after repartition by [@WenyXu](https://github.com/WenyXu) in [#9154](https://github.com/GreptimeTeam/greptimedb/pull/9154)
* fix(mysql): strip leading comments before the federated statement filter by [@killme2008](https://github.com/killme2008) in [#9156](https://github.com/GreptimeTeam/greptimedb/pull/9156)
* fix(wal): bound Kafka requests and extend latency buckets by [@WenyXu](https://github.com/WenyXu) in [#9026](https://github.com/GreptimeTeam/greptimedb/pull/9026)
* fix(flow): drain frontend probe response before selecting peer by [@discord9](https://github.com/discord9) in [#9082](https://github.com/GreptimeTeam/greptimedb/pull/9082)
* fix(cli): sanitize store_addrs in kvbackend build log by [@LiuQhahah](https://github.com/LiuQhahah) in [#8967](https://github.com/GreptimeTeam/greptimedb/pull/8967)
* fix(prometheus): align batch flush deadline with creation by [@v0y4g3r](https://github.com/v0y4g3r) in [#8802](https://github.com/GreptimeTeam/greptimedb/pull/8802)

### 🚀 Features

* feat(pprof): switch CPU profiler to framehop unwinder by [@v0y4g3r](https://github.com/v0y4g3r) in [#9125](https://github.com/GreptimeTeam/greptimedb/pull/9125)

### ⚙️ Miscellaneous Tasks

* chore: bump tikv-jemalloc-sys patch to jemalloc dev (ff80bf2d) by [@v0y4g3r](https://github.com/v0y4g3r) in [#9119](https://github.com/GreptimeTeam/greptimedb/pull/9119)
