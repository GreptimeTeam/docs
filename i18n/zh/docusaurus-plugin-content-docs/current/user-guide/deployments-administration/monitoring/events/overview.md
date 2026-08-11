---
keywords: [GreptimeDB 事件, Procedure 事件, 运维事件, greptime_private]
description: 查询 greptime_private.events 中的事件记录。
---

# 事件

`greptime_private.events` 表保存 GreptimeDB 运行期间产生的事件记录，帮助运维人员检查 DDL 变更和后台 Procedure，而不必依赖服务日志。

GreptimeDB 会以异步、尽力而为的方式写入事件记录。刚完成的操作可能不会立即出现在表中，因此事件记录不应当作为操作成功的确认。

## 配置事件记录

单机部署可以在本地配置事件记录器，分布式部署则可以在 Metasrv 上配置。配置选项和支持的事件类型请参阅[事件记录器](/user-guide/deployments-administration/configuration.md#生命周期事件记录器)，本文不重复配置详情。

单机部署会记录受支持的本地 DDL Procedure 事件。带有 Metasrv 的分布式部署还可以记录运维事件族。

## 查询事件

排查最近的操作时，可以先执行一个有数量限制的查询：

```sql
SELECT type, procedure_id, procedure_state, timestamp
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```

以下页面分别介绍查询方法和事件详情：

- [查询事件](/user-guide/deployments-administration/monitoring/events/query-events.md)
- [Procedure 事件](/user-guide/deployments-administration/monitoring/events/procedure-lifecycle.md)
- [事件数据模型](/user-guide/deployments-administration/monitoring/events/event-data-model.md)
- [DDL 事件](/user-guide/deployments-administration/monitoring/events/ddl-events.md)
