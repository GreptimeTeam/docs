---
keywords: [admin api, health check, leader query, heartbeat, maintenance mode, RESTful API]
description: Maintainer reference for Metasrv's unauthenticated Admin API router and state-changing endpoints.
---

# Admin API

The Axum router is assembled in `src/meta-srv/src/service/admin.rs` and mounted under `/admin` on Metasrv's HTTP server. The default HTTP port is `4000`.

The router does not add authentication. Some endpoints change cluster behavior, so deployments must protect this port with network-level controls. When adding a route, define its HTTP method explicitly, keep read and mutation handlers separate, and add handler-level tests in `src/meta-srv/src/service/admin/`.

## /health HTTP endpoint

`GET /admin/health` returns `OK` when the HTTP service is running. It does not prove that this node is the current leader or that external dependencies are reachable. The handler is in `health.rs`.

## /leader HTTP endpoint

`GET /admin/leader` reads the elected Metasrv leader address through the configured election backend. The handler is in `leader.rs`.

## /heartbeat HTTP endpoint

`GET /admin/heartbeat` returns Datanode heartbeat records. The optional `addr` query parameter filters by Datanode address, and `GET /admin/heartbeat/help` shows the supported query forms. The handler is in `heartbeat.rs` and reads through `MetaPeerClient`.

## /maintenance HTTP endpoint

Maintenance mode disables selected automatic cluster-management work. Its user-facing behavior is documented under [Cluster Maintenance Mode](/user-guide/deployments-administration/maintenance/maintenance-mode.md). The router exposes:

- `GET /admin/maintenance` or `GET /admin/maintenance/status`: query the maintenance mode status.
- `POST /admin/maintenance/enable`: enable maintenance mode.
- `POST /admin/maintenance/disable`: disable maintenance mode.

The implementation is in `maintenance.rs` and updates `RuntimeSwitchManager`.

## /procedure-manager HTTP endpoint

These routes pause or resume Procedure Manager scheduling. See [Prevent Metadata Changes](/user-guide/deployments-administration/maintenance/prevent-metadata-changes.md) for user-facing behavior. The router exposes:

- `GET /admin/procedure-manager/status`: query the Procedure Manager status.
- `POST /admin/procedure-manager/pause`: pause the Procedure Manager.
- `POST /admin/procedure-manager/resume`: resume the Procedure Manager.

The implementation is in `procedure.rs` and also updates `RuntimeSwitchManager`.

## Other internal endpoints

The router also exposes these maintainer-facing endpoints:

- `GET /admin/node-lease` returns the active Datanode lease records.
- `GET /admin/recovery/status` and `POST /admin/recovery/{enable,disable}` read or change recovery mode.
- `GET /admin/sequence/table/next-id` reads the next table ID without allocating it.
- `POST /admin/sequence/table/set-next-id` changes the allocator's next table ID. The handler rejects this operation unless recovery mode is enabled.

The recovery and sequence routes can change cluster state and are intended for controlled repair procedures. Read their handlers and tests before changing or invoking them; this page does not define a general recovery workflow.
