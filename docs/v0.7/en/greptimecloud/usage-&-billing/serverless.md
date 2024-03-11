# Serverless Plan

The Serverless Plan allows you to exceed the limitations of the Hobby Plan and provides support from the SRE team.
It is suitable for production environments and can scale as your business grows.

When setting up a service under the Serverless Plan or upgrading from the Hobby Plan,
you'll need to configure the capacity units for the service plan, which include:

- The Maximum WCU (Write Capacity Unit) per second, upper limit of 5000
- The Maximum RCU (Read Capacity Unit) per second, upper limit of 5000
- Storage Capacity

:::tip NOTE
For the concepts of WCU and RCU, see [WCU and RCU](wcu-rcu.md).
:::

## Costs

Please see [Pricing](https://greptime.com/pricing) for the latest pricing information.

### WCU and RCU

Greptime calculates costs based on the capacity units specified in your chosen plan on a minute-by-minute basis 
and bills you monthly for the services used.

Cost Calculation Formula:

- Minute Costs: (Chosen Plan's WCU * WCU Minute Price) + (Chosen Plan's RCU * RCU Minute Price)
- Hourly Costs: Sum of Minute Costs
- Daily Costs: Sum of Hourly Costs
- Monthly Costs: Sum of Daily Costs

<!--@include: shared-storage-capacity.md-->

<!-- ### Cost Optimization

Here are some tips to optimize your costs:

- Select appropriate capacity units for your service plan to avoid overpaying for unused capacity.
- Set a data retention policy to drop unnecessary data and reduce storage costs. -->

