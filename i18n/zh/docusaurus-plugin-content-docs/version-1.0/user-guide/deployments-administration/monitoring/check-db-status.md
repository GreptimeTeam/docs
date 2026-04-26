---
keywords: [GreptimeDB 健康检查, GreptimeDB 运行状态, GreptimeDB 部署状态, GreptimeDB 运行指标]
description: 通过 HTTP 接口检查 GreptimeDB 的健康状态、部署状态和运行指标。
---

# 检查 GreptimeDB 状态

GreptimeDB 包含了一系列的 HTTP 接口可供查询 GreptimeDB 的运行情况。
以下发起的 HTTP 请求均假定 GreptimeDB 运行在节点 `127.0.0.1` 上，其 HTTP 服务监听默认的 `4000` 端口。

## 查看 GreptimeDB 是否正常运行：

你可以使用 `/health` 接口检查 GreptimeDB 是否正常运行。
HTTP 状态码 `200 OK` 表示 GreptimeDB 运行正常。

例子：

```bash
curl -i -X GET http://127.0.0.1:4000/health
```

输出：

```text
HTTP/1.1 200 OK
content-type: application/json
vary: origin, access-control-request-method, access-control-request-headers
access-control-allow-origin: *
content-length: 2
date: Sun, 26 Apr 2026 13:46:41 GMT

{}
```

有关健康检查接口的更多信息，请参考[健康检查接口](/reference/http-endpoints.md#健康检查)。

## 查看 GreptimeDB 的部署状态

你可以使用 `/status` 接口检查 GreptimeDB 的部署状态。

```bash
curl -X GET http://127.0.0.1:4000/status | jq
```

输出：

```json
{
  "commit": "8d2f92c01ae762287a3cac587156519a536ae134",
  "branch": "",
  "rustc_version": "rustc 1.96.0-nightly (ac7f9ec7d 2026-03-20)",
  "hostname": "127.0.0.1",
  "version": "1.0.1"
}
```

有关状态接口的更多信息，请参考[状态接口](/reference/http-endpoints.md#状态)。

