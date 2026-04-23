---
keywords: [release, GreptimeDB, changelog, v1.0.1]
description: GreptimeDB v1.0.1 Changelog
date: 2026-04-23
---

# v1.0.1

Release date: April 23, 2026

If you are using [v1.0.0](https://github.com/GreptimeTeam/greptimedb/releases/tag/v1.0.0) , we recommend upgrading to [v1.0.1](https://github.com/GreptimeTeam/greptimedb/releases/tag/v1.0.1).

### 🚀 Features

* feat(mito2): allow CompactionOutput to succeed independently by [@v0y4g3r](https://github.com/v0y4g3r) in [#7948](https://github.com/GreptimeTeam/greptimedb/pull/7948)
* feat: propagate staging leader through lease and heartbeat by [@WenyXu](https://github.com/WenyXu) in [#7950](https://github.com/GreptimeTeam/greptimedb/pull/7950)
* feat: cancel local compaction for enter staging by [@WenyXu](https://github.com/WenyXu) in [#7885](https://github.com/GreptimeTeam/greptimedb/pull/7885)
* feat: use PreFilterMode::All if only one source in the partition range by [@evenyag](https://github.com/evenyag) in [#7973](https://github.com/GreptimeTeam/greptimedb/pull/7973)
* feat: add an index page by [@sunng87](https://github.com/sunng87) in [#7975](https://github.com/GreptimeTeam/greptimedb/pull/7975)

### 🐛 Bug Fixes

* fix: remap peer addresses during retries by [@WenyXu](https://github.com/WenyXu) in [#7933](https://github.com/GreptimeTeam/greptimedb/pull/7933)
* fix: using uint64 datatype for postgres prepared statement parameters by [@sunng87](https://github.com/sunng87) in [#7942](https://github.com/GreptimeTeam/greptimedb/pull/7942)
* fix: fix current version comparison logic for pre-releases by [@daviderli614](https://github.com/daviderli614) in [#7946](https://github.com/GreptimeTeam/greptimedb/pull/7946)
* fix(index): intersect bitmaps before early exit in predicates applier by [@cuiweixie](https://github.com/cuiweixie) in [#7867](https://github.com/GreptimeTeam/greptimedb/pull/7867)
* fix: randomize standalone test ports in cli export test by [@v0y4g3r](https://github.com/v0y4g3r) in [#7955](https://github.com/GreptimeTeam/greptimedb/pull/7955)
* fix: match term zh by [@discord9](https://github.com/discord9) in [#7952](https://github.com/GreptimeTeam/greptimedb/pull/7952)
* fix: cargo check -p common-meta by [@fengys1996](https://github.com/fengys1996) in [#7964](https://github.com/GreptimeTeam/greptimedb/pull/7964)
* fix: always skip field pruning when using merge mode by [@evenyag](https://github.com/evenyag) in [#7957](https://github.com/GreptimeTeam/greptimedb/pull/7957)
* fix: mysql prepare correctly returns error instead of panic by [@MichaelScofield](https://github.com/MichaelScofield) in [#7963](https://github.com/GreptimeTeam/greptimedb/pull/7963)
* fix: relax azblob validation requirements by [@WenyXu](https://github.com/WenyXu) in [#7970](https://github.com/GreptimeTeam/greptimedb/pull/7970)
* fix(meta): renew operating region leases from keeper roles by [@WenyXu](https://github.com/WenyXu) in [#7971](https://github.com/GreptimeTeam/greptimedb/pull/7971)
* fix: remove redundant error messages in admin functions by [@yxrxy](https://github.com/yxrxy) in [#7953](https://github.com/GreptimeTeam/greptimedb/pull/7953)
* fix: allow ipv4_num_to_string to accept valid integers by [@JoeS51](https://github.com/JoeS51) in [#7994](https://github.com/GreptimeTeam/greptimedb/pull/7994)
* fix: update manifest state before deleting delta files by [@evenyag](https://github.com/evenyag) in [#8001](https://github.com/GreptimeTeam/greptimedb/pull/8001)
* fix: upgrade mysql metadata value limit to mediumblob by [@WenyXu](https://github.com/WenyXu) in [#7985](https://github.com/GreptimeTeam/greptimedb/pull/7985)
* fix: zh same underscore behavior by [@discord9](https://github.com/discord9) in [#8002](https://github.com/GreptimeTeam/greptimedb/pull/8002)
* fix: manifest recovery scans after last version if possible by [@evenyag](https://github.com/evenyag) in [#8009](https://github.com/GreptimeTeam/greptimedb/pull/8009)

### 🚜 Refactor
* refactor: move group rollback ownership to parent repartition by [@WenyXu](https://github.com/WenyXu) in [#7967](https://github.com/GreptimeTeam/greptimedb/pull/7967)

### ⚡ Performance
* perf: better jieba cut by [@discord9](https://github.com/discord9) in [#7984](https://github.com/GreptimeTeam/greptimedb/pull/7984)

### ⚙️ Miscellaneous Tasks

* chore: fix git cliff errors in latest version by [@evenyag](https://github.com/evenyag) in [#7947](https://github.com/GreptimeTeam/greptimedb/pull/7947)
* ci: set upload timeout for uploading artifacts to S3 by [@daviderli614](https://github.com/daviderli614) in [#7958](https://github.com/GreptimeTeam/greptimedb/pull/7958)
* chore: add a standalone flag in plugins during startup by [@shuiyisong](https://github.com/shuiyisong) in [#7974](https://github.com/GreptimeTeam/greptimedb/pull/7974)

## New Contributors

* [@JoeS51](https://github.com/JoeS51) made their first contribution in [#7994](https://github.com/GreptimeTeam/greptimedb/pull/7994)
* [@yxrxy](https://github.com/yxrxy) made their first contribution in [#7953](https://github.com/GreptimeTeam/greptimedb/pull/7953)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@JoeS51](https://github.com/JoeS51), [@MichaelScofield](https://github.com/MichaelScofield), [@QuakeWang](https://github.com/QuakeWang), [@WenyXu](https://github.com/WenyXu), [@ZonaHex](https://github.com/ZonaHex), [@cuiweixie](https://github.com/cuiweixie), [@daviderli614](https://github.com/daviderli614), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengjiachun](https://github.com/fengjiachun), [@fengys1996](https://github.com/fengys1996), [@killme2008](https://github.com/killme2008), [@lyang24](https://github.com/lyang24), [@shuiyisong](https://github.com/shuiyisong), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@yxrxy](https://github.com/yxrxy)