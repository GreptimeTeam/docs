---
keywords: [GreptimeDB 事件, Procedure 事件, 运维事件, greptime_private]
description: 查询 greptime_private.events 中的事件记录。
---

# 事件

`greptime_private.events` 表保存 GreptimeDB 运行期间产生的事件记录，帮助运维人员检查 DDL 变更和后台 Procedure，而不必依赖服务日志。

GreptimeDB 会异步写入事件记录，通常每 5 秒刷新一次。刚完成的操作可能不会立即出现在表中；写入失败不会影响原操作的执行结果，因此不能以事件是否出现作为操作成功的依据。

## 配置事件记录

单机部署可以在本地配置事件记录器，分布式部署则可以在 Metasrv 上配置。配置选项和支持的事件类型请参阅[生命周期事件记录器](/user-guide/deployments-administration/configuration.md#生命周期事件记录器)。

单机部署会记录受支持的本地 DDL Procedure 事件。带有 Metasrv 的分布式部署还可以记录更多运维事件。

## 查询事件

排查最近的操作时，可以先查询最近一小时的事件，并将结果限制为 20 条：

事件表会在首次记录事件时创建。尚未记录任何事件，或已禁用事件记录时，下面的查询会报表不存在。

```sql
SELECT timestamp, type
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1 hour'
ORDER BY timestamp DESC
LIMIT 20;
```

以下页面分别介绍查询方法和事件详情：

- [查询事件](/user-guide/deployments-administration/monitoring/events/query-events.md)
- [事件数据模型](/user-guide/deployments-administration/monitoring/events/event-data-model.md)
- [DDL 事件](/user-guide/deployments-administration/monitoring/events/ddl-events.md)
