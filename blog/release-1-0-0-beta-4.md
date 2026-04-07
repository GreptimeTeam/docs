---
keywords: [release, GreptimeDB, changelog, v1.0.0-beta.4]
description: GreptimeDB v1.0.0-beta.4 Changelog
date: 2025-12-29
---

# v1.0.0-beta.4

Release date: December 29, 2025


### 👍 Highlights

This version applies database-level compaction options to existing tables that don't have table-level compaction options. Now users don't have to set compaction options manually for each table if they want to adjust them.

There are also some important bug fixes:

* Panic when sorting on the time index column.
* The experimental `flat` format may create incorrect index files.

It's recommended to upgrade to this version.

### Breaking changes

* feat: memory limiter unification write path by [@fengjiachun](https://github.com/fengjiachun) in [#7437](https://github.com/GreptimeTeam/greptimedb/pull/7437)
* refactor!: remove not working metasrv cli option by [@MichaelScofield](https://github.com/MichaelScofield) in [#7446](https://github.com/GreptimeTeam/greptimedb/pull/7446)

### 🚀 Features

* feat: introduce granularity for memory manager by [@fengjiachun](https://github.com/fengjiachun) in [#7416](https://github.com/GreptimeTeam/greptimedb/pull/7416)
* feat: make distributed time constants and client timeouts configurable by [@WenyXu](https://github.com/WenyXu) in [#7433](https://github.com/GreptimeTeam/greptimedb/pull/7433)
* feat: pgwire 0.37 by [@sunng87](https://github.com/sunng87) in [#7443](https://github.com/GreptimeTeam/greptimedb/pull/7443)
* feat: file range dynamic filter by [@discord9](https://github.com/discord9) in [#7441](https://github.com/GreptimeTeam/greptimedb/pull/7441)
* feat: allow auto schema creation for pg by [@lyang24](https://github.com/lyang24) in [#7459](https://github.com/GreptimeTeam/greptimedb/pull/7459)
* feat(repartition): implement enter staging region state by [@WenyXu](https://github.com/WenyXu) in [#7447](https://github.com/GreptimeTeam/greptimedb/pull/7447)
* feat!: gc versioned index by [@discord9](https://github.com/discord9) in [#7412](https://github.com/GreptimeTeam/greptimedb/pull/7412)
* feat(mito2): implement `ApplyStagingManifest` request handling by [@WenyXu](https://github.com/WenyXu) in [#7456](https://github.com/GreptimeTeam/greptimedb/pull/7456)
* feat: add more MySQL-compatible string functions by [@killme2008](https://github.com/killme2008) in [#7454](https://github.com/GreptimeTeam/greptimedb/pull/7454)
* feat: refine the MemoryGuard by [@fengjiachun](https://github.com/fengjiachun) in [#7466](https://github.com/GreptimeTeam/greptimedb/pull/7466)
* feat: update dashboard to v0.11.10 by [@ZonaHex](https://github.com/ZonaHex) in [#7479](https://github.com/GreptimeTeam/greptimedb/pull/7479)
* feat(metric-engine): support sync logical regions from source region by [@WenyXu](https://github.com/WenyXu) in [#7438](https://github.com/GreptimeTeam/greptimedb/pull/7438)
* feat: update dashboard to v0.11.11 by [@ZonaHex](https://github.com/ZonaHex) in [#7481](https://github.com/GreptimeTeam/greptimedb/pull/7481)
* feat: Implement per range stats for bulk memtable by [@evenyag](https://github.com/evenyag) in [#7486](https://github.com/GreptimeTeam/greptimedb/pull/7486)
* feat(meta-srv): add repartition procedure skeleton by [@WenyXu](https://github.com/WenyXu) in [#7487](https://github.com/GreptimeTeam/greptimedb/pull/7487)
* feat: repartition map kv by [@discord9](https://github.com/discord9) in [#7420](https://github.com/GreptimeTeam/greptimedb/pull/7420)
* feat: bump version to beta.4 by [@evenyag](https://github.com/evenyag) in [#7490](https://github.com/GreptimeTeam/greptimedb/pull/7490)
* feat: impl `json_get_string` with new json type by [@MichaelScofield](https://github.com/MichaelScofield) in [#7489](https://github.com/GreptimeTeam/greptimedb/pull/7489)

### 🐛 Bug Fixes

* fix: using anonymous s3 access when ak and sk is not provided by [@shuiyisong](https://github.com/shuiyisong) in [#7425](https://github.com/GreptimeTeam/greptimedb/pull/7425)
* fix: flat format use correct encoding in indexer for tags by [@evenyag](https://github.com/evenyag) in [#7440](https://github.com/GreptimeTeam/greptimedb/pull/7440)
* fix: close issue #7457 guard against empty buffer by [@yihong0618](https://github.com/yihong0618) in [#7458](https://github.com/GreptimeTeam/greptimedb/pull/7458)
* fix: part sort share same topk dyn filter&early stop use dyn filter by [@discord9](https://github.com/discord9) in [#7460](https://github.com/GreptimeTeam/greptimedb/pull/7460)
* fix(mito2): pass partition expr explicitly to flush task for region by [@WenyXu](https://github.com/WenyXu) in [#7461](https://github.com/GreptimeTeam/greptimedb/pull/7461)
* fix(compaction): unify behavior of database compaction options with TTL by [@AntiTopQuark](https://github.com/AntiTopQuark) in [#7402](https://github.com/GreptimeTeam/greptimedb/pull/7402)
* fix: RemovedFiles deser compatibility  by [@discord9](https://github.com/discord9) in [#7475](https://github.com/GreptimeTeam/greptimedb/pull/7475)
* fix: typo in AI-assisted contributions policy by [@MichaelScofield](https://github.com/MichaelScofield) in [#7472](https://github.com/GreptimeTeam/greptimedb/pull/7472)
* fix: more wait time for sqlness start and better message by [@yihong0618](https://github.com/yihong0618) in [#7485](https://github.com/GreptimeTeam/greptimedb/pull/7485)

### 🚜 Refactor

* refactor(cli): unify storage configuration for export command by [@McKnight22](https://github.com/McKnight22) in [#7280](https://github.com/GreptimeTeam/greptimedb/pull/7280)
* refactor: explicitly define json struct to ingest jsonbench data by [@MichaelScofield](https://github.com/MichaelScofield) in [#7462](https://github.com/GreptimeTeam/greptimedb/pull/7462)
* refactor: cache server memory limiter for other components by [@sunng87](https://github.com/sunng87) in [#7470](https://github.com/GreptimeTeam/greptimedb/pull/7470)
* refactor(mito2): reorganize manifest storage into modular components by [@WenyXu](https://github.com/WenyXu) in [#7483](https://github.com/GreptimeTeam/greptimedb/pull/7483)
* refactor(mito2): make MemtableStats fields public by [@v0y4g3r](https://github.com/v0y4g3r) in [#7488](https://github.com/GreptimeTeam/greptimedb/pull/7488)

### 📚 Documentation

* docs: about AI-assisted contributions by [@waynexia](https://github.com/waynexia) in [#7464](https://github.com/GreptimeTeam/greptimedb/pull/7464)
* docs: rfc for vector index by [@killme2008](https://github.com/killme2008) in [#7353](https://github.com/GreptimeTeam/greptimedb/pull/7353)
* docs: refer to the correct project name in AI guidelines by [@frostming](https://github.com/frostming) in [#7471](https://github.com/GreptimeTeam/greptimedb/pull/7471)

### 🧪 Testing

* test: reduce execution time of test `test_suspend_frontend` by [@MichaelScofield](https://github.com/MichaelScofield) in [#7444](https://github.com/GreptimeTeam/greptimedb/pull/7444)

### ⚙️ Miscellaneous Tasks

* chore: feature gate vector_index by [@discord9](https://github.com/discord9) in [#7428](https://github.com/GreptimeTeam/greptimedb/pull/7428)
* chore: add wait_initialized method for frontend client by [@fengys1996](https://github.com/fengys1996) in [#7414](https://github.com/GreptimeTeam/greptimedb/pull/7414)
* chore: use official etcd-client by [@MichaelScofield](https://github.com/MichaelScofield) in [#7432](https://github.com/GreptimeTeam/greptimedb/pull/7432)
* chore: remove `canonicalize` by [@shuiyisong](https://github.com/shuiyisong) in [#7430](https://github.com/GreptimeTeam/greptimedb/pull/7430)
* chore: expose `disable_ec2_metadata` option by [@shuiyisong](https://github.com/shuiyisong) in [#7439](https://github.com/GreptimeTeam/greptimedb/pull/7439)
* chore(mito): nit remove extra hashset in gc workers by [@lyang24](https://github.com/lyang24) in [#7399](https://github.com/GreptimeTeam/greptimedb/pull/7399)
* ci: ensure commits from main branch for whitelisted git dependencies by [@sunng87](https://github.com/sunng87) in [#7434](https://github.com/GreptimeTeam/greptimedb/pull/7434)
* chore: fix bincode version by [@discord9](https://github.com/discord9) in [#7445](https://github.com/GreptimeTeam/greptimedb/pull/7445)
* chore: release push check against Cargo.toml by [@discord9](https://github.com/discord9) in [#7426](https://github.com/GreptimeTeam/greptimedb/pull/7426)
* chore: expose symbols by [@v0y4g3r](https://github.com/v0y4g3r) in [#7451](https://github.com/GreptimeTeam/greptimedb/pull/7451)
* chore(metric-engine): set default compaction time window for data region by [@v0y4g3r](https://github.com/v0y4g3r) in [#7474](https://github.com/GreptimeTeam/greptimedb/pull/7474)
* chore: mount cargo git cache in docker builds by [@v0y4g3r](https://github.com/v0y4g3r) in [#7484](https://github.com/GreptimeTeam/greptimedb/pull/7484)
* ci: handle prerelease version by [@evenyag](https://github.com/evenyag) in [#7492](https://github.com/GreptimeTeam/greptimedb/pull/7492)

## New Contributors

* [@frostming](https://github.com/frostming) made their first contribution in [#7471](https://github.com/GreptimeTeam/greptimedb/pull/7471)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@AntiTopQuark](https://github.com/AntiTopQuark), [@McKnight22](https://github.com/McKnight22), [@MichaelScofield](https://github.com/MichaelScofield), [@WenyXu](https://github.com/WenyXu), [@ZonaHex](https://github.com/ZonaHex), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@fengys1996](https://github.com/fengys1996), [@frostming](https://github.com/frostming), [@killme2008](https://github.com/killme2008), [@lyang24](https://github.com/lyang24), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@yihong0618](https://github.com/yihong0618)
