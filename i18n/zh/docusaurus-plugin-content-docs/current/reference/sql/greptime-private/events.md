---
keywords: [事件, greptime private, 系统表]
description: greptime_private 数据库中的 events 表。
---

# events

`events` 表保存 GreptimeDB 运行期间产生的事件。单机部署记录受支持的本地 DDL Procedure 事件；带有 Metasrv 的分布式部署还可以记录运维事件。事件会异步写入，写入失败不会影响原操作的执行结果。因此，不能以事件是否出现作为操作成功的依据。

即使服务端全局 `auto_create_table` 配置为 `false`，首次记录事件仍会创建内部的 `greptime.greptime_private.events` 表。若现有 events 表缺少当前事件表结构中的列，记录事件时会补齐这些列。该例外只适用于内部 events 表；`auto_create_table=false` 仍会阻止用户表自动创建和自动变更表结构。尚未记录任何事件，或已禁用事件记录时，查询会提示表不存在。配置方法请参阅[事件记录配置](/user-guide/deployments-administration/configuration.md#事件记录配置)。

```sql
USE greptime_private;

SELECT timestamp, type
FROM events
WHERE timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```

字段定义请参阅[事件数据模型](/user-guide/deployments-administration/monitoring/events/event-data-model.md)。DDL Procedure 查询示例请参阅[DDL 事件](/user-guide/deployments-administration/monitoring/events/ddl-events.md)。
