---
keywords: [GreptimeDB, metadata storage, etcd, MySQL, PostgreSQL, configuration]
description: Overview of metadata storage options in GreptimeDB, including etcd, MySQL, and PostgreSQL, with recommendations for production deployments.
---

# Overview

GreptimeDB cluster requires a metadata storage to store metadata. GreptimeDB offers flexible metadata storage options with [etcd](https://etcd.io/), [MySQL](https://www.mysql.com/), and [PostgreSQL](https://www.postgresql.org/). Each option is designed for different deployment scenarios, balancing factors like scalability, reliability, and operational overhead.

- [etcd](https://etcd.io/): A lightweight distributed key-value store perfect for metadata management. Its simplicity and ease of setup make it an excellent choice for development and testing environments.

- [MySQL](https://www.mysql.com/) and [PostgreSQL](https://www.postgresql.org/): Enterprise-grade relational databases that deliver robust metadata storage capabilities. They provide essential features including ACID transactions, replication, and comprehensive backup solutions, making them ideal for production environments. Both are widely available as managed database services (RDS) across major cloud platforms.

## Recommendation

For test and development environments, [etcd](https://etcd.io/) provides a lightweight and straightforward metadata storage solution.

**For production deployments, we strongly recommend using cloud providers' Relational Database Service (RDS) for metadata storage.** This approach offers several advantages:

- Managed service with built-in high availability and disaster recovery
- Automated backups and maintenance
- Professional monitoring and support
- Reduced operational complexity compared to self-hosted solutions
- Seamless integration with other cloud services

## Best Practices

- Implement regular backup schedules for your metadata storage
- Set up comprehensive monitoring for storage health and performance metrics
- Establish clear disaster recovery procedures
- Document your metadata storage configuration and maintenance procedures



## Next steps 
- To configure the metadata storage backend, please refer to [Configuration](/user-guide/administration/manage-metadata/metadata-storage/configuration.md).
- To setup etcd for testing and development environments, please refer to [Manage etcd](/user-guide/administration/manage-metadata/metadata-storage/manage-etcd.md).