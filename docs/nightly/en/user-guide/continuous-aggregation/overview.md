# Overview

GreptimeDB provides a continuous aggregation feature that allows you to aggregate data in real-time. This feature is useful when you need to calculate and query the sum, average, or other aggregations on the fly. The continuous aggregation feature is provided by our `Flow` engine. It continuously updates the aggregated data based on the incoming data and materialize it.

- [Manage Flow](./manage-flow.md) describes how to create, update, and delete a flow. Each of your continuous aggregation query is a flow.
- [Define time window](./define-time-window.md) describes how to define the time window for the continuous aggregation. Time window is an important attribute of your continuous aggregation query. It defines the time interval for the aggregation.
- [Query](./query.md) describes how to write a continuous aggregation query.
- [Expression](./expression.md) is a reference of available expressions in the continuous aggregation query.

![Continuous Aggregation](./flow-ani.svg)