---
keywords: [事件, greptime private, 系统表]
description: greptime_private 数据库中的 events 表。
---

# events

`events` 表保存 GreptimeDB 运行期间产生的事件。单机部署记录受支持的本地 DDL Procedure 事件；带有 Metasrv 的分布式部署还可以记录运维事件。事件会异步写入，写入失败不会影响原操作的执行结果。因此，不能以事件是否出现作为操作成功的依据。

该表会在首次记录事件时自动创建。如果还没有事件记录，或已禁用事件记录，查询会提示表不存在。配置方法请参阅[事件记录配置](/user-guide/deployments-administration/configuration.md#事件记录配置)。

```sql
USE greptime_private;

SELECT timestamp, type
FROM events
WHERE timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```

字段定义请参阅[事件数据模型](/user-guide/deployments-administration/monitoring/events/event-data-model.md)。DDL Procedure 查询示例请参阅[DDL 事件](/user-guide/deployments-administration/monitoring/events/ddl-events.md)。
