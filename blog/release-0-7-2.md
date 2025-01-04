---
keywords: [release, GreptimeDB, changelog, v0.7.2]
description: GreptimeDB v0.7.2 Changelog
date: 2024-04-08
---

# v0.7.2

Release date: April 08, 2024

This is a patch release, containing a critical bug fix to avoid wrongly delete data files ([#3635](https://github.com/GreptimeTeam/greptimedb/pull/3635)).

**It's highly recommended to upgrade to this version if you're using v0.7.**

## Breaking changes

* refactor!: Renames the new memtable to PartitionTreeMemtable by [@evenyag](https://github.com/evenyag) in [#3547](https://github.com/GreptimeTeam/greptimedb/pull/3547)
* fix!: columns table in information_schema misses some columns by [@killme2008](https://github.com/killme2008) in [#3639](https://github.com/GreptimeTeam/greptimedb/pull/3639)

### 🚀 Features

* feat: Partition memtables by time if compaction window is provided by [@evenyag](https://github.com/evenyag) in [#3501](https://github.com/GreptimeTeam/greptimedb/pull/3501)
* feat: acquire all locks in procedure  by [@WenyXu](https://github.com/WenyXu) in [#3514](https://github.com/GreptimeTeam/greptimedb/pull/3514)
* feat: implement the drop database parser by [@WenyXu](https://github.com/WenyXu) in [#3521](https://github.com/GreptimeTeam/greptimedb/pull/3521)
* feat(mito): Checks whether a region should flush periodically by [@evenyag](https://github.com/evenyag) in [#3459](https://github.com/GreptimeTeam/greptimedb/pull/3459)
* feat(metasrv): implement maintenance by [@tisonkun](https://github.com/tisonkun) in [#3527](https://github.com/GreptimeTeam/greptimedb/pull/3527)
* feat: update dashboard to v0.4.9 by [@ZonaHex](https://github.com/ZonaHex) in [#3531](https://github.com/GreptimeTeam/greptimedb/pull/3531)
* feat: support per table memtable options by [@evenyag](https://github.com/evenyag) in [#3524](https://github.com/GreptimeTeam/greptimedb/pull/3524)
* feat(flow): shared in-memory state for dataflow operator  by [@discord9](https://github.com/discord9) in [#3508](https://github.com/GreptimeTeam/greptimedb/pull/3508)
* feat: update pgwire to 0.20 for improved performance by [@sunng87](https://github.com/sunng87) in [#3538](https://github.com/GreptimeTeam/greptimedb/pull/3538)
* feat: support multi params in promql range function macro by [@Taylor-lagrange](https://github.com/Taylor-lagrange) in [#3464](https://github.com/GreptimeTeam/greptimedb/pull/3464)
* feat: support append-only mode in time-series memtable by [@v0y4g3r](https://github.com/v0y4g3r) in [#3540](https://github.com/GreptimeTeam/greptimedb/pull/3540)
* feat: Able to pretty print sql query result in http output by [@YCCDSZXH](https://github.com/YCCDSZXH) in [#3539](https://github.com/GreptimeTeam/greptimedb/pull/3539)
* feat: return new added columns in region server's extension response by [@waynexia](https://github.com/waynexia) in [#3533](https://github.com/GreptimeTeam/greptimedb/pull/3533)
* feat: update physical table's schema on creating logical table by [@waynexia](https://github.com/waynexia) in [#3570](https://github.com/GreptimeTeam/greptimedb/pull/3570)
* feat: implement the drop database procedure by [@WenyXu](https://github.com/WenyXu) in [#3541](https://github.com/GreptimeTeam/greptimedb/pull/3541)
* feat: batch alter logical tables by [@fengjiachun](https://github.com/fengjiachun) in [#3569](https://github.com/GreptimeTeam/greptimedb/pull/3569)
* feat: support time range in copy table by [@v0y4g3r](https://github.com/v0y4g3r) in [#3583](https://github.com/GreptimeTeam/greptimedb/pull/3583)
* feat: update physical table schema on alter logical tables by [@fengjiachun](https://github.com/fengjiachun) in [#3585](https://github.com/GreptimeTeam/greptimedb/pull/3585)
* feat(auth): watch file user provider by [@tisonkun](https://github.com/tisonkun) in [#3566](https://github.com/GreptimeTeam/greptimedb/pull/3566)
* feat: Support printing postgresql's `bytea` data type in its "hex" and "escape" format by [@J0HN50N133](https://github.com/J0HN50N133) in [#3567](https://github.com/GreptimeTeam/greptimedb/pull/3567)
* feat: Implement append mode for a region by [@evenyag](https://github.com/evenyag) in [#3558](https://github.com/GreptimeTeam/greptimedb/pull/3558)
* feat: create regions persist true by [@fengjiachun](https://github.com/fengjiachun) in [#3590](https://github.com/GreptimeTeam/greptimedb/pull/3590)
* feat: remove support for logical tables in the create table procedure by [@fengjiachun](https://github.com/fengjiachun) in [#3592](https://github.com/GreptimeTeam/greptimedb/pull/3592)
* feat: adds metric engine to information_schema engines table by [@killme2008](https://github.com/killme2008) in [#3599](https://github.com/GreptimeTeam/greptimedb/pull/3599)
* feat: support `2+2` and `/status/buildinfo` by [@waynexia](https://github.com/waynexia) in [#3604](https://github.com/GreptimeTeam/greptimedb/pull/3604)
* feat(tql): add initial support for start,stop,step as sql functions by [@etolbakov](https://github.com/etolbakov) in [#3507](https://github.com/GreptimeTeam/greptimedb/pull/3507)
* feat: Implement an unordered scanner for append mode by [@evenyag](https://github.com/evenyag) in [#3598](https://github.com/GreptimeTeam/greptimedb/pull/3598)
* feat: allow cross-schema query in promql by [@sunng87](https://github.com/sunng87) in [#3545](https://github.com/GreptimeTeam/greptimedb/pull/3545)
* feat: let alter table procedure can only alter physical table by [@fengjiachun](https://github.com/fengjiachun) in [#3613](https://github.com/GreptimeTeam/greptimedb/pull/3613)
* feat(function): add timestamp epoch integer support for to_timezone by [@etolbakov](https://github.com/etolbakov) in [#3620](https://github.com/GreptimeTeam/greptimedb/pull/3620)
* feat: impl show index and show columns by [@killme2008](https://github.com/killme2008) in [#3577](https://github.com/GreptimeTeam/greptimedb/pull/3577)
* feat: group requests by peer by [@fengjiachun](https://github.com/fengjiachun) in [#3619](https://github.com/GreptimeTeam/greptimedb/pull/3619)
* feat: Support outputting various date styles for postgresql by [@J0HN50N133](https://github.com/J0HN50N133) in [#3602](https://github.com/GreptimeTeam/greptimedb/pull/3602)
* feat: reject invalid timestamp ranges in copy statement by [@v0y4g3r](https://github.com/v0y4g3r) in [#3623](https://github.com/GreptimeTeam/greptimedb/pull/3623)
* feat(procedure): auto split large value to multiple values by [@WenyXu](https://github.com/WenyXu) in [#3605](https://github.com/GreptimeTeam/greptimedb/pull/3605)
* feat(procedure): enable auto split large value by [@WenyXu](https://github.com/WenyXu) in [#3628](https://github.com/GreptimeTeam/greptimedb/pull/3628)
* feat: introduce wal benchmarker by [@niebayes](https://github.com/niebayes) in [#3446](https://github.com/GreptimeTeam/greptimedb/pull/3446)
* feat: adding victoriametrics remote write by [@sunng87](https://github.com/sunng87) in [#3641](https://github.com/GreptimeTeam/greptimedb/pull/3641)
* feat: Add timers to more mito methods by [@evenyag](https://github.com/evenyag) in [#3659](https://github.com/GreptimeTeam/greptimedb/pull/3659)
* feat: cluster information by [@fengjiachun](https://github.com/fengjiachun) in [#3631](https://github.com/GreptimeTeam/greptimedb/pull/3631)
* feat: update dashboard to v0.4.10 by [@ZonaHex](https://github.com/ZonaHex) in [#3663](https://github.com/GreptimeTeam/greptimedb/pull/3663)

### 🐛 Bug Fixes

* fix: clone data instead of moving it - homemade future is dangerous by [@waynexia](https://github.com/waynexia) in [#3542](https://github.com/GreptimeTeam/greptimedb/pull/3542)
* fix: performance degradation caused by config change by [@v0y4g3r](https://github.com/v0y4g3r) in [#3556](https://github.com/GreptimeTeam/greptimedb/pull/3556)
* fix(flow): Arrange get range with batch unaligned by [@discord9](https://github.com/discord9) in [#3552](https://github.com/GreptimeTeam/greptimedb/pull/3552)
* fix: set http response chartset to utf-8 when using table format by [@xxxuuu](https://github.com/xxxuuu) in [#3571](https://github.com/GreptimeTeam/greptimedb/pull/3571)
* fix: update pk_cache in compat reader  by [@waynexia](https://github.com/waynexia) in [#3576](https://github.com/GreptimeTeam/greptimedb/pull/3576)
* fix: incorrect version info in by [@waynexia](https://github.com/waynexia) in [#3586](https://github.com/GreptimeTeam/greptimedb/pull/3586)
* fix: canonicalize catalog and schema names by [@killme2008](https://github.com/killme2008) in [#3600](https://github.com/GreptimeTeam/greptimedb/pull/3600)
* fix: adjust status code to http error code map by [@waynexia](https://github.com/waynexia) in [#3601](https://github.com/GreptimeTeam/greptimedb/pull/3601)
* fix: run purge jobs in another scheduler by [@evenyag](https://github.com/evenyag) in [#3621](https://github.com/GreptimeTeam/greptimedb/pull/3621)
* fix: mistakely removes compaction inputs on failure by [@v0y4g3r](https://github.com/v0y4g3r) in [#3635](https://github.com/GreptimeTeam/greptimedb/pull/3635)
* fix: move object store read/write timer into inner by [@dimbtp](https://github.com/dimbtp) in [#3627](https://github.com/GreptimeTeam/greptimedb/pull/3627)
* fix: construct correct pk list with pre-existing pk by [@waynexia](https://github.com/waynexia) in [#3614](https://github.com/GreptimeTeam/greptimedb/pull/3614)

### 🚜 Refactor

* refactor: remove removed-prefixed keys by [@WenyXu](https://github.com/WenyXu) in [#3535](https://github.com/GreptimeTeam/greptimedb/pull/3535)
* refactor: introduce the DropTableExecutor by [@WenyXu](https://github.com/WenyXu) in [#3534](https://github.com/GreptimeTeam/greptimedb/pull/3534)
* refactor: refactor CacheInvalidator by [@WenyXu](https://github.com/WenyXu) in [#3550](https://github.com/GreptimeTeam/greptimedb/pull/3550)
* refactor: handle error for http format by [@tisonkun](https://github.com/tisonkun) in [#3548](https://github.com/GreptimeTeam/greptimedb/pull/3548)
* refactor: remove redundant PromStoreProtocolHandler::write  by [@v0y4g3r](https://github.com/v0y4g3r) in [#3553](https://github.com/GreptimeTeam/greptimedb/pull/3553)
* refactor: reduce one clone by carefully pass ready boundary by [@tisonkun](https://github.com/tisonkun) in [#3543](https://github.com/GreptimeTeam/greptimedb/pull/3543)
* refactor: try upgrade regex-automata by [@tisonkun](https://github.com/tisonkun) in [#3575](https://github.com/GreptimeTeam/greptimedb/pull/3575)
* refactor: refactor drop table executor by [@WenyXu](https://github.com/WenyXu) in [#3589](https://github.com/GreptimeTeam/greptimedb/pull/3589)
* refactor(table): remove unused table requests by [@zhongzc](https://github.com/zhongzc) in [#3603](https://github.com/GreptimeTeam/greptimedb/pull/3603)
* refactor: cache invalidator by [@fengjiachun](https://github.com/fengjiachun) in [#3611](https://github.com/GreptimeTeam/greptimedb/pull/3611)
* refactor: alter logical tables by [@fengjiachun](https://github.com/fengjiachun) in [#3618](https://github.com/GreptimeTeam/greptimedb/pull/3618)
* refactor: move create database to procedure by [@CookiePieWw](https://github.com/CookiePieWw) in [#3626](https://github.com/GreptimeTeam/greptimedb/pull/3626)
* refactor: drop Table trait by [@tisonkun](https://github.com/tisonkun) in [#3654](https://github.com/GreptimeTeam/greptimedb/pull/3654)

### 📚 Documentation

* docs: add v0.7 TSBS benchmark result by [@evenyag](https://github.com/evenyag) in [#3512](https://github.com/GreptimeTeam/greptimedb/pull/3512)
* docs: revise README file by [@tisonkun](https://github.com/tisonkun) in [#3522](https://github.com/GreptimeTeam/greptimedb/pull/3522)
* docs: readme style and project status by [@tisonkun](https://github.com/tisonkun) in [#3528](https://github.com/GreptimeTeam/greptimedb/pull/3528)
* docs: improve fn comments by [@tisonkun](https://github.com/tisonkun) in [#3526](https://github.com/GreptimeTeam/greptimedb/pull/3526)

### 🧪 Testing

* test: add a parameter type mismatch test case to sql integration test by [@xxxuuu](https://github.com/xxxuuu) in [#3568](https://github.com/GreptimeTeam/greptimedb/pull/3568)
* test: add tests for drop databases by [@WenyXu](https://github.com/WenyXu) in [#3594](https://github.com/GreptimeTeam/greptimedb/pull/3594)
* test: add more integration test for kafka wal by [@niebayes](https://github.com/niebayes) in [#3190](https://github.com/GreptimeTeam/greptimedb/pull/3190)
* test(sqlness): release databases after tests by [@WenyXu](https://github.com/WenyXu) in [#3648](https://github.com/GreptimeTeam/greptimedb/pull/3648)

### ⚙️ Miscellaneous Tasks

* ci: add bin options to reduce build burden by [@WenyXu](https://github.com/WenyXu) in [#3518](https://github.com/GreptimeTeam/greptimedb/pull/3518)
* ci: unassign issues stale 14 days ago by [@tisonkun](https://github.com/tisonkun) in [#3529](https://github.com/GreptimeTeam/greptimedb/pull/3529)
* feat: http header with metrics by [@shuiyisong](https://github.com/shuiyisong) in [#3536](https://github.com/GreptimeTeam/greptimedb/pull/3536)
* chore: avoid unnecessary cloning by [@fengjiachun](https://github.com/fengjiachun) in [#3537](https://github.com/GreptimeTeam/greptimedb/pull/3537)
* chore: fix comment in fetch-dashboard-assets.sh by [@tisonkun](https://github.com/tisonkun) in [#3546](https://github.com/GreptimeTeam/greptimedb/pull/3546)
* ci: use a PAT to list all writers by [@tisonkun](https://github.com/tisonkun) in [#3559](https://github.com/GreptimeTeam/greptimedb/pull/3559)
* chore: avoid confusing TryFrom by [@tisonkun](https://github.com/tisonkun) in [#3565](https://github.com/GreptimeTeam/greptimedb/pull/3565)
* chore: retain original headers by [@tisonkun](https://github.com/tisonkun) in [#3572](https://github.com/GreptimeTeam/greptimedb/pull/3572)
* ci: use single commit on the deployment branch by [@evenyag](https://github.com/evenyag) in [#3580](https://github.com/GreptimeTeam/greptimedb/pull/3580)
* chore: limit OpenDAL's feature gates by [@waynexia](https://github.com/waynexia) in [#3584](https://github.com/GreptimeTeam/greptimedb/pull/3584)
* chore: Delete CODE_OF_CONDUCT.md by [@tisonkun](https://github.com/tisonkun) in [#3578](https://github.com/GreptimeTeam/greptimedb/pull/3578)
* chore: add back core dependency by [@shuiyisong](https://github.com/shuiyisong) in [#3588](https://github.com/GreptimeTeam/greptimedb/pull/3588)
* chore: do not reply for broadcast msg by [@fengjiachun](https://github.com/fengjiachun) in [#3595](https://github.com/GreptimeTeam/greptimedb/pull/3595)
* ci: ignore type in sqlness sql and result files by [@waynexia](https://github.com/waynexia) in [#3616](https://github.com/GreptimeTeam/greptimedb/pull/3616)
* ci: bump license header checker action version by [@tisonkun](https://github.com/tisonkun) in [#3655](https://github.com/GreptimeTeam/greptimedb/pull/3655)
* chore: generate release notes with git-cliff by [@tisonkun](https://github.com/tisonkun) in [#3650](https://github.com/GreptimeTeam/greptimedb/pull/3650)
* chore: add manifest related metrics by [@MichaelScofield](https://github.com/MichaelScofield) in [#3634](https://github.com/GreptimeTeam/greptimedb/pull/3634)
* chore: bump version to 0.7.2 by [@waynexia](https://github.com/waynexia) in [#3658](https://github.com/GreptimeTeam/greptimedb/pull/3658)

### Build

* build(deps): remove some unused dependencies by [@dimbtp](https://github.com/dimbtp) in [#3582](https://github.com/GreptimeTeam/greptimedb/pull/3582)
* build(deps): bump h2 from 0.3.24 to 0.3.26 by [@dependabot[bot]](https://github.com/dependabot[bot]) in [#3642](https://github.com/GreptimeTeam/greptimedb/pull/3642)
* build(deps): bump whoami from 1.4.1 to 1.5.1 by [@dependabot[bot]](https://github.com/dependabot[bot]) in [#3643](https://github.com/GreptimeTeam/greptimedb/pull/3643)

## New Contributors

* [@CookiePieWw](https://github.com/CookiePieWw) made their first contribution in [#3626](https://github.com/GreptimeTeam/greptimedb/pull/3626)
* [@xxxuuu](https://github.com/xxxuuu) made their first contribution in [#3571](https://github.com/GreptimeTeam/greptimedb/pull/3571)
* [@YCCDSZXH](https://github.com/YCCDSZXH) made their first contribution in [#3539](https://github.com/GreptimeTeam/greptimedb/pull/3539)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@CookiePieWw](https://github.com/CookiePieWw), [@J0HN50N133](https://github.com/J0HN50N133), [@MichaelScofield](https://github.com/MichaelScofield), [@Taylor-lagrange](https://github.com/Taylor-lagrange), [@WenyXu](https://github.com/WenyXu), [@YCCDSZXH](https://github.com/YCCDSZXH), [@ZonaHex](https://github.com/ZonaHex), [@dimbtp](https://github.com/dimbtp), [@discord9](https://github.com/discord9), [@etolbakov](https://github.com/etolbakov), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@killme2008](https://github.com/killme2008), [@niebayes](https://github.com/niebayes), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@tisonkun](https://github.com/tisonkun), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@xxxuuu](https://github.com/xxxuuu), [@zhongzc](https://github.com/zhongzc)
