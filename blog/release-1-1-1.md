---
keywords: [release, GreptimeDB, changelog, v1.1.1]
description: GreptimeDB v1.1.1 Changelog
date: 2026-06-18
---

# v1.1.1

Release date: June 18, 2026

This release fixes a critical JSON compatibility bug that affects users upgrading from v1.0.x to v1.1.0, where legacy JSONB columns could return incorrect query results or fail during flush. It also removes a lock in the create flow procedure that could self-block sink table creation.

We strongly recommend users on v1.1.0 who use the JSON data type upgrade to v1.1.1.

### 🐛 Bug Fixes

* fix: guard structured JSON alignment paths against legacy JSONB columns by [@evenyag](https://github.com/evenyag) in [#8323](https://github.com/GreptimeTeam/greptimedb/pull/8323)
* fix: remove flow sink table lock by [@discord9](https://github.com/discord9) in [#8317](https://github.com/GreptimeTeam/greptimedb/pull/8317)

## All Contributors

We would like to thank the following contributors from the GreptimeDB community:

[@discord9](https://github.com/discord9), [@evenyag](https://github.com/evenyag)
