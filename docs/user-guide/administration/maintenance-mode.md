---
keywords: [GreptimeDB, maintenance mode, metasrv, cluster management, region scheduling, auto balancing, failover, upgrade, maintenance]
description: Guide for managing GreptimeDB cluster maintenance mode to safely perform operations like upgrades and maintenance while preventing automatic region scheduling and failover.
---

# Cluster Maintenance Mode

Maintenance mode is a safety feature in GreptimeDB that temporarily disables automatic cluster management operations. When enabled, it prevents the following operations:
- Region scheduling and rebalancing (Auto Balancing)
- Automatic failover of failed regions (Region Failover)

This mode is particularly useful during:
- Cluster upgrades
- Planned downtime
- Any operation that might temporarily affect cluster stability


## When to Use Maintenance Mode

### With GreptimeDB Operator
If you are upgrading a cluster using GreptimeDB Operator, you don't need to enable the maintenance mode manually. The operator handles this automatically.

### Without GreptimeDB Operator
When upgrading a cluster without using GreptimeDB Operator, **you must manually enable Metasrv's maintenance mode before**:
1. Rolling upgrades of Datanode nodes
2. Metasrv upgrades
3. Frontend upgrades
4. Any operation that might cause temporary node unavailability


## Impact of Maintenance Mode

When maintenance mode is enabled:
- Auto Balancing (if enabled) will be paused
- Region Failover (if enabled) will be paused
- Manual region operations are still possible
- Read and write operations continue to work normally
- Monitoring and metrics collection continue to function

## Managing Maintenance Mode
The maintenance mode can be enabled and disabled through Metasrv's HTTP interface at: `http://{METASRV}:{RPC_PORT}/admin/maintenance?enable=true`. Note that this interface listens on Metasrv's `RPC_PORT`, which defaults to `3002`.

### Enable Maintenance Mode

Enable maintenance mode by sending a POST request to the `/admin/maintenance` endpoint. For more details, please refer to [Metasrv Admin API](/contributor-guide/metasrv/admin-api.md#maintenance-http-endpoint).

```bash
curl -X POST 'http://localhost:3002/admin/maintenance?enable=true'
```

The expected output is:
```bash
{"enabled":true}
```

If you encounter any issues or unexpected behavior, do not proceed with maintenance operations.

### Disable Maintenance Mode

Before disabling maintenance mode:
1. Ensure all components are healthy and operational
2. Verify that all nodes are properly joined to the cluster

```bash
curl -X POST 'http://localhost:3002/admin/maintenance?enable=false'
```

The expected output is:
```bash
{"enabled":false}
```

### Check Maintenance Mode Status

Check maintenance mode status by sending a GET request to the `/admin/maintenance` endpoint. For more details, please refer to [Metasrv Admin API](/contributor-guide/metasrv/admin-api.md#maintenance-http-endpoint).

```bash
curl -X GET http:://localhost:3002/admin/maintenance
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
