---
keywords: [定时 Compaction, Compaction Cronjob, GreptimeDB 企业版, Metasrv, plugin]
description: 介绍如何在 GreptimeDB 企业版中配置定时 Compaction，并通过 Metasrv HTTP API 管理 Compaction 任务。
---

# 定时 Compaction

定时 Compaction 是 GreptimeDB 企业版功能，用于周期性地为集群中所有存在 leader 的物理 Region 提交 regular Compaction 请求。该功能运行在 leader Metasrv 上，根据 cron 表达式和 IANA 时区执行任务，并将最近的任务报告保存在 Metasrv KV backend 中。

该功能是 GreptimeDB 自动 Compaction 和[手动 Compaction](/user-guide/deployments-administration/manage-data/compaction.md)的补充。当你希望在固定的维护时间窗口内定期 Compaction 所有 Region 时，可以使用该功能。

## 配置 plugin

在 Metasrv 配置文件中添加 `compaction_cronjob` plugin：

```toml
[[plugins]]
[plugins.compaction_cronjob]
enable = true
timezone = "Asia/Shanghai"
cron = "0 0 0 * * *"
max_concurrent_regions = 4
compact_parallelism = 1
manual_trigger_cooldown_secs = 3600
max_history_jobs = 100
```

cron 表达式包含秒字段。例如，`0 0 0 * * *` 表示每天在所配置时区的午夜执行。

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `enable` | `false` | 是否启用定时 Compaction。 |
| `timezone` | 本地 IANA 时区；无法检测时使用 `UTC` | 计算 `cron` 时使用的时区，例如 `Asia/Shanghai`。 |
| `cron` | `0 0 0 * * *` | Compaction 执行计划。 |
| `max_concurrent_regions` | `4` | 单个任务并发提交 Region Compaction 请求的最大数量，必须大于 `0`。 |
| `compact_parallelism` | `1` | 传递给每个 Region Compaction 请求的并行度，必须大于 `0`。 |
| `manual_trigger_cooldown_secs` | `3600` | 人工触发与最近一次任务之间的最小间隔。最近的任务可以是定时触发或人工触发。设置为 `0` 可禁用冷却时间；该配置不会延迟定时任务。 |
| `max_history_jobs` | `100` | 后续任务完成并执行历史清理后，Metasrv KV backend 中最多保留的终态任务报告数量，必须大于 `0`。 |

只有 leader Metasrv 会运行 scheduler。leader 发生切换后，新的 leader 会继续根据所配置的 cron 表达式调度后续任务。

新的 leader 会在启动 scheduler 前，将遗留在 `running` 状态的任务标记为 `cancelled`，并输出 warning 日志。该状态变更不会取消前一个 leader 已经提交的 Region 请求。`cancelled` 是终态，会在后续任务完成时按照 `max_history_jobs` 参与历史清理。

## HTTP endpoints

该 plugin 会在 Metasrv HTTP server 上增加以下 endpoints。请将 `<metasrv-http-address>` 替换为 Metasrv 配置的 HTTP 地址。

### 触发任务

```bash
curl -X POST \
  "http://<metasrv-http-address>/admin/compaction_cronjob/trigger"
```

该请求必须发送到 leader Metasrv。请求会等待任务完成 Region Compaction 请求的提交，并返回任务报告。

- 请求发送到 follower Metasrv 时返回 `409 Conflict`。
- 人工触发距离最近一次定时或人工任务不足 `manual_trigger_cooldown_secs` 时返回 `429 Too Many Requests`。
- 其他错误返回 `500 Internal Server Error`。

### 查询指定任务

```bash
curl --get \
  --data-urlencode "job_id=2026-06-16T00:00:00+00:00" \
  "http://<metasrv-http-address>/admin/compaction_cronjob/job"
```

`job_id` 由触发任务和任务列表 endpoints 返回。它是 RFC 3339 时间戳，在请求中应进行 URL 编码。任务不存在时，该 endpoint 返回 `404 Not Found`。

### 查询最近任务

```bash
curl --get \
  --data-urlencode "limit=20" \
  "http://<metasrv-http-address>/admin/compaction_cronjob/jobs"
```

任务按计划执行时间倒序排列。可选参数 `limit` 的默认值为 `20`。

## 任务报告

触发和查询 endpoints 返回 JSON 格式的任务报告。以下是一个执行成功的任务报告：

```json
{
  "job_id": "2026-06-16T00:00:00+00:00",
  "scheduled_at": "2026-06-16T00:00:00Z",
  "started_at": "2026-06-16T00:00:00.010Z",
  "finished_at": "2026-06-16T00:00:01.010Z",
  "status": "succeeded",
  "execution_result": {
    "total_regions": 8,
    "submitted_regions": 8,
    "failed_regions": []
  }
}
```

`status` 字段的取值可以是 `"running"`、`"succeeded"`、`"partial_failed"` 或 `"cancelled"`。失败任务的 `status` 值为 `{"failed": "<reason>"}`。`execution_result` 记录尝试提交和成功提交的 Region 请求数量，以及各 Region 的提交失败信息。
