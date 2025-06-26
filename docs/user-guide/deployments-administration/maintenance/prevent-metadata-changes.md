---
keywords: [GreptimeDB, GreptimeDB cluster, maintenance, pause metadata changes, maintenance mode]
description: Guide for managing GreptimeDB pause metadata changes to safely perform operations like metadata backup.
---

# Prevent Metadata Changes

To prevent metadata changes, you can pause the procedure manager. This mechanism rejects all new procedures (i.e., new metadata-changing operations) while allowing existing procedures to continue running.
Once enabled, the Metasrv will reject the following procedures:

**DDL procedures:**
- Create table
- Drop table
- Alter table
- Create database
- Drop database
- Create view
- Create flow
- Drop flow

**Region procedures:**
- Region Migration
- Region Failover (if enabled)
- Auto Balancing (if enabled)

You may see error messages if you or Metasrv try to perform these procedures after metadata changes are paused. For region procedures, you can enable [Cluster Maintenance Mode](/user-guide/deployments-administration/maintenance/maintenance-mode.md) to temporarily disable them.

## Managing procedure manager
The procedure manager can be paused and resumed through Metasrv's HTTP interface at: `http://{METASRV}:{RPC_PORT}/admin/procedure-manager/pause` and `http://{METASRV}:{RPC_PORT}/admin/procedure-manager/resume`. Note that this interface listens on Metasrv's `RPC_PORT`, which defaults to `3002`.

### Pause Procedure Manager

Pause procedure manager by sending a POST request to the `/admin/procedure-manager/pause` endpoint. 

```bash
curl -X POST 'http://localhost:3002/admin/procedure-manager/pause'
```

The expected output is:
```bash
{"status":"paused"}
```

### Resume Procedure Manager

Resume procedure manager by sending a POST request to the `/admin/procedure-manager/resume` endpoint. 

```bash
curl -X POST 'http://localhost:3002/admin/procedure-manager/resume'
```

The expected output is:
```bash
{"status":"running"}
```

### Check Procedure Manager Status

Check procedure manager status by sending a GET request to the `/admin/procedure-manager/status` endpoint.

```bash
curl -X GET 'http://localhost:3002/admin/procedure-manager/status'
```

The expected output is:
```bash
{"status":"running"}
```


