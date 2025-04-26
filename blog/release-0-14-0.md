---
keywords: [release, GreptimeDB, changelog, v0.14.0]
description: GreptimeDB v0.14.0 Changelog
date: 2025-04-25
---

# v0.14.0

Release date: April 25, 2025

## 👍 Highlights

- **Bulk Insert**: Adds support for high-performance bulk data ingestion.
- **Fulltext Enhancements**: Improves fulltext search with new functions (e.g., `matches_term`, `@@` operator), backend switching, and term optimizations.
- **Flow Engine**: Introduces batching mode and dual engine capability for more flexible data processing.
- **Partitioning**: Supports column-wise and UUID-based partition rules for better scalability.
- **Region Management**: New tools for region sync, monitoring, leader region collection, and region failover handling.
- **PromQL Engine**: Enhanced query performance, range manipulation speed, and stability.
- **SQL & API Improvements**: Adds `REPLACE INTO`, new regex and JSON features, and various compatibility fixes.
- **Performance & Reliability**: Optimizations for memory, storage, and parallel computation; numerous bug fixes for stability.
- **Observability**: Per-region metrics, expanded Grafana dashboards, and better profiling tools.
- **Protocol & Integration**: Implements Arrow Flight "DoPut" for fast data loading; improves PostgreSQL protocol support.

**Plus:** Many dependency upgrades, improved config and error handling, and new contributors joined!

## 🖥️ Dashboard

- Upgrade web dashboard to [v0.9](https://github.com/GreptimeTeam/dashboard/releases/tag/v0.9.0), supports SQL explain visualization and editor improvements.

## Breaking changes

* refactor!: Remove `Value::DateTime` and `ValueRef::DateTime`. by [@linyihai](https://github.com/linyihai) in [#5616](https://github.com/GreptimeTeam/greptimedb/pull/5616)
* refactor!: make pipeline a required parameter when ingesting trace by [@sunng87](https://github.com/sunng87) in [#5828](https://github.com/GreptimeTeam/greptimedb/pull/5828)

### 🚀 Features

* feat: add `vec_dim` function by [@xiaoniaoyouhuajiang](https://github.com/xiaoniaoyouhuajiang) in [#5587](https://github.com/GreptimeTeam/greptimedb/pull/5587)
* feat: impl topk and bottomk by [@killme2008](https://github.com/killme2008) in [#5602](https://github.com/GreptimeTeam/greptimedb/pull/5602)
* feat: skip printing full config content in sqlness by [@waynexia](https://github.com/waynexia) in [#5618](https://github.com/GreptimeTeam/greptimedb/pull/5618)
* feat(log-query): implement compound filter and alias expr by [@waynexia](https://github.com/waynexia) in [#5596](https://github.com/GreptimeTeam/greptimedb/pull/5596)
* feat: alias for boolean by [@killme2008](https://github.com/killme2008) in [#5639](https://github.com/GreptimeTeam/greptimedb/pull/5639)
* feat: support some IP related functions by [@waynexia](https://github.com/waynexia) in [#5614](https://github.com/GreptimeTeam/greptimedb/pull/5614)
* feat: rewrite `json_encode_path` to `geo_path` using compound type by [@waynexia](https://github.com/waynexia) in [#5640](https://github.com/GreptimeTeam/greptimedb/pull/5640)
* feat: get tables by ids in catalog manager by [@fengjiachun](https://github.com/fengjiachun) in [#5645](https://github.com/GreptimeTeam/greptimedb/pull/5645)
* feat: opentelemetry trace new data modeling by [@sunng87](https://github.com/sunng87) in [#5622](https://github.com/GreptimeTeam/greptimedb/pull/5622)
* feat: update dashboard to v0.8.0 by [@ZonaHex](https://github.com/ZonaHex) in [#5666](https://github.com/GreptimeTeam/greptimedb/pull/5666)
* feat: support exact filter on time index column by [@evenyag](https://github.com/evenyag) in [#5671](https://github.com/GreptimeTeam/greptimedb/pull/5671)
* feat: introduce roaring bitmap to optimize sparse value scenarios by [@zhongzc](https://github.com/zhongzc) in [#5603](https://github.com/GreptimeTeam/greptimedb/pull/5603)
* feat: time series distribution in scanner by [@waynexia](https://github.com/waynexia) in [#5675](https://github.com/GreptimeTeam/greptimedb/pull/5675)
* feat(promql): supports quantile and count_values by [@killme2008](https://github.com/killme2008) in [#5652](https://github.com/GreptimeTeam/greptimedb/pull/5652)
* feat: also get index file&expose mito in metrics by [@discord9](https://github.com/discord9) in [#5680](https://github.com/GreptimeTeam/greptimedb/pull/5680)
* feat: add description for each grafana panel by [@sunng87](https://github.com/sunng87) in [#5673](https://github.com/GreptimeTeam/greptimedb/pull/5673)
* feat: update promql-parser to 0.5 for duration literal by [@sunng87](https://github.com/sunng87) in [#5682](https://github.com/GreptimeTeam/greptimedb/pull/5682)
* feat: add hint for logical region in RegionScanner by [@evenyag](https://github.com/evenyag) in [#5684](https://github.com/GreptimeTeam/greptimedb/pull/5684)
* feat: add a gauge for download tasks by [@evenyag](https://github.com/evenyag) in [#5681](https://github.com/GreptimeTeam/greptimedb/pull/5681)
* feat: alter region follower by [@fengjiachun](https://github.com/fengjiachun) in [#5676](https://github.com/GreptimeTeam/greptimedb/pull/5676)
* feat: support export command export data to s3 by [@yihong0618](https://github.com/yihong0618) in [#5585](https://github.com/GreptimeTeam/greptimedb/pull/5585)
* feat: enhancement information_schema.flows by [@AntiTopQuark](https://github.com/AntiTopQuark) in [#5623](https://github.com/GreptimeTeam/greptimedb/pull/5623)
*  by [@CookiePieWw](https://github.com/CookiePieWw)
* feat: add Docker image tag information to step summary in dev-build workflow by [@waynexia](https://github.com/waynexia) in [#5692](https://github.com/GreptimeTeam/greptimedb/pull/5692)
* feat: expose virtual_host_style config for s3 storage by [@evenyag](https://github.com/evenyag) in [#5696](https://github.com/GreptimeTeam/greptimedb/pull/5696)
* feat: make empty parent_span_id null for v1 by [@sunng87](https://github.com/sunng87) in [#5690](https://github.com/GreptimeTeam/greptimedb/pull/5690)
* feat: add simple extract processor by [@shuiyisong](https://github.com/shuiyisong) in [#5688](https://github.com/GreptimeTeam/greptimedb/pull/5688)
* feat: move default data path from /tmp to current directory by [@sunng87](https://github.com/sunng87) in [#5719](https://github.com/GreptimeTeam/greptimedb/pull/5719)
* feat: add `vec_subvector` function by [@SNC123](https://github.com/SNC123) in [#5683](https://github.com/GreptimeTeam/greptimedb/pull/5683)
* feat: load manifest manually in mito engine by [@discord9](https://github.com/discord9) in [#5725](https://github.com/GreptimeTeam/greptimedb/pull/5725)
* feat: disable http timeout by [@sunng87](https://github.com/sunng87) in [#5721](https://github.com/GreptimeTeam/greptimedb/pull/5721)
* feat: update pipeline header name to x-greptime-pipeline-name by [@sunng87](https://github.com/sunng87) in [#5710](https://github.com/GreptimeTeam/greptimedb/pull/5710)
* feat: add `vec_kth_elem` function by [@Pikady](https://github.com/Pikady) in [#5674](https://github.com/GreptimeTeam/greptimedb/pull/5674)
* feat: remove duplicated peer definition by [@Wenbin1002](https://github.com/Wenbin1002) in [#5728](https://github.com/GreptimeTeam/greptimedb/pull/5728)
* feat: add mysql election logic by [@CookiePieWw](https://github.com/CookiePieWw) in [#5694](https://github.com/GreptimeTeam/greptimedb/pull/5694)
* feat: introduce `install_manifest_to` for `RegionManifestManager` by [@WenyXu](https://github.com/WenyXu) in [#5742](https://github.com/GreptimeTeam/greptimedb/pull/5742)
* feat: support regex in simple filter by [@waynexia](https://github.com/waynexia) in [#5753](https://github.com/GreptimeTeam/greptimedb/pull/5753)
* feat(flow): frontend client for handle sql by [@discord9](https://github.com/discord9) in [#5761](https://github.com/GreptimeTeam/greptimedb/pull/5761)
* feat: support explain analyze verbose by [@evenyag](https://github.com/evenyag) in [#5763](https://github.com/GreptimeTeam/greptimedb/pull/5763)
* feat: add/correct some kafka-related metrics by [@waynexia](https://github.com/waynexia) in [#5757](https://github.com/GreptimeTeam/greptimedb/pull/5757)
* feat: utilize blob metadata properties by [@zhongzc](https://github.com/zhongzc) in [#5767](https://github.com/GreptimeTeam/greptimedb/pull/5767)
* feat(mito): allow skipping wal while creating tables by [@v0y4g3r](https://github.com/v0y4g3r) in [#5740](https://github.com/GreptimeTeam/greptimedb/pull/5740)
* feat: introduce `RegionFollowerClient` trait by [@WenyXu](https://github.com/WenyXu) in [#5771](https://github.com/GreptimeTeam/greptimedb/pull/5771)
* feat(flow): utils function for recording rule by [@discord9](https://github.com/discord9) in [#5768](https://github.com/GreptimeTeam/greptimedb/pull/5768)
* feat: add `AddRegionFollower` and `RemoveRegionFollower` admin fn by [@WenyXu](https://github.com/WenyXu) in [#5780](https://github.com/GreptimeTeam/greptimedb/pull/5780)
* feat: impl show region by [@WenyXu](https://github.com/WenyXu) in [#5782](https://github.com/GreptimeTeam/greptimedb/pull/5782)
* feat: simple implementation of DictionaryVector by [@waynexia](https://github.com/waynexia) in [#5758](https://github.com/GreptimeTeam/greptimedb/pull/5758)
* feat: expose scanner metrics to df execution metrics by [@evenyag](https://github.com/evenyag) in [#5699](https://github.com/GreptimeTeam/greptimedb/pull/5699)
* feat(pipeline): support table name suffix templating in pipeline by [@shuiyisong](https://github.com/shuiyisong) in [#5775](https://github.com/GreptimeTeam/greptimedb/pull/5775)
* feat: implement `sync_region` for mito engine by [@WenyXu](https://github.com/WenyXu) in [#5765](https://github.com/GreptimeTeam/greptimedb/pull/5765)
* feat(flow): time window expr by [@discord9](https://github.com/discord9) in [#5785](https://github.com/GreptimeTeam/greptimedb/pull/5785)
* feat: add limit for the number of running procedures by [@WenyXu](https://github.com/WenyXu) in [#5793](https://github.com/GreptimeTeam/greptimedb/pull/5793)
* feat: introduce `CustomizedRegionLeaseRenewer` by [@WenyXu](https://github.com/WenyXu) in [#5762](https://github.com/GreptimeTeam/greptimedb/pull/5762)
* feat: introduce read preference by [@WenyXu](https://github.com/WenyXu) in [#5783](https://github.com/GreptimeTeam/greptimedb/pull/5783)
* feat: introduce `CollectLeaderRegionHandler` by [@WenyXu](https://github.com/WenyXu) in [#5811](https://github.com/GreptimeTeam/greptimedb/pull/5811)
* feat: add backend field to fulltext options by [@zhongzc](https://github.com/zhongzc) in [#5806](https://github.com/GreptimeTeam/greptimedb/pull/5806)
* feat: support REPLACE INTO statement by [@evenyag](https://github.com/evenyag) in [#5820](https://github.com/GreptimeTeam/greptimedb/pull/5820)
* feat(remote-wal): add remote wal prune procedure by [@CookiePieWw](https://github.com/CookiePieWw) in [#5714](https://github.com/GreptimeTeam/greptimedb/pull/5714)
* feat: add `matches_term` function by [@zhongzc](https://github.com/zhongzc) in [#5817](https://github.com/GreptimeTeam/greptimedb/pull/5817)
* feat: implement `sync_region` for metric engine by [@WenyXu](https://github.com/WenyXu) in [#5826](https://github.com/GreptimeTeam/greptimedb/pull/5826)
* feat: introduce poison mechanism for procedure  by [@WenyXu](https://github.com/WenyXu) in [#5822](https://github.com/GreptimeTeam/greptimedb/pull/5822)
* feat: add `region_id` to `CountdownTaskHandlerExt` by [@WenyXu](https://github.com/WenyXu) in [#5834](https://github.com/GreptimeTeam/greptimedb/pull/5834)
* feat(remote-wal): send flush request when pruning remote wal by [@CookiePieWw](https://github.com/CookiePieWw) in [#5825](https://github.com/GreptimeTeam/greptimedb/pull/5825)
* feat: add term as fulltext index request by [@zhongzc](https://github.com/zhongzc) in [#5843](https://github.com/GreptimeTeam/greptimedb/pull/5843)
* feat: shorten possible wrong query range by [@waynexia](https://github.com/waynexia) in [#5849](https://github.com/GreptimeTeam/greptimedb/pull/5849)
* feat: make `admin_fn` macro usable outside common_function module by [@WenyXu](https://github.com/WenyXu) in [#5850](https://github.com/GreptimeTeam/greptimedb/pull/5850)
* feat: pushdown select distinct in some cases by [@evenyag](https://github.com/evenyag) in [#5847](https://github.com/GreptimeTeam/greptimedb/pull/5847)
* feat(flow): batching mode engine by [@discord9](https://github.com/discord9) in [#5807](https://github.com/GreptimeTeam/greptimedb/pull/5807)
* feat: add `catalog_manager` to `ProcedureServiceHandler` by [@WenyXu](https://github.com/WenyXu) in [#5873](https://github.com/GreptimeTeam/greptimedb/pull/5873)
* feat: apply terms with fulltext tantivy backend by [@zhongzc](https://github.com/zhongzc) in [#5869](https://github.com/GreptimeTeam/greptimedb/pull/5869)
* feat: apply terms with fulltext bloom backend by [@zhongzc](https://github.com/zhongzc) in [#5884](https://github.com/GreptimeTeam/greptimedb/pull/5884)
* feat: add query engine options by [@waynexia](https://github.com/waynexia) in [#5895](https://github.com/GreptimeTeam/greptimedb/pull/5895)
* feat: support altering fulltext backend by [@zhongzc](https://github.com/zhongzc) in [#5896](https://github.com/GreptimeTeam/greptimedb/pull/5896)
* feat: report per-region metrics on region server by [@waynexia](https://github.com/waynexia) in [#5893](https://github.com/GreptimeTeam/greptimedb/pull/5893)
* feat: optimize `matches_term` with constant term pre-compilation by [@zhongzc](https://github.com/zhongzc) in [#5886](https://github.com/GreptimeTeam/greptimedb/pull/5886)
* feat(flow): dual engine by [@discord9](https://github.com/discord9) in [#5881](https://github.com/GreptimeTeam/greptimedb/pull/5881)
* feat: Column-wise partition rule implementation by [@v0y4g3r](https://github.com/v0y4g3r) in [#5804](https://github.com/GreptimeTeam/greptimedb/pull/5804)
* feat: support `@@` (AtAt) operator for term matching by [@waynexia](https://github.com/waynexia) in [#5902](https://github.com/GreptimeTeam/greptimedb/pull/5902)
* feat(mito): bulk insert request handling on datanode by [@v0y4g3r](https://github.com/v0y4g3r) in [#5831](https://github.com/GreptimeTeam/greptimedb/pull/5831)
* feat: Add query pipeline http api by [@linyihai](https://github.com/linyihai) in [#5819](https://github.com/GreptimeTeam/greptimedb/pull/5819)
* feat: add json parse processor by [@shuiyisong](https://github.com/shuiyisong) in [#5910](https://github.com/GreptimeTeam/greptimedb/pull/5910)
* feat: implement Arrow Flight "DoPut" in Frontend by [@MichaelScofield](https://github.com/MichaelScofield) in [#5836](https://github.com/GreptimeTeam/greptimedb/pull/5836)
* feat: sync region followers after altering regions by [@WenyXu](https://github.com/WenyXu) in [#5901](https://github.com/GreptimeTeam/greptimedb/pull/5901)
* feat: prevent migrating a leader region to a peer that already has a region follower by [@WenyXu](https://github.com/WenyXu) in [#5923](https://github.com/GreptimeTeam/greptimedb/pull/5923)
* feat: introduce `high_watermark` for remote wal logstore by [@CookiePieWw](https://github.com/CookiePieWw) in [#5877](https://github.com/GreptimeTeam/greptimedb/pull/5877)
* feat: enable submitting wal prune procedure periodically by [@CookiePieWw](https://github.com/CookiePieWw) in [#5867](https://github.com/GreptimeTeam/greptimedb/pull/5867)
* feat: update readme by [@killme2008](https://github.com/killme2008) in [#5936](https://github.com/GreptimeTeam/greptimedb/pull/5936)
* feat: implement otel-arrow protocol for GreptimeDB by [@v0y4g3r](https://github.com/v0y4g3r) in [#5840](https://github.com/GreptimeTeam/greptimedb/pull/5840)
* feat: support building `metasrv` with selector from plugins by [@WenyXu](https://github.com/WenyXu) in [#5942](https://github.com/GreptimeTeam/greptimedb/pull/5942)
* feat: add `exclude_peer_ids` to `SelectorOptions` by [@WenyXu](https://github.com/WenyXu) in [#5949](https://github.com/GreptimeTeam/greptimedb/pull/5949)
* feat: add format support for promql http api (not prometheus) by [@sunng87](https://github.com/sunng87) in [#5939](https://github.com/GreptimeTeam/greptimedb/pull/5939)
* feat: update dashboard to v0.9.0 by [@ZonaHex](https://github.com/ZonaHex) in [#5948](https://github.com/GreptimeTeam/greptimedb/pull/5948)
* feat: introduce flush metadata region task for metric engine by [@WenyXu](https://github.com/WenyXu) in [#5951](https://github.com/GreptimeTeam/greptimedb/pull/5951)
* feat: node excluder by [@MichaelScofield](https://github.com/MichaelScofield) in [#5964](https://github.com/GreptimeTeam/greptimedb/pull/5964)
* feat(flow): use batching mode&fix sqlness by [@discord9](https://github.com/discord9) in [#5903](https://github.com/GreptimeTeam/greptimedb/pull/5903)
* feat: track region failover attempts and adjust timeout by [@WenyXu](https://github.com/WenyXu) in [#5952](https://github.com/GreptimeTeam/greptimedb/pull/5952)
* feat: enhance selector with node exclusion support by [@WenyXu](https://github.com/WenyXu) in [#5966](https://github.com/GreptimeTeam/greptimedb/pull/5966)
* feat: improve observability of region migration procedure by [@WenyXu](https://github.com/WenyXu) in [#5967](https://github.com/GreptimeTeam/greptimedb/pull/5967)
* feat: remove hyper parameter from promql functions by [@waynexia](https://github.com/waynexia) in [#5955](https://github.com/GreptimeTeam/greptimedb/pull/5955)
* feat: allow forced region failover for local WAL by [@WenyXu](https://github.com/WenyXu) in [#5972](https://github.com/GreptimeTeam/greptimedb/pull/5972)

### 🐛 Bug Fixes

* fix: check physical region before use by [@waynexia](https://github.com/waynexia) in [#5612](https://github.com/GreptimeTeam/greptimedb/pull/5612)
* fix: update typos rules to fix ci by [@yihong0618](https://github.com/yihong0618) in [#5621](https://github.com/GreptimeTeam/greptimedb/pull/5621)
* fix: speed up cargo build using sallow clone by [@yihong0618](https://github.com/yihong0618) in [#5620](https://github.com/GreptimeTeam/greptimedb/pull/5620)
* fix: increase timeout for opening candidate region and log elapsed time by [@WenyXu](https://github.com/WenyXu) in [#5627](https://github.com/GreptimeTeam/greptimedb/pull/5627)
* fix: out of bound during bloom search by [@zhongzc](https://github.com/zhongzc) in [#5625](https://github.com/GreptimeTeam/greptimedb/pull/5625)
* fix: refactor region leader state validation by [@WenyXu](https://github.com/WenyXu) in [#5626](https://github.com/GreptimeTeam/greptimedb/pull/5626)
* fix: properly display CJK characters in table/column comments by [@v0y4g3r](https://github.com/v0y4g3r) in [#5633](https://github.com/GreptimeTeam/greptimedb/pull/5633)
* fix: prevent failover of regions to the same peer by [@WenyXu](https://github.com/WenyXu) in [#5632](https://github.com/GreptimeTeam/greptimedb/pull/5632)
* fix: interval rewrite rule that messes up show create flow function by [@v0y4g3r](https://github.com/v0y4g3r) in [#5642](https://github.com/GreptimeTeam/greptimedb/pull/5642)
* fix: unable to install software-properties-common in dev builder by [@daviderli614](https://github.com/daviderli614) in [#5643](https://github.com/GreptimeTeam/greptimedb/pull/5643)
* fix(metric-engine): group DDL requests by [@WenyXu](https://github.com/WenyXu) in [#5628](https://github.com/GreptimeTeam/greptimedb/pull/5628)
* fix: window sort not apply when other column alias to time index name by [@discord9](https://github.com/discord9) in [#5634](https://github.com/GreptimeTeam/greptimedb/pull/5634)
* fix: recover plan schema after dist analyzer by [@waynexia](https://github.com/waynexia) in [#5665](https://github.com/GreptimeTeam/greptimedb/pull/5665)
* fix: flaky test in sqlness by fix random port by [@yihong0618](https://github.com/yihong0618) in [#5657](https://github.com/GreptimeTeam/greptimedb/pull/5657)
* fix: skip schema check to avoid schema mismatch brought by metadata by [@v0y4g3r](https://github.com/v0y4g3r) in [#5662](https://github.com/GreptimeTeam/greptimedb/pull/5662)
* fix: use `DateTime` instead of `NaiveDateTime` by [@shuiyisong](https://github.com/shuiyisong) in [#5669](https://github.com/GreptimeTeam/greptimedb/pull/5669)
* fix: update column requirements to use Column type instead of String by [@waynexia](https://github.com/waynexia) in [#5672](https://github.com/GreptimeTeam/greptimedb/pull/5672)
* fix: correct stalled count by [@evenyag](https://github.com/evenyag) in [#5678](https://github.com/GreptimeTeam/greptimedb/pull/5678)
* fix: FlowInfoValue's compatibility by [@discord9](https://github.com/discord9) in [#5695](https://github.com/GreptimeTeam/greptimedb/pull/5695)
* fix: conversion from TableMeta to TableMetaBuilder by [@v0y4g3r](https://github.com/v0y4g3r) in [#5693](https://github.com/GreptimeTeam/greptimedb/pull/5693)
* fix: mysql prepare bool value by [@discord9](https://github.com/discord9) in [#5732](https://github.com/GreptimeTeam/greptimedb/pull/5732)
* fix: mysql prepare limit&offset param by [@discord9](https://github.com/discord9) in [#5734](https://github.com/GreptimeTeam/greptimedb/pull/5734)
* fix: wrap table name with `` by [@CookiePieWw](https://github.com/CookiePieWw) in [#5748](https://github.com/GreptimeTeam/greptimedb/pull/5748)
* fix: handle nullable default value by [@discord9](https://github.com/discord9) in [#5747](https://github.com/GreptimeTeam/greptimedb/pull/5747)
* fix: properly give placeholder types by [@discord9](https://github.com/discord9) in [#5760](https://github.com/GreptimeTeam/greptimedb/pull/5760)
* fix: support __name__ matcher in label values by [@evenyag](https://github.com/evenyag) in [#5773](https://github.com/GreptimeTeam/greptimedb/pull/5773)
* fix: typo variadic by [@waynexia](https://github.com/waynexia) in [#5800](https://github.com/GreptimeTeam/greptimedb/pull/5800)
* fix: close issue #3902 since upstream fixed by [@yihong0618](https://github.com/yihong0618) in [#5801](https://github.com/GreptimeTeam/greptimedb/pull/5801)
* fix: correct error status code by [@WenyXu](https://github.com/WenyXu) in [#5802](https://github.com/GreptimeTeam/greptimedb/pull/5802)
* fix: interval cast expression can't work in range query, #5805 by [@killme2008](https://github.com/killme2008) in [#5813](https://github.com/GreptimeTeam/greptimedb/pull/5813)
* fix: skip replacing exprs of the DistinctOn node by [@evenyag](https://github.com/evenyag) in [#5823](https://github.com/GreptimeTeam/greptimedb/pull/5823)
* fix: throw errors instead of ignoring by [@WenyXu](https://github.com/WenyXu) in [#5792](https://github.com/GreptimeTeam/greptimedb/pull/5792)
* fix: get root cause of the procedure when coverting to pb by [@evenyag](https://github.com/evenyag) in [#5841](https://github.com/GreptimeTeam/greptimedb/pull/5841)
* fix: remove metadata region options by [@v0y4g3r](https://github.com/v0y4g3r) in [#5852](https://github.com/GreptimeTeam/greptimedb/pull/5852)
* fix: include follower peers in region distribution by [@WenyXu](https://github.com/WenyXu) in [#5844](https://github.com/GreptimeTeam/greptimedb/pull/5844)
* fix: gRPC connection pool leak by [@fengys1996](https://github.com/fengys1996) in [#5876](https://github.com/GreptimeTeam/greptimedb/pull/5876)
* fix: alway rejects write while downgrading region by [@WenyXu](https://github.com/WenyXu) in [#5842](https://github.com/GreptimeTeam/greptimedb/pull/5842)
* fix: flaky test on windows by [@yihong0618](https://github.com/yihong0618) in [#5890](https://github.com/GreptimeTeam/greptimedb/pull/5890)
* fix: ensure logical regions are synced during region sync by [@WenyXu](https://github.com/WenyXu) in [#5878](https://github.com/GreptimeTeam/greptimedb/pull/5878)
* fix: memtable panic by [@v0y4g3r](https://github.com/v0y4g3r) in [#5894](https://github.com/GreptimeTeam/greptimedb/pull/5894)
* fix: preserve timestamp precision of irate by [@waynexia](https://github.com/waynexia) in [#5904](https://github.com/GreptimeTeam/greptimedb/pull/5904)
* fix: support duration to interval conversion in PostgreSQL protocol by [@v0y4g3r](https://github.com/v0y4g3r) in [#5913](https://github.com/GreptimeTeam/greptimedb/pull/5913)
* fix: oom for sqlness test in container by [@yihong0618](https://github.com/yihong0618) in [#5917](https://github.com/GreptimeTeam/greptimedb/pull/5917)
* fix: label values potential panic by [@waynexia](https://github.com/waynexia) in [#5921](https://github.com/GreptimeTeam/greptimedb/pull/5921)
* fix: avoid double schema projection in file format readers by [@WenyXu](https://github.com/WenyXu) in [#5918](https://github.com/GreptimeTeam/greptimedb/pull/5918)
* fix: anchor regex string to fully match in promql by [@waynexia](https://github.com/waynexia) in [#5920](https://github.com/GreptimeTeam/greptimedb/pull/5920)
* fix: wrong error msg in pipeline by [@shuiyisong](https://github.com/shuiyisong) in [#5937](https://github.com/GreptimeTeam/greptimedb/pull/5937)
* fix: filter doesn't consider default values after schema change by [@evenyag](https://github.com/evenyag) in [#5912](https://github.com/GreptimeTeam/greptimedb/pull/5912)
* fix: remove obsolete failover detectors after region leader change by [@WenyXu](https://github.com/WenyXu) in [#5944](https://github.com/GreptimeTeam/greptimedb/pull/5944)
* fix: parse flow expire after interval by [@discord9](https://github.com/discord9) in [#5953](https://github.com/GreptimeTeam/greptimedb/pull/5953)
* fix: use max in flushed entry id and topic latest entry id by [@CookiePieWw](https://github.com/CookiePieWw) in [#5946](https://github.com/GreptimeTeam/greptimedb/pull/5946)
* fix: store flow query ctx on creation by [@discord9](https://github.com/discord9) in [#5963](https://github.com/GreptimeTeam/greptimedb/pull/5963)
* fix: try prune one less by [@discord9](https://github.com/discord9) in [#5965](https://github.com/GreptimeTeam/greptimedb/pull/5965)
* fix: upgrade sqlparse and validate align in range query by [@killme2008](https://github.com/killme2008) in [#5958](https://github.com/GreptimeTeam/greptimedb/pull/5958)
* fix: security update by [@sunng87](https://github.com/sunng87) in [#5982](https://github.com/GreptimeTeam/greptimedb/pull/5982)
* fix: conn timeout&refactor: better err msg by [@discord9](https://github.com/discord9) in [#5974](https://github.com/GreptimeTeam/greptimedb/pull/5974)

### 🚜 Refactor

* refactor: add pipeline concept to OTLP traces and remove OTLP over gRPC by [@sunng87](https://github.com/sunng87) in [#5605](https://github.com/GreptimeTeam/greptimedb/pull/5605)
* refactor: simplify udf by [@MichaelScofield](https://github.com/MichaelScofield) in [#5617](https://github.com/GreptimeTeam/greptimedb/pull/5617)
* refactor: rename table function to admin function by [@waynexia](https://github.com/waynexia) in [#5636](https://github.com/GreptimeTeam/greptimedb/pull/5636)
* refactor: remove or deprecated existing UDAF implementation by [@waynexia](https://github.com/waynexia) in [#5637](https://github.com/GreptimeTeam/greptimedb/pull/5637)
* refactor: remove cluster id field by [@v0y4g3r](https://github.com/v0y4g3r) in [#5610](https://github.com/GreptimeTeam/greptimedb/pull/5610)
* refactor(mito): move wal sync task to background by [@v0y4g3r](https://github.com/v0y4g3r) in [#5677](https://github.com/GreptimeTeam/greptimedb/pull/5677)
* refactor: update jaeger api implementation for new trace modeling by [@sunng87](https://github.com/sunng87) in [#5655](https://github.com/GreptimeTeam/greptimedb/pull/5655)
* refactor: remove trace id from primary key in `opentelemetry_traces` table by [@zyy17](https://github.com/zyy17) in [#5733](https://github.com/GreptimeTeam/greptimedb/pull/5733)
* refactor: make frontend instance clear by [@fengys1996](https://github.com/fengys1996) in [#5754](https://github.com/GreptimeTeam/greptimedb/pull/5754)
* refactor: move `list_flow_stats` to `ClusterInfo` trait. by [@WenyXu](https://github.com/WenyXu) in [#5774](https://github.com/GreptimeTeam/greptimedb/pull/5774)
* refactor: remove useless partition legacy code by [@v0y4g3r](https://github.com/v0y4g3r) in [#5786](https://github.com/GreptimeTeam/greptimedb/pull/5786)
* refactor: remove useless region follower legacy code by [@WenyXu](https://github.com/WenyXu) in [#5787](https://github.com/GreptimeTeam/greptimedb/pull/5787)
* refactor: remove useless region follower legacy code by [@WenyXu](https://github.com/WenyXu) in [#5795](https://github.com/GreptimeTeam/greptimedb/pull/5795)
* refactor: skip re-taking arrays in memtable if possible by [@MichaelScofield](https://github.com/MichaelScofield) in [#5779](https://github.com/GreptimeTeam/greptimedb/pull/5779)
* refactor: remove deprecated find_unique method by [@waynexia](https://github.com/waynexia) in [#5790](https://github.com/GreptimeTeam/greptimedb/pull/5790)
* refactor: remove mode option in configuration files by [@fengys1996](https://github.com/fengys1996) in [#5809](https://github.com/GreptimeTeam/greptimedb/pull/5809)
* refactor: allow bloom filter search to apply `and` conjunction by [@zhongzc](https://github.com/zhongzc) in [#5770](https://github.com/GreptimeTeam/greptimedb/pull/5770)
* refactor: remove prom store write dispatch by [@shuiyisong](https://github.com/shuiyisong) in [#5812](https://github.com/GreptimeTeam/greptimedb/pull/5812)
* refactor: remove backoff config by [@WenyXu](https://github.com/WenyXu) in [#5808](https://github.com/GreptimeTeam/greptimedb/pull/5808)
* refactor: add time range for jager get operations API by [@zyy17](https://github.com/zyy17) in [#5791](https://github.com/GreptimeTeam/greptimedb/pull/5791)
* refactor: improve performance for Jaeger APIs  by [@zyy17](https://github.com/zyy17) in [#5838](https://github.com/GreptimeTeam/greptimedb/pull/5838)
* refactor: check and fix super import by [@waynexia](https://github.com/waynexia) in [#5846](https://github.com/GreptimeTeam/greptimedb/pull/5846)
* refactor(flow): make start flownode clearer by [@discord9](https://github.com/discord9) in [#5848](https://github.com/GreptimeTeam/greptimedb/pull/5848)
* refactor: abstract index source from fulltext index applier by [@zhongzc](https://github.com/zhongzc) in [#5845](https://github.com/GreptimeTeam/greptimedb/pull/5845)
* refactor: improve error code handling in status code conversion by [@WenyXu](https://github.com/WenyXu) in [#5851](https://github.com/GreptimeTeam/greptimedb/pull/5851)
* refactor: simplify tls key read code and add sec1 key support by [@sunng87](https://github.com/sunng87) in [#5856](https://github.com/GreptimeTeam/greptimedb/pull/5856)
* refactor: avoid empty display in errors by [@MichaelScofield](https://github.com/MichaelScofield) in [#5858](https://github.com/GreptimeTeam/greptimedb/pull/5858)
* refactor: add `partition_rules_for_uuid()` by [@zyy17](https://github.com/zyy17) in [#5743](https://github.com/GreptimeTeam/greptimedb/pull/5743)
* refactor: unify all dashboards and use `dac` tool to generate intermediate dashboards by [@zyy17](https://github.com/zyy17) in [#5933](https://github.com/GreptimeTeam/greptimedb/pull/5933)
* refactor: `run_pipeline` parameters by [@shuiyisong](https://github.com/shuiyisong) in [#5954](https://github.com/GreptimeTeam/greptimedb/pull/5954)

### 📚 Documentation

* docs: tsbs update by [@discord9](https://github.com/discord9) in [#5608](https://github.com/GreptimeTeam/greptimedb/pull/5608)
* docs: update cluster dashboard to make opendal panel works by [@evenyag](https://github.com/evenyag) in [#5661](https://github.com/GreptimeTeam/greptimedb/pull/5661)
* docs: adds news to readme by [@killme2008](https://github.com/killme2008) in [#5735](https://github.com/GreptimeTeam/greptimedb/pull/5735)
*  by [@CookiePieWw](https://github.com/CookiePieWw)
* docs: update readme by [@killme2008](https://github.com/killme2008) in [#5891](https://github.com/GreptimeTeam/greptimedb/pull/5891)
* docs: memory profile scripts by [@discord9](https://github.com/discord9) in [#5922](https://github.com/GreptimeTeam/greptimedb/pull/5922)
* docs: fix some units and adds the opendal errors panel by [@evenyag](https://github.com/evenyag) in [#5962](https://github.com/GreptimeTeam/greptimedb/pull/5962)

### ⚡ Performance

* perf: rm coalesce batch when target_batch_size > fetch limit by [@discord9](https://github.com/discord9) in [#5658](https://github.com/GreptimeTeam/greptimedb/pull/5658)
* perf(prom): optimize label values query by [@WenyXu](https://github.com/WenyXu) in [#5653](https://github.com/GreptimeTeam/greptimedb/pull/5653)
* perf: support in list in simple filter by [@waynexia](https://github.com/waynexia) in [#5709](https://github.com/GreptimeTeam/greptimedb/pull/5709)
* perf: introduce `simd_json` for parsing ndjson by [@shuiyisong](https://github.com/shuiyisong) in [#5794](https://github.com/GreptimeTeam/greptimedb/pull/5794)
* perf: evolve promql execution engine by [@waynexia](https://github.com/waynexia) in [#5691](https://github.com/GreptimeTeam/greptimedb/pull/5691)
* perf: faster range manipulate for promql by [@waynexia](https://github.com/waynexia) in [#5859](https://github.com/GreptimeTeam/greptimedb/pull/5859)
* perf: avoid duplicate computation in promql by [@waynexia](https://github.com/waynexia) in [#5863](https://github.com/GreptimeTeam/greptimedb/pull/5863)
* perf: keep compiled regex in SimpleFilterEvaluator to avoid re-compiling by [@evenyag](https://github.com/evenyag) in [#5919](https://github.com/GreptimeTeam/greptimedb/pull/5919)
* perf: optimize fulltext zh tokenizer for ascii-only text by [@zhongzc](https://github.com/zhongzc) in [#5975](https://github.com/GreptimeTeam/greptimedb/pull/5975)

### 🧪 Testing

* test: looser condition by [@discord9](https://github.com/discord9) in [#5816](https://github.com/GreptimeTeam/greptimedb/pull/5816)
* test: add tests to ensure nested data structure for identity pipeline by [@sunng87](https://github.com/sunng87) in [#5888](https://github.com/GreptimeTeam/greptimedb/pull/5888)
* test: update configs to enable auto wal prune by [@CookiePieWw](https://github.com/CookiePieWw) in [#5938](https://github.com/GreptimeTeam/greptimedb/pull/5938)
* test: use random seed for window sort fuzz test by [@discord9](https://github.com/discord9) in [#5950](https://github.com/GreptimeTeam/greptimedb/pull/5950)

### ⚙️ Miscellaneous Tasks

* chore: bump version to 0.13.0 by [@WenyXu](https://github.com/WenyXu) in [#5611](https://github.com/GreptimeTeam/greptimedb/pull/5611)
* chore: support specifying `skipping` index in pipeline by [@shuiyisong](https://github.com/shuiyisong) in [#5635](https://github.com/GreptimeTeam/greptimedb/pull/5635)
*  by [@sunng87](https://github.com/sunng87)
* ci: bump dev-builder image version to 2024-12-25-a71b93dd-20250305072908 by [@daviderli614](https://github.com/daviderli614) in [#5651](https://github.com/GreptimeTeam/greptimedb/pull/5651)
* chore: improve `/v1/jaeger/api/trace/{trace_id}`'s resp by [@shuiyisong](https://github.com/shuiyisong) in [#5663](https://github.com/GreptimeTeam/greptimedb/pull/5663)
* chore: impl ref and ref_mut for json like by [@paomian](https://github.com/paomian) in [#5679](https://github.com/GreptimeTeam/greptimedb/pull/5679)
* chore: make memorykv write happily by [@fengjiachun](https://github.com/fengjiachun) in [#5686](https://github.com/GreptimeTeam/greptimedb/pull/5686)
* chore: check region wal provider on startup to avoid inconsistence by [@v0y4g3r](https://github.com/v0y4g3r) in [#5687](https://github.com/GreptimeTeam/greptimedb/pull/5687)
* chore: support `application/x-ndjson` for log ingest by [@shuiyisong](https://github.com/shuiyisong) in [#5697](https://github.com/GreptimeTeam/greptimedb/pull/5697)
* chore: support `tag` in transform by [@shuiyisong](https://github.com/shuiyisong) in [#5701](https://github.com/GreptimeTeam/greptimedb/pull/5701)
* chore: support `inverted` index in pipeline by [@shuiyisong](https://github.com/shuiyisong) in [#5700](https://github.com/GreptimeTeam/greptimedb/pull/5700)
* chore: update flate2 version by [@yihong0618](https://github.com/yihong0618) in [#5706](https://github.com/GreptimeTeam/greptimedb/pull/5706)
* chore: use `Bytes` instead of string in bulk ingestion by [@shuiyisong](https://github.com/shuiyisong) in [#5717](https://github.com/GreptimeTeam/greptimedb/pull/5717)
* chore: bump version to 0.14.0 by [@waynexia](https://github.com/waynexia) in [#5711](https://github.com/GreptimeTeam/greptimedb/pull/5711)
* chore: revert commit update flate2 version (#5706)" by [@yihong0618](https://github.com/yihong0618) in [#5715](https://github.com/GreptimeTeam/greptimedb/pull/5715)
* chore: add some method for log query handler by [@paomian](https://github.com/paomian) in [#5685](https://github.com/GreptimeTeam/greptimedb/pull/5685)
* chore: merge error files under pipeline crate by [@shuiyisong](https://github.com/shuiyisong) in [#5738](https://github.com/GreptimeTeam/greptimedb/pull/5738)
* chore: add datanode write rows to grafana dashboard by [@sunng87](https://github.com/sunng87) in [#5745](https://github.com/GreptimeTeam/greptimedb/pull/5745)
* chore: support custom time index selector for identity pipeline by [@shuiyisong](https://github.com/shuiyisong) in [#5750](https://github.com/GreptimeTeam/greptimedb/pull/5750)
* chore: ut and some fix by [@CookiePieWw](https://github.com/CookiePieWw) in [#5752](https://github.com/GreptimeTeam/greptimedb/pull/5752)
* chore: remove `Transformer` trait by [@shuiyisong](https://github.com/shuiyisong) in [#5772](https://github.com/GreptimeTeam/greptimedb/pull/5772)
* chore: upgrade some dependencies by [@fengys1996](https://github.com/fengys1996) in [#5777](https://github.com/GreptimeTeam/greptimedb/pull/5777)
* chore: accept table options in auto create table from hints by [@shuiyisong](https://github.com/shuiyisong) in [#5776](https://github.com/GreptimeTeam/greptimedb/pull/5776)
* chore: expose some methods by [@fengys1996](https://github.com/fengys1996) in [#5784](https://github.com/GreptimeTeam/greptimedb/pull/5784)
* chore: expose modules by [@WenyXu](https://github.com/WenyXu) in [#5810](https://github.com/GreptimeTeam/greptimedb/pull/5810)
* chore: remove patch.crates-io for rustls by [@fengys1996](https://github.com/fengys1996) in [#5832](https://github.com/GreptimeTeam/greptimedb/pull/5832)
* chore: update datafusion family by [@MichaelScofield](https://github.com/MichaelScofield) in [#5814](https://github.com/GreptimeTeam/greptimedb/pull/5814)
* chore: remove obsolete way of passing http configurations through env by [@MichaelScofield](https://github.com/MichaelScofield) in [#5864](https://github.com/GreptimeTeam/greptimedb/pull/5864)
* chore: un-allow clippy's "readonly_write_lock" by [@MichaelScofield](https://github.com/MichaelScofield) in [#5862](https://github.com/GreptimeTeam/greptimedb/pull/5862)
* chore: remove repl by [@MichaelScofield](https://github.com/MichaelScofield) in [#5860](https://github.com/GreptimeTeam/greptimedb/pull/5860)
* ci: not push latest image when schedule release by [@daviderli614](https://github.com/daviderli614) in [#5883](https://github.com/GreptimeTeam/greptimedb/pull/5883)
* chore: upgrade opendal to 0.52 by [@WenyXu](https://github.com/WenyXu) in [#5857](https://github.com/GreptimeTeam/greptimedb/pull/5857)
* chore: add heartbeat metrics by [@fengjiachun](https://github.com/fengjiachun) in [#5929](https://github.com/GreptimeTeam/greptimedb/pull/5929)
* chore: rm dev opt level 3 by [@discord9](https://github.com/discord9) in [#5932](https://github.com/GreptimeTeam/greptimedb/pull/5932)
* chore: use `once_cell` to avoid parse everytime in pipeline exec by [@shuiyisong](https://github.com/shuiyisong) in [#5943](https://github.com/GreptimeTeam/greptimedb/pull/5943)
* chore: better buckets for heartbeat stat size histogram by [@fengjiachun](https://github.com/fengjiachun) in [#5945](https://github.com/GreptimeTeam/greptimedb/pull/5945)
* chore: assert plugin uniqueness by [@MichaelScofield](https://github.com/MichaelScofield) in [#5947](https://github.com/GreptimeTeam/greptimedb/pull/5947)
* chore: remove unused attribute by [@fengys1996](https://github.com/fengys1996) in [#5960](https://github.com/GreptimeTeam/greptimedb/pull/5960)
* chore: update dac tools image and docs by [@zyy17](https://github.com/zyy17) in [#5961](https://github.com/GreptimeTeam/greptimedb/pull/5961)
* chore: remove coderabbit by [@killme2008](https://github.com/killme2008) in [#5969](https://github.com/GreptimeTeam/greptimedb/pull/5969)

### Build

*  by [@daviderli614](https://github.com/daviderli614)

## New Contributors

* [@Wenbin1002](https://github.com/Wenbin1002) made their first contribution in [#5728](https://github.com/GreptimeTeam/greptimedb/pull/5728)
* [@Pikady](https://github.com/Pikady) made their first contribution in [#5674](https://github.com/GreptimeTeam/greptimedb/pull/5674)
* [@SNC123](https://github.com/SNC123) made their first contribution in [#5683](https://github.com/GreptimeTeam/greptimedb/pull/5683)
* [@xiaoniaoyouhuajiang](https://github.com/xiaoniaoyouhuajiang) made their first contribution in [#5587](https://github.com/GreptimeTeam/greptimedb/pull/5587)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@AntiTopQuark](https://github.com/AntiTopQuark), [@CookiePieWw](https://github.com/CookiePieWw), [@MichaelScofield](https://github.com/MichaelScofield), [@Pikady](https://github.com/Pikady), [@SNC123](https://github.com/SNC123), [@Wenbin1002](https://github.com/Wenbin1002), [@WenyXu](https://github.com/WenyXu), [@ZonaHex](https://github.com/ZonaHex), [@daviderli614](https://github.com/daviderli614), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@fengys1996](https://github.com/fengys1996), [@killme2008](https://github.com/killme2008), [@linyihai](https://github.com/linyihai), [@paomian](https://github.com/paomian), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@xiaoniaoyouhuajiang](https://github.com/xiaoniaoyouhuajiang), [@yihong0618](https://github.com/yihong0618), [@zhongzc](https://github.com/zhongzc), [@zyy17](https://github.com/zyy17)
