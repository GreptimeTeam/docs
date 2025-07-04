---
keywords: [telemetry data, data collection, privacy, configuration, disable telemetry, enable telemetry]
description: Details on telemetry data collection in GreptimeDB, including what data is collected, how often, and how to enable or disable telemetry.
---

# Telemetry

To enhance our service, GreptimeDB collects certain telemetry data. This includes information like the GreptimeDB version, the number of nodes, the operating system used, the environment's architecture, and similar technical details. However, we respect your privacy and make sure not to collect any user-specific data, which entails database names, table names, query content, and the like.

This telemetry collection can easily be managed according to your preferences. You may choose to enable or disable it through the configurations. Your experience and privacy are our top priority.

## What data will be collected?

The usage details that get shared might change over time. These changes (if any) will be announced in release notes.

When telemetry is enabled, GreptimeDB will collect the following information every 0.5 hours:

- GreptimeDB version
- GreptimeDB build git hash
- The operating system of the machine on which GreptimeDB is running(Linux, macOS, etc.)
- Architecture of the machine on which GreptimeDB is running(x86_64, arm64, etc.)
- Mode in which GreptimeDB is running(standalone, distributed)
- A randomly generated installation ID
- The number of datanodes in the GreptimeDB cluster

## How to disable telemetry?

Telemetry will be enabled by default starting from v0.4.0. You can disable it by configuring the settings.

### Standalone mode

Set `enable_telemetry` in the standalone config file to `false`:

```toml
# Whether to enable greptimedb telemetry, true by default.
enable_telemetry = false
```

Or configure it by the environment variable `GREPTIMEDB_STANDALONE__ENABLE_TELEMETRY=false` on startup.

### Distributed mode

Set `enable_telemetry`  in the metasrv config file to `false`:

```toml
# metasrv config file
# Whether to enable greptimedb telemetry, true by default.
enable_telemetry = false 
```

Or set the environment variable `GREPTIMEDB_METASRV__ENABLE_TELEMETRY=false` on startup.
