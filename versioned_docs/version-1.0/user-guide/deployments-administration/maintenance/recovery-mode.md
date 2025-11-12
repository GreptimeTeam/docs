---
keywords: [GreptimeDB, recovery mode, metasrv, maintenance]
description: Guide for using GreptimeDB cluster recovery mode to address datanode startup failures and recover from region data loss or corruption.
---

# Cluster Recovery Mode

Recovery mode is a safety feature in GreptimeDB that allows developers to manually recover the cluster from a failed state.

## When to Use Recovery Mode

Recovery mode is particularly useful when the Datanode fails to start due to an "Empty region directory" error, often caused by:
- Data corruption (Missing region data directory)
- Recover the cluster from a metadata snapshot.

## Recovery Mode Management

Recovery mode can be enabled and disabled through Metasrv's HTTP interface at: `http://{METASRV}:{HTTP_PORT}/admin/recovery/enable` and `http://{METASRV}:{HTTP_PORT}/admin/recovery/disable`. Note that this interface listens on Metasrv's `HTTP_PORT`, which defaults to `4000`.

### Enable Recovery Mode

Enable recovery mode by sending a POST request to the `/admin/recovery/enable` endpoint. 


```bash
curl -X POST 'http://localhost:4000/admin/recovery/enable'
```

The expected output is:
```bash
{"enabled":true}
```

### Disable Recovery Mode

Disable recovery mode by sending a POST request to the `/admin/recovery/disable` endpoint.

```bash
curl -X POST 'http://localhost:4000/admin/recovery/disable'
```

The expected output is:
```bash
{"enabled":false}
```

### Check Recovery Mode Status

Check recovery mode status by sending a GET request to the `/admin/recovery/status` endpoint.

```bash
curl -X GET 'http://localhost:4000/admin/recovery/status'
```

The expected output is:
```bash
{"enabled":false}
```