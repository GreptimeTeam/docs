---
keywords: [release, GreptimeDB, changelog, v1.3.0-beta.2]
description: GreptimeDB v1.3.0-beta.2 Changelog
date: 2026-10-15
---

# v1.3.0-beta.2

Release date: October 15, 2026

GreptimeDB v1.3.0-beta.2 is the second beta of the 1.3 release. This changelog covers changes since v1.3.0-beta.1. Most changes fix queries that returned wrong results and storage paths that could lose or hide data. Distributed writes now retry transient failures by default.

### 👍 Highlights

#### Distributed write retries enabled by default

In distributed clusters, the frontend retries failed writes to datanodes instead of returning the first error. Writes that reach a region during migration, failover, or repartition are retried after refreshing routes and partition rules. Busy regions and `Unavailable`, `Cancelled`, or `DeadlineExceeded` RPC errors are retried with exponential backoff and jitter. Regions whose writes are acknowledged as successful are not retried. Inserts, deletes, bulk inserts, and writes to logical metric tables are covered. Standalone mode does not retry.

Retries are enabled with the following defaults. Set `max_retries = 0` to disable them:

```toml
[write_retry]
max_retries = 3
initial_backoff = "1500ms"
max_backoff = "10s"
backoff_multiplier = 2.0
```

See the [Frontend configuration](https://docs.greptime.com/nightly/user-guide/deployments-administration/configuration#frontend-only-configuration), [#9542](https://github.com/GreptimeTeam/greptimedb/pull/9542), [#9543](https://github.com/GreptimeTeam/greptimedb/pull/9543), and [#9574](https://github.com/GreptimeTeam/greptimedb/pull/9574).

#### Signals Explore in the bundled dashboard

The bundled dashboard adds Signals Explore, a drilldown view for metrics, logs, and traces with label filters and links between related signals. Native histogram charts are not supported yet. See [dashboard#651](https://github.com/GreptimeTeam/dashboard/pull/651).

#### PromQL and query fixes for silently wrong results

This release fixes several cases where queries returned wrong results without an error:

- Comparisons, `min`/`max`, `topk`/`bottomk`, `sqrt`, and `round` follow Prometheus float semantics. Previously a NaN ratio made `errors / requests > 0.05` true when there was no traffic, so the alert fired ([#9479](https://github.com/GreptimeTeam/greptimedb/pull/9479)).
- Binary operations on folded histograms, such as `histogram_fraction(...) + on(host) ...`, could drop matching series at query parallelism above 1 ([#9509](https://github.com/GreptimeTeam/greptimedb/pull/9509)).
- `ORDER BY` and `LIMIT` on logical metric tables could return rows in the wrong order or repeated partial groups ([#9522](https://github.com/GreptimeTeam/greptimedb/pull/9522)). Ordering over TQL `scalar()` results is also fixed ([#9523](https://github.com/GreptimeTeam/greptimedb/pull/9523)).
- Subqueries without a step use a 60-second step, as Prometheus does by default. Previously `count_over_time(x[5m:])` in an instant query returned 300 instead of 5 ([#9481](https://github.com/GreptimeTeam/greptimedb/pull/9481)).

Other PromQL fixes cover label functions, nullable matchers, subquery offsets and alignment, and pre-epoch evaluation times; see Bug Fixes.

#### Fulltext bloom index no longer skips matching rows

`matches_term` on a column with a bloom fulltext index could return fewer rows than a full scan. For example, `matches_term(msg, 'world')` missed `hello_world`, and `error` missed `错误error日志`. The index now uses the same token boundaries as `matches_term`: `_` separates tokens, and Han text is stored as bigrams.

Case-sensitive `LIKE` patterns can now use the bloom index for pruning:

```sql
SELECT * FROM logs WHERE message LIKE '%disk quota exceeded%';
```

On a case-insensitive index, `lower(message) LIKE ...` and `matches_term(lower(message), ...)` also use it. `ILIKE` does not. Existing SSTs need an index rebuild to benefit; see Upgrade notes. See [#9470](https://github.com/GreptimeTeam/greptimedb/pull/9470).

#### Storage and routing correctness

- Bulk memtable merges and flushes could let an older value override a newer write or delete. Metric engine physical tables and flat-format tables use the bulk memtable ([#9517](https://github.com/GreptimeTeam/greptimedb/pull/9517)).
- Skip-WAL writes are flushed when a region closes, so they survive a graceful datanode shutdown ([#9440](https://github.com/GreptimeTeam/greptimedb/pull/9440)).
- Writes during repartition could be routed to the wrong region and become invisible to queries ([#9458](https://github.com/GreptimeTeam/greptimedb/pull/9458)).

### Dashboard

The bundled dashboard advances from v0.13.15 to v0.14.2. Besides Signals Explore, the selected timezone now applies to both display and SQL requests ([dashboard#657](https://github.com/GreptimeTeam/dashboard/pull/657)). The update also fixes log scrolling, table loading, and trace-ID queries with time ranges ([dashboard#655](https://github.com/GreptimeTeam/dashboard/pull/655), [dashboard#656](https://github.com/GreptimeTeam/dashboard/pull/656), [dashboard#658](https://github.com/GreptimeTeam/dashboard/pull/658)).

### Benchmark results

Compared with v1.2.1, measured in the same benchmark run with warm caches:

- PromQL range queries over 32 days of node metrics (1,720 series, 158M samples, 30m step): median latency improves 1.14×–1.83× across five queries (geometric mean 1.43×). Throughput improves 16% at concurrency 1 and 6% at concurrency 4 (geometric means); at concurrency 4, one query is 8% slower.
- SQL queries over 100M agent observability records: median latency improves 1.08×–1.44× across 16 queries (geometric mean 1.20×).

These results include all changes since v1.2.1, not only those in this beta.

### Upgrade notes

- **Distributed PromQL:** Upgrade datanodes before frontends. The corrected PromQL implementations introduce functions that older datanodes cannot decode in distributed query plans ([#9479](https://github.com/GreptimeTeam/greptimedb/pull/9479)).
- **Fulltext bloom indexes:** Existing indexes fall back to scans until compaction or `ADMIN BUILD_INDEX('logs')` rebuilds them in the new format. To inspect index versions during rebuilding, check `fulltext.bloom_version` inside the `meta_json` column of `information_schema.ssts_index_meta`. Older binaries also fall back to scans when reading the new format. The bloom backend no longer uses jieba for Chinese text; Han text is stored as bigrams, which can make the index larger. Tantivy-backed fulltext indexes no longer serve `matches_term`, and those queries scan instead ([#9470](https://github.com/GreptimeTeam/greptimedb/pull/9470)).
- **Write retries:** When every attempt fails, the default backoff adds at least 10.5 seconds (1.5 + 3 + 6) plus jitter before the error returns. Clients with shorter timeouts see a timeout instead of the error. If a write succeeds but its response is lost or times out, retrying it can insert duplicate rows into append-only tables. Set `max_retries = 0` under `[write_retry]` to disable automatic retries ([#9543](https://github.com/GreptimeTeam/greptimedb/pull/9543)).
- **Flow mirroring:** Under overload, asynchronous Flow mirroring can discard batches to protect frontend memory ([#9421](https://github.com/GreptimeTeam/greptimedb/pull/9421)).
- **Series scans:** The v2 series-scan path is temporarily disabled by default ([#9436](https://github.com/GreptimeTeam/greptimedb/pull/9436)).

### Breaking changes

- **Expression depth:** Query planning rejects expressions deeper than 128 levels to reduce stack-overflow risk ([#9564](https://github.com/GreptimeTeam/greptimedb/pull/9564)).
- **PromQL subquery step:** Range queries that relied on `[R:]` following the query step now sample every 60 seconds. The step is not configurable ([#9481](https://github.com/GreptimeTeam/greptimedb/pull/9481)).
- **Decompressed request size:** Prometheus remote read/write and Loki push bodies larger than 512 MiB after decompression are rejected with 400. When a memory quota is configured, compressed gRPC requests reserve `max_recv_message_size` before decompression, so 429 or `RESOURCE_EXHAUSTED` can occur earlier ([#9264](https://github.com/GreptimeTeam/greptimedb/pull/9264)).

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
