---
name: greptimedb-trigger
description: "[Enterprise only] Guide for creating GreptimeDB Triggers — periodic evaluation rules (SQL or TQL/PromQL via TQL EVAL) that fire Alertmanager-compatible webhooks when conditions are met. Use as an alternative to Prometheus alerting rules, or to host existing PromQL alerts on GreptimeDB. Triggers on phrases like \"create trigger\", \"alerting rule\", \"告警规则\", \"trigger webhook\", \"alertmanager 对接\", \"migrate prometheus alerts\", \"promql alert\"."
---

# GreptimeDB Trigger Guide

> **Enterprise only.** Triggers are available only in GreptimeDB Enterprise.
> For open-source deployments, fall back to Prometheus Alertmanager or an
> external scheduler.

Create GreptimeDB trigger definition as an alternative to Prometheus alerting
rules. A trigger periodically runs a query — a SQL `SELECT` or a `TQL EVAL`
block wrapping a PromQL expression — and turns each result row into an alert
instance. Most concepts from Prometheus alerting rules map directly onto
trigger DDL, and existing PromQL rules can be hosted as-is through TQL EVAL.

## The workflow

To create a GreptimeDB trigger, we should follow these phases:

### Phase 1. Understanding GreptimeDB Trigger

First, we should read the trigger reference from the documentation.

There are pages available, use WebFetch to load and understand them:

1. High-level overview and a worked example
   https://docs.greptime.com/enterprise/trigger/
2. Full trigger syntax reference
   https://docs.greptime.com/reference/sql/trigger-syntax/

### Phase 2. Syntax essentials

The `ON` clause accepts either:

- a plain SQL `SELECT` (typical for GreptimeDB-native queries), or
- a **`TQL EVAL` expression** that embeds a PromQL-style query — this is
  the migration path for users porting Prometheus alerting rules.

TQL EVAL syntax inside `ON`:

```
ON (TQL EVAL (<start>, <end>, <step>[, <lookback>]) <promql_expression>)
```

See the [TQL reference](https://docs.greptime.com/reference/sql/tql/) for
the `start` / `end` / `step` semantics.

Example:

```sql
CREATE TRIGGER cpu_monitor
ON (
    TQL EVAL (now() - '5 minutes'::interval, now(), '1m')
    avg_over_time(cpu_usage_total[1m])
) EVERY '1 minute'::INTERVAL
NOTIFY (
    WEBHOOK alert_manager URL 'http://127.0.0.1:9093' WITH (timeout='1m')
);
```

When the user starts from a PromQL alert rule, **keep it as TQL EVAL** —
do not rewrite it to SQL aggregation just to fit the trigger. For cases
where the rule is natively SQL, write a regular `SELECT` with a time
window filter (e.g. `WHERE ts >= NOW() - '1 minutes'::INTERVAL`) and
`GROUP BY` for per-series evaluation.

Skeleton:

```sql
CREATE TRIGGER [IF NOT EXISTS] <trigger_name>
  ON (<SELECT ...>) EVERY <interval>
  [LABELS (<k>=<v>, ...)]
  [ANNOTATIONS (<k>=<v>, ...)]
  [FOR <interval>]
  [KEEP FIRING FOR <interval>]
  NOTIFY (
    WEBHOOK <notify_name> URL '<url>' [WITH (<k>=<v>, ...)]
  );
```

Key clauses:

- **`ON (<SELECT>) EVERY <interval>`** — the query runs on the given
  cadence. Each returned row produces one alert instance, keyed by its
  label set. Columns whose name or alias starts with `label_` are extracted
  as **dynamic labels** (the `label_` prefix is stripped); all other
  columns become **annotations**. Rows with the same label set collapse
  into a single alert.
- **`LABELS (...)`** — static labels merged into every alert instance.
  These are what Alertmanager routes / groups / silences on.
- **`ANNOTATIONS (...)`** — static annotations for human-readable context.
- **`FOR <interval>`** — how long the condition must keep matching before
  the alert transitions from `Pending` to `Firing` (and fires a
  notification). Without `FOR`, an alert fires on first appearance.
- **`KEEP FIRING FOR <interval>`** — sets a minimum firing duration. Once an
  alert enters `Firing`, it remains firing for at least this long, even if
  the condition later stops matching. After that duration has elapsed, it
  can be marked resolved on a subsequent evaluation where the condition is
  absent.
- **`NOTIFY (WEBHOOK ...)`** — currently only the `WEBHOOK` channel is
  supported, with an optional `WITH (timeout='1m')` parameter. Payload is
  compatible with Prometheus Alertmanager, so an existing Alertmanager can
  receive trigger alerts without glue code.

Interval notes: `INTERVAL` expressions may not use `years` or `months`
(variable-length). Minimum granularity is 1 second.

Worked SQL example:

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
  NOTIFY (
    WEBHOOK alert_manager URL 'http://localhost:9093' WITH (timeout='1m')
  );
```

Lifecycle: `SHOW TRIGGERS [LIKE ... | WHERE ...]`, `SHOW CREATE TRIGGER <name>`,
`DROP TRIGGER [IF EXISTS] <name>`.

### Phase 3. Configure webhook for trigger

Return a complete `CREATE TRIGGER` SQL statement. If the user did not
provide webhook details, use a placeholder Alertmanager URL (e.g.
`http://localhost:9093`) and tell them what to swap in.

If the user already runs a Prometheus Alertmanager, point the trigger
webhook at the same Alertmanager — the alert payload is Alertmanager-native,
so routing / grouping / inhibition / silencing all work unchanged.

## Reference

### Prometheus Alertmanager

Alertmanager is typically configured in `prometheus.yml` like this:

```yaml
# Alerting specifies settings related to the Alertmanager
alerting:
  alertmanagers:
    - static_configs:
      - targets:
        # Alertmanager's default port is 9093
        - localhost:9093
```

We can use this target as our webhook destination.

### Step-by-step guide

https://greptime.com/blogs/2025-12-23-trigger-quick-start
