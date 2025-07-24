---
keywords: [GreptimeDB health check, GreptimeDB status, GreptimeDB deployment status, GreptimeDB metrics]
description: Check GreptimeDB health status, deployment status, and runtime metrics through HTTP endpoints.
---

# Check GreptimeDB Status

GreptimeDB provides a series of HTTP endpoints to query the operational status of GreptimeDB.
The following HTTP requests assume that GreptimeDB is running on node `127.0.0.1` with the HTTP service listening on the default port `4000`.

## Check if GreptimeDB is running normally

You can use the `/health` endpoint to check if GreptimeDB is running normally.
An HTTP status code `200 OK` indicates that GreptimeDB is running normally.

Example:

```bash
curl -i -X GET http://127.0.0.1:4000/health
HTTP/1.1 200 OK
content-type: application/json
content-length: 2
date: Tue, 31 Dec 2024 02:15:22 GMT

{}
```

For more information about the health check endpoint, please refer to [the Health endpoint](/reference/http-endpoints.md#health-check).

## Check GreptimeDB status

You can use the `/status` endpoint to check the deployment status of GreptimeDB.

```bash
curl -X GET http://127.0.0.1:4000/status | jq

{
  "source_time": "2024-12-27T07:57:47Z",
  "commit": "b4bd34c530d62b95346a26a9470c03b9f6fb15c8",
  "branch": "main",
  "rustc_version": "rustc 1.84.0-nightly (e92993dbb 2024-10-18)",
  "hostname": "127.0.0.1",
  "version": "0.12.0"
}
```

Please refer to [the Status endpoint](/reference/http-endpoints.md#status) for more details.

