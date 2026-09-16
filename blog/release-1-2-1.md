---
keywords: [release, GreptimeDB, changelog, v1.2.1]
description: GreptimeDB v1.2.1 Changelog
date: 2026-09-16
---
# GreptimeDB v1.2.1

This patch release focuses on query correctness, JSON2 storage and write-path correctness, runtime stability, MySQL protocol compatibility, and bounded Kafka requests.

## Bug fixes

### Query correctness

- Fix aggregate dynamic filtering for queries that combine MIN/MAX over expressions and direct columns, preventing an incomplete dynamic filter from pruning rows required by another aggregate. Eligible direct-column MIN/MAX filtering remains enabled. ([#9102](https://github.com/GreptimeTeam/greptimedb/pull/9102))
- Preserve `count(*)` correctness after online repartition or SPLIT PARTITION. ([#9154](https://github.com/GreptimeTeam/greptimedb/pull/9154))
- Fix counter reset accumulation in PromQL rate windows. ([#9089](https://github.com/GreptimeTeam/greptimedb/pull/9089))
- Fix PromQL NULL-sample handling and counter extrapolation ordering, including zero-interval handling. ([#9118](https://github.com/GreptimeTeam/greptimedb/pull/9118))

### Storage correctness

- Fix misaligned Parquet statistics under projection for JSON2 data, which could incorrectly prune data during reads and cause data loss during strict-window compaction. ([#9129](https://github.com/GreptimeTeam/greptimedb/pull/9129))
- Preserve mixed JSON2 types during compaction. ([#9135](https://github.com/GreptimeTeam/greptimedb/pull/9135))
- Fix native JSON2 row inserts over gRPC, including SQL NULL values. Column-oriented JSON2 inserts are outside this fix's scope. ([#9145](https://github.com/GreptimeTeam/greptimedb/pull/9145))

### Protocol compatibility

- Strip leading comments from SQL statements before MySQL federated statement filtering, so JDBC clients that prefix statements with comments (such as DataGrip) can introspect and query the database over the MySQL protocol. ([#9156](https://github.com/GreptimeTeam/greptimedb/pull/9156))

### Reliability and diagnostics

- Drain the frontend probe response before Flow peer selection. ([#9082](https://github.com/GreptimeTeam/greptimedb/pull/9082))
- Align the Prometheus batch flush deadline with batch creation. ([#8802](https://github.com/GreptimeTeam/greptimedb/pull/8802))
- Sanitize credentials in logged CLI KV-backend store addresses. ([#8967](https://github.com/GreptimeTeam/greptimedb/pull/8967))
- Update jemalloc to the 0.7 crate series with a pinned development fix for thread-cache initialization. ([#9103](https://github.com/GreptimeTeam/greptimedb/pull/9103), [#9119](https://github.com/GreptimeTeam/greptimedb/pull/9119))
- Update CPU profiling to pprof 0.15 and use the framehop unwinder on supported platforms. ([#9125](https://github.com/GreptimeTeam/greptimedb/pull/9125))
- Bound Kafka send/response requests, defaulting requests to five seconds while preserving explicit configuration; extend WAL latency histogram buckets. This is a per-request timeout, not a five-second deadline for an entire WAL operation or a rollback guarantee. ([#9026](https://github.com/GreptimeTeam/greptimedb/pull/9026))
