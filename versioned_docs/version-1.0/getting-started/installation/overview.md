---
keywords: [installation, health check, quick start, GreptimeDB standalone, GreptimeDB cluster]
description: Instructions to install GreptimeDB, check its health status, and proceed to the quick start guide.
---


# Installation

Follow these instructions to install GreptimeDB:

- [GreptimeDB Standalone](greptimedb-standalone.md) runs as a standalone system in a single process.
- [GreptimeDB Cluster](greptimedb-cluster.md) runs as a distributed, clustered time series database.

## Check database health

After starting GreptimeDB, you can check its status to ensure it is running.

```shell
curl http://localhost:4000/health
```

If the GreptimeDB instance is running healthily, you will see the following response:

```json
{}
```

## Next steps

- [Quick Start](/getting-started/quick-start.md): Ingest and query data in GreptimeDB using MySQL or PostgreSQL clients.
