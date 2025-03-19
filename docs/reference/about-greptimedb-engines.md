---
keywords: [greptimedb engine, Mito engine, Metric engine, File engile]
description: Overview all of the engines in GreptimeDB.
---

# Mito Engine

Mito is the default `storage engine` of GreptimeDB, responsible for efficiently storing and managing database data. Built on the [LSMT][1] (Log-structured Merge-tree) architecture, Mito has been extensively optimized for time-series data workloads.

The engine features a robust architecture including Write-Ahead Logging (WAL) for durability, a memory table system, and an efficient compaction strategy based on Time Window Compaction Strategy (TWCS). This design enables Mito to handle high-throughput write operations while maintaining excellent query performance.

Mito seamlessly integrates with various object storage solutions including S3, GCS, and Azure Blob Storage, providing native support without additional plugins. It implements a tiered cache system on top of object storage, optimizing both storage costs and access speeds for time-series data at any scale.

[1]: https://en.wikipedia.org/wiki/Log-structured_merge-tree

# Metric Engine

As the name suggests, the Metric Engine is designed to efficiently process metric data. It specializes in handling scenarios with a large number of small tables typical in observability and monitoring workloads.

The key innovation of the Metric Engine is its use of synthetic wide physical tables to store data from numerous small tables. This approach enables efficient column and metadata reuse across tables, significantly reducing storage overhead while enhancing columnar compression efficiency. Under the Metric Engine, tables become lightweight logical constructs, making it ideal for cloud-native monitoring scenarios where thousands of small metric tables are common.

The Metric Engine is built on top of the Mito Engine, meaning that its data is actually stored in the Mito Engine. This architecture leverages Mito's robust storage capabilities while adding specialized optimizations for metric data management.

# File Engine

