---
keywords: [release, GreptimeDB, changelog, v0.16.0]
description: GreptimeDB v0.16.0 Changelog
date: 2025-08-06
---

# v0.16.0

Release date: August 06, 2025

### 👍 Highlights

- **Automated Metadata Reconciliation**: Introduces reconcile procedures for catalogs, databases, tables to keep metadata consistent (#6613, #6612, #6584, #6588, #6614).

- **TQL in CTE**: Allows embedding PromQL inside SQL queries (#6645), e.g.:

    ```sql
    WITH prom_result AS (
        TQL EVAL (0, 100, '10s') sum(rate(http_requests_total[5m])) BY (job)
    )
    SELECT *
    FROM prom_result
    ORDER BY sum_rate_http_requests_total_5m
    LIMIT 10;
    ```

- **PromQL**: Introduces the `absent()` function for detecting missing series (#6618).

- **Observability Improvements**: Provides a panic logger, HTTP API to toggle heap profiling (enabled by default), and more verbose logs/metrics in `EXPLAIN ANALYZE VERBOSE` (#6633, #6593, #6575).

### 🚀 Features

* feat: add `RegionId` to `FileId` by [@waynexia](https://github.com/waynexia) in [#6410](https://github.com/GreptimeTeam/greptimedb/pull/6410)
* feat: move metasrv admin to http server while keep tonic for backward compatibility by [@lyang24](https://github.com/lyang24) in [#6466](https://github.com/GreptimeTeam/greptimedb/pull/6466)
* feat(mito): replace `Memtable::iter` with `Memtable::ranges`  by [@v0y4g3r](https://github.com/v0y4g3r) in [#6549](https://github.com/GreptimeTeam/greptimedb/pull/6549)
* feat: supports more db options by [@killme2008](https://github.com/killme2008) in [#6529](https://github.com/GreptimeTeam/greptimedb/pull/6529)
* feat: allow ignoring nonexistent regions in recovery mode by [@WenyXu](https://github.com/WenyXu) in [#6592](https://github.com/GreptimeTeam/greptimedb/pull/6592)
* feat: impl some promql scalar functions by [@killme2008](https://github.com/killme2008) in [#6567](https://github.com/GreptimeTeam/greptimedb/pull/6567)
* feat: poll result stream more often by [@discord9](https://github.com/discord9) in [#6599](https://github.com/GreptimeTeam/greptimedb/pull/6599)
* feat: fallback when failed to push down using `DistPlanner` by [@discord9](https://github.com/discord9) in [#6574](https://github.com/GreptimeTeam/greptimedb/pull/6574)
* feat: add `SET DEFAULT` syntax by [@linyihai](https://github.com/linyihai) in [#6421](https://github.com/GreptimeTeam/greptimedb/pull/6421)
* feat: struct vector by [@discord9](https://github.com/discord9) in [#6595](https://github.com/GreptimeTeam/greptimedb/pull/6595)
* feat: trigger alter parse by [@fengys1996](https://github.com/fengys1996) in [#6553](https://github.com/GreptimeTeam/greptimedb/pull/6553)
* feat: update dashboard to v0.10.5 by [@ZonaHex](https://github.com/ZonaHex) in [#6604](https://github.com/GreptimeTeam/greptimedb/pull/6604)
* feat: allow setting next table id via http api by [@WenyXu](https://github.com/WenyXu) in [#6597](https://github.com/GreptimeTeam/greptimedb/pull/6597)
* feat: ignore internal keys in metadata snapshots by [@WenyXu](https://github.com/WenyXu) in [#6606](https://github.com/GreptimeTeam/greptimedb/pull/6606)
* feat: introduce reconcile table procedure by [@WenyXu](https://github.com/WenyXu) in [#6584](https://github.com/GreptimeTeam/greptimedb/pull/6584)
* feat: more logs and metrics under explain verbose mode by [@evenyag](https://github.com/evenyag) in [#6575](https://github.com/GreptimeTeam/greptimedb/pull/6575)
* feat: introduce reconcile database procedure by [@WenyXu](https://github.com/WenyXu) in [#6612](https://github.com/GreptimeTeam/greptimedb/pull/6612)
* feat: introduce reconcile logical tables procedure by [@WenyXu](https://github.com/WenyXu) in [#6588](https://github.com/GreptimeTeam/greptimedb/pull/6588)
* feat: HTTP API to activate/deactive heap prof (activate by default) by [@evenyag](https://github.com/evenyag) in [#6593](https://github.com/GreptimeTeam/greptimedb/pull/6593)
* feat: Implement a converter to converts KeyValues into BulkPart by [@evenyag](https://github.com/evenyag) in [#6620](https://github.com/GreptimeTeam/greptimedb/pull/6620)
* feat: introduce reconcile catalog procedure by [@WenyXu](https://github.com/WenyXu) in [#6613](https://github.com/GreptimeTeam/greptimedb/pull/6613)
* feat: panic logger by [@discord9](https://github.com/discord9) in [#6633](https://github.com/GreptimeTeam/greptimedb/pull/6633)
* feat: update dashboard to v0.10.6 by [@ZonaHex](https://github.com/ZonaHex) in [#6632](https://github.com/GreptimeTeam/greptimedb/pull/6632)
* feat: support `__schema__` and `__database__` in Prom Remote Read by [@waynexia](https://github.com/waynexia) in [#6610](https://github.com/GreptimeTeam/greptimedb/pull/6610)
* feat: support tls for pg backend by [@waynexia](https://github.com/waynexia) in [#6611](https://github.com/GreptimeTeam/greptimedb/pull/6611)
* feat: `absent` function in PromQL by [@waynexia](https://github.com/waynexia) in [#6618](https://github.com/GreptimeTeam/greptimedb/pull/6618)
* feat: Add option to limit the files reading simultaneously by [@evenyag](https://github.com/evenyag) in [#6635](https://github.com/GreptimeTeam/greptimedb/pull/6635)
* feat: introduce reconciliation interface by [@WenyXu](https://github.com/WenyXu) in [#6614](https://github.com/GreptimeTeam/greptimedb/pull/6614)
* feat: add partial truncate by [@discord9](https://github.com/discord9) in [#6602](https://github.com/GreptimeTeam/greptimedb/pull/6602)
* feat: schema/database support for label_values by [@sunng87](https://github.com/sunng87) in [#6631](https://github.com/GreptimeTeam/greptimedb/pull/6631)
* feat: implements FlatReadFormat to project parquets with flat schema by [@evenyag](https://github.com/evenyag) in [#6638](https://github.com/GreptimeTeam/greptimedb/pull/6638)
* feat: use real data to truncate manipulate range by [@waynexia](https://github.com/waynexia) in [#6649](https://github.com/GreptimeTeam/greptimedb/pull/6649)
* feat: Implements an iterator to read the RecordBatch in BulkPart by [@evenyag](https://github.com/evenyag) in [#6647](https://github.com/GreptimeTeam/greptimedb/pull/6647)
* feat: register all aggregate function to auto step aggr fn by [@discord9](https://github.com/discord9) in [#6596](https://github.com/GreptimeTeam/greptimedb/pull/6596)
* feat: use column expr with filters in LogQuery by [@waynexia](https://github.com/waynexia) in [#6646](https://github.com/GreptimeTeam/greptimedb/pull/6646)
* feat: record the migration events in metasrv by [@zyy17](https://github.com/zyy17) in [#6579](https://github.com/GreptimeTeam/greptimedb/pull/6579)
* feat: support TQL CTE in planner by [@waynexia](https://github.com/waynexia) in [#6645](https://github.com/GreptimeTeam/greptimedb/pull/6645)
* feat(log-query): support binary op, scalar fn & is_true/is_false by [@waynexia](https://github.com/waynexia) in [#6659](https://github.com/GreptimeTeam/greptimedb/pull/6659)
* feat: EncodedBulkPartIter iters flat format and returns RecordBatch by [@evenyag](https://github.com/evenyag) in [#6655](https://github.com/GreptimeTeam/greptimedb/pull/6655)
* feat: count underscore in English tokenizer and improve performance by [@waynexia](https://github.com/waynexia) in [#6660](https://github.com/GreptimeTeam/greptimedb/pull/6660)

### 🐛 Bug Fixes

* fix: aggr group by all partition cols use partial commutative by [@discord9](https://github.com/discord9) in [#6534](https://github.com/GreptimeTeam/greptimedb/pull/6534)
* fix: closee issue #6555 return empty result by [@yihong0618](https://github.com/yihong0618) in [#6569](https://github.com/GreptimeTeam/greptimedb/pull/6569)
* fix: ignore target files in make fmt-check by [@yihong0618](https://github.com/yihong0618) in [#6560](https://github.com/GreptimeTeam/greptimedb/pull/6560)
* fix: close issue #6586 make pg also show error as mysql by [@yihong0618](https://github.com/yihong0618) in [#6587](https://github.com/GreptimeTeam/greptimedb/pull/6587)
* fix: add map datatype conversion in copy_table_from (#6185) by [@Arshdeep54](https://github.com/Arshdeep54) in [#6422](https://github.com/GreptimeTeam/greptimedb/pull/6422)
* fix(test): concurrency issue in compaction tests by [@v0y4g3r](https://github.com/v0y4g3r) in [#6615](https://github.com/GreptimeTeam/greptimedb/pull/6615)
* fix: only return the __name__ label when there is one by [@waynexia](https://github.com/waynexia) in [#6629](https://github.com/GreptimeTeam/greptimedb/pull/6629)
* fix: bump greptime-sqlparser to avoid convert statement overflow by [@kemingy](https://github.com/kemingy) in [#6634](https://github.com/GreptimeTeam/greptimedb/pull/6634)
* fix: show create flow's expire after by [@discord9](https://github.com/discord9) in [#6641](https://github.com/GreptimeTeam/greptimedb/pull/6641)
* fix: fix sequence peek method to return correct values when sequence is not initialized by [@WenyXu](https://github.com/WenyXu) in [#6643](https://github.com/GreptimeTeam/greptimedb/pull/6643)
* fix: sequence peek with remote value by [@fengjiachun](https://github.com/fengjiachun) in [#6648](https://github.com/GreptimeTeam/greptimedb/pull/6648)
* fix: not mark all deleted when partial trunc by [@discord9](https://github.com/discord9) in [#6654](https://github.com/GreptimeTeam/greptimedb/pull/6654)
* fix: box Explain node in Statement to reduce stack size by [@waynexia](https://github.com/waynexia) in [#6661](https://github.com/GreptimeTeam/greptimedb/pull/6661)
* fix: unable to record slow query by [@zyy17](https://github.com/zyy17) in [#6590](https://github.com/GreptimeTeam/greptimedb/pull/6590)

### 🚜 Refactor

* refactor: refactor partition mod to use PartitionExpr instead of PartitionDef by [@zhongzc](https://github.com/zhongzc) in [#6554](https://github.com/GreptimeTeam/greptimedb/pull/6554)
* refactor: remove unused PartitionDef by [@zhongzc](https://github.com/zhongzc) in [#6573](https://github.com/GreptimeTeam/greptimedb/pull/6573)
* refactor: explicitly accept path type as param by [@zhongzc](https://github.com/zhongzc) in [#6583](https://github.com/GreptimeTeam/greptimedb/pull/6583)
* refactor(otlp_metric): make otlp metric compatible with promql by [@shuiyisong](https://github.com/shuiyisong) in [#6543](https://github.com/GreptimeTeam/greptimedb/pull/6543)
* refactor: remove procedure executor from DDL manager by [@WenyXu](https://github.com/WenyXu) in [#6625](https://github.com/GreptimeTeam/greptimedb/pull/6625)

### 📚 Documentation

* docs(rfc): repartition by [@waynexia](https://github.com/waynexia) in [#6557](https://github.com/GreptimeTeam/greptimedb/pull/6557)
* docs(rfc): compatibility test framework by [@waynexia](https://github.com/waynexia) in [#6460](https://github.com/GreptimeTeam/greptimedb/pull/6460)

### ⚡ Performance

* perf: Reduce fulltext bloom load time by [@evenyag](https://github.com/evenyag) in [#6651](https://github.com/GreptimeTeam/greptimedb/pull/6651)

### ⚙️ Miscellaneous Tasks

* chore(otlp_metric): support attr list in header opts by [@shuiyisong](https://github.com/shuiyisong) in [#6617](https://github.com/GreptimeTeam/greptimedb/pull/6617)
* chore(otlp_metric): update metric and label naming by [@shuiyisong](https://github.com/shuiyisong) in [#6624](https://github.com/GreptimeTeam/greptimedb/pull/6624)
* chore: refine metrics tracking the flush/compaction cost time by [@v0y4g3r](https://github.com/v0y4g3r) in [#6630](https://github.com/GreptimeTeam/greptimedb/pull/6630)
* chore: update jieba tantivy-jieba and tantivy version by [@yihong0618](https://github.com/yihong0618) in [#6637](https://github.com/GreptimeTeam/greptimedb/pull/6637)
* chore: add `limit` in resources panel and `Cache Miss` panel by [@zyy17](https://github.com/zyy17) in [#6636](https://github.com/GreptimeTeam/greptimedb/pull/6636)
* chore: add methods to catalog manager by [@v0y4g3r](https://github.com/v0y4g3r) in [#6656](https://github.com/GreptimeTeam/greptimedb/pull/6656)

## New Contributors

* [@kemingy](https://github.com/kemingy) made their first contribution in [#6634](https://github.com/GreptimeTeam/greptimedb/pull/6634)
* [@lyang24](https://github.com/lyang24) made their first contribution in [#6466](https://github.com/GreptimeTeam/greptimedb/pull/6466)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@Arshdeep54](https://github.com/Arshdeep54), [@WenyXu](https://github.com/WenyXu), [@ZonaHex](https://github.com/ZonaHex), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@fengys1996](https://github.com/fengys1996), [@kemingy](https://github.com/kemingy), [@killme2008](https://github.com/killme2008), [@linyihai](https://github.com/linyihai), [@lyang24](https://github.com/lyang24), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@yihong0618](https://github.com/yihong0618), [@zhongzc](https://github.com/zhongzc), [@zyy17](https://github.com/zyy17)
