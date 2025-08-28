---
keywords: [GreptimeDB, resource ID maintenance, metasrv, metadata, maintenance, next table ID, table ID]
description: Guide for maintaining and updating resource IDs in GreptimeDB clusters, including resetting next table ID after metadata restoration.
---
# Resource ID Management

Resource ID management is primarily used to manually set resource identifiers (such as table IDs) when restoring a cluster from a [Metadata Backup](/user-guide/deployments-administration/manage-metadata/restore-backup.md). This is because the backup file may not contain the latest `next table ID` value, which could lead to resource conflicts or data inconsistencies if not properly reset.

### Understanding the Relationship Between Table ID and Next Table ID

In GreptimeDB:
- **Table ID**: Each table has a unique numeric identifier used internally by the database to identify and manage tables
- **Next Table ID**: The system-reserved next available table ID value. When creating a new table, the system automatically assigns this ID to the new table and then increments the `next table ID`

**Example:**
- Suppose the current cluster has tables with IDs 1001, 1002, and 1003
- The `next table ID` should be 1004
- When creating a new table, the system assigns ID 1004 to the new table and updates the `next table ID` to 1005
- If during backup restoration, the `next table ID` is still 1002, it would conflict with existing table IDs 1002 and 1003 (you would encounter the error `Region 1024 is corrupted, reason: ` when starting the Datanode)

:::warning

Under normal circumstances, resource IDs are automatically maintained by the database and require no manual intervention. However, in certain special scenarios (such as restoring a cluster from metadata backup where new tables were created after the backup), the `next table ID` in the backup may lag behind the actual cluster state, requiring manual adjustment.

**How to determine if manual `next table ID` setting is needed:**
1. Query all table IDs in the current cluster: `SELECT TABLE_ID FROM INFORMATION_SCHEMA.TABLES ORDER BY TABLE_ID DESC LIMIT 1;`
2. Get the current `next table ID` via API (see interface description below)
3. If the maximum existing table ID is greater than or equal to the current `next table ID`, you need to manually set the `next table ID` to a larger value, typically the maximum existing table ID plus 1.

:::


You can get or set the `next table ID` using Metasrv's HTTP interface at the following endpoints: `http://{METASRV}:{HTTP_PORT}/admin/sequence/table/next-id` (to get) and `http://{METASRV}:{HTTP_PORT}/admin/sequence/table/set-next-id` (to set). This interface listens on Metasrv's `HTTP_PORT`, which defaults to `4000`.

### Set next table ID

To safely update the `next table ID`, follow this step-by-step process:

1. **Enable cluster recovery mode** - This prevents new table creation during the update process. See [Cluster Recovery Mode](/user-guide/deployments-administration/maintenance/recovery-mode.md) for more details.
2. **Set the next table ID** - Use the HTTP interface to set the `next table ID`.
3. **Restart metasrv nodes** - This ensures the new `next table ID` is properly applied.
4. **Disable cluster recovery mode** - Resume normal cluster operations.

Set the `next table ID` by sending a POST request to the `/admin/sequence/table/set-next-id` endpoint:

```bash
curl -X POST 'http://localhost:4000/admin/sequence/table/set-next-id' \
  -H 'Content-Type: application/json' \
  -d '{"next_table_id": 2048}'
```

The expected output is (the `next_table_id` may be different):

```bash
{"next_table_id":2048}
```

### Get next table ID

```bash
curl -X GET 'http://localhost:4000/admin/sequence/table/next-id'
```

The expected output is (the `next_table_id` may be different):

```bash
{"next_table_id":1254}
```
