---
keywords: [GreptimeDB, 资源标识维护, metasrv, 元数据, 维护, 待分配表 ID, 表 ID]
description: 介绍如何维护和更新 GreptimeDB 集群中的资源标识（ID），包括在元数据恢复后重置待分配表 ID。
---

# 资源标识（ID）管理

资源标识（ID）管理主要用于在从[元数据备份](/user-guide/deployments-administration/manage-metadata/restore-backup.md)恢复集群时，手动设置资源标识（如表 ID）。这是因为备份文件可能未包含最新的`待分配表 ID`值，如果不及时重置，可能会导致资源冲突或数据不一致。

### 理解表 ID 及 待分配表 ID 的关系

在 GreptimeDB 中：
- **表 ID**：每个表都有一个唯一的数字标识符，用于数据库内部识别和管理表
- **待分配表 ID（Next Table ID）**：系统预留的下一个可用的表 ID 值。当创建新表时，系统会自动分配这个 ID 给新表，然后将`待分配表 ID`递增

**举例说明：**
- 假设当前集群中已有表 ID 为 1001、1002、1003 的表
- 此时`待分配表 ID`应该是 1004
- 当创建新表时，系统分配 ID 1004 给新表，并将`待分配表 ID`更新为 1005
- 如果从备份恢复时，`待分配表 ID`仍然是 1002，就会与现有表 ID 1002、1003 产生冲突（通常你会在 Datanode 启动时遇到 `Region 1024 is corrupted, reason: ` 的错误）


通常情况下，资源标识（ID）由数据库自动维护，无需人工干预。但在某些特殊场景下（如从元数据备份恢复集群，且备份后集群又创建了新表），备份中的`待分配表 ID`可能已经落后于实际集群状态，此时需要手动调整。

**如何判断是否需要手动设置`待分配表 ID`：**
1. 查询当前集群中所有表的 ID：`SELECT TABLE_ID FROM INFORMATION_SCHEMA.TABLES ORDER BY TABLE_ID DESC LIMIT 1;`
2. 通过 API 获取当前的`待分配表 ID`（见下方接口说明）
3. 如果现有表 ID 的最大值大于等于当前的`待分配表 ID`，则需要手动设置`待分配表 ID`为一个更大的值。通常为现有表 ID 的最大值加 1。


你可以通过 Metasrv 的 HTTP 接口获取或设置`待分配的表 ID`：`http://{METASRV}:{HTTP_PORT}/admin/sequence/table/next-id`（获取）和 `http://{METASRV}:{HTTP_PORT}/admin/sequence/table/set-next-id`（设置）。请注意，此接口监听 Metasrv 的 `HTTP_PORT`，默认为 `4000`。

### 设置待分配的表 ID

要安全地更新`待分配的表 ID`，请按照以下步骤操作：

1. **暂停 Procedure Manager** - 这会拒绝新的元数据变更操作，包括建表。详见[阻止元数据变更](/user-guide/deployments-administration/maintenance/prevent-metadata-changes.md)。
2. **等待在途 procedure 结束** - 暂停只拒绝**新的** procedure，已经在运行的会继续执行。轮询直到没有仍在进行的 procedure：

   ```sql
   SELECT procedure_id, procedure_type, status
   FROM INFORMATION_SCHEMA.PROCEDURE_INFO
   WHERE status IN ('Running', 'Retrying', 'PrepareRollback', 'RollingBack');
   ```

   只有该查询返回空结果时才能继续。如果超过预期等待时间仍有 procedure 在运行，请停止操作并排查原因，不要继续修改 sequence。出现 `Failed` 或 `Poisoned` 表示 procedure 以非正常状态终止，需先处理干净再继续。参见 [PROCEDURE_INFO](/reference/sql/information-schema/procedure-info.md)。
3. **启用集群恢复模式** - 设置`待分配的表 ID`只允许在恢复模式下进行。详情请参阅[集群恢复模式](/user-guide/deployments-administration/maintenance/recovery-mode.md)。
4. **设置待分配的表 ID** - 通过 HTTP 接口设置`待分配的表 ID`。
5. **重启 metasrv 节点** - 这确保新的`待分配的表 ID`被正确设置。重启后先确认恢复模式仍然开启、Procedure Manager 仍处于暂停状态，再验证新的`待分配的表 ID`。
6. **禁用集群恢复模式** - 然后恢复 Procedure Manager，回到正常的集群操作。

:::warning
恢复模式本身不会阻止 DDL。它只是 `set-next-id` 接口的前置条件，并放宽 Datanode 的启动检查。真正阻止新元数据变更的是暂停 Procedure Manager。
:::

通过发送 POST 请求到 `/admin/sequence/table/set-next-id` 端点设置`待分配的表 ID`：

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
