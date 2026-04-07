---
keywords: [GreptimeDB, metadata storage, configuration, etcd, MySQL, PostgreSQL, metasrv, backend setup]
description: Comprehensive guide for configuring metadata storage backends (etcd, MySQL, PostgreSQL) in GreptimeDB's metasrv component, including setup instructions and best practices.
---

# Metadata Storage Configuration

This section describes how to configure different metadata storage backends for the GreptimeDB Metasrv component. The metadata storage is used to store critical system information including catalogs, schemas, tables, regions, and other metadata that are essential for the operation of GreptimeDB.

## Available Storage Backends

GreptimeDB supports the following metadata storage backends:

- **etcd**: The default and recommended backend for development and testing environments, offering simplicity and ease of setup
- **MySQL/PostgreSQL**: Production-ready backend options that integrate well with existing database infrastructure and cloud RDS services

This documentation describes the TOML configuration for each backend. You can use these configurations when deploying GreptimeDB without Helm Chart.
If you are using Helm Chart to deploy GreptimeDB, please refer to [Common Helm Chart Configurations](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md#configuring-metasrv-backend-storage) for more details.

## Use etcd as metadata storage

While etcd is suitable for development and testing environments, it may not be ideal for production deployments requiring high availability and scalability.

Configure the metasrv component to use etcd as metadata storage:

```toml
# The metadata storage backend for metasrv
backend = "etcd_store"

# Store server addresses
# You can specify multiple etcd endpoints for high availability
store_addrs = ["127.0.0.1:2379"]

# Backend client options for etcd
[backend_client]
# The keep alive timeout for backend client
keep_alive_timeout = "3s"

# The keep alive interval for backend client
keep_alive_interval = "10s"

# The connect timeout for backend client
connect_timeout = "3s"

[backend_tls]
# - "disable" - No TLS
# - "require" - Require TLS
mode = "prefer"

# Path to client certificate file (for client authentication)
# Like "/path/to/client.crt"
cert_path = ""

# Path to client private key file (for client authentication)
# Like "/path/to/client.key"
key_path = ""

# Path to CA certificate file (for server certificate verification)
# Required when using custom CAs or self-signed certificates
# Leave empty to use system root certificates only
# Like "/path/to/ca.crt"
ca_cert_path = ""
```

### Best Practices

While etcd can be used as metadata storage, we recommend against using it in production environments unless you have extensive experience with etcd operations and maintenance. For detailed guidance on etcd management, including installation, backup, and maintenance procedures, please refer to [Manage etcd](/user-guide/deployments-administration/manage-metadata/manage-etcd.md).

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

[backend_tls]
# - "disable" - No TLS
# - "prefer" (default) - Try TLS, fallback to plain
# - "require" - Require TLS
# - "verify_ca" - Require TLS and verify CA
# - "verify_full" - Require TLS and verify hostname
mode = "prefer"

# Path to client certificate file (for client authentication)
# Like "/path/to/client.crt"
cert_path = ""

# Path to client private key file (for client authentication)
# Like "/path/to/client.key"
key_path = ""

# Path to CA certificate file (for server certificate verification)
# Required when using custom CAs or self-signed certificates
# Leave empty to use system root certificates only
# Like "/path/to/ca.crt"
ca_cert_path = ""
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

# Optional: The schema for metadata table and election table name.
# In PostgreSQL 15 and later, the default public schema is restricted by default,
# and non-superusers are no longer allowed to create tables in the public schema.
# When encountering permission restrictions, use this parameter to specify a writable schema.
meta_schema_name = "greptime_schema"

# Optional: Automatically create PostgreSQL schema if it doesn't exist.
# When enabled, the system will execute `CREATE SCHEMA IF NOT EXISTS <schema_name>`
# before creating metadata tables. This is useful in production environments where
# manual schema creation may be restricted.
# Default: true
# Note: The PostgreSQL user must have CREATE SCHEMA permission for this to work.
auto_create_schema = true

# Optional: Advisory lock ID for election
# Default: 1
meta_election_lock_id = 1

[backend_tls]
# - "disable" - No TLS
# - "prefer" (default) - Try TLS, fallback to plain
# - "require" - Require TLS
# - "verify_ca" - Require TLS and verify CA
# - "verify_full" - Require TLS and verify hostname
mode = "prefer"

# Path to client certificate file (for client authentication)
# Like "/path/to/client.crt"
cert_path = ""

# Path to client private key file (for client authentication)
# Like "/path/to/client.key"
key_path = ""

# Path to CA certificate file (for server certificate verification)
# Required when using custom CAs or self-signed certificates
# Leave empty to use system root certificates only
# Like "/path/to/ca.crt"
ca_cert_path = ""
```
When sharing a PostgreSQL instance between multiple GreptimeDB clusters or with other applications, you must configure two unique identifiers to prevent conflicts:

1. Set a unique `meta_table_name` for each GreptimeDB cluster to avoid metadata conflicts
2. Assign a unique `meta_election_lock_id` to each GreptimeDB cluster to prevent advisory lock conflicts with other applications using the same PostgreSQL instance