---
keywords: [GreptimeDB, maintenance mode, metasrv, cluster management, region scheduling, auto balancing, failover, upgrade, maintenance]
description: Guide for managing GreptimeDB cluster maintenance mode to safely perform operations like upgrades and maintenance while preventing automatic region scheduling and failover.
---

# Cluster Maintenance Mode

Maintenance mode is a safety feature in GreptimeDB that temporarily disables automatic cluster management operations.

This mode is particularly useful during:
- Cluster deployment
- Cluster upgrades
- Planned downtime
- Any operation that might temporarily affect cluster stability


## When to Use Maintenance Mode

### With GreptimeDB Operator
If you are upgrading a cluster using GreptimeDB Operator, you don't need to enable the maintenance mode manually. The operator handles this automatically.

### Without GreptimeDB Operator
When upgrading a cluster without using GreptimeDB Operator, **you must manually enable Metasrv's maintenance mode before**:
1. Deploying a new cluster (maintenance mode should be enabled after metasrv nodes are ready)
2. Rolling upgrades of Datanode nodes
3. Metasrv nodes upgrades
4. Frontend nodes upgrades
5. Any operation that might cause temporary node unavailability

After the cluster is deployed/upgraded, you can disable the maintenance mode.

## Impact of Maintenance Mode

When maintenance mode is enabled:
- Auto Balancing (if enabled) will be paused
- Region Failover (if enabled) will be paused
- Manual region operations are still possible
- Read and write operations continue to work normally
- Monitoring and metrics collection continue to function

## Managing Maintenance Mode
The maintenance mode can be enabled and disabled through Metasrv's HTTP interface at: `http://{METASRV}:{HTTP_PORT}/admin/maintenance/enable` and `http://{METASRV}:{HTTP_PORT}/admin/maintenance/disable`. Note that this interface listens on Metasrv's `HTTP_PORT`, which defaults to `4000`.

### Enable Maintenance Mode

:::danger
After calling the maintenance mode interface,
ensure you check that the HTTP status code returned is 200 and confirm that the response content meets expectations.
If there are any exceptions or the interface behavior does not meet expectations,
proceed with caution and avoid continuing with high-risk operations such as cluster upgrades.
:::

Enable maintenance mode by sending a POST request to the `/admin/maintenance/enable` endpoint. 

```bash
curl -X POST 'http://localhost:4000/admin/maintenance/enable'
```

The expected output is:
```bash
{"enabled":true}
```

If you encounter any issues or unexpected behavior, do not proceed with maintenance operations.

### Disable Maintenance Mode

:::danger
Before disabling maintenance mode,
you must confirm that **all components have returned to normal status**.
:::

Disable maintenance mode by sending a POST request to the `/admin/maintenance/disable` endpoint. 

Before disabling maintenance mode:
1. Ensure all components are healthy and operational
2. Verify that all nodes are properly joined to the cluster

```bash
curl -X POST 'http://localhost:4000/admin/maintenance/disable'
```

The expected output is:
```bash
{"enabled":false}
```

### Check Maintenance Mode Status

Check maintenance mode status by sending a GET request to the `/admin/maintenance` endpoint.

```bash
curl -X GET http://localhost:4000/admin/maintenance/status
```

The expected output is:
```bash
{"enabled":false}
```

## Troubleshooting

### Common Issues

1. **Maintenance mode cannot be enabled**
   - Verify Metasrv is running and accessible
   - Check if you have the correct permissions
   - Ensure the RPC port is correct

### Best Practices

1. Always verify the maintenance mode status before and after operations
2. Have a rollback plan ready
3. Monitor cluster health during maintenance
4. Document all changes made during maintenance
