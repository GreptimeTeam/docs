---
keywords: [disaster recovery, GreptimeDB, DR solutions, backup and restore, single-region deployment, region failover, active-active failover, cross-region deployment, RTO, RPO]
description: Overview of disaster recovery (DR) solutions in GreptimeDB, including basic concepts, component architecture, and various DR solutions such as standalone, single-region deployment in a single cluster, active-active failover, cross-region deployment, and backup & restore.
---

# Disaster Recovery

GreptimeDB is a distributed database designed to withstand disasters. It provides different solutions for disaster recovery (DR).

This document contains:
* Basic concepts in DR.
* The deployment architecture of GreptimeDB and Backup & Restore (BR).
* GreptimeDB provides the DR solutions.
* Compares these DR solutions.

## Basic Concepts

* **Recovery Time Objective (RTO)**: refers to the maximum acceptable amount of time that a business process can be down after a disaster occurs before it negatively impacts the organization.
* **Recovery Point Objective (RPO)**: refers to the maximum acceptable amount of time since the last data recovery point. This determines what is considered an acceptable loss of data between the last recovery point and the interruption of service.

The following figure illustrates these two concepts:

![RTO-RPO-explain](/RTO-RPO-explain.png)

* **Write-Ahead Logging (WAL)**: persistently records every data modification to ensure data integrity and consistency.

GreptimeDB storage engine is a typical [LSM Tree](https://en.wikipedia.org/wiki/Log-structured_merge-tree) :
![LSM-tree-explain](/LSM-tree-explain.png)

The data written is going firstly persisted into WAL, then applied into Memtable in memory. Under specific conditions (e.g., exceeding the memory threshold), the Memtable will be flushed and persisted as an SSTable. So the DR of WAL and SSTable is key to the DR of GreptimeDB.

* **Region**: a contiguous segment of a table, and also could be regarded as a partition in some relational databases. Read [Table Sharding](/contributor-guide/frontend/table-sharding.md#region) for more details.

## Component architecture

### GreptimeDB

Before digging into the specific DR solution, let's explain the architecture of GreptimeDB components in the perspective of DR:
![Component-architecture](/Component-architecture.png)

GreptimeDB is designed with a cloud-native architecture based on storage-compute separation:
* **Frontend**:  the ingestion and query service layer, which forwards requests to Datanode and processes, and merges responses from Datanode.
* **Datanode**:  the storage layer of GreptimeDB, and is an LSM storage engine. Region is the basic unit for storing and scheduling data in Datanode. A region is a table partition, a collection of data rows. The data in region is saved into Object Storage (such as AWS S3). Unflushed Memtable data is written into WAL and can be recovered in DR.
* **WAL**: persists the unflushed Memtable data in memory. It will be truncated when the Memtable is flushed into SSTable files. It can be local disk-based (local WAL) or Kafka cluster-based (remote WAL).
* **Object Storage**: persists the SSTable data and index.

The GreptimeDB stores data in object storage such as [AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/DataDurability.html) or its compatible services, which is designed to provide 99.999999999% durability and 99.99% availability of objects over a given year. And services such as S3 provide [replications in Single-Region or Cross-Region](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html), which is naturally capable of DR.

At the same time, the WAL component is pluggable, e.g. using Kafka as the WAL service that offers a mature [DR solution](https://www.confluent.io/blog/disaster-recovery-multi-datacenter-apache-kafka-deployments/).

### Backup and restore

![BR-explain](/BR-explain.png)

The Backup & Restore (BR) tool can perform a full snapshot backup of databases or tables at a specific time and supports incremental backup.
When a cluster encounters a disaster, you can restore the cluster from backup data. Generally speaking, BR is the last resort for disaster recovery.

## Solutions introduction

### DR solution for GreptimeDB Standalone

If the Standalone is running on the local disk for WAL and data, then:
* RPO: depends on backup frequency.
* RTO: doesn't make sense in standalone mode, mostly depends on the size of the data to be restored, your failure response time, and the operational infrastructure.

A good start is to deploy GreptimeDB Standalone into an IaaS platform that has a backup and recovery solution. For example, Amazon EC2 with EBS volumes provides a comprehensive [Backup and Recovery solution](https://docs.aws.amazon.com/prescriptive-guidance/latest/backup-recovery/backup-recovery-ec2-ebs.html).

But if running the Standalone with remote WAL and object storage, there is a better DR solution:
![DR-Standalone](/DR-Standalone.png)

Write the WAL to the Kafka cluster and store the data in object storage, so that the ingested data no longer depends on the node's local disk.

The node is not fully stateless, though: a standalone instance keeps its metadata — catalogs, schemas and table definitions — in a local key-value store under `<data_home>/metadata` (see [Storage Location](/user-guide/concepts/storage-location.md)). Kafka and object storage cannot rebuild it. Losing the host together with its disk means losing that metadata unless you have backed it up separately, so include it in the plan with [Metadata Export & Import](/user-guide/deployments-administration/disaster-recovery/back-up-&-restore-meta-data.md).

**RPO=0** and an **RTO in minutes** are the design targets of this topology. They hold as long as the Kafka cluster and the object storage both survive the failure you are planning for, the WAL covering unflushed writes is still present, and the metadata can be restored. Verify them with a failure drill against your own deployment.

### DR solution based on single-region deployment in a single cluster

![Single-region-single-cluster](/Single-region-single-cluster.svg)

Before a cluster spans regions, it has to survive the loss of a single node or of a single AZ inside one region. An AZ here is the same logical unit of disaster recovery used in the cross-region solutions: a data center, or a compartment of a data center. This topology is the common production baseline, and the cross-region solutions below are built on top of it.

The cluster lives in one region, with its roles spread over the AZs that region offers:

* **Frontend** is stateless. Run several replicas behind a load balancer so that a failed replica only affects the requests in flight on it. See [Role Replicas Configuration](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md#role-replicas-configuration).
* **Metasrv** runs as several replicas that elect a leader; losing a follower is transparent, and losing the leader costs a re-election. The metadata itself lives in an external backend — etcd, MySQL or PostgreSQL — that Metasrv does not replicate for you, so give that backend its own high availability and its own backups. See [Metadata Management](/user-guide/deployments-administration/manage-metadata/overview.md) and [Metadata Export & Import](/user-guide/deployments-administration/disaster-recovery/back-up-&-restore-meta-data.md).
* **Datanode** holds the regions. When one fails, [Region Failover](/user-guide/deployments-administration/manage-data/region-failover.md) reopens its regions on the surviving Datanodes. It is **disabled by default**, and it requires [shared storage](/user-guide/deployments-administration/configuration.md#storage-options) together with remote WAL. Enabling it on local WAL with `allow_region_failover_on_local_wal=true` is possible but may lose data, because the WAL of the failed node stays on that node's disk.
* **Kafka** (remote WAL) and the **object storage** hold the state that has to outlive the node. Give Kafka a replication factor that tolerates the broker loss you are planning for, and spread brokers and Datanodes over the AZs instead of packing them into one.

Latencies:
- Same-region round trips only; neither writes nor replication pay a cross-region penalty

Supports High Availability:
- A single node is unavailable with almost the same performance, once its regions are reopened elsewhere
- A single AZ is unavailable with degraded performance, unless the surviving AZs were sized to absorb its share of the load
- The region itself is not covered; it is a single failure domain in this topology

This solution targets zero RPO and a minute-level RTO for a node or AZ failure. As with the other solutions, the numbers depend on conditions you have to check:

- Region Failover is **disabled by default** and must be enabled explicitly.
- The surviving Datanodes need spare capacity to carry the failed node's regions, otherwise failover only moves the overload.
- The recovery time is dominated by WAL replay: the more regions share one Kafka topic, the more redundant data has to be read before those regions serve again. Read [The recovery time of Region Failover](/user-guide/deployments-administration/manage-data/region-failover.md#the-recovery-time-of-region-failover) for the model behind that.

Confirm the resulting RPO and RTO with a failure drill. If the region as a whole, the Kafka cluster or the object storage becomes unavailable, you need one of the solutions below, or regular backups kept in another region.

### DR solution based on Active-Active Failover

![Active-active failover](/active-active-failover.png)

In some edge or small-to-medium scale scenarios, or if you lack the resources to deploy remote WAL or object storage, Active-Active Failover offers a better solution compared to Standalone DR. Two actively serving standalone nodes replicate data changes asynchronously. If a peer or the inter-site network fails, the healthy node continues serving, retains pending changes on its local storage, and sends them after the peer recovers.

Pending changes remain recoverable only while the source node's local storage is available. Losing a node and its local storage before replication completes can leave the peer without those changes.

Deploying nodes in different regions can also meet region-level DR requirements, but the scalability is limited.

:::tip NOTE

**Active-Active Failover  is only available in GreptimeDB Enterprise.**

:::

For more information about this solution, see [DR solution based on Active-Active Failover](/enterprise/deployments-administration/disaster-recovery/dr-solution-based-on-active-active-failover.md).

### DR solution  based on cross-region deployment in a single cluster

![Cross-region-single-cluster](/Cross-region-single-cluster.png)

For medium-to-large scale scenarios requiring zero RPO, this solution is highly recommended. In this deployment architecture, the entire cluster spans across three regions, with each region capable of handling both read and write requests. Data replication is achieved using remote WAL and object storage, both of which must have cross-region DR enabled.
If Region 1 becomes completely unavailable due to a disaster, the table regions within it will be opened and recovered in the other regions.
In the event that Region 1 becomes completely unavailable due to a disaster, the table regions within it will be opened and recovered in the other regions. Region 3 serves as a replica to adhere to the majority protocol of Metasrv.

This solution targets region-level fault tolerance, scalable write capability, zero RPO, and a minute-level RTO or lower. Reaching those numbers depends on the whole dependency chain, not on the cluster layout alone:

- Region Failover is **disabled by default** and must be enabled explicitly.
- Kafka, the object storage, the metadata backend and the traffic entry point all have to span the failure domain you are protecting against. Metasrv running in three regions does not replicate an external MySQL or PostgreSQL metadata backend for you.
- The automatic Datanode selector picks targets by round-robin, lease or load. It is not an availability-zone-aware placement policy, so surviving regions need enough healthy capacity to take over.

Confirm the resulting RPO and RTO with an end-to-end failure drill. For more information about this solution, see [DR solution based on cross-region deployment in a single cluster](./dr-solution-based-on-cross-region-deployment-in-single-cluster.md).

### DR solution based on BR

![/BR-DR](/BR-DR.png)

In this architecture, GreptimeDB Cluster 1 is deployed in region 1. The BR process continuously and regularly backs up the data from Cluster 1 to region 2. If region 1 experiences a disaster rendering Cluster 1 unrecoverable, you can use the backup data to restore a new cluster (Cluster 2) in region 2 to resume services.

The DR solution based on BR provides an RPO depending on the backup frequency and an RTO that varies with the size of the data to be restored.

Read [Backup & restore data](./back-up-&-restore-data.md) for details.

### Solution Comparison

By comparing these DR solutions, you can decide on the final option based on their specific scenarios, requirements, and cost. The RPO and RTO columns are the design targets of each topology under the conditions described above, not values guaranteed for every deployment; confirm them with a failure drill.


|     DR solution | Error Tolerance Objective |  RPO | RTO | TCO | Scenarios | Remote WAL & Object Storage | Notes |
| ------------- | ------------------------- | ----- | ----- | ----- | ---------------- | --------- | --------|
|  DR solution for Standalone| Single-Region | Backup Interval | Minute or Hour level | Low | Low requirements for availability and reliability in small scenarios |  Optional | |
|  DR solution based on single-region deployment in a single cluster | Single-Region, node and AZ level | 0 | Minute level | Medium | The common production baseline for a cluster that lives in one region | Required | Region Failover is disabled by default |
|  DR solution based on Active-Active Failover | Cross-Region | Depends on pending changes and the failure mode | Depends on external failover | Low | High requirements for availability and reliability in small-to-medium scenarios |  Optional | Commercial feature |
|  DR solution based on cross-region deployment in a single cluster| Multi-Regions | 0 | Minute level | High | High requirements for availability and reliability in medium-to-large scenarios |  Required | |
|  DR solution based on BR | Single-Region | Backup Interval | Minute or Hour level | Low | Acceptable requirements for availability and reliability | Optional | |


## References

* [Backup & restore data](./back-up-&-restore-data.md)
* [DR solution based on Active-Active Failover ](/enterprise/deployments-administration/disaster-recovery/dr-solution-based-on-active-active-failover.md)
* [DR solution based on cross-region deployment in a single cluster](./dr-solution-based-on-cross-region-deployment-in-single-cluster.md)
* [S3 Replicating objects overview](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html)
