---
keywords: [serverless plan, request capacities, cost calculation, billing information, data storage]
description: Details the Serverless Plan, including request capacities, support, cost calculation, and billing information.
---

# Serverless Plan

The serverless plan allows you to purchase request capacities according to your needs
and provides support from the SRE team.
This solution offers unlimited data storage and configurable retention,
making it suitable for production environments and scalable with your business growth.

When setting up a service under the Serverless Plan or upgrading from the Hobby Plan,
you'll need to configure the capacity units for the service plan, which include:

- The Maximum WCU (Write Capacity Unit) per second, upper limit of 5000
- The Maximum RCU (Read Capacity Unit) per second, upper limit of 5000

:::tip NOTE
For the concepts of WCU and RCU, see [Request Capacity Unit](request-capacity-unit.md).
:::

## Costs

Please see [Pricing](https://greptime.com/pricing) for the latest pricing information.

### WCU and RCU

Greptime calculates costs based on the capacity units specified in your chosen plan on a hour-by-hour basis 
and bills you monthly for the services used.

Cost Calculation Formula:

- Hourly Costs: (Chosen Plan's WCU * (WCU Minute Price * 60 minutes)) + (Chosen Plan's RCU * (RCU Minute Price * 60 minutes))
- Daily Costs: Sum of Hourly Costs
- Monthly Costs: Sum of Daily Costs

import Includesharedstoragecapacity from './shared-storage-capacity.md' 

<Includesharedstoragecapacity/>

<!-- ### Cost Optimization

Here are some tips to optimize your costs:

- Select appropriate capacity units for your service plan to avoid overpaying for unused capacity.
- Set a data retention policy to drop unnecessary data and reduce storage costs. -->

