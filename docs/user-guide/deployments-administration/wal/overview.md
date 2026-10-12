---
title: "GreptimeDB WAL Overview"
keywords: [WAL, Write-Ahead Logging, Local WAL, Remote WAL, GreptimeDB]
description: This section describes the WAL (Write-Ahead Logging) in GreptimeDB, including the advantages and disadvantages of Local WAL and Remote WAL.
---
# Write-Ahead Logging (WAL)

The [Write-Ahead Logging](/contributor-guide/datanode/wal.md#introduction)(WAL) in GreptimeDB persistently records every data modification to ensure no memory-cached data loss. GreptimeDB provides four WAL storage options:

- **Local WAL**: Uses an embedded storage engine([raft-engine](https://github.com/tikv/raft-engine)) within the [Datanode](/user-guide/concepts/architecture.md).

- **Remote WAL**: Uses [Apache Kafka](https://kafka.apache.org/) as the external(remote) WAL storage component.

- **Object Store WAL**: An experimental provider for standalone mode that stores the WAL as objects in an object store such as S3.

- **Noop WAL**: A no-op WAL provider for emergency situations when WAL becomes unavailable. Does not store any data. 

## Local WAL

### Advantages

- **Low latency**: The local WAL is stored within the same process as the Datanode, eliminating network overhead and providing low write latency.

- **No extra components**: The WAL is co-located with the Datanode, so nothing else has to be deployed or operated.

- **Zero RPO**: When deploying GreptimeDB in the cloud, you can configure persistent storage for WAL data using cloud storage services such as AWS EBS or GCP Persistent Disk. This ensures zero [Recovery Point Objective](https://en.wikipedia.org/wiki/Disaster_recovery#Recovery_Point_Objective) (RPO), meaning no data loss, even in the event of system failure.

### Disadvantages

- **High RTO**: Because the WAL resides on the same node as the Datanode, the [Recovery Time Objective](https://en.wikipedia.org/wiki/Disaster_recovery#Recovery_Time_Objective) (RTO) is relatively high. After a Datanode restarts, it must replay the WAL to restore the latest data, during which time the node remains unavailable.

- **Single-Point Access Limitation**: The local WAL is tightly coupled with the Datanode process and only supports a single consumer, which limits features such as region hot standby and [Region Migration](/user-guide/deployments-administration/manage-data/region-migration.md).

## Remote WAL

### Advantages

- **Low RTO**: By decoupling WAL from the Datanode, [Recovery Time Objective](https://en.wikipedia.org/wiki/Disaster_recovery#Recovery_Time_Objective) (RTO) is minimized. If a Datanode crashes, the Metasrv can quickly trigger a [Region Failover](/user-guide/deployments-administration/manage-data/region-failover.md) to migrate affected regions to healthy nodes—without the need to replay WAL locally.

- **Multi-Consumer Subscriptions**: Remote WAL supports multiple consumers subscribing to WAL logs simultaneously, enabling features such as region hot standby and [Region Migration](/user-guide/deployments-administration/manage-data/region-migration.md), thereby enhancing system availability and flexibility.

### Disadvantages

- **External dependencies**: Remote WAL relies on an external Kafka cluster, which increases the complexity of deployment, operation, and maintenance.

- **Network overhead**: Since WAL data needs to be transmitted over the network, careful planning of cluster network bandwidth is required to ensure low latency and high throughput, especially under write-heavy workloads.

## Object Store WAL

Object Store WAL is an experimental WAL provider for standalone mode. It batches the WAL entries of all regions and writes each batch as an object to an object store such as S3.

### Advantages

- **No extra components**: The WAL can use the same object store as the data files, so nothing else has to be deployed or operated.

- **Object store durability**: By default, a write is acknowledged only after it is durable in the object store, so it is as durable as the object store itself.

- **No persistent volume for the WAL**: The Datanode does not need a local persistent volume for the WAL. Standalone still keeps its metadata under the data home.

### Disadvantages

- **Higher write latency**: By default, a write waits until its batch is written as an object. Each object create on a cloud object store takes tens of milliseconds.

- **Request cost**: Every object is one request to the object store. Timer-triggered flushes create up to 10 objects per second per node at the default flush interval, and flushes triggered by batch size or backlog can add more.

- **Experimental and standalone only**: It is not supported in cluster mode, and its configuration and behavior may change.

For detailed configuration, see the [Object Store WAL](/user-guide/deployments-administration/wal/object-store-wal.md) page.

## Noop WAL

Noop WAL is a special WAL provider for emergency situations when the configured WAL provider becomes temporarily unavailable. It does not store any WAL data and is only available in cluster mode.

For detailed configuration, see the [Noop WAL](/user-guide/deployments-administration/wal/noop-wal.md) page.

## Next steps

- [Local WAL](/user-guide/deployments-administration/wal/local-wal.md) — configuring the embedded WAL.

- [Remote WAL](/user-guide/deployments-administration/wal/remote-wal/configuration.md) — configuring Kafka as the WAL backend.

- [Object Store WAL](/user-guide/deployments-administration/wal/object-store-wal.md) — storing the WAL in an object store in standalone mode (experimental).

- [Noop WAL](/user-guide/deployments-administration/wal/noop-wal.md) — the emergency no-op provider.