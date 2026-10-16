---
keywords: [release, GreptimeDB, changelog, v1.3.0-beta.2]
description: GreptimeDB v1.3.0-beta.2 Changelog
date: 2026-10-15
---

# v1.3.0-beta.2

Release date: October 15, 2026

GreptimeDB v1.3.0-beta.2 is the second beta of the 1.3 release and covers changes since v1.3.0-beta.1. Most changes are bug fixes, including fixes for wrong query results and for writes that could be lost or hidden.

### 👍 Highlights

#### Distributed write retries enabled by default

In distributed clusters, the frontend retries failed writes to datanodes. Writes that hit a region during migration, failover, or repartition are retried after a route refresh. Busy regions and `Unavailable`, `Cancelled`, or `DeadlineExceeded` errors are retried with exponential backoff and jitter. Regions that acknowledged success aren't retried. Retries cover inserts, deletes, bulk inserts, and logical metric tables; standalone mode doesn't retry.

Retries are on by default with these settings. Set `max_retries = 0` to disable them:

```toml
[write_retry]
max_retries = 3
initial_backoff = "1500ms"
max_backoff = "10s"
backoff_multiplier = 2.0
```

See the [Frontend configuration](https://docs.greptime.com/nightly/user-guide/deployments-administration/configuration#frontend-only-configuration), [#9542](https://github.com/GreptimeTeam/greptimedb/pull/9542), [#9543](https://github.com/GreptimeTeam/greptimedb/pull/9543), and [#9574](https://github.com/GreptimeTeam/greptimedb/pull/9574).

#### Signals Explore in the bundled dashboard

Signals Explore is a drilldown view for metrics, logs, and traces, with label filters. Logs link to their traces, and traces link to their logs. Native and gauge histograms aren't charted yet. See [dashboard#651](https://github.com/GreptimeTeam/dashboard/pull/651).

![Signals Explore Metrics tab showing a grid of metric charts, with metric name prefixes and counts in the left panel.](/release-1-3-0-beta-2-signals-explore-metrics.png)

![Signals Explore Logs tab grouping OpenTelemetry logs by service name, with log volume charts and trace ID links on each log line.](/release-1-3-0-beta-2-signals-explore-logs.png)

#### Fixes for silently wrong query results

The following queries returned wrong results without an error:

- PromQL comparisons, `min`/`max`, `topk`/`bottomk`, `sqrt`, and `round` follow Prometheus float semantics. Previously, `errors / requests > 0.05` was true for a NaN ratio, so alerts fired when there was no traffic ([#9479](https://github.com/GreptimeTeam/greptimedb/pull/9479)).
- Binary operations on folded histograms, such as `histogram_fraction(...) + on(host, shard) ...`, could drop matching series at query parallelism above 1 ([#9509](https://github.com/GreptimeTeam/greptimedb/pull/9509)).
- `ORDER BY` and `LIMIT` on logical metric tables could return misordered rows or repeated partial groups ([#9522](https://github.com/GreptimeTeam/greptimedb/pull/9522)). Ordering over TQL `scalar()` results is also fixed ([#9523](https://github.com/GreptimeTeam/greptimedb/pull/9523)).
- A subquery without a step uses 60 seconds, the Prometheus default. Previously, `count_over_time(x[5m:])` in an instant query returned 300 instead of 5 ([#9481](https://github.com/GreptimeTeam/greptimedb/pull/9481)).

Other PromQL fixes are listed under Bug Fixes.

#### Fulltext bloom index no longer skips matching rows

`matches_term` on a bloom fulltext index could return fewer rows than a full scan: `matches_term(msg, 'world')` missed `hello_world`, and `error` missed `错误error日志`. The index now splits text where `matches_term` does: `_` separates tokens, and Han text is stored as bigrams.

Case-sensitive `LIKE` can now use the index for pruning:

```sql
SELECT * FROM logs WHERE message LIKE '%disk quota exceeded%';
```

On a case-insensitive index, `lower(message) LIKE ...` and `matches_term(lower(message), ...)` also use it; `ILIKE` doesn't. Existing SSTs need an index rebuild, as described in Upgrade notes. See [#9470](https://github.com/GreptimeTeam/greptimedb/pull/9470).

#### Storage and routing fixes

- Bulk memtable merges and flushes could let an older value override a newer write or delete. Metric engine physical tables and flat-format tables use the bulk memtable ([#9517](https://github.com/GreptimeTeam/greptimedb/pull/9517)).
- Closing a region flushes skip-WAL writes, so they survive a graceful datanode shutdown ([#9440](https://github.com/GreptimeTeam/greptimedb/pull/9440)).
- Writes during repartition could go to the wrong region and be missing from query results ([#9458](https://github.com/GreptimeTeam/greptimedb/pull/9458)).

### Dashboard

The bundled dashboard moves from v0.13.15 to v0.14.2. Besides Signals Explore, it applies the selected timezone to both display and SQL requests ([dashboard#657](https://github.com/GreptimeTeam/dashboard/pull/657)), and fixes log scrolling, table loading, and trace-ID lookups ([dashboard#655](https://github.com/GreptimeTeam/dashboard/pull/655), [dashboard#656](https://github.com/GreptimeTeam/dashboard/pull/656), [dashboard#658](https://github.com/GreptimeTeam/dashboard/pull/658)).

### Benchmark results

Compared with v1.2.1 on the same setup for both versions. The results cover all changes since v1.2.1, not only this beta.

- 30-day PromQL range queries over node metrics (1,720 series, 158M samples, 30m step, warm cache): the five queries are 1.14×–1.83× faster at the median (geometric mean 1.43×). Throughput is 16% higher at concurrency 1 and 6% higher at concurrency 4 (geometric means); one query is 8% slower at concurrency 4.
- SQL queries over 100M agent observability records (c7i.2xlarge, 8 CPUs and 16 GB for the database): the 16 queries are 1.08×–1.44× faster at the median (geometric mean 1.20×).

### Upgrade notes

- **Distributed PromQL:** Upgrade datanodes before frontends. Older datanodes can't decode the new PromQL functions in distributed query plans ([#9479](https://github.com/GreptimeTeam/greptimedb/pull/9479)).
- **Fulltext bloom indexes:** `matches_term` and `LIKE` scan SSTs with old-format indexes until compaction or `ADMIN BUILD_INDEX('logs')` rebuilds them. To check rebuild progress, read `fulltext.bloom_version` in the `meta_json` column of `information_schema.ssts_index_meta`. After a downgrade, older binaries also scan SSTs with new-format indexes. The bloom backend no longer uses jieba; Han text is stored as bigrams, which can make the index larger. Tantivy-backed indexes no longer serve `matches_term`; those queries scan ([#9470](https://github.com/GreptimeTeam/greptimedb/pull/9470)).
- **Write retries:** If every attempt fails, the error returns after at least 10.5 seconds of backoff (1.5 + 3 + 6) plus jitter. Clients with shorter timeouts see a timeout instead. If a write succeeds but its response is lost or times out, the retry can insert duplicate rows into append-only tables. Set `max_retries = 0` under `[write_retry]` to disable retries ([#9543](https://github.com/GreptimeTeam/greptimedb/pull/9543)).
- **Flow mirroring:** When a flownode is slow or unreachable and more than 1M mirrored rows are pending, the frontend drops further mirrored batches to protect its memory. Flow results can have gaps ([#9421](https://github.com/GreptimeTeam/greptimedb/pull/9421)).
- **Series scans:** The v2 series-scan path is temporarily disabled by default ([#9436](https://github.com/GreptimeTeam/greptimedb/pull/9436)).

### Breaking changes

- **Expression depth:** Query planning rejects expressions deeper than 128 levels to reduce stack-overflow risk ([#9564](https://github.com/GreptimeTeam/greptimedb/pull/9564)).
- **PromQL subquery step:** Range queries that relied on `[R:]` using the query step now sample every 60 seconds. The step isn't configurable ([#9481](https://github.com/GreptimeTeam/greptimedb/pull/9481)).
- **Decompressed request size:** Prometheus remote read/write and Loki push bodies over 512 MiB after decompression are rejected with 400. With a memory quota configured, compressed gRPC requests reserve `max_recv_message_size` before decompression, so 429 or `RESOURCE_EXHAUSTED` can occur sooner ([#9264](https://github.com/GreptimeTeam/greptimedb/pull/9264)).

### 🚀 Features

* feat(json2): json_get respect type hints by [@fengys1996](https://github.com/fengys1996) in [#9349](https://github.com/GreptimeTeam/greptimedb/pull/9349)
* feat: update dashboard to v0.14.0 by [@sunchanglong](https://github.com/sunchanglong) in [#9510](https://github.com/GreptimeTeam/greptimedb/pull/9510)
* feat: support automatic column addition for Flight bulk inserts by [@v0y4g3r](https://github.com/v0y4g3r) in [#9285](https://github.com/GreptimeTeam/greptimedb/pull/9285)
* feat(catalog): declare information-schema table scopes by [@shuiyisong](https://github.com/shuiyisong) in [#9504](https://github.com/GreptimeTeam/greptimedb/pull/9504)
* feat(meta-client): forward actor and event context for region follower RPCs by [@sunng87](https://github.com/sunng87) in [#9568](https://github.com/GreptimeTeam/greptimedb/pull/9568)
* feat: update dashboard to v0.14.2 by [@sunchanglong](https://github.com/sunchanglong) in [#9570](https://github.com/GreptimeTeam/greptimedb/pull/9570)
* feat(client): support region request reuse and route refresh hints by [@WenyXu](https://github.com/WenyXu) in [#9540](https://github.com/GreptimeTeam/greptimedb/pull/9540)
* feat(operator): retry failed writes with refreshed partitions by [@WenyXu](https://github.com/WenyXu) in [#9542](https://github.com/GreptimeTeam/greptimedb/pull/9542)
* feat(frontend): retry transient distributed write failures by [@WenyXu](https://github.com/WenyXu) in [#9543](https://github.com/GreptimeTeam/greptimedb/pull/9543)

### 🐛 Bug Fixes

* fix: temporarily disable v2 series scan by default by [@evenyag](https://github.com/evenyag) in [#9436](https://github.com/GreptimeTeam/greptimedb/pull/9436)
* fix: align TWCS assignment with half-open time windows by [@v0y4g3r](https://github.com/v0y4g3r) in [#9464](https://github.com/GreptimeTeam/greptimedb/pull/9464)
* fix(json2): preserve metadata when adding columns via alter table by [@fengys1996](https://github.com/fengys1996) in [#8696](https://github.com/GreptimeTeam/greptimedb/pull/8696)
* fix: bound decompressed request size and close memory-admission gaps for compressed requests by [@sunng87](https://github.com/sunng87) in [#9264](https://github.com/GreptimeTeam/greptimedb/pull/9264)
* fix(promql): apply offset to subquery evaluation window by [@DeviousCardi](https://github.com/DeviousCardi) in [#9364](https://github.com/GreptimeTeam/greptimedb/pull/9364)
* fix(client): yield Flight batches and affected rows without waiting for next message by [@discord9](https://github.com/discord9) in [#8918](https://github.com/GreptimeTeam/greptimedb/pull/8918)
* fix(promql): resolve dotted column names as unqualified columns by [@killme2008](https://github.com/killme2008) in [#9391](https://github.com/GreptimeTeam/greptimedb/pull/9391)
* fix(promql): align timestamp(), label_join and label_replace with Prometheus semantics by [@killme2008](https://github.com/killme2008) in [#9385](https://github.com/GreptimeTeam/greptimedb/pull/9385)
* fix(mito2): truncate parquet column index min/max for SST writes by [@killme2008](https://github.com/killme2008) in [#9420](https://github.com/GreptimeTeam/greptimedb/pull/9420)
* fix(catalog): skip backend batch_get on full cache hits by [@WenyXu](https://github.com/WenyXu) in [#9431](https://github.com/GreptimeTeam/greptimedb/pull/9431)
* fix: coalesce equal histogram quantile bucket boundaries by [@evenyag](https://github.com/evenyag) in [#9451](https://github.com/GreptimeTeam/greptimedb/pull/9451)
* fix: accept a bool value for the CLI --auto-create-schema flag by [@fengyue-xve](https://github.com/fengyue-xve) in [#9450](https://github.com/GreptimeTeam/greptimedb/pull/9450)
* fix(otlp): coerce empty and "-" trace attribute strings to null by [@killme2008](https://github.com/killme2008) in [#9461](https://github.com/GreptimeTeam/greptimedb/pull/9461)
* fix(meta-client): bound heartbeat handshake timeout by [@Aetherance](https://github.com/Aetherance) in [#9438](https://github.com/GreptimeTeam/greptimedb/pull/9438)
* fix(partition): preserve region mapping during repartition by [@killme2008](https://github.com/killme2008) in [#9458](https://github.com/GreptimeTeam/greptimedb/pull/9458)
* fix(promql): restore exact filtering for nullable label matchers by [@killme2008](https://github.com/killme2008) in [#9418](https://github.com/GreptimeTeam/greptimedb/pull/9418)
* fix(metasrv): retry failed heartbeat address updates by [@WenyXu](https://github.com/WenyXu) in [#9437](https://github.com/GreptimeTeam/greptimedb/pull/9437)
* fix(operator): bound FlowMirrorTask pending rows to prevent frontend OOM by [@discord9](https://github.com/discord9) in [#9421](https://github.com/GreptimeTeam/greptimedb/pull/9421)
* fix(promql): align subqueries to the absolute evaluation grid by [@discord9](https://github.com/discord9) in [#9400](https://github.com/GreptimeTeam/greptimedb/pull/9400)
* fix(promql): keep vector labels when a computed scalar is on the right by [@killme2008](https://github.com/killme2008) in [#9478](https://github.com/GreptimeTeam/greptimedb/pull/9478)
* fix(otlp): convert boolean metric attributes into label values by [@fengyue-xve](https://github.com/fengyue-xve) in [#9468](https://github.com/GreptimeTeam/greptimedb/pull/9468)
* fix(promql): return no point for zero-interval irate/idelta by [@niladrix719](https://github.com/niladrix719) in [#9455](https://github.com/GreptimeTeam/greptimedb/pull/9455)
* fix(metasrv): stop parking the heartbeat response on the region supervisor queue by [@lczllx](https://github.com/lczllx) in [#9474](https://github.com/GreptimeTeam/greptimedb/pull/9474)
* fix(promql): keep metric name for comparison operators by [@Aumnertic](https://github.com/Aumnertic) in [#9332](https://github.com/GreptimeTeam/greptimedb/pull/9332)
* fix(metasrv): stop holding the pusher registry lock across mailbox sends by [@lczllx](https://github.com/lczllx) in [#9445](https://github.com/GreptimeTeam/greptimedb/pull/9445)
* fix(mito): flush memtables containing skip-WAL writes on region close by [@WenyXu](https://github.com/WenyXu) in [#9440](https://github.com/GreptimeTeam/greptimedb/pull/9440)
* fix(promql): accept evaluation times before the Unix epoch by [@killme2008](https://github.com/killme2008) in [#9480](https://github.com/GreptimeTeam/greptimedb/pull/9480)
* fix: unify unknown flow option rejection across OSS and enterprise builds by [@discord9](https://github.com/discord9) in [#9319](https://github.com/GreptimeTeam/greptimedb/pull/9319)
* fix(promql): return range-vector results for instant queries by [@killme2008](https://github.com/killme2008) in [#9477](https://github.com/GreptimeTeam/greptimedb/pull/9477)
* fix(query): stop reporting region scans as hash partitioned by [@discord9](https://github.com/discord9) in [#9491](https://github.com/GreptimeTeam/greptimedb/pull/9491)
* fix(table): require complete primary keys for hash partitioning by [@discord9](https://github.com/discord9) in [#9507](https://github.com/GreptimeTeam/greptimedb/pull/9507)
* fix(deps): bump OpenDAL to 0.59.4 for OSS RRSA credentials by [@WenyXu](https://github.com/WenyXu) in [#9520](https://github.com/GreptimeTeam/greptimedb/pull/9520)
* fix(promql): default a stepless subquery to a one-minute step by [@killme2008](https://github.com/killme2008) in [#9481](https://github.com/GreptimeTeam/greptimedb/pull/9481)
* fix(promql): follow IEEE 754 float semantics in comparisons and aggregations by [@killme2008](https://github.com/killme2008) in [#9479](https://github.com/GreptimeTeam/greptimedb/pull/9479)
* fix(query): keep filter fetch when rewriting matches term by [@discord9](https://github.com/discord9) in [#9521](https://github.com/GreptimeTeam/greptimedb/pull/9521)
* fix(mito): preserve version ordering in bulk merges and flushes by [@evenyag](https://github.com/evenyag) in [#9517](https://github.com/GreptimeTeam/greptimedb/pull/9517)
* fix(mito2): ignore missing inverted indexes in old SSTs by [@WenyXu](https://github.com/WenyXu) in [#9545](https://github.com/GreptimeTeam/greptimedb/pull/9545)
* fix: prevent stale leader metadata after concurrent writes by [@fengjiachun](https://github.com/fengjiachun) in [#9549](https://github.com/GreptimeTeam/greptimedb/pull/9549)
* fix(promql): stop fabricating histogram fold hash partitioning by [@discord9](https://github.com/discord9) in [#9509](https://github.com/GreptimeTeam/greptimedb/pull/9509)
* fix(table): stop claiming tag order for logical metric scans by [@discord9](https://github.com/discord9) in [#9522](https://github.com/GreptimeTeam/greptimedb/pull/9522)
* fix(promql): stop claiming scalar calculate preserves order by [@discord9](https://github.com/discord9) in [#9523](https://github.com/GreptimeTeam/greptimedb/pull/9523)
* fix: align fulltext bloom tokens with matches_term and use them for LIKE by [@killme2008](https://github.com/killme2008) in [#9470](https://github.com/GreptimeTeam/greptimedb/pull/9470)
* fix(query): guard deep expressions during query planning by [@evenyag](https://github.com/evenyag) in [#9564](https://github.com/GreptimeTeam/greptimedb/pull/9564)
* fix(operator): reuse catalog table resolution for write retries by [@WenyXu](https://github.com/WenyXu) in [#9574](https://github.com/GreptimeTeam/greptimedb/pull/9574)
* fix(json2): support settings in ALTER TABLE ADD COLUMN by [@fengys1996](https://github.com/fengys1996) in [#9472](https://github.com/GreptimeTeam/greptimedb/pull/9472)
* fix(query): accept narrowed nullability in MergeScan remote schema check by [@killme2008](https://github.com/killme2008) in [#9592](https://github.com/GreptimeTeam/greptimedb/pull/9592)
* fix(table): stop claiming exact null and distinct counts for append scans by [@killme2008](https://github.com/killme2008) in [#9593](https://github.com/GreptimeTeam/greptimedb/pull/9593)
* fix: avoid pinning memtables during series-index reconciliation by [@evenyag](https://github.com/evenyag) in [#9588](https://github.com/GreptimeTeam/greptimedb/pull/9588)
* fix(query): keep state column names unique when splitting aggregates by [@killme2008](https://github.com/killme2008) in [#9594](https://github.com/GreptimeTeam/greptimedb/pull/9594)
* build(deps): update opensrv-mysql to fix MariaDB 12.3 USE information_schema hang by [@tian1220A](https://github.com/tian1220A) in [#9357](https://github.com/GreptimeTeam/greptimedb/pull/9357)

### 🚜 Refactor

* refactor: expose OTLP write and batching helpers for downstream routers by [@shuiyisong](https://github.com/shuiyisong) in [#9401](https://github.com/GreptimeTeam/greptimedb/pull/9401)
* refactor(operator): centralize write partitioning and dispatch by [@WenyXu](https://github.com/WenyXu) in [#9541](https://github.com/GreptimeTeam/greptimedb/pull/9541)

### 📚 Documentation

* docs(config): align example configs and config.md with actual defaults by [@killme2008](https://github.com/killme2008) in [#9460](https://github.com/GreptimeTeam/greptimedb/pull/9460)

### ⚡ Performance

* perf(catalog): optimize single-table lookups in information_schema.partitions by [@fengyue-xve](https://github.com/fengyue-xve) in [#9473](https://github.com/GreptimeTeam/greptimedb/pull/9473)
* perf(promql): reduce timestamp payload allocations and use narrow cursor scans by [@discord9](https://github.com/discord9) in [#9417](https://github.com/GreptimeTeam/greptimedb/pull/9417)
* perf(query): infer safe aggregate input bounds from HAVING by [@v0y4g3r](https://github.com/v0y4g3r) in [#9582](https://github.com/GreptimeTeam/greptimedb/pull/9582)

### 🧪 Testing

* test(sqlness): wait for mirrored inserts before flushing streaming flows by [@killme2008](https://github.com/killme2008) in [#9424](https://github.com/GreptimeTeam/greptimedb/pull/9424)
* test(promql): cover label_replace normalization with distinct series by [@fengyue-xve](https://github.com/fengyue-xve) in [#9485](https://github.com/GreptimeTeam/greptimedb/pull/9485)

### ⚙️ Miscellaneous Tasks

* ci(query-regression): bump RUNNER_IMAGE_EPOCH to 7 by [@MichaelScofield](https://github.com/MichaelScofield) in [#9395](https://github.com/GreptimeTeam/greptimedb/pull/9395)
* ci: retry failed nightly release on following weekdays by [@sunng87](https://github.com/sunng87) in [#9394](https://github.com/GreptimeTeam/greptimedb/pull/9394)
* ci: upgrade EC2 runner action to restore runner registration by [@evenyag](https://github.com/evenyag) in [#9430](https://github.com/GreptimeTeam/greptimedb/pull/9430)
* ci: make query regression non-blocking for scheduled nightly releases by [@sunng87](https://github.com/sunng87) in [#9434](https://github.com/GreptimeTeam/greptimedb/pull/9434)
* chore: update rust toolchain to 1.98.1 by [@sunng87](https://github.com/sunng87) in [#9429](https://github.com/GreptimeTeam/greptimedb/pull/9429)
* ci: update dev-builder image tag by [@github-actions[bot]](https://github.com/github-actions[bot]) in [#9469](https://github.com/GreptimeTeam/greptimedb/pull/9469)
* ci: enhance benchmark workflows with version comparisons and diagnostics by [@WenyXu](https://github.com/WenyXu) in [#9383](https://github.com/GreptimeTeam/greptimedb/pull/9383)
* ci: benchmark the object store WAL against S3 from an EC2 runner by [@fengjiachun](https://github.com/fengjiachun) in [#9536](https://github.com/GreptimeTeam/greptimedb/pull/9536)
* build: reduce checkout-specific inputs for cache reuse by [@discord9](https://github.com/discord9) in [#9198](https://github.com/GreptimeTeam/greptimedb/pull/9198)

## New Contributors

* [@Aumnertic](https://github.com/Aumnertic) made their first contribution in [#9332](https://github.com/GreptimeTeam/greptimedb/pull/9332)
* [@Aetherance](https://github.com/Aetherance) made their first contribution in [#9438](https://github.com/GreptimeTeam/greptimedb/pull/9438)
* [@fengyue-xve](https://github.com/fengyue-xve) made their first contribution in [#9450](https://github.com/GreptimeTeam/greptimedb/pull/9450)
* [@niladrix719](https://github.com/niladrix719) made their first contribution in [#9455](https://github.com/GreptimeTeam/greptimedb/pull/9455)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@Aetherance](https://github.com/Aetherance), [@Aumnertic](https://github.com/Aumnertic), [@DeviousCardi](https://github.com/DeviousCardi), [@MichaelScofield](https://github.com/MichaelScofield), [@WenyXu](https://github.com/WenyXu), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@fengys1996](https://github.com/fengys1996), [@fengyue-xve](https://github.com/fengyue-xve), [@killme2008](https://github.com/killme2008), [@lczllx](https://github.com/lczllx), [@niladrix719](https://github.com/niladrix719), [@shuiyisong](https://github.com/shuiyisong), [@sunchanglong](https://github.com/sunchanglong), [@sunng87](https://github.com/sunng87), [@tian1220A](https://github.com/tian1220A), [@v0y4g3r](https://github.com/v0y4g3r)
