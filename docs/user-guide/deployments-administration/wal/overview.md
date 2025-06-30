---
keywords: [WAL, Write-Ahead Logging, Local WAL, Remote WAL, GreptimeDB]
description: This section describes the WAL (Write-Ahead Logging) in GreptimeDB, including the advantages and disadvantages of Local WAL and Remote WAL.
---
# Overview

The [Write-Ahead Logging](/contributor-guide/datanode/wal.md#introduction)(WAL) is a crucial component in GreptimeDB that persistently records every data modification to ensure no memory-cached data loss. GreptimeDB provides two WAL storage options:

- **Local WAL**: Uses an embedded storage engine([raft-engine](https://github.com/tikv/raft-engine)) within the [Datanode](/user-guide/concepts/why-greptimedb.md).

- **Remote WAL**: Uses [Apache Kafka](https://kafka.apache.org/) as the external(remote) WAL storage component. 

## Local WAL

### Advantages

- **Low latency**: The local WAL is stored within the same process as the Datanode, eliminating network overhead and providing low write latency.

- **Easy to deploy**: Since the WAL is co-located with the Datanode, no additional components are required, simplifying deployment and operations.

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


## Next steps

- To configure the Local WAL storage, please refer to [Local WAL](/user-guide/deployments-administration/wal/local-wal.md).

- To learn more about the Remote WAL, please refer to [Remote WAL](/user-guide/deployments-administration/wal/remote-wal/configuration.md).