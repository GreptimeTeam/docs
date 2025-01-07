---
keywords: [billing process, invoice generation, usage tracking, cost calculation, GreptimeCloud]
description: Explains the billing process, invoice generation, usage tracking, and cost calculation for different plans in GreptimeCloud.
---

# Billing

## Invoice

Every service in GreptimeCloud belongs to a team.
You can add Payment Methods for the team in the [billing](https://console.greptime.cloud/settings/team#billing) dashboard under the team settings.
GreptimeCloud charges and generates invoices on a calendar monthly basis.

## Usage tracking

A detailed usage report for the current billing cycle can be found in the [billing](https://console.greptime.cloud/settings/team#billing) dashboard, which includes the following items:

- Serverless plan:
  - The sum of request capacity units (RCU and WCU) set by all Serverless services.
  - The sum of storage capacity used by all Serverless services.
- Dedicated plan:
  - The number of dedicated instances according to the configuration.
  - The sum of storage capacity used by all dedicated instances.
  - The network traffic of the load balancers for all dedicated instances.

The usage tracking items are updated daily by summing up the usage from the previous days of the current month.
For example, if you have Service A in the Serverless plan with 10 RCU set, and Service B with 20 RCU set,
the usage tracking item "Serverless RCU" is calculated as 720 (10 * 24 hours + 20 * 24 hours) on the second day of the month and 1440 (720 + 720) on the third day.

## Costs

Please refer to [Serverless Plan](serverless.md#costs) and [Dedicated Plan](dedicated.md#costs) for cost calculation logics.

