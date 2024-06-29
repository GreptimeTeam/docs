# Overview

GreptimeDB is a distributed database designed to withstand disasters. It provides different solutions for disaster recovery (DR).

## Basic Concepts

* **Recovery Time Objective (RTO)**: refers to the maximum acceptable amount of time that a business process can be down after a disaster occurs before it negatively impacts the organization.
* **Recovery Point Objective (RPO)**: refers to the maximum acceptable amount of data loss measured in time before the disaster occurs. It indicates the time interval during which data might be lost due to a major incident. 

The following figure illustrates these two concepts:

![RTO-RPO-explain](/RTO-RPO-explain.png)

* **Write-Ahead Logging(WAL)**: persistently records every data modification to ensure data integrity and consistency.

GreptimeDB storage engine is a typical [LSM Tree](https://en.wikipedia.org/wiki/Log-structured_merge-tree) :
![LSM-tree-explain.pngin](/LSM-tree-explain.png)

The data written is going firstly persisted into WAL, then applied into Memtable in memory. Under specific conditions(e.g., exceeding the memory threshold), the Memtable will be flushed and persisted as an SSTable. So the DR of WAL and SSTable is key to the DR of GreptimeDB.

* **Region**: a contiguous segment of a table, and also could be regarded as a partition in some relational databases.

## Component architecture

### GreptimeDB

Before digging into the specific DR solution, let's explain the architecture of GreptimeDB components in the perspective of DR:
![Component-architecture](/Component-architecture.png)

GreptimeDB is designed with a cloud-native architecture based on storage-compute separation：
* **Frontend**:  the ingestion and query service layer, which forwards requests to Datanode and processes, and merges responses from Datanode.
* **Datanode**:  the storage layer of GreptimeDB, and is a LSM storage engine. Region is the basic unit for storing and scheduling data in Datanode. A region is a table partition, a collection of data rows. The data in region is saved into Object Storage(such as AWS S3). Unflushed Memtable data is written into WAL and can be recovered in DA.
* **WAL**: persists the unflushed Memtable data in memory. It will be truncated when the Memtable is flushed into SSTable files.
* **Object Storage**: persists the SSTable data and index.

The GreptimeDB stores data in object storage such as [AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/DataDurability.html) or its compatible services, which is designed to provide 99.999999999% durability and 99.99% availability of objects over a given year. And services such as S3 provide [replications in Single-Region or Cross-Region](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html), which is naturally capable of DR.

At the same time, the WAL component is pluggable, e.g. using Kafka as the WAL service that offers a mature [DR solution](https://www.confluent.io/blog/disaster-recovery-multi-datacenter-apache-kafka-deployments/).

### BR

![BR-explain](/BR-explain.png)

BR tool can perform a full snapshot backup of databases or tables at a specific time and supports incremental backup.
When a cluster encounters a disaster, you can restore the cluster from backup data. Generally speaking, BR is the last resort for disaster recovery.

## Solutions introduction

### Standalone DR discussion

### DR solution based on Dual Active-Standby 

### DR solution  based on multiple replicas in a single cluster

### DR solution based on BR

### Solution Comparison


## References
* [Backup & restore data](./back-up-&-restore-data.md)