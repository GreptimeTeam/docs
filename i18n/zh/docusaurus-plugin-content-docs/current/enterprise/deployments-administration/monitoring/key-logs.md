---
keywords: [关键日志, 错误日志, 运维日志, GreptimeDB 日志]
description: 通过关键日志了解 GreptimeDB 的运行情况，以及排查错误出现的原因。
---

# 运维关键日志

GreptimeDB 在运行过程中，会将一些关键的操作以及预期外的错误信息输出到日志中。
你可以通过这些日志了解 GreptimeDB 的运行情况，以及排查错误出现的原因。

## GreptimeDB 运维日志

请参考 GreptimeDB OSS 文档中的[重要日志](/user-guide/deployments-administration/monitoring/key-logs.md)部分。

## License 过期

对于 GreptimeDB 的企业版，建议监控 license 的到期日志以确保不间断使用企业版功能。
企业版的 license 过期时，metasrv 会打印如下 warning 日志，
这时需要及时联系 Greptime 获取新的 license

```bash
License is expired at xxx, please contact your GreptimeDB vendor to renew it
```

