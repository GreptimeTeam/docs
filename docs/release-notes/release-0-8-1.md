# v0.8.1

Release date: May 30, 2024

This is a patch release, containing some important bug fix for flow's continuous aggregating in [#4018](https://github.com/GreptimeTeam/greptimedb/pull/4018)

**It's highly recommended to upgrade to this version if you're using v0.8.0.**

### 🚀 Features

* **feat: avoid some cloning when mirror requests to flownode by [@fengjiachun](https://github.com/fengjiachun) in [#4068](https://github.com/GreptimeTeam/greptimedb/pull/4068)**
* feat: use cache in compaction by [@evenyag](https://github.com/evenyag) in [#3982](https://github.com/GreptimeTeam/greptimedb/pull/3982)
* feat: support compression on gRPC server by [@shuiyisong](https://github.com/shuiyisong) in [#3961](https://github.com/GreptimeTeam/greptimedb/pull/3961)
* feat: Adds `RegionScanner` trait by [@evenyag](https://github.com/evenyag) in [#3948](https://github.com/GreptimeTeam/greptimedb/pull/3948)
* feat: make create view procedure simple as others by [@fengjiachun](https://github.com/fengjiachun) in [#4001](https://github.com/GreptimeTeam/greptimedb/pull/4001)
* feat: respect time range when building parquet reader by [@v0y4g3r](https://github.com/v0y4g3r) in [#3947](https://github.com/GreptimeTeam/greptimedb/pull/3947)
* feat: manual compaction by [@v0y4g3r](https://github.com/v0y4g3r) in [#3988](https://github.com/GreptimeTeam/greptimedb/pull/3988)
* feat: add fallback logic for vmagent sending wrong content type by [@sunng87](https://github.com/sunng87) in [#4009](https://github.com/GreptimeTeam/greptimedb/pull/4009)
* feat: Add TLS support for gRPC service by [@realtaobo](https://github.com/realtaobo) in [#3957](https://github.com/GreptimeTeam/greptimedb/pull/3957)
* feat: remove one clone on constructing partition by [@waynexia](https://github.com/waynexia) in [#4028](https://github.com/GreptimeTeam/greptimedb/pull/4028)
* feat: add `RawEntryReader` and `OneshotWalEntryReader` trait by [@WenyXu](https://github.com/WenyXu) in [#4027](https://github.com/GreptimeTeam/greptimedb/pull/4027)
* feat: round-robin selector by [@waynexia](https://github.com/waynexia) in [#4024](https://github.com/GreptimeTeam/greptimedb/pull/4024)
* feat: implement the `LogStoreRawEntryReader` and `RawEntryReaderFilter` by [@WenyXu](https://github.com/WenyXu) in [#4030](https://github.com/GreptimeTeam/greptimedb/pull/4030)
* feat: support table level comment by [@irenjj](https://github.com/irenjj) in [#4042](https://github.com/GreptimeTeam/greptimedb/pull/4042)
* feat(operator): check if a database is in use before dropping it by [@etolbakov](https://github.com/etolbakov) in [#4035](https://github.com/GreptimeTeam/greptimedb/pull/4035)
* feat: change EXPIRE WHEN to EXPIRE AFTER by [@waynexia](https://github.com/waynexia) in [#4002](https://github.com/GreptimeTeam/greptimedb/pull/4002)
* feat: enable tcp keepalive for http server by [@MichaelScofield](https://github.com/MichaelScofield) in [#4019](https://github.com/GreptimeTeam/greptimedb/pull/4019)
* feat: invoke `flush_table` and `compact_table` in fuzz tests by [@WenyXu](https://github.com/WenyXu) in [#4045](https://github.com/GreptimeTeam/greptimedb/pull/4045)
* feat: open region in background by [@WenyXu](https://github.com/WenyXu) in [#4052](https://github.com/GreptimeTeam/greptimedb/pull/4052)
* feat: Implement SHOW STATUS by [@LYZJU2019](https://github.com/LYZJU2019) in [#4050](https://github.com/GreptimeTeam/greptimedb/pull/4050)
* feat: Implements row group level parallel unordered scanner by [@evenyag](https://github.com/evenyag) in [#3992](https://github.com/GreptimeTeam/greptimedb/pull/3992)


### 🐛 Bug Fixes

* **fix(flow): correctness bugs by [@discord9](https://github.com/discord9) in [#4018](https://github.com/GreptimeTeam/greptimedb/pull/4018)**
* fix: try to fix broken CI by [@WenyXu](https://github.com/WenyXu) in [#3998](https://github.com/GreptimeTeam/greptimedb/pull/3998)
* fix: move log_version() into build() of App to fix no log version on bootstrap by [@zyy17](https://github.com/zyy17) in [#4004](https://github.com/GreptimeTeam/greptimedb/pull/4004)
* fix: try to fix unstable fuzz test  by [@WenyXu](https://github.com/WenyXu) in [#4003](https://github.com/GreptimeTeam/greptimedb/pull/4003)
* fix: can't print log because the tracing guard is dropped by [@zyy17](https://github.com/zyy17) in [#4005](https://github.com/GreptimeTeam/greptimedb/pull/4005)
* fix(fuzz): sort inserted rows with primary keys and time index by [@CookiePieWw](https://github.com/CookiePieWw) in [#4008](https://github.com/GreptimeTeam/greptimedb/pull/4008)
* fix: notifies all workers once a region is flushed by [@evenyag](https://github.com/evenyag) in [#4016](https://github.com/GreptimeTeam/greptimedb/pull/4016)
* fix(fuzz-tests): avoid to drop in-use database by [@WenyXu](https://github.com/WenyXu) in [#4049](https://github.com/GreptimeTeam/greptimedb/pull/4049)
* fix(metric-engine): missing catchup implementation by [@WenyXu](https://github.com/WenyXu) in [#4048](https://github.com/GreptimeTeam/greptimedb/pull/4048)
* fix: set local or session time_zone not work by [@killme2008](https://github.com/killme2008) in [#4064](https://github.com/GreptimeTeam/greptimedb/pull/4064)

* fix: avoid acquiring lock during reading stats by [@WenyXu](https://github.com/WenyXu) in [#4070](https://github.com/GreptimeTeam/greptimedb/pull/4070)

### 🚜 Refactor

* refactor:  make the command entry cleaner by [@zyy17](https://github.com/zyy17) in [#3981](https://github.com/GreptimeTeam/greptimedb/pull/3981)
* refactor: replace Expr with datafusion::Expr by [@realtaobo](https://github.com/realtaobo) in [#3995](https://github.com/GreptimeTeam/greptimedb/pull/3995)
* refactor: remove unused log config by [@v0y4g3r](https://github.com/v0y4g3r) in [#4021](https://github.com/GreptimeTeam/greptimedb/pull/4021)
* refactor(fuzz-tests): generate ts value separately by [@WenyXu](https://github.com/WenyXu) in [#4056](https://github.com/GreptimeTeam/greptimedb/pull/4056)
* refactor: move Database to client crate behind testing feature by [@tisonkun](https://github.com/tisonkun) in [#4059](https://github.com/GreptimeTeam/greptimedb/pull/4059)
* refactor(log_store): remove associated type `Namespace` and `Entry` in `LogStore` by [@WenyXu](https://github.com/WenyXu) in [#4038](https://github.com/GreptimeTeam/greptimedb/pull/4038)

### 📚 Documentation

* docs: add toc for config docs by [@zyy17](https://github.com/zyy17) in [#3974](https://github.com/GreptimeTeam/greptimedb/pull/3974)
* docs: add v0.8.0 TSBS report by [@evenyag](https://github.com/evenyag) in [#3983](https://github.com/GreptimeTeam/greptimedb/pull/3983)

### ⚙️ Miscellaneous Tasks

* ci: report CI failures with creating issues  by [@tisonkun](https://github.com/tisonkun) in [#3976](https://github.com/GreptimeTeam/greptimedb/pull/3976)
* chore: change binary array type from LargeBinaryArray to BinaryArray by [@etolbakov](https://github.com/etolbakov) in [#3924](https://github.com/GreptimeTeam/greptimedb/pull/3924)
* chore: pin cargo-ndk to 3.5.4 by [@WenyXu](https://github.com/WenyXu) in [#3979](https://github.com/GreptimeTeam/greptimedb/pull/3979)
* ci: check-status for nightly-ci by [@tisonkun](https://github.com/tisonkun) in [#3984](https://github.com/GreptimeTeam/greptimedb/pull/3984)
* ci: fixup strings in check ci status by [@tisonkun](https://github.com/tisonkun) in [#3987](https://github.com/GreptimeTeam/greptimedb/pull/3987)
* ci: add 'contents: write' permission by [@zyy17](https://github.com/zyy17) in [#3989](https://github.com/GreptimeTeam/greptimedb/pull/3989)
* chore: remove a dbg! forget to remove by [@discord9](https://github.com/discord9) in [#3990](https://github.com/GreptimeTeam/greptimedb/pull/3990)
* chore(ci): add fuzz tests for distributed mode by [@WenyXu](https://github.com/WenyXu) in [#3967](https://github.com/GreptimeTeam/greptimedb/pull/3967)
* ci: change the image name of nightly build by [@zyy17](https://github.com/zyy17) in [#3994](https://github.com/GreptimeTeam/greptimedb/pull/3994)
* chore(ci): export kind logs by [@WenyXu](https://github.com/WenyXu) in [#3996](https://github.com/GreptimeTeam/greptimedb/pull/3996)
* chore: add ttl to write_cache by [@shuiyisong](https://github.com/shuiyisong) in [#4010](https://github.com/GreptimeTeam/greptimedb/pull/4010)
* chore: log error for detail by [@fengjiachun](https://github.com/fengjiachun) in [#4011](https://github.com/GreptimeTeam/greptimedb/pull/4011)
* chore(ci): add more replicas by [@WenyXu](https://github.com/WenyXu) in [#4015](https://github.com/GreptimeTeam/greptimedb/pull/4015)
* ci: skip notification for manual releases by [@tisonkun](https://github.com/tisonkun) in [#4033](https://github.com/GreptimeTeam/greptimedb/pull/4033)
* chore: add logs for setting the region to writable by [@WenyXu](https://github.com/WenyXu) in [#4044](https://github.com/GreptimeTeam/greptimedb/pull/4044)
* chore: add `LAST_SENT_HEARTBEAT_ELAPSED` metric by [@WenyXu](https://github.com/WenyXu) in [#4062](https://github.com/GreptimeTeam/greptimedb/pull/4062)
* chore: bump to v0.8.1 by [@discord9](https://github.com/discord9) in [#4055](https://github.com/GreptimeTeam/greptimedb/pull/4055)

### Build

* build(deps): upgrade promql-parser to 0.4  by [@tisonkun](https://github.com/tisonkun) in [#4047](https://github.com/GreptimeTeam/greptimedb/pull/4047)
* build(deps): merge tower deps to workspace by [@tisonkun](https://github.com/tisonkun) in [#4036](https://github.com/GreptimeTeam/greptimedb/pull/4036)
* build(deps): upgrade opendal to 0.46 by [@tisonkun](https://github.com/tisonkun) in [#4037](https://github.com/GreptimeTeam/greptimedb/pull/4037)

## New Contributors

* [@LYZJU2019](https://github.com/LYZJU2019) made their first contribution in [#4050](https://github.com/GreptimeTeam/greptimedb/pull/4050)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@CookiePieWw](https://github.com/CookiePieWw), [@LYZJU2019](https://github.com/LYZJU2019), [@MichaelScofield](https://github.com/MichaelScofield), [@WenyXu](https://github.com/WenyXu), [@discord9](https://github.com/discord9), [@etolbakov](https://github.com/etolbakov), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@irenjj](https://github.com/irenjj), [@killme2008](https://github.com/killme2008), [@realtaobo](https://github.com/realtaobo), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@tisonkun](https://github.com/tisonkun), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@zyy17](https://github.com/zyy17)


