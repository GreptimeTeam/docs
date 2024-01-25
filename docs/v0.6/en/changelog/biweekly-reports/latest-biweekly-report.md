# Biweekly Report - Lazy Load of Vector Builder Leads to a 90% Drop in Memory Usage
January 24, 2024
## Summary
Together with our global community of contributors, GreptimeDB continues to evolve and flourish as a growing open-source project. We are grateful to each and every one of you.

In the past two weeks, we have made steady progress. Below are some highlights:

- Continuous Performance Enhancements:
  - Memory usage reduced by up to 90% in scenarios with high null values.
  - Optimize the filter for reading Parquet files, gaining up to 50% faster TSBS test time.
- Expanding fuzz testing in GreptimeDB to encompass a wider array of scenarios.
- Officially launching Inverted Index, set to boost future read performance of GreptimeDB.
- Further developed support for SQL and PromQL features.

## Contributors
For the past two weeks, our community has been super active with a total of 77 PRs merged. 6 PRs from 3 individual contributors have been successfully merged, with many more pending merger.

Congrats on becoming our most active contributors in the past 2 weeks:

- @[etolbakov](https://github.com/etolbakov) ([db#3147](https://github.com/GreptimeTeam/greptimedb/pull/3147))

- @[lyang24](https://github.com/lyang24) ([db#3076](https://github.com/GreptimeTeam/greptimedb/pull/3076))

- @[tisonkun](https://github.com/tisonkun) ([db#3168](https://github.com/GreptimeTeam/greptimedb/pull/3168) [db#3169](https://github.com/GreptimeTeam/greptimedb/pull/3169) [db#3118](https://github.com/GreptimeTeam/greptimedb/pull/3118) [db#3062](https://github.com/GreptimeTeam/greptimedb/pull/3062))

👏  Welcome contributor @[etolbakov](https://github.com/etolbakov) @[lyang24](https://github.com/lyang24) back to the community!

A big THANK YOU to all our members and contributors! It is people like you who are making GreptimeDB a great product. Let's build an even greater community together.

## Highlights of Recent PR
### [#3210](https://github.com/GreptimeTeam/greptimedb/pull/3210) Lazy load to delay initialization of Vector Builder time
In scenarios with numerous null values, this optimization can slash GreptimeDB's memory consumption by about 90%, significantly enhancing its space efficiency.

### [#3182](https://github.com/GreptimeTeam/greptimedb/pull/3182) Introduced random generators for create table and alter table SQL in fuzz testing
Fuzz testing aids in early bug detection in GreptimeDB.

### [#3178](https://github.com/GreptimeTeam/greptimedb/pull/3178) More precise filtering when reading Parquet files
Optimized performance for reading Parquet files, cutting down time costs by up to 50% in TSBS tests.

### [#3164](https://github.com/GreptimeTeam/greptimedb/pull/3164) Support for `COPY DATABASE FROM` statement
Facilitates full database export and import, complementing the `COPY DATABASE TO` functionality.

### [#3158](https://github.com/GreptimeTeam/greptimedb/pull/3158) Official launch of the Inverted Index feature
Inverted indexes can significantly improve query efficiency. For more information about GreptimeDB's Inverted Index, please refer to the RFC: 
https://github.com/GreptimeTeam/greptimedb/blob/develop/docs/rfcs/2023-11-03-inverted-index.md

## Good First Issue
[#3212](https://github.com/GreptimeTeam/greptimedb/issues/3212) Fix a minor bug in `join_path` for more elegant code

[#3044](https://github.com/GreptimeTeam/greptimedb/issues/3044) 
Add tests for `MetaPeerClientRef` to enhance GreptimeDB's stability

[#2931](https://github.com/GreptimeTeam/greptimedb/issues/2931) Enhance GreptimeDB's self-observability with `information_schema`,  welcome contributions to improve it