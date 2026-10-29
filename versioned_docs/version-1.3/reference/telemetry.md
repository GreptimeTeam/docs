---
keywords: [telemetry data, data collection, privacy, configuration, disable telemetry, enable telemetry]
description: Details on telemetry data collection in GreptimeDB, including what data is collected, how often, and how to enable or disable telemetry.
---

# Telemetry

GreptimeDB enables anonymous telemetry by default. The telemetry payload contains the installation and runtime fields listed below. It does not contain database names, table names, or query text.

You can disable telemetry in the GreptimeDB configuration.

## What data will be collected?

The fields in the telemetry payload may change in a future release. Such changes are documented in the release notes.

When telemetry is enabled, GreptimeDB sends a report when the telemetry task starts and every 30 minutes afterward. Each report contains:

- GreptimeDB version
- GreptimeDB build git hash
- The operating system of the machine on which GreptimeDB is running(Linux, macOS, etc.)
- Architecture of the machine on which GreptimeDB is running(x86_64, arm64, etc.)
- Mode in which GreptimeDB is running(standalone, distributed)
- A randomly generated installation ID
- The number of datanodes in the GreptimeDB cluster
- System uptime, not exact figures, only time ranges like `hours`, `weeks` with no numbers

 Sample telemetry data:
```json
{
  "os": "linux",
  "version": "0.15.1",
  "arch": "aarch64",
  "mode": "standalone",
  "git_commit": "00d759e828f5e148ec18141904e20cb1cb7577b0",
  "nodes": 1,
  "uuid": "43717682-baa8-41e0-b126-67b797b66606",
  "uptime": "hours"
}
```

## How to disable telemetry?

Telemetry has been enabled by default since GreptimeDB v0.4.0.

### Standalone mode

Set `enable_telemetry` in the standalone config file to `false`:

```toml
# Whether to enable greptimedb telemetry, true by default.
enable_telemetry = false
```

Or configure it by the environment variable `GREPTIMEDB_STANDALONE__ENABLE_TELEMETRY=false` on startup.

### Distributed mode

Set `enable_telemetry` in the metasrv config file to `false`:

```toml
# metasrv config file
# Whether to enable greptimedb telemetry, true by default.
enable_telemetry = false
```

Or set the environment variable `GREPTIMEDB_METASRV__ENABLE_TELEMETRY=false` on startup.
