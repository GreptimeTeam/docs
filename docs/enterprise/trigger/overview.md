---
keywords: [Trigger, Alert, GreptimeDB Enterprise, SQL, Webhook, Alertmanager, Slack]
description: This guide demonstrates how GreptimeDB Triggers enable seamless integration with the Prometheus Alertmanager ecosystem for comprehensive monitoring and alerting.
---

# Trigger

Trigger allows users to define evaluation rules with SQL.
GreptimeDB evaluates these rules periodically; once the condition is met, a
notification is sent out.

## Quick Start Example

### Overview

This section walks through a end-to-end example that uses Trigger to monitor
system load and raise an alert.

The diagram illustrates the complete end-to-end workflow of the example.

![Trigger demo architecture](/trigger-demo-architecture.png)

1. Vector continuously scrapes host metrics and writes it to GreptimeDB.
2. A Trigger in GreptimeDB evaluates the rule `load1 > 10` every minute; whenever
    the condition is met, it sends a notification to Alertmanager.
3. Alertmanager applies its own policies and finally delivers the alert to Slack.

> The payload of GreptimeDB Trigger's Webhook is compatible with Prometheus
Alertmanager, so we can reuse Alertmanager’s grouping, inhibition, silencing and
routing features without any extra glue code.

### Prerequisites

Use Vector to scrapes host metrics and write it to GreptimeDB. Below is a Vector
configuration example:

```toml
[sources.in]
type = "host_metrics"
scrape_interval_secs = 15

[sinks.out]
inputs = ["in"]
type = "greptimedb"
endpoint = "localhost:4001"
```

GreptimeDB auto-creates tables on the first write. The resulting `host_load1`
table stores the load1 metrics; its schema is shown below:

```sql
+-----------+----------------------+------+------+---------+---------------+
| Column    | Type                 | Key  | Null | Default | Semantic Type |
+-----------+----------------------+------+------+---------+---------------+
| ts        | TimestampMillisecond | PRI  | NO   |         | TIMESTAMP     |
| collector | String               | PRI  | YES  |         | TAG           |
| host      | String               | PRI  | YES  |         | TAG           |
| val       | Float64              |      | YES  |         | FIELD         |
+-----------+----------------------+------+------+---------+---------------+
```

> "load1" refers to the load average of the Linux system over the past minute.
It is one of the key performance indicators for measuring how busy the system is.

Set up Alertmanager with a Slack receiver. Below is a minimal message template
you can use:

```text
{{ define "slack.text" }}

Alert: {{ .CommonLabels.alertname }} (Status: {{ .CommonLabels.status }})
Severity: {{ .CommonLabels.severity }}

Annotations:
{{ range .CommonAnnotations.SortedPairs }}
- {{ .Name }}: {{ .Value }}
{{ end }}

Labels:
{{ range .CommonLabels.SortedPairs }}
- {{ .Name }}: {{ .Value }}
{{ end }}

{{ end }}
```

Start Alertmanager once the configuration is ready.


### Demo

Create the Trigger in GreptimeDB.
Connect to GreptimeDB with MySql client and run the following SQL:

```sql
CREATE TRIGGER IF NOT EXISTS load1_monitor
        ON (
                SELECT collector AS label_collector, 
                host as label_host, 
                val 
                FROM host_load1 WHERE val > 10 and ts >= now() - '1 minutes'::INTERVAL
                ) EVERY '1 minute'::INTERVAL
        LABELS (severity=warning)
        ANNOTATIONS (comment='Your computer is smoking, should take a break.')
        NOTIFY(
                WEBHOOK alert_manager URL 'http://127.0.0.1localhost:9093' WITH (timeout="1m")
        );
```

The above SQL will create a trigger named `load1_monitor` that runs every minute.
It evaluates the last 60 seconds of data in host_load1; if any load1 value 
exceeds 10, it sends a notification to Alertmanager.

Execute `SHOW TRIGGERS` to view the list of created Triggers.

```sql
SHOW TRIGGERS;
```

The output should look like this:

```text
+---------------+
| Triggers      |
+---------------+
| load1_monitor |
+---------------+
```

Use stress-ng to simulate high CPU load for 60 s:

```bash
stress-ng --cpu 100 --cpu-load 10 --timeout 60
```

The load1 will rise quickly, the notify of Trigger will fire, and within a minute
Slack channel will receive an alert like:

![Trigger slack alert](/trigger-slack-alert.png)
