---
keywords: [release, GreptimeDB, changelog, v1.2.0-beta.2]
description: GreptimeDB v1.2.0-beta.2 Changelog
date: 2026-08-21
---

# v1.2.0-beta.2

Release date: August 21, 2026

GreptimeDB v1.2.0-beta.2 is the second beta of the v1.2 line. It focuses on safer table administration, better Flow and procedure observability, continued JSON2 preparation, and query and storage correctness fixes.

### 👍 Highlights

- **One-way `skip_wal` changes with `ALTER TABLE`** — You can enable `skip_wal` on supported tables with `ALTER TABLE`, and the change is validated against the table's leader routes before the irreversible metadata update. The transition is intentionally one-way: changing `skip_wal` back to `false` is rejected ([#8817](https://github.com/GreptimeTeam/greptimedb/pull/8817), [#8838](https://github.com/GreptimeTeam/greptimedb/pull/8838)).

- **Flow runtime statistics** — `information_schema.flow_statistics` and `SHOW FLOW STATUS` expose the supported per-flow runtime state. In distributed Flow, `start_time` and `uptime_seconds` remain unavailable (`NULL`) in this release; full upstream state support is not included. Aggregation and SQL rendering fixes also improve distributed Flow statistics and Flow query execution ([#8392](https://github.com/GreptimeTeam/greptimedb/pull/8392), [#8729](https://github.com/GreptimeTeam/greptimedb/pull/8729)).

- **JSON2 extension and layout preparation** — JSON2 now has a separate extension type, type hints can be pushed down to Parquet reads, and DDL accepts JSON2 storage-layout settings. The v2 physical-layout primitives are prepared, but the v2 physical layout is not activated by this release ([#8745](https://github.com/GreptimeTeam/greptimedb/pull/8745), [#8833](https://github.com/GreptimeTeam/greptimedb/pull/8833), [#8895](https://github.com/GreptimeTeam/greptimedb/pull/8895), [#8901](https://github.com/GreptimeTeam/greptimedb/pull/8901)).

- **Procedure and administration event observability** — Procedure events now carry structured context, lifecycle locators, submission context, and the actor; admin function executions are recorded as events, and the shared query-channel definition keeps event protocol information consistent ([#8734](https://github.com/GreptimeTeam/greptimedb/pull/8734), [#8787](https://github.com/GreptimeTeam/greptimedb/pull/8787), [#8834](https://github.com/GreptimeTeam/greptimedb/pull/8834), [#8835](https://github.com/GreptimeTeam/greptimedb/pull/8835), [#8856](https://github.com/GreptimeTeam/greptimedb/pull/8856), [#8849](https://github.com/GreptimeTeam/greptimedb/pull/8849), [#8825](https://github.com/GreptimeTeam/greptimedb/pull/8825)).

- **Safer discard-unflushed operations** — The frontend heartbeat is extensible and lifecycle-safe, while storage can discard unflushed region data while preserving persisted SST files and expose the operation through an admin function ([#8726](https://github.com/GreptimeTeam/greptimedb/pull/8726), [#8600](https://github.com/GreptimeTeam/greptimedb/pull/8600), [#8768](https://github.com/GreptimeTeam/greptimedb/pull/8768)).

- **Dictionary tag group-by path restored** — The columnar group-by path works again for dictionary-encoded tag columns ([#8902](https://github.com/GreptimeTeam/greptimedb/pull/8902)).

### Dashboard

The bundled GreptimeDB dashboard was updated from **v0.13.10** to **v0.13.13** ([#8898](https://github.com/GreptimeTeam/greptimedb/pull/8898)). The update includes:

- Better table sizing, horizontal scrolling, and cell expansion, including virtual-list tables ([dashboard#638](https://github.com/GreptimeTeam/dashboard/pull/638)).
- Full-screen query results ([dashboard#639](https://github.com/GreptimeTeam/dashboard/pull/639)).
- Trace-table selection and edition/build information ([dashboard#640](https://github.com/GreptimeTeam/dashboard/pull/640), [dashboard#641](https://github.com/GreptimeTeam/dashboard/pull/641)).
- A command palette ([dashboard#642](https://github.com/GreptimeTeam/dashboard/pull/642)).
- Removal of the guided tour ([dashboard#643](https://github.com/GreptimeTeam/dashboard/pull/643)).
- A fix for connections after changing hosts ([dashboard#644](https://github.com/GreptimeTeam/dashboard/pull/644)).

### Breaking changes

- **Soft-drop and recovery are enterprise-only again in beta2.** PR [#8747](https://github.com/GreptimeTeam/greptimedb/pull/8747) gates soft-drop tables, `UNDROP TABLE`, `ADMIN purge_table()`, `information_schema.recycle_bin`, and expired soft-drop garbage collection behind the enterprise feature. This reverses the beta1 behavior that made these operations available in OSS. An OSS beta2 metasrv rejects `gc.experimental_soft_drop.enable = true` during startup, so remove that setting before upgrading. OSS beta2 also cannot recover or purge tables already soft-dropped in beta1 and does not run their expired-tombstone cleanup; recover any tables you may need before upgrading, or use Enterprise Edition to continue the soft-drop lifecycle. This is by [@v0y4g3r](https://github.com/v0y4g3r).

- **Native histogram persisted fields change signedness.** PR [#8824](https://github.com/GreptimeTeam/greptimedb/pull/8824) changes persisted native-histogram span-length list elements from `UInt32` to `Int32` and integer count fields from `UInt64` to `Int64`, including renaming `count_u64`/`zero_count_u64` to `count_i64`/`zero_count_i64`. Existing native-histogram Struct data written with the previous schema may be unreadable in beta2, and rolling binaries back does not restore or convert data written with the changed fields. There is no migration, downgrade, or mixed-version compatibility layer; do not run mixed versions, and establish a migration or reingestion plan before upgrading. This is by [@sunng87](https://github.com/sunng87).

### 🚀 Features

- Add `information_schema.flow_statistics` and `SHOW FLOW STATUS` for Flow runtime observability ([#8392](https://github.com/GreptimeTeam/greptimedb/pull/8392)) by [@onepizzateam](https://github.com/onepizzateam).
- Safely discard unflushed region data while retaining persisted SST files ([#8600](https://github.com/GreptimeTeam/greptimedb/pull/8600)) by [@evenyag](https://github.com/evenyag).
- Make the frontend heartbeat extensible and lifecycle-safe ([#8726](https://github.com/GreptimeTeam/greptimedb/pull/8726)) by [@fengjiachun](https://github.com/fengjiachun).
- Add structured event context to procedure events ([#8734](https://github.com/GreptimeTeam/greptimedb/pull/8734)) by [@WenyXu](https://github.com/WenyXu).
- Separate the JSON2 extension type from the legacy JSON extension type ([#8745](https://github.com/GreptimeTeam/greptimedb/pull/8745)) by [@MichaelScofield](https://github.com/MichaelScofield).
- Add an admin function to discard unflushed data ([#8768](https://github.com/GreptimeTeam/greptimedb/pull/8768)) by [@evenyag](https://github.com/evenyag).
- Support enabling `skip_wal` with `ALTER TABLE` ([#8817](https://github.com/GreptimeTeam/greptimedb/pull/8817)) by [@evenyag](https://github.com/evenyag).
- Share the query-channel definition across components while preserving its wire values ([#8825](https://github.com/GreptimeTeam/greptimedb/pull/8825)) by [@WenyXu](https://github.com/WenyXu).
- Push JSON2 type hints down to Parquet reads ([#8833](https://github.com/GreptimeTeam/greptimedb/pull/8833)) by [@fengys1996](https://github.com/fengys1996).
- Centralize procedure event-context handling ([#8834](https://github.com/GreptimeTeam/greptimedb/pull/8834)) by [@WenyXu](https://github.com/WenyXu).
- Record admin function executions as events ([#8835](https://github.com/GreptimeTeam/greptimedb/pull/8835)) by [@WenyXu](https://github.com/WenyXu).
- Record the actor for procedure events ([#8849](https://github.com/GreptimeTeam/greptimedb/pull/8849)) by [@WenyXu](https://github.com/WenyXu).
- Separate procedure submission context ([#8856](https://github.com/GreptimeTeam/greptimedb/pull/8856)) by [@WenyXu](https://github.com/WenyXu).
- Update to pgwire 0.40.7 ([#8860](https://github.com/GreptimeTeam/greptimedb/pull/8860)) by [@sunng87](https://github.com/sunng87).
- Support JSON2 storage-layout settings in DDL ([#8895](https://github.com/GreptimeTeam/greptimedb/pull/8895)) by [@MichaelScofield](https://github.com/MichaelScofield).
- Add JSON2 v2 physical-layout primitives; the v2 layout is not activated by this release ([#8901](https://github.com/GreptimeTeam/greptimedb/pull/8901)) by [@MichaelScofield](https://github.com/MichaelScofield).

### 🐛 Bug Fixes

- Avoid unsafe `count(*)` wildcard rewrites ([#8522](https://github.com/GreptimeTeam/greptimedb/pull/8522)) by [@discord9](https://github.com/discord9).
- Validate remote schemas in `MergeScan` ([#8579](https://github.com/GreptimeTeam/greptimedb/pull/8579)) and ignore field metadata during that validation ([#8818](https://github.com/GreptimeTeam/greptimedb/pull/8818)), both by [@discord9](https://github.com/discord9).
- Resolve custom timestamp and value columns in Prometheus remote reads ([#8659](https://github.com/GreptimeTeam/greptimedb/pull/8659)) by [@grezzko](https://github.com/grezzko).
- Limit compaction picker threads and provide a bounded compact-runtime blocking pool ([#8704](https://github.com/GreptimeTeam/greptimedb/pull/8704)) by [@v0y4g3r](https://github.com/v0y4g3r).
- Fail open when Bloom-filter `IN` predicates contain non-literal or unencodable members ([#8709](https://github.com/GreptimeTeam/greptimedb/pull/8709)) by [@discord9](https://github.com/discord9).
- Add a public compactor constructor ([#8724](https://github.com/GreptimeTeam/greptimedb/pull/8724)) by [@sunng87](https://github.com/sunng87).
- Fix Flow statistics aggregation and quoting in `df_plan_to_sql` ([#8729](https://github.com/GreptimeTeam/greptimedb/pull/8729)) by [@discord9](https://github.com/discord9).
- Remove gRPC DDL panics for `DropView` and non-timestamp time indexes ([#8739](https://github.com/GreptimeTeam/greptimedb/pull/8739)) by [@discord9](https://github.com/discord9).
- Release region guards after a drop rollback ([#8751](https://github.com/GreptimeTeam/greptimedb/pull/8751)) by [@WenyXu](https://github.com/WenyXu).
- Handle `Utf8View` tag and label columns without panicking ([#8772](https://github.com/GreptimeTeam/greptimedb/pull/8772)) by [@discord9](https://github.com/discord9).
- Cache physical-table metadata lookups ([#8777](https://github.com/GreptimeTeam/greptimedb/pull/8777)) by [@shuiyisong](https://github.com/shuiyisong).
- Preserve procedure lifecycle locators ([#8787](https://github.com/GreptimeTeam/greptimedb/pull/8787)) by [@WenyXu](https://github.com/WenyXu).
- Re-encode bulk WAL entries after filling missing columns ([#8808](https://github.com/GreptimeTeam/greptimedb/pull/8808)) by [@fengjiachun](https://github.com/fengjiachun).
- Backport the Prometheus response `Utf8View` handling and `skip_wal` leader validation in one release-branch fix ([#8838](https://github.com/GreptimeTeam/greptimedb/pull/8838)) by [@evenyag](https://github.com/evenyag). This is the release-branch umbrella for upstream fixes [#8754](https://github.com/GreptimeTeam/greptimedb/pull/8754) and [#8823](https://github.com/GreptimeTeam/greptimedb/pull/8823); it is listed here only once.
- Bump DataFusion to support dictionary literals in Substrait plans ([#8842](https://github.com/GreptimeTeam/greptimedb/pull/8842)) by [@discord9](https://github.com/discord9).
- Harden permission checks and process visibility ([#8852](https://github.com/GreptimeTeam/greptimedb/pull/8852)) by [@shuiyisong](https://github.com/shuiyisong).
- Remove the `iceberg.read` permission action ([#8858](https://github.com/GreptimeTeam/greptimedb/pull/8858)) by [@shuiyisong](https://github.com/shuiyisong).
- Respect query time zones in timestamp casts ([#8859](https://github.com/GreptimeTeam/greptimedb/pull/8859)) by [@fzlzjerry](https://github.com/fzlzjerry).
- Keep deletion markers when compacting part of a window ([#8872](https://github.com/GreptimeTeam/greptimedb/pull/8872)) by [@fengjiachun](https://github.com/fengjiachun).
- Preserve timestamp literal semantics in inserts ([#8889](https://github.com/GreptimeTeam/greptimedb/pull/8889)) by [@killme2008](https://github.com/killme2008).
- Restore columnar group-by for dictionary-encoded tags ([#8902](https://github.com/GreptimeTeam/greptimedb/pull/8902)) by [@discord9](https://github.com/discord9).
- Clear pooled Prometheus Remote Write decoder state ([#8921](https://github.com/GreptimeTeam/greptimedb/pull/8921)) by [@shuiyisong](https://github.com/shuiyisong).

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@fengys1996](https://github.com/fengys1996), [@fzlzjerry](https://github.com/fzlzjerry), [@grezzko](https://github.com/grezzko), [@killme2008](https://github.com/killme2008), [@MichaelScofield](https://github.com/MichaelScofield), [@onepizzateam](https://github.com/onepizzateam), [@shuiyisong](https://github.com/shuiyisong), [@sunchanglong](https://github.com/sunchanglong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@WenyXu](https://github.com/WenyXu)

**Full Changelog**: https://github.com/GreptimeTeam/greptimedb/compare/v1.2.0-beta.1...v1.2.0-beta.2
