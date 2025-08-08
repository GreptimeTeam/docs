---
keywords: [Trigger, Alert, GreptimeDB Enterprise, Syntax]
description: This document provides more details about the GreptimeDB Trigger.
---

# Syntax

## Create Trigger

The syntax for creating a Trigger:

```sql
CREATE TRIGGER [IF NOT EXISTS] <trigger_name>
        ON (<query_expression>) EVERY <interval_expression>
        [LABELS (<label_name>=<label_val>, ...)]
        [ANNOTATIONS (<annotation_name>=<annotation_val>, ...)]
        NOTIFY (
                WEBHOOK <notify_name1> URL '<url1>' [WITH (<parameter1>=<value1>, ...)],
                WEBHOOK <notify_name2> URL '<url2>' [WITH (<parameter2>=<value2>, ...)]
        );
```

### Trigger name

- Trigger name: the unique identifier of the Trigger at the catalog level.
- IF NOT EXISTS: prevents an error from occurring if the Trigger exists.

### On clause

#### Query expression

The SQL query which be executed periodically. The notification will be fired
if query result is not empty. If query result has multiple rows, a notification
will be fired for each row.

In addition, the Trigger will extract the `labels` and `annotations` from the
query result, and attach them to the notification message along with the key-value
pairs specified in the `LABELS` and `ANNOTATIONS` clauses.

The extraction rules are as follows:

- Extract columns whose name or alias starts with `label_` to `LABELS`. The key
    of labels is the column name or alias without the `label_` prefix.
- Extract the other columns to `ANNOTATIONS`. The key of annotations is the
    column name.

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

This will generate two notifications.

The first notification will have the following labels and annotations:

- Labels:
    - collector: collector1
    - host: host1
    - the labels defined in the `LABELS` clause
- Annotations:
    - val: 12
    - the annotations defined in the `ANNOTATIONS` clause

The second notification will have the following labels and annotations:

- Labels:
    - collector: collector2
    - host: host2
    - the labels defined in the `LABELS` clause
- Annotations:
    - val: 15
    - the annotations defined in the `ANNOTATIONS` clause
        
#### Interval expression

It indicates how often the query is executed. e.g., `'5 minute'::INTERVAL`,
`'1 hour'::INTERVAL` etc. For more details, see [interval-type](../../reference/sql/data-types.md#interval-type).

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

## Show Triggers

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

## Drop Trigger

To delete a trigger, use the following `DROP TRIGGER` clause:

```sql
DROP TRIGGER [IF EXISTS] <trigger-name>;
```

For example:

```sql
DROP TRIGGER IF EXISTS load1_monitor;
```
