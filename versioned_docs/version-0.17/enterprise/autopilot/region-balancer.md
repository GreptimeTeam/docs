---
keywords: [region balancer, load balancing, configuration, datanodes, migration]
description: Configuration guide for the region balancer plugin in GreptimeDB Enterprise, which balances write loads across datanodes to prevent frequent region migrations.
---

# Region Balancer

This plugin balances the write load of regions across datanodes, using specified window sizes and load thresholds to prevent frequent region migrations. You can enable the Region Rebalancer feature by adding the following configuration to Metasrv.

```toml
[[plugins]]
[plugins.region_balancer]

window_size = "45s"

window_stability_threshold = 2

min_load_threshold = "10MB"

tick_interval = "45s"
```

## Configuration Parameters

- `window_size`: string
  - **Description**: Defines the time span for the sliding window used to calculate the short-term average load of a region. This window helps smooth out temporary spikes in load, reducing the chance of unnecessary rebalancing.
  - **Units**: Time (e.g., `"45s"` represents 45 seconds).
  - **Recommendation**: Adjust according to load volatility. Larger values smooth more effectively but may delay load balancing responses.
- `window_stability_threshold`: integer
  - **Description**: Specifies the number of consecutive windows that must meet the load-balancing criteria before a region migration is triggered. This threshold helps prevent frequent balancing actions, ensuring region migration only occurs when imbalance is sustained.
  - **Recommendation**: Higher values delay rebalancing triggers and suit environments with volatile loads; a value of 2 means that at least two consecutive windows must meet the threshold before triggering.
- `min_load_threshold`: string
  - **Description**: Minimum write load threshold (in bytes per second) to trigger region migration. Nodes with load below this value will not trigger rebalancing.
  - **Units**: Bytes (e.g., `"10MB"` represents 10 MiB).
  - **Recommendation**: Set an appropriate minimum to avoid triggering region migration with low load. Adjust based on typical traffic.
- `tick_interval`: string
  - **Description**: Interval at which the balancer checks and potentially triggers a rebalancing task.
  - **Units**: Time (e.g., `"45s"` represents 45 seconds).
  - **Recommendation**: Set based on desired responsiveness and load volatility. Shorter intervals allow faster responses but may increase overhead.