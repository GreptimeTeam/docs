---
keywords: [query guard, ban drop table, ban drop database, ban truncate table, data protection, security, configuration]
description: Guide to configuring the Query Guard plugin in GreptimeDB Enterprise to ban DROP TABLE, DROP DATABASE, and TRUNCATE TABLE operations for all users and disallow cross-catalog queries.
---

# Query Guard

Query Guard is a GreptimeDB Enterprise plugin that intercepts queries at the frontend
protocol layer and rejects potentially dangerous statements before they are executed.
It provides the following protections:

- **Ban `DROP TABLE`**: reject all `DROP TABLE` statements.
- **Ban `DROP DATABASE`**: reject all `DROP DATABASE` statements.
- **Ban `TRUNCATE TABLE`**: reject all `TRUNCATE TABLE` statements.
- **Reject `COPY` statements**: reject all `COPY` statements.
- **Disallow cross-catalog access**: reject queries that reference tables across
  different catalogs, cross-catalog gRPC DDL requests, and Flight bulk inserts
  targeting a different catalog.

## Overview

The configured operation bans are enforced in the query interceptors, which run
**before any permission check**. This means the bans apply to **every user,
including administrators**. No one can run a banned operation through a configured
frontend until the configuration is changed and the frontend is restarted.

The bans cover both the SQL protocols (MySQL, PostgreSQL, and HTTP) and the gRPC
protocol:

- SQL path: configured `DROP TABLE`, `DROP DATABASE`, and `TRUNCATE TABLE`
  statements are rejected with a `NotSupported` error.
- gRPC path: configured structured `DROP TABLE` and `TRUNCATE TABLE` DDL requests
  are rejected. The structured gRPC DDL request has no drop-database variant;
  however, SQL statements sent over gRPC go through the same SQL interceptors, so
  the `DROP DATABASE` ban applies to SQL over gRPC as well.

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
# Operations to ban for all users. The list is empty by default.
banned_ops = ["drop_table", "drop_database", "truncate_table"]
```

The supported operation names are `drop_table`, `drop_database`, and
`truncate_table`. To ban only a subset of these operations, include only their
names in `banned_ops`.

The former `ban_drop_table`, `ban_drop_database`, and `ban_truncate_table` options
are no longer supported. Using any of them causes configuration parsing to fail.

The plugin works in both standalone mode and distributed mode. In distributed mode,
it takes effect on the frontend where it is configured.

## Caveats

- **Every frontend must carry the configuration.** In a deployment with multiple
  frontends, you must add the plugin configuration to every frontend's config file;
  frontends without the configuration will still execute operations listed in
  `banned_ops`.
- **Operation bans must be configured separately.** Turning on `query_guard`
  automatically rejects `COPY` statements, cross-catalog queries, cross-catalog
  gRPC DDL requests, and Flight bulk inserts targeting a different catalog. To ban
  the supported operations, add them to `banned_ops`, which is empty by default.
- The bans are enforced at the protocol layer. Changing the configuration requires
  a restart of the frontend to take effect.
