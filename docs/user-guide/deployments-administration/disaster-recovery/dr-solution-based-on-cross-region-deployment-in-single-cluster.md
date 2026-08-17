---
keywords: [disaster recovery, GreptimeDB, cross-region deployment, single cluster, high availability, metadata, Region Failover]
description: Design and validate a GreptimeDB cluster that spans availability zones or regions without assuming unprovided failure-domain guarantees.
---

# Cross-Region Deployment in a Single Cluster

A GreptimeDB cluster can span availability zones or regions, but GreptimeDB alone does not make every dependency cross-region. This guide describes the failure boundaries that must be covered before treating such a deployment as a disaster-recovery solution.

## Recovery model

A table is divided into Regions, and each Region is opened on a Datanode. Community GreptimeDB does not keep a synchronous Datanode replica of every open Region. With Region Failover enabled, Metasrv detects an unavailable Region, selects a healthy Datanode, changes the route, and opens the Region there. The new Datanode recovers persisted data from shared storage and Remote WAL.

This model has two consequences:

- The target Datanode must be able to reach the same data storage and WAL as the failed Datanode.
- Recovery cannot succeed if a shared dependency is lost with the failed site.

Region Failover is disabled by default. Read [Region Failover](/user-guide/deployments-administration/manage-data/region-failover.md) before enabling it, including the initialization delay and maintenance-mode requirements.

## Define failure domains

An availability zone, data center, and geographic region are infrastructure concepts. Decide which failure each deployment must tolerate, then map every component to those fault domains. GreptimeDB does not infer that a Datanode belongs to a particular city or data center.

For Kubernetes, use node labels, affinity, topology spread constraints, and disruption budgets to place replicas. Verify the resulting placement after each deployment change. GreptimeDB's built-in community selectors choose among available Datanodes by round robin, lease, or load; they do not enforce cross-zone placement.

## Required dependencies

### Data storage

Use shared object storage that remains readable and writable after the target fault domain fails. Configure replication, versioning, credentials, endpoints, and failover according to the storage provider. A bucket in one region is still a single-region dependency even when Datanodes run in several regions.

### Remote WAL

Use Kafka Remote WAL for safe Region Failover. Kafka must remain available from surviving Datanodes and must retain every WAL entry that GreptimeDB can still reference. Configure Kafka replication and cross-region recovery for the same failure boundary as the GreptimeDB cluster.

Do not use Kafka size-based retention when `overwrite_entry_start_id = true`; it can delete entries that GreptimeDB still needs. See [Configure Remote WAL](/user-guide/deployments-administration/wal/remote-wal/configuration.md) and [Manage Kafka for Remote WAL](/user-guide/deployments-administration/wal/remote-wal/manage-kafka.md).

### Metadata

Metasrv instances use a metadata backend such as etcd, MySQL, or PostgreSQL. Deploy both Metasrv and that backend for the target failure boundary. Adding Metasrv replicas does not create a quorum or cross-region replication for the metadata backend.

Cross-region consensus adds write latency to metadata operations. Follow the backend's quorum and failover rules; do not place members merely to match the number of GreptimeDB sites.

### Request routing

Applications need a surviving Frontend endpoint. Configure health-checked load balancing or DNS failover outside GreptimeDB, and make client retry behavior consistent with the maximum acceptable interruption.

### Spare capacity

Surviving Datanodes must absorb Regions from the failed domain while serving their existing workload. Capacity planning should test the largest intended failure, not only steady state. See [Capacity Planning](/user-guide/deployments-administration/capacity-plan.md).

## Choose a topology

Use the smallest topology that covers the declared failure:

- For an availability-zone failure, distribute GreptimeDB components and all stateful dependencies across enough zones for their quorum and replication policies.
- For a regional failure, every required dependency must either span regions or have a tested regional failover. This includes object storage, Kafka, metadata, Frontend routing, credentials, and observability.
- If cross-region latency makes a single cluster impractical, use separate clusters with an explicit replication or backup-and-restore strategy instead of claiming a single-cluster RTO that has not been measured.

The network figures in a topology diagram are not a product property. Measure latency, bandwidth, and packet loss between the actual sites. Test the effect on Kafka acknowledgements, metadata operations, queries, and recovery before selecting the topology.

## Validate recovery

Run failure drills before production and after material infrastructure changes:

1. Stop a Datanode and confirm its Regions reopen on expected nodes.
2. Isolate an entire availability zone or region, including its network path.
3. Verify Kafka, object storage, and the metadata backend from surviving sites.
4. Confirm Frontend routing and client retries restore access.
5. Compare the last acknowledged writes with recovered query results.
6. Measure detection, Region recovery, backlog catch-up, and total service-restoration time.
7. Restore the failed site without triggering unnecessary failovers; use maintenance mode during planned restarts.

Use the measured data-loss window and restoration time as the deployment's RPO and RTO evidence. Do not describe the architecture as zero-RPO or minute-level RTO unless the complete failure drill demonstrates those results under the required workload.
