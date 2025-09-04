---
keywords: [账单, 发票, 用量跟踪, 费用计算, GreptimeCloud]
description: 介绍 GreptimeCloud 的账单生成、用量跟踪和费用计算方法。
---

# 账单

## 发票

GreptimeCloud 中的每个 Service 都属于一个团队。
你可以在团队设置中的 [billing](https://console.greptime.cloud/settings/team#billing) 仪表板下为团队添加付款方式。
GreptimeCloud 按自然月收费并生成发票。

## 用量跟踪

当前账单周期中的详细用量报告可以在 [billing](https://console.greptime.cloud/settings/team#billing) 中找到，其中包括以下项目：

- Serverless 计划：
  - 所有 Serverless Service 设定的请求容量单位（RCU 和 WCU）之和。
  - 所有 Serverless Service 使用的存储容量之和。
- Dedicated 计划：
  - 所有 Dedicated service 配置的专用实例数量。
  - 所有专用实例使用的存储容量之和。
  - 所有专用实例的负载均衡器的网络流量。

用量跟踪项目每天更新一次，通过汇总当前月份前几天的用量得出。
例如，如果你有 Service A 在 Serverless 计划中设定了 10 RCU，Service B 设定了 20 RCU，
那么 Serverless RCU 的用量在月份第二天的计算结果为 720（10 * 24 小时 + 20 * 24 小时），在第三天为 1440（720 + 720）。

## 费用

请参考 [Serverless Plan](serverless.md#费用) 和 [Dedicated Plan](dedicated.md#费用) 了解费用计算逻辑。

