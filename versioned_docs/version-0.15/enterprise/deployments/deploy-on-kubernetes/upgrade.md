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

Maintenance mode can be enabled and disabled through Metasrv's HTTP interface.
The interface address format is: `http://{METASRV}:{RPC_PORT}/admin/maintenance?enable=true`.
Note that **this interface listens on Metasrv's `RPC_PORT` port, with the default port being `3002`**.

### Enable Metasrv Maintenance Mode

:::danger
After calling the maintenance mode interface,
ensure you check that the HTTP status code returned is 200 and confirm that the response content meets expectations.
If there are any exceptions or the interface behavior does not meet expectations,
proceed with caution and avoid continuing with high-risk operations such as cluster upgrades.
:::

```bash
curl -X POST 'localhost:3002/admin/maintenance?enable=true'
```

Expected output:

```json
{"enabled":true}
```

### Disable Metasrv Maintenance Mode

:::danger
Before disabling maintenance mode,
you must confirm that **all components have returned to normal status**.
:::

```bash
curl -X POST 'localhost:3002/admin/maintenance?enable=false'
```

Expected output:

```json
{"enabled":false}
```

## Query Whether Metasrv Currently Has Maintenance Mode Enabled

```bash
curl -X GET localhost:3002/admin/maintenance
```

Expected output:

```json
{"enabled":false}
```
