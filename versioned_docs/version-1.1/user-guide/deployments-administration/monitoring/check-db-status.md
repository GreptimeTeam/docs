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
```

Output:

```text
HTTP/1.1 200 OK
content-type: application/json
vary: origin, access-control-request-method, access-control-request-headers
access-control-allow-origin: *
content-length: 2
date: Sun, 26 Apr 2026 13:46:41 GMT

{}
```

For more information about the health check endpoint, please refer to [the Health endpoint](/reference/http-endpoints.md#health-check).

## Check GreptimeDB status

You can use the `/status` endpoint to check the deployment status of GreptimeDB.

```bash
curl -X GET http://127.0.0.1:4000/status | jq
```

Output:

```json
{
  "commit": "8d2f92c01ae762287a3cac587156519a536ae134",
  "branch": "",
  "rustc_version": "rustc 1.96.0-nightly (ac7f9ec7d 2026-03-20)",
  "hostname": "127.0.0.1",
  "version": "1.0.1"
}
```

Please refer to [the Status endpoint](/reference/http-endpoints.md#status) for more details.
