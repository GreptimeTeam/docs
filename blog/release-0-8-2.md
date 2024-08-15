---
date: 2024-06-14
---

# v0.8.2

Release date: June 14, 2024

### 🚀 Features

* feat: Implement SHOW CREATE FLOW by [@irenjj](https://github.com/irenjj) in [#4040](https://github.com/GreptimeTeam/greptimedb/pull/4040)
* feat: invoke `handle_batch_open_requests` by [@WenyXu](https://github.com/WenyXu) in [#4107](https://github.com/GreptimeTeam/greptimedb/pull/4107)
* feat: Implement RegionScanner for SeqScan by [@evenyag](https://github.com/evenyag) in [#4060](https://github.com/GreptimeTeam/greptimedb/pull/4060)

### 🐛 Bug Fixes

* fix: Update region `Version` in the worker loop by [@evenyag](https://github.com/evenyag) in [#4114](https://github.com/GreptimeTeam/greptimedb/pull/4114)
* fix: executes pending ddls if region memtable is empty while scheduling next flush by [@evenyag](https://github.com/evenyag) in [#4119](https://github.com/GreptimeTeam/greptimedb/pull/4119)
* fix: macro crate cannot be compiled alone by [@sunng87](https://github.com/sunng87) in [#4130](https://github.com/GreptimeTeam/greptimedb/pull/4130)
* fix(flow): infer table schema correctly by [@discord9](https://github.com/discord9) in [#4113](https://github.com/GreptimeTeam/greptimedb/pull/4113)
* fix: explicitly set config instead of using changeable default in tests by [@MichaelScofield](https://github.com/MichaelScofield) in [#4132](https://github.com/GreptimeTeam/greptimedb/pull/4132)
* fix: retry on unknown error by [@WenyXu](https://github.com/WenyXu) in [#4138](https://github.com/GreptimeTeam/greptimedb/pull/4138)
* fix(ci): use `ld_classic` on macOS by [@WenyXu](https://github.com/WenyXu) in [#4143](https://github.com/GreptimeTeam/greptimedb/pull/4143)
* fix: fix release CI typo by [@WenyXu](https://github.com/WenyXu) in [#4147](https://github.com/GreptimeTeam/greptimedb/pull/4147)

### 🚜 Refactor

* refactor: remove double checks of memtable size by [@cjwcommuny](https://github.com/cjwcommuny) in [#4117](https://github.com/GreptimeTeam/greptimedb/pull/4117)
* refactor: remove substrait ser/de for region query in standalone by [@MichaelScofield](https://github.com/MichaelScofield) in [#3812](https://github.com/GreptimeTeam/greptimedb/pull/3812)
* refactor: simplify parquet writer by [@v0y4g3r](https://github.com/v0y4g3r) in [#4112](https://github.com/GreptimeTeam/greptimedb/pull/4112)

### ⚙️ Miscellaneous Tasks

* chore: run fuzz tests with kafka remote wal by [@WenyXu](https://github.com/WenyXu) in [#4105](https://github.com/GreptimeTeam/greptimedb/pull/4105)
* chore(common-macro): remove features covered by full by [@evenyag](https://github.com/evenyag) in [#4131](https://github.com/GreptimeTeam/greptimedb/pull/4131)
* chore: remove unused code by [@WenyXu](https://github.com/WenyXu) in [#4135](https://github.com/GreptimeTeam/greptimedb/pull/4135)
* chore: run fuzz tests with disk cache by [@WenyXu](https://github.com/WenyXu) in [#4118](https://github.com/GreptimeTeam/greptimedb/pull/4118)
* chore: bump version to v0.8.2 by [@WenyXu](https://github.com/WenyXu) in [#4141](https://github.com/GreptimeTeam/greptimedb/pull/4141)
* chore(ci): switch to aws registry by [@WenyXu](https://github.com/WenyXu) in [#4145](https://github.com/GreptimeTeam/greptimedb/pull/4145)

## New Contributors

* [@cjwcommuny](https://github.com/cjwcommuny) made their first contribution in [#4117](https://github.com/GreptimeTeam/greptimedb/pull/4117)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@MichaelScofield](https://github.com/MichaelScofield), [@WenyXu](https://github.com/WenyXu), [@cjwcommuny](https://github.com/cjwcommuny), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@irenjj](https://github.com/irenjj), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r)

# v0.9.0-b03cb3860-20240606-1717661661

Release date: June 06, 2024

## Breaking changes

* refactor!: remove the tableid in ddl response since tableids is enough by [@fengjiachun](https://github.com/fengjiachun) in [#4080](https://github.com/GreptimeTeam/greptimedb/pull/4080)

### 🚀 Features

* feat: querying from view works by [@killme2008](https://github.com/killme2008) in [#3952](https://github.com/GreptimeTeam/greptimedb/pull/3952)
* feat: implement `WalEntryDistributor`, `WalEntryReceiver` by [@WenyXu](https://github.com/WenyXu) in [#4031](https://github.com/GreptimeTeam/greptimedb/pull/4031)
* feat(flow): make write path faster with shared lock by [@discord9](https://github.com/discord9) in [#4073](https://github.com/GreptimeTeam/greptimedb/pull/4073)
* feat: implement `Display` for `PartitionExpr` by [@Kelvinyu1117](https://github.com/Kelvinyu1117) in [#4087](https://github.com/GreptimeTeam/greptimedb/pull/4087)
* feat: set global runtime size by config file by [@MichaelScofield](https://github.com/MichaelScofield) in [#4063](https://github.com/GreptimeTeam/greptimedb/pull/4063)
* feat: implement drop multiple tables by [@sarailQAQ](https://github.com/sarailQAQ) in [#4085](https://github.com/GreptimeTeam/greptimedb/pull/4085)
* feat: show create table only for base table by [@tisonkun](https://github.com/tisonkun) in [#4099](https://github.com/GreptimeTeam/greptimedb/pull/4099)
* feat: implement the `handle_batch_open_requests` by [@WenyXu](https://github.com/WenyXu) in [#4075](https://github.com/GreptimeTeam/greptimedb/pull/4075)
* feat: introduce `pipeline` crate by [@shuiyisong](https://github.com/shuiyisong) in [#4109](https://github.com/GreptimeTeam/greptimedb/pull/4109)
* feat: support gRPC cancellation by [@fengjiachun](https://github.com/fengjiachun) in [#4092](https://github.com/GreptimeTeam/greptimedb/pull/4092)

### 🐛 Bug Fixes

* fix: add tailing separator to prefix by [@waynexia](https://github.com/waynexia) in [#4078](https://github.com/GreptimeTeam/greptimedb/pull/4078)
* fix: display error in correct format by [@waynexia](https://github.com/waynexia) in [#4082](https://github.com/GreptimeTeam/greptimedb/pull/4082)
* fix: display the PartitionBound and PartitionDef correctly by [@Kelvinyu1117](https://github.com/Kelvinyu1117) in [#4101](https://github.com/GreptimeTeam/greptimedb/pull/4101)
* fix: recover memtable options when opening physical regions by [@v0y4g3r](https://github.com/v0y4g3r) in [#4102](https://github.com/GreptimeTeam/greptimedb/pull/4102)
* fix: fix EntityTooSmall issue by [@WenyXu](https://github.com/WenyXu) in [#4100](https://github.com/GreptimeTeam/greptimedb/pull/4100)
* fix(flow): mfp operator missing rows by [@discord9](https://github.com/discord9) in [#4084](https://github.com/GreptimeTeam/greptimedb/pull/4084)

### 🚜 Refactor

* refactor: remove upgrade cli tool by [@fengjiachun](https://github.com/fengjiachun) in [#4077](https://github.com/GreptimeTeam/greptimedb/pull/4077)
* refactor: move `define_into_tonic_status` to `common-error` by [@shuiyisong](https://github.com/shuiyisong) in [#4095](https://github.com/GreptimeTeam/greptimedb/pull/4095)

### 🧪 Testing

* test: run `test_flush_reopen_region` and `test_region_replay` with `KafkaLogStore` by [@WenyXu](https://github.com/WenyXu) in [#4083](https://github.com/GreptimeTeam/greptimedb/pull/4083)
* test: add fuzz tests for column data type alteration by [@realtaobo](https://github.com/realtaobo) in [#4076](https://github.com/GreptimeTeam/greptimedb/pull/4076)

### ⚙️ Miscellaneous Tasks

* ci: cargo gc fuzz test runner by [@waynexia](https://github.com/waynexia) in [#4074](https://github.com/GreptimeTeam/greptimedb/pull/4074)
* ci: try to free space after fuzz tests by [@WenyXu](https://github.com/WenyXu) in [#4089](https://github.com/GreptimeTeam/greptimedb/pull/4089)
* chore: enable `strip` for tests-fuzz crate by [@WenyXu](https://github.com/WenyXu) in [#4093](https://github.com/GreptimeTeam/greptimedb/pull/4093)
* ci: add 'make run-cluster-with-etcd' to run greptimedb cluster by using docker-compose by [@zyy17](https://github.com/zyy17) in [#4103](https://github.com/GreptimeTeam/greptimedb/pull/4103)
* chore(ci): remove redundant sqlness test config by [@WenyXu](https://github.com/WenyXu) in [#4106](https://github.com/GreptimeTeam/greptimedb/pull/4106)
* ci: cargo gc all fuzz test runner by [@waynexia](https://github.com/waynexia) in [#4081](https://github.com/GreptimeTeam/greptimedb/pull/4081)
* chore: remove gc before running fuzz tests by [@WenyXu](https://github.com/WenyXu) in [#4108](https://github.com/GreptimeTeam/greptimedb/pull/4108)
* chore: reduce some burden on the write path by [@fengjiachun](https://github.com/fengjiachun) in [#4110](https://github.com/GreptimeTeam/greptimedb/pull/4110)

### Build

* build(deps): bump datafusion 20240528 by [@waynexia](https://github.com/waynexia) in [#4061](https://github.com/GreptimeTeam/greptimedb/pull/4061)

## New Contributors

* [@sarailQAQ](https://github.com/sarailQAQ) made their first contribution in [#4085](https://github.com/GreptimeTeam/greptimedb/pull/4085)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@Kelvinyu1117](https://github.com/Kelvinyu1117), [@MichaelScofield](https://github.com/MichaelScofield), [@WenyXu](https://github.com/WenyXu), [@discord9](https://github.com/discord9), [@fengjiachun](https://github.com/fengjiachun), [@killme2008](https://github.com/killme2008), [@realtaobo](https://github.com/realtaobo), [@sarailQAQ](https://github.com/sarailQAQ), [@shuiyisong](https://github.com/shuiyisong), [@tisonkun](https://github.com/tisonkun), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@zyy17](https://github.com/zyy17)
