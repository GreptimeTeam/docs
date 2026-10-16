---
keywords: [release, GreptimeDB, changelog, v1.3.0]
description: GreptimeDB v1.3.0 Changelog
draft: true
---

# v1.3.0

<!-- Draft: complete the release date, highlights, changelog, and contributors before publication. -->

### Security

VRL pipeline functions that access the server environment or network are disabled by default ([#9619](https://github.com/GreptimeTeam/greptimedb/pull/9619)).

We thank [@Mikelteller4](https://github.com/Mikelteller4) for privately reporting this vulnerability.

### Breaking changes

- **VRL pipelines:** Existing pipelines that use functions to access the server environment or network no longer work with the default settings ([#9619](https://github.com/GreptimeTeam/greptimedb/pull/9619)).
