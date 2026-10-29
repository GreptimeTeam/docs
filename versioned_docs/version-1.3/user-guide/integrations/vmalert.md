---
keywords: [vmalert, VictoriaMetrics, alerting rules, recording rules, PromQL]
description: >-
  Configure vmalert to evaluate alerting and recording rules against GreptimeDB.
---

# vmalert

[vmalert](https://docs.victoriametrics.com/vmalert/) supports defining alerting
and recording rules in Prometheus-style YAML configuration. It can query
GreptimeDB through the Prometheus HTTP API to evaluate rule expressions.

When integrating vmalert with GreptimeDB, version `1.148.4` or later is recommended.

## Define rules

vmalert uses a YAML rule configuration format similar to that used by
Prometheus. See the [vmalert rule documentation][vmalert-rules] for supported
configuration options.

[vmalert-rules]: https://docs.victoriametrics.com/victoriametrics/vmalert/#rules

The following example defines an alerting rule and a recording rule that
query GreptimeDB using PromQL. It assumes that the database already contains
an `up` metric and an `http_requests_total` counter, both with a `job` label.
The alerting rule monitors targets with `job="api"`. Adjust this value to
match your `job` label.
Save the following configuration as `/etc/vmalert/greptimedb-rules.yaml`:

```yaml
groups:
  - name: greptimedb
    interval: 1m
    rules:
      - alert: InstanceDown
        expr: up{job="api"} == 0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API instance is down"

      - record: job:http_requests:rate5m
        expr: sum by (job) (rate(http_requests_total[5m]))
```

The rule group is evaluated every minute. The two rules work as follows:

- `InstanceDown`: Enters the firing state when a time series with `job="api"`
  continuously satisfies `up == 0` for 5 minutes.
- `job:http_requests:rate5m`: Calculates the average HTTP request rate over
  the past 5 minutes, summed by `job`, and writes the results to GreptimeDB
  through the remote write endpoint. The recorded metric can be used in
  traffic dashboards and alerts without repeating the rate calculation.

## Configure GreptimeDB as the data source

After creating the rule file, start vmalert with the following command. It
configures GreptimeDB as the data source for querying metrics and the remote
write endpoint for storing recording rule results:

```shell
GREPTIME_URL="http://<greptimedb-host>:4000"
vmalert \
  -rule=/etc/vmalert/greptimedb-rules.yaml \
  -datasource.url="${GREPTIME_URL}/v1/prometheus?db=public" \
  -datasource.headers='Content-Type: application/x-www-form-urlencoded' \
  -remoteWrite.url="${GREPTIME_URL}/v1/prometheus/write?db=public" \
  -remoteWrite.disablePathAppend \
  -notifier.blackhole
```

Replace `<greptimedb-host>` with your GreptimeDB host and `public` with the
database that stores your metrics. The options are:

- `-rule`: Specifies the rule file created in the previous step.
- `-datasource.url`: Sets the root path of GreptimeDB's Prometheus query API.
  The `db` parameter selects the database.
- `-datasource.headers`: Sets `Content-Type` to
  `application/x-www-form-urlencoded`, as required by GreptimeDB for query
  requests from vmalert.
- `-remoteWrite.url`: Sets GreptimeDB's remote write endpoint for storing
  recording rule results.
- `-remoteWrite.disablePathAppend`: Prevents vmalert from appending
  `/api/v1/write` to the URL, so it uses the specified
  `/v1/prometheus/write` path.
- `-notifier.blackhole`: Disables alert notifications while allowing
  alerting rules to run.

If authentication is enabled, configure vmalert to authenticate its requests to
both the data source and remote write endpoint. See
[HTTP authentication](/user-guide/protocols/http.md#authentication) for
GreptimeDB authentication methods.

The example uses `-notifier.blackhole`, so it does not send notifications.
To send notifications, remove this flag and configure a notifier such as
Alertmanager according to the
[vmalert documentation](https://docs.victoriametrics.com/vmalert/).

## Verify recording rule results

After vmalert writes the recording rule results to GreptimeDB, query them
through the Prometheus HTTP API:

```shell
curl --get "${GREPTIME_URL}/v1/prometheus/api/v1/query" \
  --data-urlencode 'db=public' \
  --data-urlencode 'query=job:http_requests:rate5m'
```

If `http_requests_total` contains enough samples in the 5-minute window for
the rule to evaluate, the query returns the recorded request rate for each
`job`, measured in requests per second.
