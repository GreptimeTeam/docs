---
keywords: [release, GreptimeDB, changelog, v0.15.3]
description: GreptimeDB v0.15.3 Changelog
date: 2025-07-24
---

# v0.15.3

Release date: July 24, 2025

### 🚀 Features
* feat: add filter processor to v0.15 by [@shuiyisong](https://github.com/shuiyisong) in [#6516](https://github.com/GreptimeTeam/greptimedb/pull/6516)
* feat: update partial execution metrics by [@waynexia](https://github.com/waynexia) in [#6499](https://github.com/GreptimeTeam/greptimedb/pull/6499)
* feat: add metrics for request wait time and adjust stall metrics by [@evenyag](https://github.com/evenyag) in [#6540](https://github.com/GreptimeTeam/greptimedb/pull/6540)
* feat: impl timestamp function for promql by [@killme2008](https://github.com/killme2008) in [#6556](https://github.com/GreptimeTeam/greptimedb/pull/6556)
* feat: MergeScan print input by [@discord9](https://github.com/discord9) in [#6563](https://github.com/GreptimeTeam/greptimedb/pull/6563)

### 🐛 Bug Fixes
* fix(grpc): check grpc client unavailable by [@v0y4g3r](https://github.com/v0y4g3r) in [#6488](https://github.com/GreptimeTeam/greptimedb/pull/6488)
* fix: add system variable max_execution_time by [@codephage2020](https://github.com/codephage2020) in [#6511](https://github.com/GreptimeTeam/greptimedb/pull/6511)
* fix: breaking loop when not retryable by [@discord9](https://github.com/discord9) in [#6538](https://github.com/GreptimeTeam/greptimedb/pull/6538)
* fix: row selection intersection removes trailing rows by [@zhongzc](https://github.com/zhongzc) in [#6539](https://github.com/GreptimeTeam/greptimedb/pull/6539)
* fix: aggr group by all partition cols use partial commutative by [@discord9](https://github.com/discord9) in [#6534](https://github.com/GreptimeTeam/greptimedb/pull/6534)
* fix: estimate mem size for bulk ingester by [@fengys1996](https://github.com/fengys1996) in [#6550](https://github.com/GreptimeTeam/greptimedb/pull/6550)
* fix: flow mirror cache by [@discord9](https://github.com/discord9) in [#6551](https://github.com/GreptimeTeam/greptimedb/pull/6551)
* fix: closee issue #6555 return empty result by [@yihong0618](https://github.com/yihong0618) in [#6569](https://github.com/GreptimeTeam/greptimedb/pull/6569)

### 🚜 Refactor
* refactor(flow): faster time window expr by [@discord9](https://github.com/discord9) in [#6495](https://github.com/GreptimeTeam/greptimedb/pull/6495)

### 🧪 Testing
* test: add sqlness test for max execution time by [@codephage2020](https://github.com/codephage2020) in [#6517](https://github.com/GreptimeTeam/greptimedb/pull/6517)

### ⚙️ Miscellaneous Tasks
* chore: bump version to 0.15.3 by [@evenyag](https://github.com/evenyag) in [#6580](https://github.com/GreptimeTeam/greptimedb/pull/6580)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@codephage2020](https://github.com/codephage2020), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@fengys1996](https://github.com/fengys1996), [@killme2008](https://github.com/killme2008), [@shuiyisong](https://github.com/shuiyisong), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@yihong0618](https://github.com/yihong0618), [@zhongzc](https://github.com/zhongzc)
