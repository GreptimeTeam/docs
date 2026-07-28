---
keywords: [query guard, ban drop table, ban drop database, data protection, security, configuration]
description: Guide to configuring the Query Guard plugin in GreptimeDB Enterprise to ban DROP TABLE / DROP DATABASE statements for all users and disallow cross-catalog queries.
---

# Query Guard

Query Guard is a GreptimeDB Enterprise plugin that intercepts queries at the frontend
protocol layer and rejects potentially dangerous statements before they are executed.
It provides the following protections:

- **Ban `DROP TABLE`**: reject all `DROP TABLE` statements.
- **Ban `DROP DATABASE`**: reject all `DROP DATABASE` statements.
- **Reject `COPY` statements**: reject all `COPY` statements.
- **Disallow cross-catalog access**: reject queries that reference tables across
  different catalogs, cross-catalog gRPC DDL requests, and Flight bulk inserts
  targeting a different catalog.

## Overview

The `DROP TABLE` and `DROP DATABASE` bans are enforced in the query interceptors,
which run **before any permission check**. This means once enabled, the bans apply
to **every user, including administrators**. No one can drop tables or databases
through the client protocols until the configuration is changed and the frontend
is restarted.

The bans cover both the SQL protocols (MySQL, PostgreSQL, and HTTP) and the gRPC
protocol:

- SQL path: `DROP TABLE` and `DROP DATABASE` statements are rejected with a
  `NotSupported` error.
- gRPC path: `DROP TABLE` DDL requests are rejected. Note that `DROP DATABASE` is
  SQL-only; the gRPC protocol has no drop-database request.

Internal operations such as TTL-based data expiration and automatic cleanup bypass
the frontend protocol-layer interceptors and are **not** affected by these bans.

## Configuration

Query Guard is provided as a plugin in GreptimeDB. To enable and configure it, add
the following TOML to your GreptimeDB config file:

```toml
[[plugins]]
# Add the query guard plugin to your GreptimeDB.
[plugins.query_guard]
# Whether to enable the query guard plugin, defaults to false.
enable = true
# Whether to ban DROP TABLE statements for all users, defaults to false.
ban_drop_table = true
# Whether to ban DROP DATABASE statements for all users, defaults to false.
ban_drop_database = true
```

The plugin works in both standalone mode and distributed mode. In distributed mode,
it takes effect on the frontend where it is configured.

## Caveats

- **Every frontend must carry the configuration.** In a deployment with multiple
  frontends, you must add the plugin configuration to every frontend's config file;
  frontends without the configuration will still execute `DROP` statements.
- **Enabling the plugin activates all protections except the `DROP` bans.**
  Turning on `query_guard` automatically rejects `COPY` statements, cross-catalog
  queries, cross-catalog gRPC DDL requests, and Flight bulk inserts targeting a
  different catalog, even if you only want the `DROP` bans. The `DROP` bans are
  controlled separately by `ban_drop_table` and `ban_drop_database`.
- The bans are enforced at the protocol layer. Changing the configuration requires
  a restart of the frontend to take effect.
