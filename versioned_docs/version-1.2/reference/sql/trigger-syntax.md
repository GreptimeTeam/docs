---
keywords: [Trigger, Alert, GreptimeDB Enterprise, Syntax]
description: This document provides more details about the GreptimeDB Trigger.
---

# Trigger Syntax

:::tip NOTE

This feature is only available in the GreptimeDB Enterprise database.

:::


## CREATE TRIGGER

The syntax for creating a Trigger:

```sql
CREATE TRIGGER [IF NOT EXISTS] <trigger_name>
        ON (<query_expression>) EVERY <interval_expression>
        [LABELS (<label_name>=<label_val>, ...)]
        [ANNOTATIONS (<annotation_name>=<annotation_val>, ...)]
        [FOR <interval_expression>]
        [KEEP FIRING FOR <interval_expression>]
        NOTIFY (
                WEBHOOK <notify_name1> URL '<url1>' [WITH (<parameter1>=<value1>, ...)],
                WEBHOOK <notify_name2> URL '<url2>' [WITH (<parameter2>=<value2>, ...)]
        );
```

- Trigger name: the unique identifier of the Trigger at the catalog level.
- IF NOT EXISTS: prevent errors that would occur if the Trigger being created.

### On clause

#### Query expression

The SQL query specified in the `ON` clause is executed periodically. Its evaluation
result may produce one or more alert instances, depending on the returned rows.

The Trigger extracts `labels` and `annotations` from the query result and attaches
them to each alert instance. These values are combined with the static key-value
pairs specified in the `LABELS` and `ANNOTATIONS` clauses.

The extraction rules are as follows:

- Extract columns whose name or alias starts with `label_` to `LABELS`. The key
    of labels is the column name or alias without the `label_` prefix.
- Extract the other columns to `ANNOTATIONS`. The key of annotations is the
    column name.
    
It is worth noting that each alert instance is uniquely identified by its label
set. Multiple rows with the same labels will only create a single alert instance.

For example, the query expression is as follows:

```sql
SELECT collect as label_collector, host as label_host, val
    FROM host_load1
    WHERE val > 10 and ts >= now() - '1 minutes'::INTERVAL
```

Assume the query result is not empty and looks like this:

| label_collector  | label_host | val |
|------------------|------------|-----|
| collector1       | host1      | 12  |
| collector2       | host2      | 15  |

This will generate two alert instances.

The first alert instance will have the following labels and annotations:

- Labels:
    - collector: collector1
    - host: host1
    - the labels defined in the `LABELS` clause
- Annotations:
    - val: 12
    - the annotations defined in the `ANNOTATIONS` clause

The second alert instance will have the following labels and annotations:

- Labels:
    - collector: collector2
    - host: host2
    - the labels defined in the `LABELS` clause
- Annotations:
    - val: 15
    - the annotations defined in the `ANNOTATIONS` clause
        
#### Interval expression

It indicates how often the query is executed. e.g., `'5 minute'::INTERVAL`,
`'1 hour'::INTERVAL` etc.

- `Years` and `months` are **prohibited** in INTERVAL expressions. Because the
    duration of a month or year is variable and depends on the specific month 
    or year, it is not suitable for defining fixed intervals.
- The minimum interval is 1 second. Any interval specified less than 1 second 
    will be automatically rounded up to 1 second.

For more details about how to write INTERVAL time, see [interval-type](/reference/sql/data-types.md#interval-type).

### FOR clause

The `FOR` clause controls how long an alert must remain active before it fires.
Its behavior is similar to the `for` option in Prometheus Alerting Rules.

When an alert instance appears in the evaluation results for the first time, it
enters the `Pending` state, during which no notification is sent. If the alert 
instance remains active throughout every evaluation within the duration specified
by `FOR`, its state transitions from `Pending` to `Firing`, and a notification
is sent immediately.

If the `FOR` clause is not specified, the alert will not enter the `Pending`
state. Instead, an alert instance transitions to the `Firing` state immediately
upon its first appearance in the evaluation results, and a notification is sent
immediately.

### KEEP FIRING FOR clause

The `KEEP FIRING FOR` clause controls how long an alert instance should remain
in the `Firing` state after it first enters that state. Its behavior is similar
to the `keep_firing_for` option in Prometheus Alerting Rules.

Once an alert instance enters the `Firing` state, it will remain firing for at
least the duration specified by `KEEP FIRING FOR`, even if it no longer appears
in subsequent evaluation results.

After the `KEEP FIRING FOR` duration has passed, if the alert instance does not
appear in the next evaluation, it will be marked as resolved and will no longer
remain in the `Firing` state.

If the `KEEP FIRING FOR` clause is not specified, an alert instance will be 
marked as resolved in the first evaluation where it no longer appears in the
query results after entering the `Firing` state.

### Labels and Annotations clauses

The LABELS and ANNOTATIONS clauses allow you to attach static key-value pairs
to the notification messages sent by Trigger. These can be used to provide
additional context or metadata about the Trigger.

- LABELS: serve as labels for Alertmanager routing, grouping, and inhibition.
- ANNOTATIONS: typically for human-readable descriptions.

### Notify clause

The NOTIFY clause allows you to specify one or more notification channels.

Currently, GreptimeDB supports the following notification channel:

#### Webhook

The webhook channel will send HTTP requests to a specified URL when the Trigger
fires. The payload of the http request is compatible with
[Prometheus Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/),
which means you can use GreptimeDB's Trigger with Prometheus Alertmanager
without any extra glue code.

The optional `WITH` clause allows you to specify additional parameters:

- timeout: The timeout for the HTTP request, e.g., `timeout='1m'`.

## SHOW TRIGGERS

Show all triggers:

```sql
SHOW TRIGGERS;
```

Show triggers by `like` pattern:

```sql
SHOW TRIGGERS LIKE '<pattern>';
```

For example:

```sql
SHOW TRIGGERS LIKE 'load%';
```

Show triggers by `where` condition:

```sql
SHOW TRIGGERS WHERE <condition>;
```

For example:

```sql
SHOW TRIGGERS WHERE name = 'load1_monitor';
```

## SHOW CREATE TRIGGER

To show the Trigger's definition:

```sql
SHOW CREATE TRIGGER <trigger-name>;
```

For example:

```sql
SHOW CREATE TRIGGER load1_monitor;
```

## DROP TRIGGER

To delete a trigger, use the following `DROP TRIGGER` clause:

```sql
DROP TRIGGER [IF EXISTS] <trigger-name>;
```

For example:

```sql
DROP TRIGGER IF EXISTS load1_monitor;
```

## Example

Please refer to the [Trigger](/enterprise/trigger.md) documentation in the enterprise user guide for examples.
