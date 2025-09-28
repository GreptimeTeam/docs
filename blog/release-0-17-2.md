---
keywords: [release, GreptimeDB, changelog, v0.17.2]
description: GreptimeDB v0.17.2 Changelog
date: 2025-09-28
---

# 0.17.2

Release date: September 28, 2025

**If you are using [v0.17.1](https://github.com/GreptimeTeam/greptimedb/releases/tag/v0.17.1) or [v0.17.0](https://github.com/GreptimeTeam/greptimedb/releases/tag/v0.17.0), we recommend upgrading to [v0.17.2](https://github.com/GreptimeTeam/greptimedb/releases/tag/v0.17.2).**

v0.17.2 enhances overall reliability, resolves critical query bugs, and introduces support for expressions within TQL parameters.

### 🚀 Features

* feat: update dashboard to v0.11.6 by [@ZonaHex](https://github.com/ZonaHex) in [#7026](https://github.com/GreptimeTeam/greptimedb/pull/7026)
* feat: supports expression in TQL params by [@killme2008](https://github.com/killme2008) in [#7014](https://github.com/GreptimeTeam/greptimedb/pull/7014)

### 🐛 Bug Fixes

* fix: step aggr merge phase not order nor filter by [@discord9](https://github.com/discord9) in [#6998](https://github.com/GreptimeTeam/greptimedb/pull/6998)
* fix: not step when aggr have order by/filter by [@discord9](https://github.com/discord9) in [#7015](https://github.com/GreptimeTeam/greptimedb/pull/7015)
* fix: skip placeholder when partition columns by [@discord9](https://github.com/discord9) in [#7020](https://github.com/GreptimeTeam/greptimedb/pull/7020)
* fix: group by expr not as column in step aggr by [@discord9](https://github.com/discord9) in [#7008](https://github.com/GreptimeTeam/greptimedb/pull/7008)
* fix: match promql column reference in case sensitive way by [@waynexia](https://github.com/waynexia) in [#7013](https://github.com/GreptimeTeam/greptimedb/pull/7013)
* fix: incorrect timestamp resolution in information_schema.partitions table by [@waynexia](https://github.com/waynexia) in [#7004](https://github.com/GreptimeTeam/greptimedb/pull/7004)
* fix: promql range function has incorrect timestamps by [@waynexia](https://github.com/waynexia) in [#7006](https://github.com/GreptimeTeam/greptimedb/pull/7006)
* fix: make EXPIRE (keyword) parsing case-insensitive, when creating flow by [@shyam](https://github.com/Shyamnatesan) in [#6997](https://github.com/GreptimeTeam/greptimedb/pull/6997)
* fix: print the output message of the error in admin fn macro by [@evenyag](https://github.com/evenyag) in [#6994](https://github.com/GreptimeTeam/greptimedb/pull/6994)

### ⚙️ Miscellaneous Tasks

* chore: add function for getting started on metasrv (by [@shuiyisong](https://github.com/shuiyisong)) in [#7022](https://github.com/GreptimeTeam/greptimedb/pull/7022)
* chore: not warning by [@discord9](https://github.com/discord9) in [#7037](https://github.com/GreptimeTeam/greptimedb/pull/7037)


## New Contributors

* [@shyam](https://github.com/Shyamnatesan) made their first contribution in [#6997](https://github.com/GreptimeTeam/greptimedb/pull/6997)


## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@ZonaHex](https://github.com/ZonaHex), [@killme2008](https://github.com/killme2008), [@discord9](https://github.com/discord9), [@waynexia](https://github.com/waynexia), [@Shyamnatesan](https://github.com/Shyamnatesan), [@evenyag](https://github.com/evenyag), [@shuiyisong](https://github.com/shuiyisong)
