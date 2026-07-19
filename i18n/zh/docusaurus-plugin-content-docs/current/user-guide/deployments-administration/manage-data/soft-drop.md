---
keywords: [soft drop, recycle bin, drop table, undrop table, purge table, 数据恢复]
description: 介绍如何在 GreptimeDB 中开启和使用 soft-drop table。
---

# Soft-Drop Table

Soft-drop 用于在分布式 GreptimeDB 集群中防止误执行 `DROP TABLE`。开启后，`DROP TABLE` 会关闭表的 regions，并把表元数据移动到 tombstone，而不是立即删除物理数据。你可以在保留期过期前恢复表，也可以在确认不再需要时手动 purge。

Soft-drop 适用于分布式模式下支持该能力的表引擎。Standalone 模式仍保持原有 hard-drop 行为。开启集群级 soft-drop 开关后，file-engine 表和 metric logical 表也仍保持 hard-drop 行为。

## 开启 soft-drop

Soft-drop 在 Metasrv 的 GC 配置中开启，并要求 Metasrv GC 已启用。

```toml
[gc]
enable = true

[gc.soft_drop]
enable = true
retention = "7d"
```

配置项如下：

| 配置项 | 说明 |
| --- | --- |
| `gc.enable` | 启用 Metasrv GC 调度器。设置 `gc.soft_drop.enable = true` 时必须启用。 |
| `gc.soft_drop.enable` | 在分布式模式中为支持的表启用 soft-drop。 |
| `gc.soft_drop.retention` | Soft-dropped table 在 recycle bin 中保留多久后由 Metasrv GC 自动 purge。该值必须至少为 `1ms`。 |

修改配置后请重启 Metasrv。普通文件 GC 仍需按照[垃圾回收（GC）](./gc.md)中的说明，保持 Metasrv 与 Datanode 的 GC 配置一致。

## 删除表

开启 soft-drop 后，照常使用 `DROP TABLE`：

```sql
DROP TABLE monitor;
```

该表会对 DDL 和 DML 不可见，也不再出现在 `information_schema.tables` 中，但会出现在 [`information_schema.recycle_bin`](/reference/sql/information-schema/recycle-bin.md) 中，直到被恢复、手动 purge，或在 retention deadline 后被自动 purge。

## 查看已删除表

查询 recycle bin 可以查看已删除表及其 retention deadline：

```sql
SELECT object_id,
       object_type,
       original_catalog_name,
       original_schema_name,
       original_object_name,
       dropped_at,
       retention_expires_at,
       purge_status,
       restorable
FROM information_schema.recycle_bin
WHERE original_schema_name = 'public';
```

该表只展示 active 且可恢复的 soft-dropped table。已经进入 purge 流程的表不会显示在 recycle bin 中。

## 恢复表

使用 `UNDROP TABLE` 恢复 soft-dropped table：

```sql
UNDROP TABLE monitor;
```

也可以使用完整限定名：

```sql
UNDROP TABLE greptime.public.monitor;
```

如果不存在同名 live table，表会带着原始数据恢复。如果已经存在同名 live table，`UNDROP TABLE` 会失败，并且不会把已删除表恢复成其他名称。

## Purge 表

如果希望在 retention deadline 前永久删除 soft-dropped table，可以使用 admin function `purge_table()`：

```sql
ADMIN purge_table('monitor');
```

参数可以是未限定、schema 限定或完整限定的表名：

```sql
ADMIN purge_table('public.monitor');
ADMIN purge_table('greptime.public.monitor');
```

Purge 是永久操作。完成后，表会从 `information_schema.recycle_bin` 中消失，并且不能再恢复。`purge_table()` 只能通过 `ADMIN` 语句调用；在普通 `SELECT` 语句中调用会被拒绝。

## 同名冲突规则

- 旧表被 soft-drop 后，可以创建同名新表。
- 如果已经存在同名 live table，`UNDROP TABLE` 会失败。
- 如果较早的 tombstone 仍占用同一个完整表名，删除后来创建的同名表会失败。请先 purge 或恢复较早的 tombstone。
- `ADMIN purge_table('<name>')` 解析的是 tombstoned table，而不是同名 live table。

## 自动 purge

Metasrv GC 会周期性扫描 soft-dropped table。当某个表的 `retention_expires_at` 已过期后，GC 会提交与 `ADMIN purge_table()` 相同的 purge procedure。Retention deadline 在执行 drop 时固定，之后修改 `gc.soft_drop.retention` 不会影响已经删除的表。
