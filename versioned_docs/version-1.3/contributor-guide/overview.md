---
keywords: [architecture, key components, user requests, data processing, database components]
description: Overview of GreptimeDB's architecture, key components, and how they interact to process user requests.
---

# Contributor Guide

This guide explains the internal design of GreptimeDB for contributors. Start with [Getting Started](/contributor-guide/getting-started.md) to build and run it from source. Submission requirements, including the CLA, license headers, formatting, and the checks a pull request must pass, are maintained in the source repository's [CONTRIBUTING.md](https://github.com/GreptimeTeam/greptimedb/blob/main/CONTRIBUTING.md).

## Architecture

For the architecture and components of GreptimeDB, please see the [Architecture](/user-guide/concepts/architecture.md) document in the user guide.

For more details on each component, see the following guides:

- [frontend][1]
- [datanode][2]
- [metasrv][3]
- [flownode][4]

[1]: /contributor-guide/frontend/overview.md
[2]: /contributor-guide/datanode/overview.md
[3]: /contributor-guide/metasrv/overview.md
[4]: /contributor-guide/flownode/overview.md

## Additional reference

[DeepWiki](https://deepwiki.com/GreptimeTeam/greptimedb) provides an automatically generated walkthrough of the GreptimeDB repository. It can help when exploring an unfamiliar area, but it is a secondary reference: verify version-sensitive behavior against the source code.
