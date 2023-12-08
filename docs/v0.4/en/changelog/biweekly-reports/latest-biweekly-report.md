---
title: Biweekly Report (Nov.13 - Nov.26) – Storage Engine Mito2 -  Constantly Evolving
category: Engineering
summary: A recap of the past two-weeks progress and changes happened on GreptimeDB.
cover: /blogs/2023-11-29-biweekly-report/coverimage.png
authors:
  - name: Jiachun Feng
    email: jiachun@greptime.com
modify: November 29, 2023
---

## Summary

Together with our global community of contributors, GreptimeDB continues to evolve and flourish as a growing open-source project. We are grateful to each and every one of you.

In the past two weeks, we have made steady progress. Below are some highlights:

- Removed the storage crate from the dependency lists of other crates, and the actual storage engine is `Mito2`.

- Enabled distributed tracing in GreptimeDB.

- A new `Decimal128` type has been added to the supported types.

- A row group level page cache for the `Mito` engine has been implemented in order to reduce data scan time.

- New modules region migration and inverted index are currently under accelerated development.

## Contributors

For the past two weeks, our community has been super active with a total of 58 PRs merged. 7 PRs from 4 external contributors merged successfully and lots pending to be merged.

Congrats on becoming our most active contributors in the past 2 weeks:

- @[bigboss2063](https://github.com/bigboss2063) ([db#2775](https://github.com/GreptimeTeam/greptimedb/pull/2775))

- @[lyang24](https://github.com/lyang24) ([db#2765](https://github.com/GreptimeTeam/greptimedb/pull/2765))

- @[taobo](https://github.com/realtaobo)（[db#2748](https://github.com/GreptimeTeam/greptimedb/pull/2748))

- @[tisonkun](https://github.com/tisonkun) ([db#2799](https://github.com/GreptimeTeam/greptimedb/pull/2799) [db#2734](https://github.com/GreptimeTeam/greptimedb/pull/2734) [db#2781](https://github.com/GreptimeTeam/greptimedb/pull/2781) [db#2716](https://github.com/GreptimeTeam/greptimedb/pull/2716))

👏  Welcome contributor @[bigboss2063](https://github.com/bigboss2063) @[lyang24](https://github.com/lyang24) @[taobo](https://github.com/realtaobo) to the community as new contributors, and congratulations on successfully merging their first PR!

A big THANK YOU to all our members and contributors! It is people like you who are making GreptimeDB a great product. Let's build an even greater community together.

## Highlights of Recent PR

### [#2777](https://github.com/GreptimeTeam/greptimedb/pull/2777)  This PR removes the storage crate from other crates' dependency lists and the actual storage engine is `Mito2`.

### [#2755](https://github.com/GreptimeTeam/greptimedb/pull/2755) To enable distributed tracing in GreptimeDB.
Use otlp as exporter protocol, which can support distributed tracing backend like jaeger, tempo etc.

### [#2788](https://github.com/GreptimeTeam/greptimedb/pull/2788) A new `Decimal128` type has been added to the supported types.

### [#2688](https://github.com/GreptimeTeam/greptimedb/pull/2688)
This PR implements a row group level page cache for the Mito engine.

A new page reader `CachedPageReader` is introduced to return pages of a row group from the cache.

When the first time we read a row group, all pages of the row group are loaded and put it into the cache. The next time we read, we can fetch cached pages from the cache and build a `CachedPageReader`.

Cached pages are decompressed, so we can skip the decompression step and reduce 20% - 30% of the total scan time if a query hits the cache.

#### Region migration is under development, details can be found at https://github.com/GreptimeTeam/greptimedb/issues/2700

#### The inverted index is also under intensive development, details can be found at https://github.com/GreptimeTeam/greptimedb/issues/2705

## Good First Issue

#### [#2637](https://github.com/GreptimeTeam/greptimedb/issues/2637) Add more SQLness case for special characters in identifier 

#### [#2601](https://github.com/GreptimeTeam/greptimedb/issues/2601) Execute `create database` in procedure
