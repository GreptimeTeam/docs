# Visualize data

## Introduction

Visualization plays a crucial role in effectively utilizing time series data.

To help users leverage the various features of GreptimeDB, Greptime offers a simple [dashboard](https://github.com/GreptimeTeam/dashboard).

The current version of the dashboard supports MySQL and Python queries, with support for PromQL coming soon. Please stay tuned for updates.

![](../public/dashboard-select.jpg)


We offer various chart types to choose from based on different scenarios.

![line](../public/dashboard-line.jpg)
![scatter](../public/dashboard-scatter.jpg)

We are committed to the ongoing development and iteration of this open source project, and we plan to expand the application of time series data in monitoring, analysis, and other relevant fields in the future.

## Embedded Dashboard in GreptimeDB

The Dashboard can be embedded into GreptimeDB's binary. Build GreptimeDB with feature `servers/dashboard` enabled from workspace root. For example, `cargo build --feature servers/dashboard`. The building process will automatically download the distribution of the Dashboard. After the building process succeeded, you can start GreptimeDB normally, and visit the HTTP endpoint `dashboard` to use the Dashboard locally. 
