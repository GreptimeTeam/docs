---
keywords: [GreptimeDB, metadata storage, configuration, etcd, MySQL, PostgreSQL, metasrv, backend setup]
description: Comprehensive guide for configuring metadata storage backends (etcd, MySQL, PostgreSQL) in GreptimeDB's metasrv component, including setup instructions and best practices.
---

# Configuration

This section describes how to configure different metadata storage backends for the GreptimeDB Metasrv component. The metadata storage is used to store critical system information including catalogs, schemas, tables, regions, and other metadata that are essential for the operation of GreptimeDB.

## Available Storage Backends

GreptimeDB supports the following metadata storage backends:

- **etcd**: The default and recommended backend for development and testing environments, offering simplicity and ease of setup
- **MySQL/PostgreSQL**: Production-ready backend options that integrate well with existing database infrastructure and cloud RDS services

## Use etcd as metadata storage

While etcd is suitable for development and testing environments, it may not be ideal for production deployments requiring high availability and scalability.

Configure the metasrv component to use etcd as metadata storage:

```toml
# The metadata storage backend for metasrv
backend = "etcd_store"

# Store server addresses
# You can specify multiple etcd endpoints for high availability
store_addrs = ["127.0.0.1:2379"]
```

### Best Practices

While etcd can be used as metadata storage, we recommend against using it in production environments unless you have extensive experience with etcd operations and maintenance. For detailed guidance on etcd management, including installation, backup, and maintenance procedures, please refer to [Manage etcd](/user-guide/administration/manage-metadata/metadata-storage/manage-etcd.md).

When using etcd as metadata storage:

- Deploy multiple endpoints across different availability zones for high availability
- Configure appropriate auto-compaction settings to manage storage growth
- Implement regular maintenance procedures:
  - Run `Defrag` command periodically to reclaim disk space
  - Monitor etcd cluster health metrics
  - Review and adjust resource limits based on usage patterns


## Use MySQL as metadata storage

MySQL serves as a viable metadata storage backend option. This choice is particularly beneficial when you need to integrate with existing MySQL infrastructure or have specific MySQL-related requirements. For production deployments, we strongly recommend utilizing cloud providers' Relational Database Service (RDS) solutions for enhanced reliability and managed service benefits.

Configure the metasrv component to use MySQL as metadata storage:

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

When sharing a MySQL instance between multiple GreptimeDB clusters, you must set a unique `meta_table_name` for each GreptimeDB cluster to avoid metadata conflicts.

## Use PostgreSQL as metadata storage

PostgreSQL serves as a viable metadata storage backend option. This choice is particularly beneficial when you need to integrate with existing PostgreSQL infrastructure or have specific PostgreSQL-related requirements. For production deployments, we strongly recommend utilizing cloud providers' Relational Database Service (RDS) solutions for enhanced reliability and managed service benefits.

Configure the metasrv component to use PostgreSQL as metadata storage:

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
When sharing a PostgreSQL instance between multiple GreptimeDB clusters or with other applications, you must configure two unique identifiers to prevent conflicts:

1. Set a unique `meta_table_name` for each GreptimeDB cluster to avoid metadata conflicts
2. Assign a unique `meta_election_lock_id` to each GreptimeDB cluster to prevent advisory lock conflicts with other applications using the same PostgreSQL instance