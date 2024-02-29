# Biweekly Report - Spring Into GreptimeDB v0.7 - Anticipating New Features, Welcome New Contributors!
February 28, 2024

## Summary

Together with our global community of contributors, GreptimeDB continues to evolve and flourish as a growing open-source project. We are grateful to each and every one of you.

Over the past two weeks, following a brief holiday, we refocused our efforts on the release of version 0.7, which is expected to launch soon. Here are the updates:

- Significantly improved the write and query performance of the Memtable, merging a total of 18 PRs related to Memtable during this period

- Continuous development of the Greptime Flow stream processing engine

- Ongoing expansion of Information Schema to enhance the observability of GreptimeDB

- Code issue fixes and performance optimization for inverted indexes and the Metric Engine

## Contributors

For the past two weeks, our community has been super active with a total of 58 PRs merged. 5 PRs from 5 individual contributors have been successfully merged, with many more pending merger.

Congrats on becoming our most active contributors in the past 2 weeks:

- @[caicancai](https://github.com/caicancai) ([db#3299](https://github.com/GreptimeTeam/greptimedb/pull/3299))

- @[dimbtp](https://github.com/dimbtp) ([db#3389](https://github.com/GreptimeTeam/greptimedb/pull/3389))

- @[Hudson C. Dalprá](https://github.com/dalprahcd) ([db#3280](https://github.com/GreptimeTeam/greptimedb/pull/3280))

- @[KKould](https://github.com/KKould) ([db#3360](https://github.com/GreptimeTeam/greptimedb/pull/3360))

- @[SteveLauC](https://github.com/SteveLauC) ([db#3352](https://github.com/GreptimeTeam/greptimedb/pull/3352))

👏  Welcome contributor @[caicancai](https://github.com/caicancai) @[Hudson C. Dalprá](https://github.com/dalprahcd) @[KKould](https://github.com/KKould) @[SteveLauC](https://github.com/SteveLauC) join to the community!

<p><img src="/blogs/2024-02-28-biweekly-report/contributorpost.jpg" alt="latency figure" style="width: 70%; margin: 0 auto"></p>

🌟 Special thanks to our distinguished contributor @yurivict, Greptime is now supported for installation on FreeBSD: https://cgit.freebsd.org/ports/tree/databases/greptimedb.

A big THANK YOU to all our members and contributors! It is people like you who are making GreptimeDB a great product. Let's build an even greater community together.

## Highlights of Recent PR

### [#3278](https://github.com/GreptimeTeam/greptimedb/pull/3278) Added partitions and `greptime_region_peers` tables to the information schema

- Users can query the distribution of Table Partitions through the `partitions` table.

- Users can query the distribution of regions through the `greptime_region_peers` table.

### [#3271](https://github.com/GreptimeTeam/greptimedb/pull/3271) [#3293](https://github.com/GreptimeTeam/greptimedb/pull/3293) Optimized the allocation logic for TableID during table creation

The new version allows procedures to handle the allocation of TableIDs during table creation, instead of pre-allocating TableIDs before table creation. This effectively reduces the waste of TableIDs in scenarios of concurrent table creations due to pre-allocation.

### [#3310](https://github.com/GreptimeTeam/greptimedb/pull/3310) Optimized the display of distributed tracing links

Corrected the incorrect propagation of tracing ID in query chains and fixed the call chains under distributed tracing.

### [#3325](https://github.com/GreptimeTeam/greptimedb/pull/3325) Added `migrate_region` and `procedure_state` functions

Users can migrate regions between Datanodes using the `migrate_region` function in SQL, and query the status of a specific procedure with the `procedure_state` function.

### [#3364](https://github.com/GreptimeTeam/greptimedb/pull/3364) Optimized Column Filling Logic

The logic for filling NULL values in Put and Delete requests has been optimized for the Mito2 Engine, resulting in up to a threefold performance improvement in Put requests under specific conditions.

### [#3360](https://github.com/GreptimeTeam/greptimedb/pull/3360) GreptimeDB now supports the use of the `isnull function` in queries

## Good First Issue

### [#3366](https://github.com/GreptimeTeam/greptimedb/issues/3366) Refactored the implementation of information_schema to reduce redundant code within information_schema

Keywords: information_schema

Difficulty: Medium

### [#3365](https://github.com/GreptimeTeam/greptimedb/issues/3365) Simplified the writing of administration functions using Rust's procedural macros

Keywords: administration functions

Difficulty: Medium

### [#3354](https://github.com/GreptimeTeam/greptimedb/issues/3354) Added support for SHOW statements within the MySQL protocol for information_schema

Keywords: information_schema

Difficulty: Medium
