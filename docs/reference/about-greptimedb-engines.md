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

As the name suggests, the Metric Engine is designed to process metrics data efficiently. It specializes in handling scenarios with a large number of small tables typical in observability and monitoring workloads.

The key innovation of the Metric Engine is its use of synthetic wide physical tables to store data from numerous small tables. This approach enables efficient column and metadata reuse across tables, significantly reducing storage overhead while enhancing columnar compression efficiency. Under the Metric Engine, tables become lightweight logical constructs, making it ideal for cloud-native monitoring scenarios where thousands of small metric tables are common.

The Metric Engine is built on top of the Mito Engine, meaning that its data is actually stored in the Mito Engine. This architecture leverages Mito's robust storage capabilities while adding specialized optimizations for metrics data management.

# File Engine

The File Engine is a specialized storage engine in GreptimeDB designed for handling file-based data sources. It allows GreptimeDB to directly query and process data stored in external files without requiring data import or conversion.

This engine supports various file formats commonly used in data analytics workflows, enabling seamless integration with existing data pipelines. By treating external files as virtual tables, the File Engine provides SQL query capabilities over file-based data while maintaining the performance optimizations of GreptimeDB's query engine.

The File Engine is particularly useful for scenarios where data already exists in file formats, allowing users to analyze this data alongside time-series data stored in other GreptimeDB engines. This capability makes GreptimeDB more versatile as a unified analytics platform that can work with diverse data sources.
