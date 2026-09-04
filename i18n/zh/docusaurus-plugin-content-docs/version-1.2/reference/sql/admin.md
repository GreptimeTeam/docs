---
keywords: [管理函数, ADMIN 语句, SQL ADMIN, 数据库管理, 表管理, 数据管理, 丢弃未刷盘数据, 构建索引]
description: ADMIN 语句用于运行管理函数，包括刷盘、丢弃未刷盘数据、压缩和构建索引等数据库管理操作。
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
* `discard_unflushed(table_name_or_region_id)` 永久丢弃表中所有物理 Region 或指定 Region 的未刷盘数据。
* `compact_table(table_name, [type], [options])` 为表启动一个 compaction 任务，详细信息请阅读 [compaction](/user-guide/deployments-administration/manage-data/compaction.md#严格窗口压缩策略swcs和手动压缩)。
* `compact_region(region_id)` 为 Region 启动一个 compaction 任务。
* `build_index(table_name)` 在新增或修改索引定义后，为表已有的 SST 文件补建缺失的物理索引。
* `migrate_region(region_id, from_peer, to_peer, [timeout])` 在 Datanode 之间迁移 Region，请阅读 [Region Migration](/user-guide/deployments-administration/manage-data/region-migration.md)。
* `procedure_state(procedure_id)` 根据 ID 查询 Procedure 状态。
* `flush_flow(flow_name)` 将 Flow 的输出刷新到目标接收表。
* `reconcile_table(table_name)` 修复指定表的元数据不一致问题，详细信息请阅读 [table reconciliation](/user-guide/deployments-administration/maintenance/table-reconciliation.md)。
* `reconcile_database(database_name)` 修复指定数据库中所有表的元数据不一致问题，详细信息请阅读 [table reconciliation](/user-guide/deployments-administration/maintenance/table-reconciliation.md)。
* `reconcile_catalog()` 修复整个集群中所有表的元数据不一致问题，详细信息请阅读 [table reconciliation](/user-guide/deployments-administration/maintenance/table-reconciliation.md)。
* `gc_table(table_name, [full_file_listing])` 对对象存储中已删除表的孤立 SST 文件进行垃圾回收，返回已处理的 Region 数量。可选参数 `full_file_listing`（默认为 `false`），设为 `true` 时启用全量文件扫描模式。
* `gc_regions(region_id1, ..., region_idN, [full_file_listing])` 根据 Region ID 对对象存储中指定 Region 的孤立 SST 文件进行垃圾回收，返回已处理的 Region 数量。可选参数 `full_file_listing`（默认为 `false`），设为 `true` 时启用全量文件扫描模式。
* `purge_table(table_name)` 永久 purge 一个 [soft-dropped table](/enterprise/soft-drop.md)。表名可以是未限定、schema 限定或完整限定名称。该函数仅在 GreptimeDB 企业版中可用，且只能通过 `ADMIN` 语句调用。

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

-- 对左闭右开的时间范围 [start_time, end_time) 启动常规 compaction --
admin compact_table("test", "regular", "start_time=2026-01-01T00:00:00Z,end_time=2026-02-01T00:00:00Z");

-- 对指定时间范围启动 SWCS compaction --
admin compact_table("test", "strict_window", "window=3600,start_time=2026-01-01T00:00:00Z,end_time=2026-02-01T00:00:00Z");

-- 在新增或修改索引后，为已有 SST 文件补建索引 --
admin build_index("test");

-- 对已删除的表进行垃圾回收 --
admin gc_table("test");

-- 对已删除的表进行垃圾回收（启用全量文件扫描）--
admin gc_table("test", true);

-- 对指定 Region 进行垃圾回收 --
admin gc_regions(1, 2, 3);

-- 对指定 Region 进行垃圾回收（启用全量文件扫描）--
admin gc_regions(1, 2, 3, true);

-- 永久 purge 一个 soft-dropped table --
admin purge_table("test");
```

## 丢弃未刷盘数据

当 Memtable 中的数据导致 flush 反复失败、写缓冲区被占满并阻塞后续写入时，可以使用 `admin discard_unflushed` 进行紧急恢复。

:::danger 危险操作

该操作会永久删除目标 Region 中尚未持久化到 SST 文件的所有数据，并将对应的 WAL 条目标记为过期，因此重启 Datanode 也无法恢复这些数据。已经持久化到 SST 文件的数据不受影响。

:::

该函数只接受一个表名或 Region ID：

```sql
ADMIN discard_unflushed('table_name');
ADMIN discard_unflushed(region_id);
```

使用表名时，该操作会作用于表的所有物理 Region。表名可以是未限定名、schema 限定名或完整限定名；省略的限定部分将根据当前查询上下文解析。

使用数值类型的 Region ID 时，该操作只作用于指定 Region。可以查询 [`information_schema.PARTITIONS`](./information-schema/partitions.md) 表获取 Region ID。

Metric Engine 逻辑表不支持该操作，因为多个逻辑表共享相同的物理 Region。使用 Metric Engine 物理表名或物理 Region ID 会丢弃其逻辑表共享的未刷盘数据，因此请仔细确认操作目标。

该函数只能通过 `ADMIN` 语句调用，在 `SELECT` 语句中调用会被拒绝。如果目标中已没有未刷盘数据，重复执行该操作是安全的，不会产生影响。

## 构建索引

当表元数据要求的索引在部分 SST 文件上还不存在时，可以用 `admin build_index` 手动为已有数据文件构建索引。典型场景包括：给已有列新增索引、迁移索引功能可用之前写入的数据、上一次索引构建失败后重试。

```sql
admin build_index("table_name");
```

该函数只接受一个字符串参数。表名可以是未限定名，也可以是完整限定名；未限定名按当前查询上下文解析。

例如，为已有数据构建全文索引：

```sql
CREATE TABLE logs (
    ts TIMESTAMP TIME INDEX,
    message TEXT
);

INSERT INTO logs VALUES
    (1, 'The quick brown fox jumps over the lazy dog'),
    (2, 'The quick brown fox jumps over the lazy cat');

admin flush_table("logs");

ALTER TABLE logs MODIFY COLUMN message SET FULLTEXT INDEX;

admin build_index("logs");

SELECT message FROM logs WHERE matches_term(message, 'fox');
```

`admin build_index` 会向表的所有 Region 下发构建请求。每个 Region 只为索引元数据与当前表元数据不一致的 SST 文件构建索引，已经具备所需索引元数据的文件会被跳过，因此重复执行是安全的。该命令目前返回受影响行数。

用 `SHOW INDEX` 查看逻辑索引定义：

```sql
SHOW INDEX FROM logs;
```

也可以查询 `information_schema.ssts_index_meta` 查看 SST 文件的物理索引元数据：

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

构建索引需要读取 SST 数据并写入索引文件，会占用 CPU、内存和 I/O 资源。在异步索引构建模式下，自动 flush、compaction 以及 schema 变更触发的构建可能与手动构建同时进行，重复的构建任务会被去重或中止，命令依然可以安全重跑。
