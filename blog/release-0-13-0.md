---
keywords: [release, GreptimeDB, changelog, v0.13.0]
description: GreptimeDB v0.13.0 Changelog
date: 2025-03-14
---

# v0.13.0

Release date: March 14, 2025

## 👍 Highlights

* Introduced roaring bitmap to optimize sparse value scenarios
* Added support for IP-related functions
* Enhanced PromQL with support for `quantile` and `count_values` functions
* Improved time series distribution in scanner
* Added support for exporting data to S3

## Breaking changes

* refactor!: Remove `Value::DateTime` and `ValueRef::DateTime`. by [@linyihai](https://github.com/linyihai) in https://github.com/GreptimeTeam/greptimedb/pull/5616

### 🚀 Features

* feat: add `vec_dim` function by [@xiaoniaoyouhuajiang](https://github.com/xiaoniaoyouhuajiang) in https://github.com/GreptimeTeam/greptimedb/pull/5587
* feat: impl topk and bottomk by [@killme2008](https://github.com/killme2008) in https://github.com/GreptimeTeam/greptimedb/pull/5602
* feat: skip printing full config content in sqlness by [@waynexia](https://github.com/waynexia) in https://github.com/GreptimeTeam/greptimedb/pull/5618
* feat(log-query): implement compound filter and alias expr by [@waynexia](https://github.com/waynexia) in https://github.com/GreptimeTeam/greptimedb/pull/5596
* feat: alias for boolean by [@killme2008](https://github.com/killme2008) in https://github.com/GreptimeTeam/greptimedb/pull/5639
* feat: support some IP related functions by [@waynexia](https://github.com/waynexia) in https://github.com/GreptimeTeam/greptimedb/pull/5614
* feat: rewrite `json_encode_path` to `geo_path` using compound type by [@waynexia](https://github.com/waynexia) in https://github.com/GreptimeTeam/greptimedb/pull/5640
* feat: get tables by ids in catalog manager by [@fengjiachun](https://github.com/fengjiachun) in https://github.com/GreptimeTeam/greptimedb/pull/5645
* feat: opentelemetry trace new data modeling by [@sunng87](https://github.com/sunng87) in https://github.com/GreptimeTeam/greptimedb/pull/5622
* feat: update dashboard to v0.8.0 by [@ZonaHex](https://github.com/ZonaHex) in https://github.com/GreptimeTeam/greptimedb/pull/5666
* feat: support exact filter on time index column by [@evenyag](https://github.com/evenyag) in https://github.com/GreptimeTeam/greptimedb/pull/5671
* feat: introduce roaring bitmap to optimize sparse value scenarios by [@zhongzc](https://github.com/zhongzc) in https://github.com/GreptimeTeam/greptimedb/pull/5603
* feat: time series distribution in scanner by [@waynexia](https://github.com/waynexia) in https://github.com/GreptimeTeam/greptimedb/pull/5675
* feat(promql): supports quantile and count_values by [@killme2008](https://github.com/killme2008) in https://github.com/GreptimeTeam/greptimedb/pull/5652
* feat: also get index file&expose mito in metrics by [@discord9](https://github.com/discord9) in https://github.com/GreptimeTeam/greptimedb/pull/5680
* feat: add description for each grafana panel by [@sunng87](https://github.com/sunng87) in https://github.com/GreptimeTeam/greptimedb/pull/5673
* feat: update promql-parser to 0.5 for duration literal by [@sunng87](https://github.com/sunng87) in https://github.com/GreptimeTeam/greptimedb/pull/5682
* feat: add hint for logical region in RegionScanner by [@evenyag](https://github.com/evenyag) in https://github.com/GreptimeTeam/greptimedb/pull/5684
* feat: add a gauge for download tasks by [@evenyag](https://github.com/evenyag) in https://github.com/GreptimeTeam/greptimedb/pull/5681
* feat: alter region follower by [@fengjiachun](https://github.com/fengjiachun) in https://github.com/GreptimeTeam/greptimedb/pull/5676
* feat: support export command export data to s3 by [@yihong0618](https://github.com/yihong0618) in https://github.com/GreptimeTeam/greptimedb/pull/5585
* feat: enhancement information_schema.flows by [@AntiTopQuark](https://github.com/AntiTopQuark) in https://github.com/GreptimeTeam/greptimedb/pull/5623
* feat: add mysql kvbackend by [@CookiePieWw](https://github.com/CookiePieWw) in https://github.com/GreptimeTeam/greptimedb/pull/5528
* feat: add Docker image tag information to step summary in dev-build workflow by [@waynexia](https://github.com/waynexia) in https://github.com/GreptimeTeam/greptimedb/pull/5692
* feat: expose virtual_host_style config for s3 storage by [@evenyag](https://github.com/evenyag) in https://github.com/GreptimeTeam/greptimedb/pull/5696
* feat: make empty parent_span_id null for v1 by [@sunng87](https://github.com/sunng87) in https://github.com/GreptimeTeam/greptimedb/pull/5690
* feat: add simple extract processor by [@shuiyisong](https://github.com/shuiyisong) in https://github.com/GreptimeTeam/greptimedb/pull/5688

### 🐛 Fixes

* fix: check physical region before use by [@waynexia](https://github.com/waynexia) in https://github.com/GreptimeTeam/greptimedb/pull/5612
* fix: update typos rules to fix ci by [@yihong0618](https://github.com/yihong0618) in https://github.com/GreptimeTeam/greptimedb/pull/5621
* fix: speed up cargo build using sallow clone by [@yihong0618](https://github.com/yihong0618) in https://github.com/GreptimeTeam/greptimedb/pull/5620
* fix: increase timeout for opening candidate region and log elapsed time by [@WenyXu](https://github.com/WenyXu) in https://github.com/GreptimeTeam/greptimedb/pull/5627
* fix: out of bound during bloom search by [@zhongzc](https://github.com/zhongzc) in https://github.com/GreptimeTeam/greptimedb/pull/5625
* fix: refactor region leader state validation by [@WenyXu](https://github.com/WenyXu) in https://github.com/GreptimeTeam/greptimedb/pull/5626
* fix: properly display CJK characters in table/column comments by [@v0y4g3r](https://github.com/v0y4g3r) in https://github.com/GreptimeTeam/greptimedb/pull/5633
* fix: prevent failover of regions to the same peer by [@WenyXu](https://github.com/WenyXu) in https://github.com/GreptimeTeam/greptimedb/pull/5632
* fix: interval rewrite rule that messes up show create flow function by [@v0y4g3r](https://github.com/v0y4g3r) in https://github.com/GreptimeTeam/greptimedb/pull/5642
* fix: unable to install software-properties-common in dev builder by [@daviderli614](https://github.com/daviderli614) in https://github.com/GreptimeTeam/greptimedb/pull/5643
* fix(metric-engine): group DDL requests by [@WenyXu](https://github.com/WenyXu) in https://github.com/GreptimeTeam/greptimedb/pull/5628
* fix: window sort not apply when other column alias to time index name by [@discord9](https://github.com/discord9) in https://github.com/GreptimeTeam/greptimedb/pull/5634
* fix: recover plan schema after dist analyzer by [@waynexia](https://github.com/waynexia) in https://github.com/GreptimeTeam/greptimedb/pull/5665
* fix: flaky test in sqlness by fix random port by [@yihong0618](https://github.com/yihong0618) in https://github.com/GreptimeTeam/greptimedb/pull/5657
* fix: skip schema check to avoid schema mismatch brought by metadata by [@v0y4g3r](https://github.com/v0y4g3r) in https://github.com/GreptimeTeam/greptimedb/pull/5662
* fix: use `DateTime` instead of `NaiveDateTime` by [@shuiyisong](https://github.com/shuiyisong) in https://github.com/GreptimeTeam/greptimedb/pull/5669
* fix: update column requirements to use Column type instead of String by [@waynexia](https://github.com/waynexia) in https://github.com/GreptimeTeam/greptimedb/pull/5672
* fix: correct stalled count by [@evenyag](https://github.com/evenyag) in https://github.com/GreptimeTeam/greptimedb/pull/5678
* fix: FlowInfoValue's compatibility by [@discord9](https://github.com/discord9) in https://github.com/GreptimeTeam/greptimedb/pull/5695
* fix: conversion from TableMeta to TableMetaBuilder by [@v0y4g3r](https://github.com/v0y4g3r) in https://github.com/GreptimeTeam/greptimedb/pull/5693

### 🚜 Refactor

* refactor: add pipeline concept to OTLP traces and remove OTLP over gRPC by [@sunng87](https://github.com/sunng87) in https://github.com/GreptimeTeam/greptimedb/pull/5605
* refactor: simplify udf by [@MichaelScofield](https://github.com/MichaelScofield) in https://github.com/GreptimeTeam/greptimedb/pull/5617
* refactor: rename table function to admin function by [@waynexia](https://github.com/waynexia) in https://github.com/GreptimeTeam/greptimedb/pull/5636
* refactor: remove or deprecated existing UDAF implementation by [@waynexia](https://github.com/waynexia) in https://github.com/GreptimeTeam/greptimedb/pull/5637
* refactor: remove cluster id field by [@v0y4g3r](https://github.com/v0y4g3r) in https://github.com/GreptimeTeam/greptimedb/pull/5610
* refactor(mito): move wal sync task to background by [@v0y4g3r](https://github.com/v0y4g3r) in https://github.com/GreptimeTeam/greptimedb/pull/5677

### 📚 Documentation

* docs: tsbs update by [@discord9](https://github.com/discord9) in https://github.com/GreptimeTeam/greptimedb/pull/5608
* docs: update cluster dashboard to make opendal panel works by [@evenyag](https://github.com/evenyag) in https://github.com/GreptimeTeam/greptimedb/pull/5661

### ⚡ Performance

* perf: rm coalesce batch when target_batch_size > fetch limit by [@discord9](https://github.com/discord9) in https://github.com/GreptimeTeam/greptimedb/pull/5658
* perf(prom): optimize label values query by [@WenyXu](https://github.com/WenyXu) in https://github.com/GreptimeTeam/greptimedb/pull/5653
* perf: support in list in simple filter by [@waynexia](https://github.com/waynexia) in https://github.com/GreptimeTeam/greptimedb/pull/5709

### ⚙️ Miscellaneous Tasks

* chore: bump version to 0.13.0 by [@WenyXu](https://github.com/WenyXu) in https://github.com/GreptimeTeam/greptimedb/pull/5611
* chore: support specifying `skipping` index in pipeline by [@shuiyisong](https://github.com/shuiyisong) in https://github.com/GreptimeTeam/greptimedb/pull/5635
* chore: improve `/v1/jaeger/api/trace/{trace_id}`'s resp by [@shuiyisong](https://github.com/shuiyisong) in https://github.com/GreptimeTeam/greptimedb/pull/5663
* chore: impl ref and ref_mut for json like by [@paomian](https://github.com/paomian) in https://github.com/GreptimeTeam/greptimedb/pull/5679
* chore: make memorykv write happily by [@fengjiachun](https://github.com/fengjiachun) in https://github.com/GreptimeTeam/greptimedb/pull/5686
* chore: check region wal provider on startup to avoid inconsistence by [@v0y4g3r](https://github.com/v0y4g3r) in https://github.com/GreptimeTeam/greptimedb/pull/5687
* chore: support `application/x-ndjson` for log ingest by [@shuiyisong](https://github.com/shuiyisong) in https://github.com/GreptimeTeam/greptimedb/pull/5697
* chore: support `tag` in transform by [@shuiyisong](https://github.com/shuiyisong) in https://github.com/GreptimeTeam/greptimedb/pull/5701
* chore: support `inverted` index in pipeline by [@shuiyisong](https://github.com/shuiyisong) in https://github.com/GreptimeTeam/greptimedb/pull/5700

### CI

* ci: remove ubuntu 20.04 runners by [@sunng87](https://github.com/sunng87) in https://github.com/GreptimeTeam/greptimedb/pull/5545
* ci: bump dev-builder image version to 2024-12-25-a71b93dd-20250305072908 by [@daviderli614](https://github.com/daviderli614) in https://github.com/GreptimeTeam/greptimedb/pull/5651

### Build

* build: use ubuntu-22.04 base image release `dev-build` image by [@daviderli614](https://github.com/daviderli614) in https://github.com/GreptimeTeam/greptimedb/pull/5554

## New Contributors

* [@xiaoniaoyouhuajiang](https://github.com/xiaoniaoyouhuajiang) made their first contribution in https://github.com/GreptimeTeam/greptimedb/pull/5587

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@AntiTopQuark](https://github.com/AntiTopQuark), [@CookiePieWw](https://github.com/CookiePieWw), [@MichaelScofield](https://github.com/MichaelScofield), [@WenyXu](https://github.com/WenyXu), [@ZonaHex](https://github.com/ZonaHex), [@daviderli614](https://github.com/daviderli614), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@killme2008](https://github.com/killme2008), [@linyihai](https://github.com/linyihai), [@paomian](https://github.com/paomian), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@xiaoniaoyouhuajiang](https://github.com/xiaoniaoyouhuajiang), [@yihong0618](https://github.com/yihong0618), [@zhongzc](https://github.com/zhongzc)

**Full Changelog**: https://github.com/GreptimeTeam/greptimedb/compare/v0.12.0...v0.13.0
