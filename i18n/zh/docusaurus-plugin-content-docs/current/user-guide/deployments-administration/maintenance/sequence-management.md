---
keywords: [GreptimeDB, 资源标识维护, metasrv, 元数据, 维护, 待分配的表 ID]
description: 介绍如何维护和更新 GreptimeDB 集群中的资源标识（ID），包括在元数据恢复后重置待分配的表 ID。
---

# 资源标识（ID）维护

资源标识（ID）维护允许开发者在从[元数据备份](/user-guide/deployments-administration/manage-metadata/restore-backup.md)恢复集群时重置资源标识（ID）。这一功能非常重要，因为备份可能无法捕获 ID 的最新值（如待分配的表 ID，即 Next Table ID），如果不正确重置，可能会导致冲突或不一致。

## 维护资源标识

你可以通过 Metasrv 的 HTTP 接口获取或设置待分配的表 ID：`http://{METASRV}:{HTTP_PORT}/admin/sequence/table/next-id`（获取）和 `http://{METASRV}:{HTTP_PORT}/admin/sequence/table/set-next-id`（设置）。请注意，此接口监听 Metasrv 的 `HTTP_PORT`，默认为 `4000`。

:::tip
确定待分配的表 ID：在设置新的表 ID 之前，请确保该值大于集群中任何现有的表 ID，以避免冲突。你可以通过查询 `INFORMATION_SCHEMA.TABLES` 系统表或检查当前集群状态来检查现有的表 ID。
:::

### 设置待分配的表 ID

要安全地更新待分配的表 ID，请按照以下步骤操作：

1. **启用集群恢复模式** - 这可以防止在更新过程中创建新表。详情请参阅[集群恢复模式](/user-guide/deployments-administration/maintenance/recovery-mode.md)。
2. **设置待分配的表 ID** - 通过 HTTP 接口设置待分配的表 ID。
3. **重启 metasrv 节点** - 这确保新的待分配的表 ID 被正确设置。
4. **禁用集群恢复模式** - 恢复正常的集群操作。

通过发送 POST 请求到 `/admin/sequence/table/set-next-id` 端点设置待分配的表 ID：

```bash
curl -X POST 'http://localhost:4000/admin/sequence/table/set-next-id' \
  -H 'Content-Type: application/json' \
  -d '{"next_table_id": 2048}'
```

预期输出（`next_table_id` 可能不同）：

```bash
{"next_table_id":2048}
```

### 获取待分配的表 ID

```bash
curl -X GET 'http://localhost:4000/admin/sequence/table/next-id'
```

预期输出（`next_table_id` 可能不同）：

```bash
{"next_table_id":1254}
```
