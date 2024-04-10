# v0.7.1

Release date: March 14, 2024

This is a patch release, containing an important bug fix while decoding the Prometheus remote write proto https ([#3505](https://github.com/GreptimeTeam/greptimedb/pull/3505)).

**Future critical bug fixes were delivered at v0.7.2. It's highly recommended to upgrade to [v0.7.2](./release-0-7-2.md) if you're using v0.7.**

## Breaking changes

* fix!: remove error message from http header to avoid panic by [@sunng87](https://github.com/sunng87) in [#3506](https://github.com/GreptimeTeam/greptimedb/pull/3506)

## Bug fixes

* fix: add support for influxdb basic auth by [@shuiyisong](https://github.com/shuiyisong) in [#3437](https://github.com/GreptimeTeam/greptimedb/pull/3437)
* fix: fix incorrect `COM_STMT_PREPARE` reply by [@WenyXu](https://github.com/WenyXu) in [#3463](https://github.com/GreptimeTeam/greptimedb/pull/3463)
* fix: impl `RecordBatchStream` method explicitly by [@shuiyisong](https://github.com/shuiyisong) in [#3482](https://github.com/GreptimeTeam/greptimedb/pull/3482)
* fix: make max-txn-ops limit valid by [@fengjiachun](https://github.com/fengjiachun) in [#3481](https://github.com/GreptimeTeam/greptimedb/pull/3481)
* fix: fix f64 has no sufficient precision during parsing by [@WenyXu](https://github.com/WenyXu) in [#3483](https://github.com/GreptimeTeam/greptimedb/pull/3483)
* fix: freeze data buffer in shard by [@evenyag](https://github.com/evenyag) in [#3468](https://github.com/GreptimeTeam/greptimedb/pull/3468)
* fix: allow passing extra table options by [@evenyag](https://github.com/evenyag) in [#3484](https://github.com/GreptimeTeam/greptimedb/pull/3484)
* fix(common-time): allow building nanos timestamp from parts split from i64::MIN by [@zhongzc](https://github.com/zhongzc) in [#3493](https://github.com/GreptimeTeam/greptimedb/pull/3493)
* fix: adjust fill behavior of range query by [@Taylor-lagrange](https://github.com/Taylor-lagrange) in [#3489](https://github.com/GreptimeTeam/greptimedb/pull/3489)
* fix: decoding prometheus remote write proto doesn't reset the value by [@waynexia](https://github.com/waynexia) in [#3505](https://github.com/GreptimeTeam/greptimedb/pull/3505)
* fix: correctly generate sequences when the value is pre-existed by [@MichaelScofield](https://github.com/MichaelScofield) in [#3502](https://github.com/GreptimeTeam/greptimedb/pull/3502)

## Improvements

* feat: impl some "set"s to adapt to some client apps by [@MichaelScofield](https://github.com/MichaelScofield) in [#3443](https://github.com/GreptimeTeam/greptimedb/pull/3443)
* feat: update dashboard to v0.4.8 by [@ZonaHex](https://github.com/ZonaHex) in [#3450](https://github.com/GreptimeTeam/greptimedb/pull/3450)
* feat: max-txn-ops option by [@fengjiachun](https://github.com/fengjiachun) in [#3458](https://github.com/GreptimeTeam/greptimedb/pull/3458)
* feat(influxdb): add db query param support for v2 write api by [@etolbakov](https://github.com/etolbakov) in [#3445](https://github.com/GreptimeTeam/greptimedb/pull/3445)
* feat: support `first_value/last_value` in range query by [@Taylor](https://github.com/Taylor)-lagrange in [#3448](https://github.com/GreptimeTeam/greptimedb/pull/3448)
* feat: clamp function by [@waynexia](https://github.com/waynexia) in [#3465](https://github.com/GreptimeTeam/greptimedb/pull/3465)
* feat(fuzz): validate columns by [@WenyXu](https://github.com/WenyXu) in [#3485](https://github.com/GreptimeTeam/greptimedb/pull/3485)
* feat: to_timezone function by [@tisonkun](https://github.com/tisonkun) in [#3470](https://github.com/GreptimeTeam/greptimedb/pull/3470)
* feat(flow): accumlator for aggr func by [@discord9](https://github.com/discord9) in [#3396](https://github.com/GreptimeTeam/greptimedb/pull/3396)
* feat(flow): plan def by [@discord9](https://github.com/discord9) in [#3490](https://github.com/GreptimeTeam/greptimedb/pull/3490)
* feat: improve prom write requests decode performance by [@v0y4g3r](https://github.com/v0y4g3r) in [#3478](https://github.com/GreptimeTeam/greptimedb/pull/3478)
* feat(fuzz): add insert target by [@zhongzc](https://github.com/zhongzc) in [#3499](https://github.com/GreptimeTeam/greptimedb/pull/3499)
* feat(fuzz): add alter table target  by [@WenyXu](https://github.com/WenyXu) in [#3503](https://github.com/GreptimeTeam/greptimedb/pull/3503)
* feat: support decode gzip if influxdb write specify it by [@tisonkun](https://github.com/tisonkun) in [#3494](https://github.com/GreptimeTeam/greptimedb/pull/3494)
* feat: Partition memtables by time if compaction window is provided by [@evenyag](https://github.com/evenyag) in [#3501](https://github.com/GreptimeTeam/greptimedb/pull/3501)

### Others

* build(deps): upgrade opendal to 0.45.1 by [@tisonkun](https://github.com/tisonkun) in [#3432](https://github.com/GreptimeTeam/greptimedb/pull/3432)
* chore: add bin opt to build cmd by [@WenyXu](https://github.com/WenyXu) in [#3440](https://github.com/GreptimeTeam/greptimedb/pull/3440)
* chore: specify binary name by [@WenyXu](https://github.com/WenyXu) in [#3449](https://github.com/GreptimeTeam/greptimedb/pull/3449)
* test: add fuzz test for create table by [@WenyXu](https://github.com/WenyXu) in [#3441](https://github.com/GreptimeTeam/greptimedb/pull/3441)
* refactor: separate the quote char and value by [@WenyXu](https://github.com/WenyXu) in [#3455](https://github.com/GreptimeTeam/greptimedb/pull/3455)
* perf: Reduce decode overhead during pruning keys in the memtable by [@evenyag](https://github.com/evenyag) in [#3415](https://github.com/GreptimeTeam/greptimedb/pull/3415)
* chore: remove repetitive words by [@gcmutator](https://github.com/gcmutator) in [#3469](https://github.com/GreptimeTeam/greptimedb/pull/3469)
* refactor: introduce new `Output` with `OutputMeta` by [@shuiyisong](https://github.com/shuiyisong) in [#3466](https://github.com/GreptimeTeam/greptimedb/pull/3466)
* refactor: make http api returns non-200 status code by [@crwen](https://github.com/crwen) in [#3473](https://github.com/GreptimeTeam/greptimedb/pull/3473)
* ci: use another mirror for etcd image by [@waynexia](https://github.com/waynexia) in [#3486](https://github.com/GreptimeTeam/greptimedb/pull/3486)
* perf: more benchmarks for memtables by [@evenyag](https://github.com/evenyag) in [#3491](https://github.com/GreptimeTeam/greptimedb/pull/3491)
* refactor: validate constraints eagerly by [@tisonkun](https://github.com/tisonkun) in [#3472](https://github.com/GreptimeTeam/greptimedb/pull/3472)
* ci: attempt to setup docker cache for etcd by [@sunng87](https://github.com/sunng87) in [#3488](https://github.com/GreptimeTeam/greptimedb/pull/3488)
* chore: bump version to v0.7.1 by [@evenyag](https://github.com/evenyag) in [#3510](https://github.com/GreptimeTeam/greptimedb/pull/3510)
* docs: add v0.7 TSBS benchmark result by [@evenyag](https://github.com/evenyag) in [#3512](https://github.com/GreptimeTeam/greptimedb/pull/3512)
* ci: add bin options to reduce build burden by [@WenyXu](https://github.com/WenyXu) in [#3518](https://github.com/GreptimeTeam/greptimedb/pull/3518)

## Contributors

We would like to thank the following contributors from the GreptimeDB community:

Eugene Tolbakov, JeremyHi, LFC, Lei HUANG, Ning Sun, Ruihang Xia, WU Jingdi, Weny Xu, Yingwen, Zhenchi, ZonaHe, crwen, discord9, gcmutator, shuiyisong, tison
