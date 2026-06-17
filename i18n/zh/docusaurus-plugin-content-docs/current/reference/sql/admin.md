---
keywords: [管理函数, ADMIN 语句, SQL ADMIN, 数据库管理, 表管理, 数据管理, 构建索引]
description: ADMIN 语句用于运行管理函数来管理数据库和数据，包括刷新表、启动 compaction、构建索引、迁移 Region、查询 Procedure 状态以及回收孤立文件。
---

# ADMIN

`ADMIN` 语句用于运行管理函数：

```sql
ADMIN function(arg1, arg2, ...)
```

## 管理函数

GreptimeDB 提供了一些管理函数来管理数据库和数据：

* `flush_table(table_name)` 根据表名将表的 Memtable 刷新到 SST 文件中。
* `flush_region(region_id)` 根据 Region ID 将 Region 的 Memtable 刷新到 SST 文件中。通过 [PARTITIONS](./information-schema/partitions.md) 表查找 Region ID。
* `compact_table(table_name, [type], [options])` 为表启动一个 compaction 任务，详细信息请阅读 [compaction](/user-guide/deployments-administration/manage-data/compaction.md#严格窗口压缩策略swcs和手动压缩)。
* `compact_region(region_id)` 为 Region 启动一个 compaction 任务。
* `build_index(table_name)` 在添加或修改索引定义后，为表中已有 SST 文件构建缺失的物理索引。
* `migrate_region(region_id, from_peer, to_peer, [timeout])` 在 Datanode 之间迁移 Region，请阅读 [Region Migration](/user-guide/deployments-administration/manage-data/region-migration.md)。
* `procedure_state(procedure_id)` 根据 ID 查询 Procedure 状态。
* `flush_flow(flow_name)` 将 Flow 的输出刷新到目标接收表。
* `reconcile_table(table_name)` 修复指定表的元数据不一致问题，详细信息请阅读 [table reconciliation](/user-guide/deployments-administration/maintenance/table-reconciliation.md)。
* `reconcile_database(database_name)` 修复指定数据库中所有表的元数据不一致问题，详细信息请阅读 [table reconciliation](/user-guide/deployments-administration/maintenance/table-reconciliation.md)。
* `reconcile_catalog()` 修复整个集群中所有表的元数据不一致问题，详细信息请阅读 [table reconciliation](/user-guide/deployments-administration/maintenance/table-reconciliation.md)。
* `gc_table(table_name, [full_file_listing])` 对对象存储中已删除表的孤立 SST 文件进行垃圾回收，返回已处理的 Region 数量。可选参数 `full_file_listing`（默认为 `false`），设为 `true` 时启用全量文件扫描模式。
* `gc_regions(region_id1, ..., region_idN, [full_file_listing])` 根据 Region ID 对对象存储中指定 Region 的孤立 SST 文件进行垃圾回收，返回已处理的 Region 数量。可选参数 `full_file_listing`（默认为 `false`），设为 `true` 时启用全量文件扫描模式。

例如：
```sql
-- 刷新表 test --
admin flush_table("test");

-- 为表 test 启动 compaction 任务，默认并行度为 1 --
admin compact_table("test");

-- 启动常规 compaction，并行度设置为 2 --
admin compact_table("test", "regular", "parallelism=2");

-- 启动 SWCS compaction，使用默认时间窗口，并行度设置为 2 --
admin compact_table("test", "swcs", "parallelism=2");

-- 启动 SWCS compaction，自定义时间窗口和并行度 --
admin compact_table("test", "swcs", "window=1800,parallelism=2");

-- 添加或修改索引后，为已有 SST 文件构建缺失的索引 --
admin build_index("test");

-- 对已删除的表进行垃圾回收 --
admin gc_table("test");

-- 对已删除的表进行垃圾回收（启用全量文件扫描）--
admin gc_table("test", true);

-- 对指定 Region 进行垃圾回收 --
admin gc_regions(1, 2, 3);

-- 对指定 Region 进行垃圾回收（启用全量文件扫描）--
admin gc_regions(1, 2, 3, true);
```

## 构建索引

当表元数据要求某些索引，但部分已有 SST 文件还没有对应物理索引时，可以使用 `ADMIN BUILD_INDEX` 手动为已有数据文件构建索引。常见场景包括为已有列添加索引、迁移早期版本写入的数据，或者在之前的索引构建失败后重试。

```sql
ADMIN BUILD_INDEX('table_name');
```

该函数只接受一个字符串参数。表名可以是不带 catalog 和 database 的表名，也可以是完整表名；不带限定符的表名会根据当前查询上下文解析。

例如，为已有数据构建全文索引：

```sql
CREATE TABLE logs (
    ts TIMESTAMP TIME INDEX,
    message TEXT,
);

INSERT INTO logs VALUES
    (1, 'The quick brown fox jumps over the lazy dog'),
    (2, 'The quick brown fox jumps over the lazy cat');

ADMIN FLUSH_TABLE('logs');

ALTER TABLE logs MODIFY COLUMN message SET FULLTEXT INDEX;

ADMIN BUILD_INDEX('logs');

SELECT message FROM logs WHERE MATCHES(message, 'fox');
```

`ADMIN BUILD_INDEX` 会向表的所有 Region 发送构建请求。每个 Region 只会为索引元数据与当前表元数据不一致的 SST 文件构建索引。已经包含所需索引元数据的文件会被跳过，因此可以安全地重复执行该命令。

使用 `SHOW INDEX` 检查逻辑索引定义：

```sql
SHOW INDEX FROM logs;
```

也可以查询 `information_schema.ssts_index_meta`，检查 SST 文件的物理索引元数据：

```sql
SELECT COUNT(*) AS fulltext_index_meta_count
FROM information_schema.ssts_index_meta
WHERE table_id = (
    SELECT table_id
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'logs'
)
AND index_type LIKE 'fulltext%';
```

构建索引会读取 SST 数据并写入索引文件，因此会消耗 CPU、内存和 I/O 资源。在异步索引构建模式下，flush、compaction 和 schema change 自动触发的构建任务可能与手动构建同时发生。重复的进行中任务会被去重或中止，重复执行该命令仍然是安全的。
