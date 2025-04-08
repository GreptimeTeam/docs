---
keywords: [release, GreptimeDB, changelog, v0.13.2]
description: GreptimeDB v0.13.2 Changelog
date: 2025-04-08
---

# v0.13.2

Release date: April 08, 2025

### 🚀 Features

* feat: introduce poison mechanism for procedure  by [@WenyXu](https://github.com/WenyXu) in [#5822](https://github.com/GreptimeTeam/greptimedb/pull/5822)


### 🐛 Bug Fixes

* fix: mysql prepare bool value by [@discord9](https://github.com/discord9) in [#5732](https://github.com/GreptimeTeam/greptimedb/pull/5732)
* fix: mysql prepare limit&offset param by [@discord9](https://github.com/discord9) in [#5734](https://github.com/GreptimeTeam/greptimedb/pull/5734)
* fix: wrap table name with `` by [@CookiePieWw](https://github.com/CookiePieWw) in [#5748](https://github.com/GreptimeTeam/greptimedb/pull/5748)
* fix: handle nullable default value by [@discord9](https://github.com/discord9) in [#5747](https://github.com/GreptimeTeam/greptimedb/pull/5747)
* fix: properly give placeholder types by [@discord9](https://github.com/discord9) in [#5760](https://github.com/GreptimeTeam/greptimedb/pull/5760)
* fix: support __name__ matcher in label values by [@evenyag](https://github.com/evenyag) in [#5773](https://github.com/GreptimeTeam/greptimedb/pull/5773)
* fix: typo variadic by [@waynexia](https://github.com/waynexia) in [#5800](https://github.com/GreptimeTeam/greptimedb/pull/5800)
* fix: close issue #3902 since upstream fixed by [@yihong0618](https://github.com/yihong0618) in [#5801](https://github.com/GreptimeTeam/greptimedb/pull/5801)
* fix: correct error status code by [@WenyXu](https://github.com/WenyXu) in [#5802](https://github.com/GreptimeTeam/greptimedb/pull/5802)
* fix: interval cast expression can't work in range query, #5805 by [@killme2008](https://github.com/killme2008) in [#5813](https://github.com/GreptimeTeam/greptimedb/pull/5813)
* fix: skip replacing exprs of the DistinctOn node by [@evenyag](https://github.com/evenyag) in [#5823](https://github.com/GreptimeTeam/greptimedb/pull/5823)
* fix: throw errors instead of ignoring by [@WenyXu](https://github.com/WenyXu) in [#5792](https://github.com/GreptimeTeam/greptimedb/pull/5792)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@CookiePieWw](https://github.com/CookiePieWw), [@MichaelScofield](https://github.com/MichaelScofield), [@Pikady](https://github.com/Pikady), [@SNC123](https://github.com/SNC123), [@Wenbin1002](https://github.com/Wenbin1002), [@WenyXu](https://github.com/WenyXu), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengys1996](https://github.com/fengys1996), [@killme2008](https://github.com/killme2008), [@paomian](https://github.com/paomian), [@shuiyisong](https://github.com/shuiyisong), [@soisyourface](https://github.com/soisyourface), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@yihong0618](https://github.com/yihong0618), [@zhongzc](https://github.com/zhongzc), [@zyy17](https://github.com/zyy17)