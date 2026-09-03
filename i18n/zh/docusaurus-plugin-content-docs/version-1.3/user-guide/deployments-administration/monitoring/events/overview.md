---
keywords: [GreptimeDB 事件, Procedure 事件, 运维事件, greptime_private]
description: 查询 greptime_private.events 中的事件记录。
---

# 事件

`greptime_private.events` 表保存 GreptimeDB 运行期间产生的事件记录，帮助运维人员检查 DDL 变更和后台 Procedure，而不必依赖服务日志。

GreptimeDB 会异步写入事件记录，通常每 5 秒刷新一次。刚完成的操作可能不会立即出现在表中；写入失败不会影响原操作的执行结果，因此不能以事件是否出现作为操作成功的依据。

## 配置事件记录

配置选项以及 standalone、Frontend 和 Metasrv 支持的事件类型请参阅[事件记录配置](/user-guide/deployments-administration/configuration.md#事件记录配置)。

## 查询事件

事件记录器首次写入事件时会创建 `greptime_private.events` 系统表。如果现有表缺少当前事件表结构中的列，记录器会补齐这些列。即使自动建表已禁用，仍会执行这两项操作。禁用事件记录不会删除已有表。只有该表当前不存在时，下面的查询才会报表不存在，例如从启动时就禁用了事件记录，或者表已被删除。事件记录器在下一次写入事件时会重新创建该表。

排查最近的操作时，可以先查询最近一小时的事件，并将结果限制为 20 条：

```sql
SELECT timestamp, type
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```

以下页面分别介绍查询方法和事件详情：

- [查询事件](/user-guide/deployments-administration/monitoring/events/query-events.md)
- [事件数据模型](/user-guide/deployments-administration/monitoring/events/event-data-model.md)
- [DDL 事件](/user-guide/deployments-administration/monitoring/events/ddl-events.md)
- [Region 事件](/user-guide/deployments-administration/monitoring/events/region-events.md)
- [维护事件](/user-guide/deployments-administration/monitoring/events/maintenance-events.md)
