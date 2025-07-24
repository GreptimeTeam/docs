---
keywords: [upgrade GreptimeDB, Metasrv maintenance mode]
description: Steps to upgrade GreptimeDB on Kubernetes, including direct upgrade and upgrading clusters without using GreptimeDB Operator.
---

# Upgrade

## Upgrade Cluster with GreptimeDB Operator

Upgrading the GreptimeDB Enterprise Edition image is straightforward.
Simply modify the `tag` in the Helm chart and restart.

## Upgrading Cluster Without GreptimeDB Operator

When upgrading a cluster without the GreptimeDB Operator,
you must manually enable Metasrv maintenance mode before operating on each component (e.g., rolling upgrade of Datanode nodes).

After the upgrade is complete,
wait for all components to return to a healthy state before disabling Metasrv maintenance mode.
When Metasrv maintenance mode is enabled,
the Auto Balancing (if enabled) and Region Failover (if enabled) mechanisms in the cluster will be suspended until maintenance mode is disabled.

Please refer to [Managing Maintenance Mode](/user-guide/deployments-administration/maintenance/maintenance-mode.md#managing-maintenance-mode) for detailed instructions on how to enable and disable Metasrv maintenance mode.

