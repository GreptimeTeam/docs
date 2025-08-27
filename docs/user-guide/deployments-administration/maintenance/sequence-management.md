---
keywords: [GreptimeDB, sequence management, metasrv, metadata, maintenance]
description: Guide for managing and updating metadata sequences in GreptimeDB clusters, including resetting table IDs after metadata restoration.
---

# Sequence Management

Sequence management allows developers to reset resource sequences when restoring a cluster from a [Metadata Backup](/user-guide/deployments-administration/manage-metadata/restore-backup.md). This is important because the backup may not capture the most recent values of sequences (such as the next table ID), which could lead to conflicts or inconsistencies if not properly reset.


## Manage Sequence

You can get or set the next table ID using Metasrv's HTTP interface at the following endpoints: `http://{METASRV}:{HTTP_PORT}/admin/sequence/table/next-id` (to get) and `http://{METASRV}:{HTTP_PORT}/admin/sequence/table/set-next-id` (to set). This interface listens on Metasrv's `HTTP_PORT`, which defaults to `4000`.

:::tip
Determining the Next Table ID: Before setting a new table ID, ensure the value is higher than any existing table ID in your cluster to avoid conflicts. You can check existing table IDs by querying the `INFORMATION_SCHEMA.TABLES` system table or by examining your current cluster state.
:::

### Set next table ID

To safely update the next table ID, follow this step-by-step process:

1. **Enable cluster recovery mode** - This prevents new table creation during the update process. See [Cluster Recovery Mode](/user-guide/deployments-administration/maintenance/recovery-mode.md) for more details.
2. **Set the next table ID** - Use the API endpoint to update the sequence value.
3. **Restart metasrv nodes** - This ensures the new table ID is properly applied.
4. **Disable cluster recovery mode** - Resume normal cluster operations.

Set the next table ID by sending a POST request to the `/admin/sequence/table/set-next-id` endpoint:

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
