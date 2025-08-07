---
keywords: [key logs, error logs, operational logs, GreptimeDB logs]
description: Understand GreptimeDB's operational status and troubleshoot errors through key logs.
---

# Key Logs

During operation, GreptimeDB outputs key operations and unexpected error information to logs.
You can use these logs to understand GreptimeDB's operational status and troubleshoot errors.

## GreptimeDB Operational Logs

Refer to the [important logs](/user-guide/deployments-administration/monitoring/key-logs.md) outlined in the GreptimeDB OSS documentation for recommended monitoring practices.

## License Expiration Logs

For the Enterprise Edition of GreptimeDB,
it is crucial to monitor license expiration logs to ensure uninterrupted access to enterprise features.
When the license expires,
the metasrv component will generate the following warning log.
Promptly contact GreptimeDB to renew your license:

```bash
License is expired at xxx, please contact your GreptimeDB vendor to renew it
```

