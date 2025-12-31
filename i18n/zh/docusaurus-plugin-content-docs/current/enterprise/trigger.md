---
keywords: [触发器, 告警, GreptimeDB 企业版, SQL, Webhook]
description: GreptimeDB 触发器概述。
---

# Trigger

Trigger 允许用户基于 SQL 语句定义触发规则，GreptimeDB 根据这些触发规则进行周期性
计算，当满足条件后对外发出通知。

## 关键特性

- **SQL 原生**：用 SQL 定义触发规则，复用 GreptimeDB 内置函数，无需额外学习成本
- **多阶段** 状态管理：内置 pending / firing / inactive 状态机，防止抖动和重复
    通知
- **丰富的上下文**：自定义 labels 和 annotations，并自动注入查询结果字段，便于精
    准定位根因
- **生态友好**：告警负载完全兼容 Prometheus Alertmanager，可直接使用其分组、抑制、
    静默和路由功能

## 快速入门示例

本节通过端到端示例展示如何监控系统负载（`load1`），当负载超过阈值时触发告警。

在本示例中你将：

- 创建指标表：建立 `load1` 表存储主机负载指标
- 定义 Trigger：通过 SQL 设定触发条件，配置 labels、annotations 及通知方式
- 模拟数据写入：依次注入正常与异常的负载数据，激活告警逻辑
- 观察状态变化：实时查看告警实例从 pending → firing → inactive 的完整生命周期

### 1. 创建数据表

使用 MySQL 客户端连接 GreptimeDB，并创建 `load1` 表：

```sql
CREATE TABLE `load1` (
    host            STRING,
    load1           FLOAT32,
    ts              TIMESTAMP TIME INDEX
) WITH ('append_mode'='true');
```

### 2. 创建 Trigger

使用 MySQL 客户端连接 GreptimeDB，并创建 `load1_monitor` Trigger：

```sql
CREATE TRIGGER IF NOT EXISTS `load1_monitor`
    ON (
        SELECT
            host          AS label_host,
            avg(load1)    AS avg_load1,
            max(ts)       AS ts
        FROM public.load1
        WHERE ts >= NOW() - '1 minutes'::INTERVAL
        GROUP BY host
        HAVING avg(load1) > 10
    ) EVERY '1 minutes'::INTERVAL
    FOR '3 minutes'::INTERVAL
    KEEP FIRING FOR '3 minutes'::INTERVAL
    LABELS (severity=warning)
    ANNOTATIONS (comment='Your computer is smoking, should take a break.')
    NOTIFY(
        WEBHOOK alert_manager URL 'http://localhost:9093' WITH (timeout='1m')
    );
```

该 Trigger 每分钟运行一次，计算过去 60 秒内每台主机的平均负载，并为每个满足
`avg(load1) > 10` 的主机生成告警实例。

关键参数说明：

- **FOR**：指定条件需要持续多久才会进入 firing 状态
- **KEEP FIRING FOR**：指定条件不再满足后，告警实例在 firing 状态保持多久

详见 [Trigger 语法](/reference/sql/trigger-syntax.md)。

### 3. 查看 Trigger 状态

#### 列出所有 Trigger

```sql
SHOW TRIGGERS;
```

输出：

```text
+---------------+
| Triggers      |
+---------------+
| load1_monitor |
+---------------+
```

#### 查看创建语句

```sql
SHOW CREATE TRIGGER `load1_monitor`\G
```

输出：

```text
*************************** 1. row ***************************
       Trigger: load1_monitor
Create Trigger: CREATE TRIGGER IF NOT EXISTS `load1_monitor`
  ON (SELECT host AS label_host, avg(load1) AS avg_load1 ...) EVERY '1 minutes'::INTERVAL
  FOR '3 minutes'::INTERVAL
  KEEP FIRING FOR '3 minutes'::INTERVAL
  LABELS (severity = 'warning')
  ANNOTATIONS (comment = 'Your computer is smoking, should take a break.')
  NOTIFY(
    WEBHOOK `alert_manager` URL `http://localhost:9093` WITH (timeout = '1m'),
  )
```

#### 查看 Trigger 详情

```sql
SELECT * FROM information_schema.triggers\G
```

输出：

```text
*************************** 1. row ***************************
   trigger_name: load1_monitor
     trigger_id: 1024
        raw_sql: (SELECT host AS label_host, avg(load1) AS avg_load1, ...)
       interval: 60
         labels: {"severity":"warning"}
    annotations: {"comment":"Your computer is smoking, should take a break."}
            for: 180
keep_firing_for: 180
       channels: [{"channel_type":{"Webhook":{"opts":{"timeout":"1m"}, ...}]
    flownode_id: 0
```

关于更多字段说明，参见 [Triggers](/reference/sql/information-schema/triggers)。

#### 查看告警实例

```sql
SELECT * FROM information_schema.alerts;
```

如果尚未写入数据，将返回空结果。


关于更多字段说明，参见 [Alerts](/reference/sql/information-schema/alerts)。

### 4. 写入数据并观察告警状态

下面的脚本模拟数据写入：先写入 1 分钟正常值，再写入 6 分钟的高值触发告警，随后
恢复到正常值。

```bash
#!/usr/bin/env bash

MYSQL="mysql -h 127.0.0.1 -P 4002"

insert_normal() {
  $MYSQL -e "INSERT INTO load1 (host, load1, ts) VALUES
    ('newyork1', 1.2, now()),
    ('newyork2', 1.1, now()),
    ('newyork3', 1.3, now());"
}

insert_high() {
  $MYSQL -e "INSERT INTO load1 (host, load1, ts) VALUES
    ('newyork1', 1.2, now()),
    ('newyork2', 12.1, now()),
    ('newyork3', 11.5, now());"
}

# 第一分钟：正常数据
for i in {1..4}; do insert_normal; sleep 15; done

# 接下来 6 分钟：高负载
for i in {1..24}; do insert_high; sleep 15; done

# 之后：恢复正常
while true; do insert_normal; sleep 15; done
```

#### 状态变迁

在另一个终端中查询告警状态：

**阶段 1：无告警**

```sql
SELECT * FROM information_schema.alerts\G
```

输出：

```
Empty set
```

**阶段 2：pending**（条件首次满足，未达 `FOR` 时长）

```sql
SELECT trigger_id, active_at, fired_at, resolved_at FROM information_schema.alerts;
```

```text
+------------+----------------------------+----------+-------------+
| trigger_id | active_at                  | fired_at | resolved_at |
+------------+----------------------------+----------+-------------+
|       1024 | 2025-12-29 11:58:20.992670 | NULL     | NULL        |
|       1024 | 2025-12-29 11:58:20.992670 | NULL     | NULL        |
+------------+----------------------------+----------+-------------+
```

**阶段 3：firing**（满足 `FOR`，开始发送通知）

```sql
SELECT trigger_id, active_at, fired_at, resolved_at FROM information_schema.alerts;
```

```text
+------------+----------------------------+----------------------------+-------------+
| trigger_id | active_at                  | fired_at                   | resolved_at |
+------------+----------------------------+----------------------------+-------------+
|       1024 | 2025-12-29 11:58:20.992670 | 2025-12-29 12:02:20.991713 | NULL        |
|       1024 | 2025-12-29 11:58:20.992670 | 2025-12-29 12:02:20.991713 | NULL        |
+------------+----------------------------+----------------------------+-------------+
```

**阶段 4：inactive**（条件不满足 + KEEP FIRING FOR 期满，发送恢复通知）

```sql
SELECT trigger_id, active_at, fired_at, resolved_at FROM information_schema.alerts;
```

```text
+------------+----------------------------+----------------------------+----------------------------+
| trigger_id | active_at                  | fired_at                   | resolved_at                |
+------------+----------------------------+----------------------------+----------------------------+
|       1024 | 2025-12-29 11:58:20.992670 | 2025-12-29 12:02:20.991713 | 2025-12-29 12:05:20.991750 |
|       1024 | 2025-12-29 11:58:20.992670 | 2025-12-29 12:02:20.991713 | 2025-12-29 12:05:20.991750 |
+------------+----------------------------+----------------------------+----------------------------+
```

### 5. 集成 Alertmanager（可选）

如果已部署 Prometheus Alertmanager，GreptimeDB 会自动将 firing 和 inactive 状态
的告警推送过去。

每次评估后，Trigger 会将查询结果中的字段注入 labels 和 annotations。本示例中，
`host` 会作为 label，`avg_load1` 会作为 annotation。这些字段会传递到 Alertmanager，
并可在通知模板中使用。

由于 payload 与 Alertmanager 兼容，你可以直接复用其分组、抑制、静默和路由能力，
无需适配器。

## Reference

- [Trigger 语法](/reference/sql/trigger-syntax.md): 与 `TRIGGER` 相关的 SQL 语句的语法细节
- [Triggers 信息模式](/reference/sql/information-schema/triggers): 关于 `Trigger` 元数据的视图
- [Alerts 信息模式](/reference/sql/information-schema/alerts): 关于告警实例元数据的视图
