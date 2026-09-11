---
keywords: [metadata storage, Metasrv, etcd, MySQL, PostgreSQL, RDS, cluster]
description: The metadata backends a GreptimeDB cluster can use — etcd, MySQL, and PostgreSQL — and which to choose for development and for production.
---

# Metadata Storage

A GreptimeDB cluster stores its metadata in an external system, which the Metasrv component reads and writes. The supported backends are:

- **[etcd](https://etcd.io/)** — a distributed key-value store with a small operational footprint.
- **[MySQL](https://www.mysql.com/) and [PostgreSQL](https://www.postgresql.org/)** — relational databases with ACID transactions, replication, and established backup tooling. Both are available as managed services (RDS) on the major cloud platforms.

## Which to choose

For development and testing, etcd is the lightest option to run.

For production, use a cloud provider's managed relational database. A managed service covers high availability, automated backups, and maintenance, which is where most of the operational cost of self-hosting a metadata store goes.

Whichever backend you run, it sits outside GreptimeDB's own data path: it needs its own backup schedule and its own health monitoring.

## Next steps

- [Configuration](/user-guide/deployments-administration/manage-metadata/configuration.md) — pointing Metasrv at a backend.
- [Manage etcd](/user-guide/deployments-administration/manage-metadata/manage-etcd.md) — running etcd for development and testing.
