# Biweekly Report - v0.5.1 Update Enhances Remote WAL to Support Cloud-Native Applications
January 10, 2024
## Summary
Together with our global community of contributors, GreptimeDB continues to evolve and flourish as a growing open-source project. We are grateful to each and every one of you.

In the past two weeks, we have made steady progress. Below are some highlights:

- v0.5 has been successfully released, with highlights of the new version featuring:
    - Key functionality for cloud-native architecture: Remote WAL
    - A brand new storage engine: Metric Engine

- PromQL enhancement: Added support for the `OR` operator, now fully supporting all set operators in PromQL.

- Significant expansion of system tables: Added 20+ new tables to the `INFORMATION_SCHEMA`.

- Query performance optimization: Implemented predicate pushdown for the `INFORMATION_SCHEMA` tables.

- Feature development progress: Full-speed development of Region Migration, Write Cache, and Inverted Index features.

## Contributors
For the past two weeks, our community has been super active with a total of 76 PRs merged. 12 PRs from 6 individual contributors merged successfully and lots pending to be merged.

Congrats on becoming our most active contributors in the past 2 weeks:

- @[AntiTopQuark](https://github.com/AntiTopQuark) ([db#3031](https://github.com/GreptimeTeam/greptimedb/pull/3031))

- @[Clayton Collie](https://github.com/ccollie) ([docs#752](https://github.com/GreptimeTeam/docs/pull/752))

- @[ClSlaid](https://github.com/ClSlaid) ([db#3084](https://github.com/GreptimeTeam/greptimedb/pull/3084))

- @[dimbtp](https://github.com/dimbtp) ([db#3060](https://github.com/GreptimeTeam/greptimedb/pull/3060) [db#3057](https://github.com/GreptimeTeam/greptimedb/pull/3057) [db#3054](https://github.com/GreptimeTeam/greptimedb/pull/3054))

- @[SSebo](https://github.com/SSebo) ([db#2985](https://github.com/GreptimeTeam/greptimedb/pull/2985))

- @[tisonkun](https://github.com/tisonkun) ([db#3080](https://github.com/GreptimeTeam/greptimedb/pull/3080) [dashboard#396](https://github.com/GreptimeTeam/dashboard/pull/396)[docs#748](https://github.com/GreptimeTeam/docs/pull/748) [docs#733](https://github.com/GreptimeTeam/docs/pull/733) [db#2996](https://github.com/GreptimeTeam/greptimedb/pull/2996))

<p><img src="/biweekly-images/newcontributor.png" alt="contributors" style="width: 70%; margin: 0 auto"></p>

👏  Welcome contributor @[AntiTopQuark](https://github.com/AntiTopQuark) @[Clayton Collie](https://github.com/ccollie) @[ClSlaid](https://github.com/ClSlaid) @[dimbtp](https://github.com/dimbtp) to the community as new contributors, and congratulations on successfully merging their first PR!

A big THANK YOU to all our members and contributors! It is people like you who are making GreptimeDB a great product. Let's build an even greater community together.

## Highlights of Recent PR
### [#2988](https://github.com/GreptimeTeam/greptimedb/pull/2988) Support for using a single Etcd instance to serve multiple GreptimeDB clusters
By introducing the `--store-key-prefix` configuration option, administrators can specify a prefix for metasrv to avoid key collisions.

### [#2992](https://github.com/GreptimeTeam/greptimedb/pull/2992) New configuration item to specify the default timezone for database queries
The `default_time_zone` option has been added to the configuration of the standalone mode and the Frontend component, enabling users to set the system timezone, which defaults to UTC. When a new session is established, the system timezone will become the user's default timezone, but users can change the timezone using `SET time_zone = 'UTC'`.

### [#3091](https://github.com/GreptimeTeam/greptimedb/pull/3091) Performance optimization for queries on the `INFORMATION_SCHEMA` tables, supporting the pushdown of filters
This optimization reduces memory consumption when constructing system table results and speeds up queries.

### [#3047](https://github.com/GreptimeTeam/greptimedb/pull/3047) Optimized network overhead for GreptimeDB's self-importing Metrics
Improvements to the `ExportMetricHandler` behavior in standalone mode and Frontend component have been made to avoid unnecessary network communication.

### [#3024](https://github.com/GreptimeTeam/greptimedb/pull/3024) Implemented the `OR` logical operator in PromQL
A new special `UNION` operator (`OR` in PromQL) has been introduced specifically for certain PromQL query scenarios. The operator takes two inputs, outputs all columns from the left child, and uses the columns specified by `compare_keys` to check for collision. In case of collision, if they all originate from the right child, only the first row is kept; if from the left child, the corresponding row from the right child is discarded. The output includes all columns from both the left and right children, and the row order is not maintained.

## Good first issue
[#3004](https://github.com/GreptimeTeam/greptimedb/issues/3004) Add checksum verification mechanism to manifest file

[#3044](https://github.com/GreptimeTeam/greptimedb/issues/3044) Add more tests for `MetaPeerClientRef`

[#3046](https://github.com/GreptimeTeam/greptimedb/issues/3046) Implement the `KvBackend` trait for `MetaPeerClient`
