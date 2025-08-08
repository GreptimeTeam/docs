---
keywords: [Trigger, Alert, GreptimeDB Enterprise, Reference]
description: This reference provides detailed information about the GreptimeDB Trigger.
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

- Trigger name

    The trigger name is the unique identifier of the Trigger at the catalog level.

- IF NOT EXISTS

    Prevents an error from occurring if the Trigger exists.

### On clause

- Query expression

    The SQL query which be executed periodically. The notification will be fired
    if query result is not empty. If query result has multiple rows, a notification
    will be fired for each row.
    
    In addition, the Trigger will extract the `labels` and `annotations` from 
    the query result, and attach them to the notification message along with the
    key-value pairs specified in the `LABELS` and `ANNOTATIONS` clauses.

    The extraction rules are as follows:
    
    - Extract columns whose name or alias starts with `label_` to `LABELS`. The
        key of lables is the column name or alias without the `label_` prefix,
        and the value of labels is the column value.
    - Extract the other columns to `ANNOTATIONS`. The key of annotations is the
        column name, and the value of annotations is the column value.
    
- Interval expression
    
    The time interval at which the query expression is executed. e.g., 
    `INTERVAL '1 minute'`, `INTERVAL '1 hour'` etc.

### Labels and Annotations

The LABELS and ANNOTATIONS clauses allow you to attach static key-value pairs
to the notification messages sent by Trigger. These can be used to provide
additional context or metadata about the Trigger.
    
- LABELS: serve as labels for Alertmanager routing, grouping, and inhibition.
- ANNOTATIONS: serve as annotations, typically for human-readable descriptions.

### Notify clause

The NOTIFY clause allows you to specify one or more notification channels.

Currently, GreptimeDB supports the following notification channel:

- Webhook

    The webhook channel will send HTTP requests to a specified URL when the 
    Trigger fires. The payload of the http request is compatible with
    Prometheus Alertmanager, which means you can use GreptimeDB's Trigger with
    Prometheus Alertmanager without any extra glue code.

    The optional `WITH` clause allows you to specify additional parameters:

    - timeout: The timeout for the HTTP request.

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
