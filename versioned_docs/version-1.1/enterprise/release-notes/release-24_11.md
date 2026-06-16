---
keywords: [release notes, region rebalancing, management console, LDAP, audit logs, new features]
description: Release notes for GreptimeDB Enterprise version 24.11, highlighting new features like region rebalancing, management console, LDAP user provider, and audit logs.
---

# Release 24.11

We are pleased to introduce the 24.11 release of GreptimeDB Enterprise.

## Feature Highlights

### Region Rebalance

To enhance the overall resilience of GreptimeDB, region rebalancing enables
flexible relocation of regions among data nodes, whether initiated manually or
dynamically.

This proactive approach facilitates several key benefits, including
redistributing workload across nodes and efficiently migrating regions to ensure
uninterrupted operation during planned maintenance activities.

### GreptimeDB Enterprise Management Console

Introducing the Console UI for Managing GreptimeDB Enterprise

This initial release provides a comprehensive set of features, including:

* In-depth slow query analysis and troubleshooting
* Detailed cluster topology information
* Real-time cluster metrics and log viewer

### LDAP User Provider

Bridging your own LDAP user database and authentication to GreptimeDB
Enterprise. We implemented flexible configuration options for LDAP connections,
supporting both simple and complex authentication mechanisms.

### Audit Logs

We provided logs to track queries in the database, with information of:

- Query type: read, write, DDL or others
- Command: select, insert, etc.
- Object type: target of the operation, for example, table, database, etc.

## Features From GreptimeDB OSS

This release is based on GreptimeDB OSS v0.10. The OSS base introduces a few
new features includes

- Vector data type support for similarity search.
- Secondary index update: user can now create secondary index on any columns.
- Alter table options are added for updating table TTL, compaction parameters
  and full-text index settings.
- JSON data type and functions support.
- More geospatial UDF: spatial relation and measurement, S2 index and etc.
- Initial release of Loki remote write support.

See [this](https://docs.greptime.com/release-notes/release-0-10-0) for a
complete changelog of 0.10
