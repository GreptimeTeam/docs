# Dedicated

The dedicated plan offers unlimited data storage,
completely isolated resource control and network,
and includes support from our SRE team.

If you require absolute isolation from other users or 
need to exceed the maximum WCU and RCU limits of the Serverless Plan, 
then the Dedicated Plan is your choice.

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

<!--@include: shared-storage-capacity.md-->

### Network traffic

The cost of network traffic will be included in your monthly bill.
Pricing is determined by the cloud server provider (such as AWS).
Greptime does not charge any additional fees for traffic costs.

