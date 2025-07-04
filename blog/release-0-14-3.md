---
keywords: [release, GreptimeDB, changelog, v0.14.3]
description: GreptimeDB v0.14.3 Changelog
date: 2025-05-23
---

# v0.14.3

Release date: May 23, 2025

### 🚀 Features

* feat: don't hide atomic write dir by [@waynexia](https://github.com/waynexia) in [#6109](https://github.com/GreptimeTeam/greptimedb/pull/6109)
* feat: accommodate default column name with pre-created table schema by [@waynexia](https://github.com/waynexia) in [#6126](https://github.com/GreptimeTeam/greptimedb/pull/6126)
* feat: support altering multiple logical table in one remote write request by [@waynexia](https://github.com/waynexia) in [#6137](https://github.com/GreptimeTeam/greptimedb/pull/6137)

### 🐛 Bug Fixes

* fix: reset tags when creating an empty metric in prom call by [@evenyag](https://github.com/evenyag) in [#6056](https://github.com/GreptimeTeam/greptimedb/pull/6056)
* fix: flownode chose fe randomly&not starve lock by [@discord9](https://github.com/discord9) in [#6077](https://github.com/GreptimeTeam/greptimedb/pull/6077)
* fix: append noop entry when auto topic creation is disabled by [@WenyXu](https://github.com/WenyXu) in [#6092](https://github.com/GreptimeTeam/greptimedb/pull/6092)
* fix(flow): flow task run interval by [@discord9](https://github.com/discord9) in [#6100](https://github.com/GreptimeTeam/greptimedb/pull/6100)
* fix: flow update use proper update by [@discord9](https://github.com/discord9) in [#6108](https://github.com/GreptimeTeam/greptimedb/pull/6108)
* fix: clean files under the atomic write dir on failure by [@evenyag](https://github.com/evenyag) in [#6112](https://github.com/GreptimeTeam/greptimedb/pull/6112)
* fix: update promql-parser for regex anchor fix by [@waynexia](https://github.com/waynexia) in [#6117](https://github.com/GreptimeTeam/greptimedb/pull/6117)
* fix: require input ordering in series divide plan by [@waynexia](https://github.com/waynexia) in [#6148](https://github.com/GreptimeTeam/greptimedb/pull/6148)
* fix: ident value in set search_path by [@sunng87](https://github.com/sunng87) in [#6153](https://github.com/GreptimeTeam/greptimedb/pull/6153)

### ⚙️ Miscellaneous Tasks

* chore: reduce unnecessary txns in alter operations by [@fengjiachun](https://github.com/fengjiachun) in [#6133](https://github.com/GreptimeTeam/greptimedb/pull/6133)
* chore: invalid table flow mapping cache by [@discord9](https://github.com/discord9) in [#6135](https://github.com/GreptimeTeam/greptimedb/pull/6135)
* chore: bump version to 0.14.3 by [@zhongzc](https://github.com/zhongzc) in [#6168](https://github.com/GreptimeTeam/greptimedb/pull/6168)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@WenyXu](https://github.com/WenyXu), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@sunng87](https://github.com/sunng87), [@waynexia](https://github.com/waynexia), [@zhongzc](https://github.com/zhongzc)
