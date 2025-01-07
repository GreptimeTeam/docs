---
keywords: [dedicated plan, dedicated CPUs, resource isolation, cost calculation, GreptimeCloud]
description: Details the Dedicated Plan, including dedicated CPUs, storage, resource isolation, and cost calculation for GreptimeCloud.
---

# Dedicated Plan

The dedicated plan allows you to purchase dedicated CPUs and storage to host GreptimeDB.
It provides unlimited data storage and retention,
complete isolation of resources and network,
and includes support from Greptime's SRE team.

If you require absolute isolation from other users or 
need to exceed the maximum usage limits of the serverless plan, 
then the dedicated plan is your choice.

## Costs

Please see [Pricing](https://greptime.com/pricing) for the latest pricing information.

### Computing nodes

When setting up a service under the Dedicated Plan, you'll need to configure the service mode,
which determine the size of computing nodes.
Greptime calculates costs based on the computing nodes specified in your chosen plan every hour and bills monthly.

Cost Calculation Formula:

- Hourly Costs: (Chosen Plan's Node Size * Number of Nodes * Node Hour Price)
- Daily Costs: Sum of Hourly Costs
- Monthly Costs: Sum of Daily Costs

import Includesharedstoragecapacity from './shared-storage-capacity.md' 

<Includesharedstoragecapacity/>

### Network traffic

The cost of network traffic will be included in your monthly bill.
Pricing is determined by the cloud server provider (such as AWS).
Greptime does not charge any additional fees for traffic costs.

