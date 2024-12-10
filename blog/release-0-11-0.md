---
date: 2024-12-10
---

# v0.11.0

Release date: December 10, 2024

## 👍 Highlights

* Dashboard supports using a log view to explore logs.
* Fixes performance regressions in v0.10.
* Supports tables with `TTL=instant` as source tables for flow tasks.
* Supports `postgres_fdw` to integrate GreptimeDB with existing PostgreSQL databases.


## Breaking changes

* feat!: remove GET method in `/debug` path by [@waynexia](https://github.com/waynexia) in [#5102](https://github.com/GreptimeTeam/greptimedb/pull/5102)
* fix!: fix regression caused by unbalanced partitions and splitting ranges by [@evenyag](https://github.com/evenyag) in [#5090](https://github.com/GreptimeTeam/greptimedb/pull/5090)
* feat!: enable read cache and write cache when using remote object stores by [@killme2008](https://github.com/killme2008) in [#5093](https://github.com/GreptimeTeam/greptimedb/pull/5093)

### 🚀 Features

* feat: use cache kv manager for SchemaMetadataManager by [@v0y4g3r](https://github.com/v0y4g3r) in [#5053](https://github.com/GreptimeTeam/greptimedb/pull/5053)
* feat: add decolorize processor by [@waynexia](https://github.com/waynexia) in [#5065](https://github.com/GreptimeTeam/greptimedb/pull/5065)
* feat: enable compression for metasrv client by [@WenyXu](https://github.com/WenyXu) in [#5078](https://github.com/GreptimeTeam/greptimedb/pull/5078)
* feat: recover file cache index asynchronously by [@WenyXu](https://github.com/WenyXu) in [#5087](https://github.com/GreptimeTeam/greptimedb/pull/5087)
* feat: define basic structures and implement TimeFilter by [@waynexia](https://github.com/waynexia) in [#5086](https://github.com/GreptimeTeam/greptimedb/pull/5086)
* feat: update dashboard to v0.7.0 by [@ZonaHex](https://github.com/ZonaHex) in [#5100](https://github.com/GreptimeTeam/greptimedb/pull/5100)
* feat: add more transaction related statement for postgres interface by [@sunng87](https://github.com/sunng87) in [#5081](https://github.com/GreptimeTeam/greptimedb/pull/5081)
* feat: ttl=0/instant/forever/humantime&ttl refactor by [@discord9](https://github.com/discord9) in [#5089](https://github.com/GreptimeTeam/greptimedb/pull/5089)
* feat: add cursor statements by [@sunng87](https://github.com/sunng87) in [#5094](https://github.com/GreptimeTeam/greptimedb/pull/5094)
* feat: update pgwire to 0.28 by [@sunng87](https://github.com/sunng87) in [#5113](https://github.com/GreptimeTeam/greptimedb/pull/5113)
* feat: update dashboard to v0.7.1 by [@ZonaHex](https://github.com/ZonaHex) in [#5123](https://github.com/GreptimeTeam/greptimedb/pull/5123)

### 🐛 Bug Fixes

* fix(metric-engine): set ttl also on opening metadata regions by [@v0y4g3r](https://github.com/v0y4g3r) in [#5051](https://github.com/GreptimeTeam/greptimedb/pull/5051)
* fix: pass series row selector to file range reader by [@evenyag](https://github.com/evenyag) in [#5054](https://github.com/GreptimeTeam/greptimedb/pull/5054)
* fix: allow physical region alter region options by [@lyang24](https://github.com/lyang24) in [#5046](https://github.com/GreptimeTeam/greptimedb/pull/5046)
* fix(flow): minor fix about count(*)&sink keyword by [@discord9](https://github.com/discord9) in [#5061](https://github.com/GreptimeTeam/greptimedb/pull/5061)
* fix: correct `is_exceeded_size_limit` behavior for in-memory store by [@WenyXu](https://github.com/WenyXu) in [#5082](https://github.com/GreptimeTeam/greptimedb/pull/5082)
* fix: schema cache invalidation by [@v0y4g3r](https://github.com/v0y4g3r) in [#5067](https://github.com/GreptimeTeam/greptimedb/pull/5067)
* fix: put PipelineChecker at the end by [@waynexia](https://github.com/waynexia) in [#5092](https://github.com/GreptimeTeam/greptimedb/pull/5092)
* fix: show create table doesn't quote option keys which contains dot by [@killme2008](https://github.com/killme2008) in [#5108](https://github.com/GreptimeTeam/greptimedb/pull/5108)

### 🚜 Refactor

* refactor: expose configs for http clients used in object store by [@MichaelScofield](https://github.com/MichaelScofield) in [#5041](https://github.com/GreptimeTeam/greptimedb/pull/5041)
* refactor: remove built-in apidocs and schemars by [@sunng87](https://github.com/sunng87) in [#5068](https://github.com/GreptimeTeam/greptimedb/pull/5068)
* refactor: replace LogHandler with PipelineHandler by [@waynexia](https://github.com/waynexia) in [#5096](https://github.com/GreptimeTeam/greptimedb/pull/5096)
* refactor: relocate CLI to a dedicated directory by [@WenyXu](https://github.com/WenyXu) in [#5101](https://github.com/GreptimeTeam/greptimedb/pull/5101)
* refactor: extract implicit conversion helper functions of vector type by [@zhongzc](https://github.com/zhongzc) in [#5118](https://github.com/GreptimeTeam/greptimedb/pull/5118)

### 📚 Documentation

* docs: tweak readme and AUTHOR by [@killme2008](https://github.com/killme2008) in [#5069](https://github.com/GreptimeTeam/greptimedb/pull/5069)
* docs: remove lg_prof_interval from env by [@evenyag](https://github.com/evenyag) in [#5103](https://github.com/GreptimeTeam/greptimedb/pull/5103)

### ⚡ Performance

* perf: take a new batch to reduce last row cache usage by [@evenyag](https://github.com/evenyag) in [#5095](https://github.com/GreptimeTeam/greptimedb/pull/5095)

### 🧪 Testing

* test: adds sqlness test for TTL by [@killme2008](https://github.com/killme2008) in [#5063](https://github.com/GreptimeTeam/greptimedb/pull/5063)

### ⚙️ Miscellaneous Tasks

* chore: bump version of main branch to v0.11.0 by [@zhongzc](https://github.com/zhongzc) in [#5057](https://github.com/GreptimeTeam/greptimedb/pull/5057)
* chore: remove openssl deps by [@sunng87](https://github.com/sunng87) in [#5079](https://github.com/GreptimeTeam/greptimedb/pull/5079)
* chore: correct example config file by [@WenyXu](https://github.com/WenyXu) in [#5105](https://github.com/GreptimeTeam/greptimedb/pull/5105)
* chore: Add timeout setting for `find_ttl`. by [@linyihai](https://github.com/linyihai) in [#5088](https://github.com/GreptimeTeam/greptimedb/pull/5088)
* ci: set meta replicas to 1 by [@WenyXu](https://github.com/WenyXu) in [#5111](https://github.com/GreptimeTeam/greptimedb/pull/5111)
* chore:  Reduce FETCH_OPTION_TIMEOUT from 10 to 3 seconds in config.rs by [@v0y4g3r](https://github.com/v0y4g3r) in [#5117](https://github.com/GreptimeTeam/greptimedb/pull/5117)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@MichaelScofield](https://github.com/MichaelScofield), [@WenyXu](https://github.com/WenyXu), [@ZonaHex](https://github.com/ZonaHex), [@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag), [@killme2008](https://github.com/killme2008), [@linyihai](https://github.com/linyihai), [@lyang24](https://github.com/lyang24), [@sunng87](https://github.com/sunng87), [@v0y4g3r](https://github.com/v0y4g3r), [@waynexia](https://github.com/waynexia), [@zhongzc](https://github.com/zhongzc)
