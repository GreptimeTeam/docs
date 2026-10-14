---
keywords: [release, GreptimeDB, changelog, v1.3.0-beta.2]
description: GreptimeDB v1.3.0-beta.2 Changelog
date: 2026-10-14
---

# v1.3.0-beta.2

Release date: October 14, 2026

GreptimeDB v1.3.0-beta.2 is the second beta of the 1.3 release. This changelog covers changes since v1.3.0-beta.1, with fixes for query correctness, storage consistency, and distributed write retries.

### 👍 Highlights

#### Configurable distributed write retries

Distributed frontends now retry retryable write failures with exponential backoff and jitter, refreshing routing and partition metadata when requested by the server. The default configuration allows three retries after the initial attempt:

```toml
[write_retry]
max_retries = 3
initial_backoff = "1500ms"
max_backoff = "10s"
backoff_multiplier = 2.0
```

Set `max_retries = 0` to disable retries. Successful regions are not replayed; standalone does not enable this distributed retry path. Logical metric table retries resolve partition information through the catalog. See [#9543](https://github.com/GreptimeTeam/greptimedb/pull/9543) and [#9574](https://github.com/GreptimeTeam/greptimedb/pull/9574).

#### Correct fulltext matching and LIKE pruning

Fulltext bloom indexes now use token boundaries consistent with `matches_term`, fixing missing matches around underscores, mixed Han/ASCII text, and Han substrings. They also support pruning for eligible `LIKE` predicates:

```sql
CREATE TABLE logs (
    ts TIMESTAMP TIME INDEX,
    message STRING FULLTEXT INDEX WITH (
        analyzer = 'English',
        backend = 'bloom',
        case_sensitive = 'false'
    )
);

INSERT INTO logs VALUES (0, 'worker_error: disk quota exceeded');
SELECT * FROM logs WHERE matches_term(message, 'error');
SELECT * FROM logs WHERE lower(message) LIKE '%disk quota exceeded%';
```

Pruning depends on the pattern and available index; query results remain correct when a scan is required. `matches_term` rewrites also preserve `LIMIT`. See [#9470](https://github.com/GreptimeTeam/greptimedb/pull/9470) and [#9521](https://github.com/GreptimeTeam/greptimedb/pull/9521).

#### PromQL and query correctness

PromQL fixes align NaN comparisons, min/max, topk/bottomk, rounding, and square roots with Prometheus semantics. Subqueries now honor offsets and the absolute evaluation grid; an omitted subquery step defaults to one minute:

```promql
max_over_time(rate(http_requests_total[5m])[1h:])
```

This release also fixes label and metric-name preservation, histogram joins that could drop rows, and incorrect ordering assumptions in logical metric scans and scalar calculations that could affect `ORDER BY`, `LIMIT`, and window queries. See [#9479](https://github.com/GreptimeTeam/greptimedb/pull/9479), [#9481](https://github.com/GreptimeTeam/greptimedb/pull/9481), [#9509](https://github.com/GreptimeTeam/greptimedb/pull/9509), [#9522](https://github.com/GreptimeTeam/greptimedb/pull/9522), and [#9523](https://github.com/GreptimeTeam/greptimedb/pull/9523).

### Dashboard

The bundled dashboard advances from v0.13.15 to v0.14.2. Signal Explorer adds drilldown views for metrics, logs, and traces, with label filters and links between related signals ([dashboard#651](https://github.com/GreptimeTeam/dashboard/pull/651)). Timezone selection is applied consistently to display and SQL requests ([dashboard#657](https://github.com/GreptimeTeam/dashboard/pull/657)). The update also fixes log scrolling, table loading, and trace-ID queries with time ranges ([dashboard#655](https://github.com/GreptimeTeam/dashboard/pull/655), [dashboard#656](https://github.com/GreptimeTeam/dashboard/pull/656), [dashboard#658](https://github.com/GreptimeTeam/dashboard/pull/658)). Native histogram charts in Signal Explorer remain unsupported.

### Upgrade notes

- **Distributed PromQL:** Upgrade datanodes before frontends. The corrected PromQL implementations introduce functions that older datanodes cannot decode in distributed query plans ([#9479](https://github.com/GreptimeTeam/greptimedb/pull/9479)).
- **Fulltext bloom indexes:** Existing indexes fall back to scans until compaction or `ADMIN BUILD_INDEX('logs')` rebuilds them in the new format. Older binaries also fall back to scans when reading the new format ([#9470](https://github.com/GreptimeTeam/greptimedb/pull/9470)).
- **Expression depth:** Query planning rejects expressions deeper than 128 levels to reduce stack-overflow risk ([#9564](https://github.com/GreptimeTeam/greptimedb/pull/9564)).
- **Flow mirroring:** Under overload, asynchronous Flow mirroring can discard batches to protect frontend memory ([#9421](https://github.com/GreptimeTeam/greptimedb/pull/9421)).
- **Series scans:** The v2 series-scan path is temporarily disabled by default ([#9436](https://github.com/GreptimeTeam/greptimedb/pull/9436)).


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

### 🚜 Refactor

* refactor: expose OTLP write and batching helpers for downstream routers by [@shuiyisong](https://github.com/shuiyisong) in [#9401](https://github.com/GreptimeTeam/greptimedb/pull/9401)
* refactor(operator): centralize write partitioning and dispatch by [@WenyXu](https://github.com/WenyXu) in [#9541](https://github.com/GreptimeTeam/greptimedb/pull/9541)

### 📚 Documentation

* docs(config): align example configs and config.md with actual defaults by [@killme2008](https://github.com/killme2008) in [#9460](https://github.com/GreptimeTeam/greptimedb/pull/9460)

### ⚡ Performance

* perf(catalog): optimize single-table lookups in information_schema.partitions by [@fengyue-xve](https://github.com/fengyue-xve) in [#9473](https://github.com/GreptimeTeam/greptimedb/pull/9473)
* perf(promql): reduce timestamp payload allocations and use narrow cursor scans by [@discord9](https://github.com/discord9) in [#9417](https://github.com/GreptimeTeam/greptimedb/pull/9417)

### 🧪 Testing

* test(sqlness): wait for mirrored inserts before flushing streaming flows by [@killme2008](https://github.com/killme2008) in [#9424](https://github.com/GreptimeTeam/greptimedb/pull/9424)
* test(promql): cover label_replace normalization with distinct series by [@fengyue-xve](https://github.com/fengyue-xve) in [#9485](https://github.com/GreptimeTeam/greptimedb/pull/9485)

### ⚙️ Miscellaneous Tasks

* Release-only Rust 1.98 Clippy adaptation for `OptionMap` iteration ([commit](https://github.com/GreptimeTeam/greptimedb/commit/5c8fad7093c6c7e117413ae29d45c4cc0275fcf8)).

* ci(query-regression): bump RUNNER_IMAGE_EPOCH to 7 by [@MichaelScofield](https://github.com/MichaelScofield) in [#9395](https://github.com/GreptimeTeam/greptimedb/pull/9395)
* ci: retry failed nightly release on following weekdays by [@sunng87](https://github.com/sunng87) in [#9394](https://github.com/GreptimeTeam/greptimedb/pull/9394)
* ci: upgrade EC2 runner action to restore runner registration by [@evenyag](https://github.com/evenyag) in [#9430](https://github.com/GreptimeTeam/greptimedb/pull/9430)
* ci: make query regression non-blocking for scheduled nightly releases by [@sunng87](https://github.com/sunng87) in [#9434](https://github.com/GreptimeTeam/greptimedb/pull/9434)
* chore: update rust toolchain to 1.98.1 by [@sunng87](https://github.com/sunng87) in [#9429](https://github.com/GreptimeTeam/greptimedb/pull/9429)
* ci: update dev-builder image tag by [@github-actions[bot]](https://github.com/github-actions[bot]) in [#9469](https://github.com/GreptimeTeam/greptimedb/pull/9469)
* ci: enhance benchmark workflows with version comparisons and diagnostics by [@WenyXu](https://github.com/WenyXu) in [#9383](https://github.com/GreptimeTeam/greptimedb/pull/9383)
* ci: benchmark the object store WAL against S3 from an EC2 runner by [@fengjiachun](https://github.com/fengjiachun) in [#9536](https://github.com/GreptimeTeam/greptimedb/pull/9536)

### Build

* build(deps): update opensrv-mysql to fix MariaDB 12.3 USE information_schema hang by [@tian1220A](https://github.com/tian1220A) in [#9357](https://github.com/GreptimeTeam/greptimedb/pull/9357)
* build: reduce checkout-specific inputs for cache reuse by [@discord9](https://github.com/discord9) in [#9198](https://github.com/GreptimeTeam/greptimedb/pull/9198)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@Aetherance](https://github.com/Aetherance), [@Aumnertic](https://github.com/Aumnertic), [@DeviousCardi](https://github.com/DeviousCardi), [@MichaelScofield](https://github.com/MichaelScofield), [@WenyXu](https://github.com/WenyXu), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@fengys1996](https://github.com/fengys1996), [@fengyue-xve](https://github.com/fengyue-xve), [@killme2008](https://github.com/killme2008), [@lczllx](https://github.com/lczllx), [@niladrix719](https://github.com/niladrix719), [@shuiyisong](https://github.com/shuiyisong), [@sunchanglong](https://github.com/sunchanglong), [@sunng87](https://github.com/sunng87), [@tian1220A](https://github.com/tian1220A), [@v0y4g3r](https://github.com/v0y4g3r)
