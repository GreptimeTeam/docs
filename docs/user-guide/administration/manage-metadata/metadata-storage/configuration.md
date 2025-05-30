---
keywords: [GreptimeDB, metadata storage, configuration, etcd, MySQL, PostgreSQL, metasrv, backend setup]
description: Comprehensive guide for configuring metadata storage backends (etcd, MySQL, PostgreSQL) in GreptimeDB's metasrv component, including setup instructions and best practices.
---

# Configuration

This section describes how to configure different metadata storage backends for the GreptimeDB metasrv component. The metadata storage is used to store critical system information including catalogs, schemas, tables, regions, and other metadata that are essential for the operation of GreptimeDB.

## Available Storage Backends

GreptimeDB supports the following metadata storage backends:

- **etcd**: The default and recommended backend for development and testing environments
- **MySQL**: Alternative backend for users who prefer MySQL
- **PostgreSQL**: Alternative backend for users who prefer PostgreSQL

## Use etcd as metadata storage

:::warning
etcd is only recommended for development and testing environments.
:::

### Configuration file

Configure the metasrv component to use etcd as metadata storage:

```toml
# The metadata storage backend for metasrv
backend = "etcd_store"

# Store server addresses
# You can specify multiple etcd endpoints for high availability
store_addrs = ["127.0.0.1:2379"]
```

## Use MySQL as metadata storage

:::tip
For production environments, we strongly recommend using cloud providers' Relational Database Service (RDS) for metadata storage.
:::

MySQL can be used as a metadata storage backend. This is useful when you want to leverage existing MySQL infrastructure or have specific requirements for MySQL.


### Configuration file

Configure the metasrv component to use MySQL as metadata storage:

:::warning
If you want use same MySQL instance for metadata storage and application data, you need to configure the `meta_table_name` to avoid conflicts.
:::

```toml
# The metadata storage backend for metasrv
backend = "mysql_store"

# Store server address
# Format: mysql://user:password@ip:port/dbname
store_addrs = ["mysql://user:password@ip:port/dbname"]

# Optional: Custom table name for storing metadata
# Default: greptime_metakv
meta_table_name = "greptime_metakv"
```

## Use PostgreSQL as metadata storage

:::tip
For production environments, we strongly recommend using cloud providers' Relational Database Service (RDS) for metadata storage.
:::

PostgreSQL can be used as an alternative metadata storage backend. This is useful when you want to leverage existing PostgreSQL infrastructure or have specific requirements for PostgreSQL.

### Configuration file

Configure the metasrv component to use PostgreSQL as metadata storage:

:::warning
If you want use same PostgreSQL instance for metadata storage and application data, you need to configure the `meta_table_name` and `meta_election_lock_id` to avoid conflicts.
:::

```toml
# The metadata storage backend for metasrv
backend = "postgres_store"

# Store server address
# Format: password=password dbname=postgres user=postgres host=localhost port=5432
store_addrs = ["password=password dbname=postgres user=postgres host=localhost port=5432"]

# Optional: Custom table name for storing metadata
# Default: greptime_metakv
meta_table_name = "greptime_metakv"

# Optional: Advisory lock ID for election
# Default: 1
meta_election_lock_id = 1
```

## Best Practices

### General Guidelines

- Implement regular backup schedules for your metadata storage
- Set up comprehensive monitoring for storage health and performance metrics
- Establish clear disaster recovery procedures
- Document your metadata storage configuration and maintenance procedures

### Relational Database Service (RDS)

For production deployments, we strongly recommend using cloud providers' Relational Database Service (RDS) for metadata storage. The RDS service typically offers:

- Built-in high availability and automatic failover
- Automated backup and point-in-time recovery
- Managed maintenance and updates
- Professional monitoring and support
- Seamless integration with cloud services

### etcd

:::warning
We don't recommend using etcd as metadata storage for production environments if you don't have deep experience in operating etcd.
:::

When using etcd as metadata storage:

- Deploy multiple endpoints across different availability zones for high availability
- Configure appropriate auto-compaction settings to manage storage growth
- Implement regular maintenance procedures:
  - Run `Defrag` command periodically to reclaim disk space
  - Monitor etcd cluster health metrics
  - Review and adjust resource limits based on usage patterns
