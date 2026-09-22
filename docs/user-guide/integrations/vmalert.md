---
keywords: [vmalert, VictoriaMetrics, alerting rules, recording rules, PromQL]
description: >-
  Configure vmalert to evaluate alerting and recording rules against GreptimeDB.
---

# vmalert

[vmalert](https://docs.victoriametrics.com/vmalert/) evaluates
Prometheus-compatible alerting and recording rules. You can use GreptimeDB as
its data source through the Prometheus HTTP API.

When integrating vmalert with GreptimeDB, we recommend version `1.148.4` or
later.

## Configure GreptimeDB as the data source

The following example starts vmalert with a rule file at
`/etc/vmalert/greptimedb-rules.yaml`. It configures GreptimeDB as the data
source and remote write endpoint. Create the rule file using the example in
the next section before starting vmalert:

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

- `-rule`: Specifies the rule file, shown in the next section.
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

## Define rules

vmalert uses a YAML rule configuration format similar to that used by
Prometheus. See the
[vmalert rule documentation][vmalert-rules] for supported configuration
options. For rule syntax and concepts, see the Prometheus documentation for
[alerting rules][prom-alerting] and [recording rules][prom-recording].

[vmalert-rules]: https://docs.victoriametrics.com/victoriametrics/vmalert/#rules
[prom-alerting]:
  https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/
[prom-recording]:
  https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/

The following example defines an alerting rule and a recording rule that
query GreptimeDB using PromQL. It assumes that the database already contains
an `up` metric with a `job` label. Save the following configuration as
`/etc/vmalert/greptimedb-rules.yaml`:

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

      - record: job:up:sum
        expr: sum by (job) (up)
```

Start vmalert using the command in the previous section. It evaluates both
rules in the group every minute:

- `InstanceDown`: Enters the firing state when a time series with `job="api"`
  continuously satisfies `up == 0` for 5 minutes.
- `job:up:sum`: Sums `up` by `job` and writes the results to GreptimeDB as
  the `job:up:sum` metric through the remote write endpoint.

The example uses `-notifier.blackhole`, so it does not send notifications.
To send notifications, remove this flag and configure a notifier such as
Alertmanager according to the
[vmalert documentation](https://docs.victoriametrics.com/vmalert/).

After vmalert writes the recording rule results to GreptimeDB, query them
through the Prometheus HTTP API:

```shell
curl --get "${GREPTIME_URL}/v1/prometheus/api/v1/query" \
  --data-urlencode 'db=public' \
  --data-urlencode 'query=job:up:sum'
```

If the `up` metric contains data for the rule to evaluate, the query should
return `job:up:sum` time series grouped by `job`, with each value equal to
the sum of `up` values in that group.
