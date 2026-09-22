---
keywords: [vmalert, VictoriaMetrics, alerting rules, 记录规则, PromQL]
description: >-
  配置 vmalert 以 GreptimeDB 为数据源执行 alerting rules 和 recording rules。
---

# vmalert

[vmalert](https://docs.victoriametrics.com/vmalert/) 支持使用 Prometheus 风格的
YAML 配置定义 alerting rules 和 recording rules，并通过 Prometheus HTTP API
查询 GreptimeDB，以评估规则表达式。

将 vmalert 与 GreptimeDB 集成时，我们推荐使用 `1.148.4` 或更高版本。

## 将 GreptimeDB 配置为数据源

以下示例使用 `/etc/vmalert/greptimedb-rules.yaml` 作为规则文件启动 vmalert，
并将 GreptimeDB 配置为数据源和远程写入端点。启动前，请先按照下一节的示例
创建规则文件：

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

将 `<greptimedb-host>` 替换为 GreptimeDB 的主机地址，将 `public` 替换为实际存储
指标的数据库。各参数说明如下：

- `-rule`：指定规则文件，示例内容见下一节。
- `-datasource.url`：指定 GreptimeDB 的 Prometheus 查询接口根路径，通过
  `db` 参数选择数据库。
- `-datasource.headers`：GreptimeDB 要求 vmalert 的查询请求将 `Content-Type`
  设置为 `application/x-www-form-urlencoded`。
- `-remoteWrite.url`：指定 GreptimeDB 的远程写入端点，用于保存
  recording rules（记录规则）的计算结果。
- `-remoteWrite.disablePathAppend`：禁止 vmalert 自动追加 `/api/v1/write`，
  使其使用上面指定的 `/v1/prometheus/write` 路径。
- `-notifier.blackhole`：执行 alerting rules，但不发送通知。

如果启用了鉴权，需要为 vmalert 配置数据源和远程写入端点的认证信息。有关
GreptimeDB 支持的鉴权方式，请参阅
[HTTP 鉴权](/user-guide/protocols/http.md#authentication)。

## 定义规则

vmalert 使用与 Prometheus 类似的 YAML 规则配置格式。支持的配置选项请参阅
[vmalert 官方规则文档][vmalert-rules]。规则语法和相关概念也可参考 Prometheus 的
[alerting rules][prom-alerting] 和 [recording rules][prom-recording] 官方文档。

[vmalert-rules]: https://docs.victoriametrics.com/victoriametrics/vmalert/#rules
[prom-alerting]:
  https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/
[prom-recording]:
  https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/

以下示例包含一条 alerting rule 和一条 recording rule，均使用 PromQL
表达式查询 GreptimeDB。示例假设数据库中已有 `up` 指标和
`http_requests_total` counter 指标，且两者均包含 `job` 标签。
其中 alerting rule 监控 `job="api"` 的目标，请按实际的 `job` 标签值调整。
将以下内容保存为 `/etc/vmalert/greptimedb-rules.yaml`：

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

使用上一节的命令启动 vmalert 后，它会每分钟执行一次规则组中的两条规则：

- `InstanceDown`：当某条 `job="api"` 的时间序列持续满足 `up == 0` 达到
  5 分钟时，告警进入 firing 状态。
- `job:http_requests:rate5m`：计算过去 5 分钟的平均 HTTP 请求速率，按 `job`
  汇总后通过远程写入端点保存到 GreptimeDB。该指标可用于流量仪表盘和告警，
  无需重复计算请求速率。

示例使用 `-notifier.blackhole`，因此不会发送告警通知。如需发送通知，请移除
该参数，并参考 [vmalert 文档](https://docs.victoriametrics.com/vmalert/)
配置 Alertmanager 等通知器。

等待 recording rule 执行并完成写入后，可通过 GreptimeDB 的 Prometheus
HTTP API 查询结果：

```shell
curl --get "${GREPTIME_URL}/v1/prometheus/api/v1/query" \
  --data-urlencode 'db=public' \
  --data-urlencode 'query=job:http_requests:rate5m'
```

当 `http_requests_total` 在 5 分钟窗口内包含足够的样本供规则计算时，
查询结果会返回每个 `job` 已记录的请求速率，单位为每秒请求数。
