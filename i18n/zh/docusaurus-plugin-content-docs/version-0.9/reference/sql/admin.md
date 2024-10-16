# ADMIN

`ADMIN` 语句用于运行管理函数：

```sql
ADMIN function(arg1, arg2, ...)
```

## 管理函数

GreptimeDB 提供了一些管理函数来管理数据库和数据：

* `flush_table(table_name)` 根据表名将表的 Memtable 刷新到 SST 文件中。
* `flush_region(region_id)` 根据 Region ID 将 Region 的 Memtable 刷新到 SST 文件中。通过 [PARTITIONS](./information-schema/partitions.md) 表查找 Region ID。
* `compact_table(table_name, [type], [options])` 为表启动一个 compaction 任务，详细信息请阅读 [compaction](/user-guide/administration/manage-data/compaction.md#严格窗口压缩策略swcs和手动压缩)。
* `compact_region(region_id)` 为 Region 启动一个 compaction 任务。
* `migrate_region(region_id, from_peer, to_peer, [timeout])` 在 Datanode 之间迁移 Region，请阅读 [Region Migration](/user-guide/administration/manage-data/region-migration.md)。
* `procedure_state(procedure_id)` 根据 ID 查询 Procedure 状态。
* `flush_flow(flow_name)` 将 Flow 的输出刷新到目标接收表。

例如：
```sql
-- 刷新表 test --
admin flush_table("test");

-- 为表 test 启动 compaction 任务 --
admin compact_table("test");
```
