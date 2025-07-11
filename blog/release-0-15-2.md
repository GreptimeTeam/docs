---
keywords: [release, GreptimeDB, changelog, v0.15.2]
description: GreptimeDB v0.15.2 Changelog
date: 2025-07-11
---

# v0.15.2

Release date: July 11, 2025

### 🚀 Features
* feat: allow alternative version string by [@sunng87](https://github.com/sunng87) in [#6472](https://github.com/GreptimeTeam/greptimedb/pull/6472)

### 🐛 Bug Fixes
* fix(metric-engine): handle stale metadata region recovery failures by [@WenyXu](https://github.com/WenyXu) in [#6395](https://github.com/GreptimeTeam/greptimedb/pull/6395)
* fix: stricter win sort condition by [@discord9](https://github.com/discord9) in [#6477](https://github.com/GreptimeTeam/greptimedb/pull/6477)
* fix: empty statements hang by [@killme2008](https://github.com/killme2008) in [#6480](https://github.com/GreptimeTeam/greptimedb/pull/6480)
* fix: range query returns range selector error when table not found by [@evenyag](https://github.com/evenyag) in [#6481](https://github.com/GreptimeTeam/greptimedb/pull/6481)
* fix: skip nan in prom remote write pipeline by [@shuiyisong](https://github.com/shuiyisong) in [#6489](https://github.com/GreptimeTeam/greptimedb/pull/6489)
* fix: correctly update partition key indices during alter table operations by [@WenyXu](https://github.com/WenyXu) in [#6494](https://github.com/GreptimeTeam/greptimedb/pull/6494)
* fix: expand on conditional commutative as well by [@waynexia](https://github.com/waynexia) in [#6484](https://github.com/GreptimeTeam/greptimedb/pull/6484)

### ⚙️ Miscellaneous Tasks
* chore: sort range query return values by [@shuiyisong](https://github.com/shuiyisong) in [#6474](https://github.com/GreptimeTeam/greptimedb/pull/6474)
* chore: remove region id to reduce time series by [@paomian](https://github.com/paomian) in [#6506](https://github.com/GreptimeTeam/greptimedb/pull/6506)
* chore: skip calc ts in doc 2 with transform by [@shuiyisong](https://github.com/shuiyisong) in [#6509](https://github.com/GreptimeTeam/greptimedb/pull/6509)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@WenyXu](https://github.com/WenyXu), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@killme2008](https://github.com/killme2008), [@paomian](https://github.com/paomian), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@waynexia](https://github.com/waynexia)
