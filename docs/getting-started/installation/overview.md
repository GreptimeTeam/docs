# Overview

## Installation

Follow these instructions to install GreptimeDB:

- [GreptimeDB Standalone](greptimedb-standalone.md) runs as a standalone system in a single process.
- [GreptimeDB Cluster](greptimedb-cluster.md) runs as a distributed, clustered time series database.

## Check database status

After starting GreptimeDB, you can check its status to ensure it is running.

```shell
curl http://localhost:4000/status
```

If the GreptimeDB instance is running healthily, you will see a response like the following:

```json
{
  "source_time": "2024-09-06T04:13:23Z",
  "commit": "506dc20765f892b3d7ad77af841f6bbf7c1a3892",
  "branch": "",
  "rustc_version": "rustc 1.80.0-nightly (72fdf913c 2024-06-05)",
  "hostname": "7189d0233448",
  "version": "0.9.3"
}
```

## Next steps

- [Quick Start](./quick-start.md): Ingest and query data in GreptimeDB using MySQL or PostgreSQL clients.
