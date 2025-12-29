---
keywords: [Trigger, GreptimeDB Enterprise, SQL, Webhook]
description: The overview of GreptimeDB Trigger.
---

# Trigger

Trigger allows you to define evaluation rules with SQL.
GreptimeDB evaluates these rules periodically; once the condition is met, a
notification is sent out.

## Key Features

- **SQL-native**: Define trigger rules in SQL, reusing GreptimeDB's built-in
    functions without a learning curve.
- **Multi-stage** state management: Built-in pending / firing / inactive state
    machine prevents flapping and duplicate notifications.
- **Rich context**: Custom labels and annotations with automatic injection of
    query result fields to pinpoint root causes.
- **Ecosystem-friendly**: Alert payload fully compatible with Prometheus 
    Alertmanager—use its grouping, inhibition, silencing, and routing without
    glue code.

## Quick Start Example

This guide walks through an end-to-end alerting scenario: monitor system load
(`load1`) and fire alerts when load exceeds a threshold.

In this quick start, you will:

- Create a `load1` table to store host load metrics
- Define a Trigger with conditions, labels, annotations, and notifications
- Simulate data ingestion with normal and abnormal values
- Watch alerts transition through PENDING → FIRING → INACTIVE

### 1. Create the Data Table

Connect to GreptimeDB with a MySQL client and create the `load1` table:

```sql
CREATE TABLE `load1` (
    host            STRING,
    load1           FLOAT32,
    ts              TIMESTAMP TIME INDEX
) WITH ('append_mode'='true');
```

### 2. Create Trigger

Connect to GreptimeDB with MySQL client and create the `load1_monitor` trigger:

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

This Trigger runs every minute, computes average load per host over the last
60 seconds, and produces an alert instance for each host where `avg(load1) > 10`.

Key parameters:

- **FOR**: Specifies how long the condition must continuously hold before an
    alert instance is emitted.
- **KEEP FIRING FOR**: Specifies how long an alert instance continues to be
    emitted after the condition no longer holds.

See the [trigger syntax](https://docs.greptime.com/reference/sql/trigger-syntax/)
for more detail.

### 3. Check Trigger Status

#### List all Triggers

```sql
SHOW TRIGGERS;
```

Output:

```text
+---------------+
| Triggers      |
+---------------+
| load1_monitor |
+---------------+
```

#### View the creation statement

```sql
SHOW CREATE TRIGGER `load1_monitor`\G
```

Output:

```text
*************************** 1. row ***************************
       Trigger: load1_monitor
Create Trigger: CREATE TRIGGER IF NOT EXISTS `load1_monitor`
  ON (SELECT host AS label_host, avg(load1) AS avg_load1 AS ts ...) EVERY '1 minutes'::INTERVAL
  FOR '3 minutes'::INTERVAL
  KEEP FIRING FOR '3 minutes'::INTERVAL
  LABELS (severity = 'warning')
  ANNOTATIONS (comment = 'Your computer is smoking, should take a break.')
  NOTIFY(
    WEBHOOK `alert_manager` URL `http://localhost:9093` WITH (timeout = '1m'),
  )
```

#### View Trigger details

```sql
SELECT * FROM information_schema.triggers\G
```

Output:

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

All time-related fields are expressed in seconds. For more information about
the `information_schema.triggers` table, please refer to [Trigger Syntax](https://docs.greptime.com/reference/sql/information-schema/triggers/).

#### View alert instances

```sql
SELECT * FROM information_schema.alerts;
```

With no data written yet, this returns an empty set.

For more information about the `information_schema.alerts` table, please refer
to [Alerts Information Schema](https://docs.greptime.com/reference/sql/information-schema/alerts/).

### 4. Write Data and Observe Alert States

This script simulates data ingestion: normal values for the first minute, high
values for 6 minutes to trigger alerts, then back to normal.

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

# First minute: normal data
for i in {1..4}; do insert_normal; sleep 15; done

# Next 6 minutes: high values
for i in {1..24}; do insert_high; sleep 15; done

# After: back to normal
while true; do insert_normal; sleep 15; done
```
In another terminal, query alert status:

```sql
SELECT * FROM information_schema.alerts\G
```

#### State Transitions

**Phase 1: No alerts**

```sql
SELECT * FROM information_schema.alerts\G
```

Output:

```
Empty set
```

**Phase 2: PENDING** (condition met, `FOR` duration not reached)

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

**Phase 3: FIRING** (`FOR` satisfied, notifications sent)

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

**Phase 4: INACTIVE** (condition cleared + `KEEP FIRING FOR` expired)

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

### 5. Alertmanager Integration (Optional)

If you have Prometheus Alertmanager deployed, GreptimeDB automatically pushes
firing and inactive alerts to it.

After each evaluation, the Trigger injects query result fields into labels and
annotations. In this example, `avg_load1` appears in annotations—reference it
in Alertmanager notification templates to include hostname, load values, and
other context.

Since the payload is Alertmanager-compatible, you can use grouping, inhibition,
silencing, and routing without adapters.

## Reference

- [Syntax](/reference/sql/trigger-syntax.md): The syntax for SQL statements
related to `TRIGGER`.

