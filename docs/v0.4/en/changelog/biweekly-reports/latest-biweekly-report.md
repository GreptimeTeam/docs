# Biweekly Report – 82% Compatibility Milestone for PromQL, with a Remarkable 200% Performance Uplift in Targeted TSBS Scenarios
December 13, 2023
## Summary
Together with our global community of contributors, GreptimeDB continues to evolve and flourish as a growing open-source project. We are grateful to each and every one of you.

In the past two weeks, we have made steady progress. Below are some highlights:

- Compatibility of PromQL has been enhanced to 82%.

- Parallel scanning for SSTs and `memtables` has been implemented, resulting in up to 200% performance improvement in TSBS scenarios.

- New functions, `date_add` and `date_sub` have been added.

- Tables can now be created with the option to specify different storage backends.

- Introduction of the `ALIGN TO` clause, along with support for `Interval` queries.

- Support for configuring the sampling rate parameter for distributed tracing.

- Fixed an issue where Procedures were unable to resume execution after a restart.

## Contributors
For the past two weeks, our community has been super active with a total of 56 PRs merged. 8 PRs from 4 individual contributors merged successfully and lots pending to be merged.

Congrats on becoming our most active contributors in the past 2 weeks:

- @[hygkui](https://github.com/hygkui) ([db#2821](https://github.com/GreptimeTeam/greptimedb/pull/2821))

- @[LinuxSuRen](https://github.com/LinuxSuRen) ([dashboard#359](https://github.com/GreptimeTeam/dashboard/pull/359))

- @[NiwakaDev](https://github.com/NiwakaDev) ([db#2887](https://github.com/GreptimeTeam/greptimedb/pull/2887) [db#2733](https://github.com/GreptimeTeam/greptimedb/pull/2733))

- @[tisonkun](https://github.com/tisonkun) ([db#2886](https://github.com/GreptimeTeam/greptimedb/pull/2886) [db#2884](https://github.com/GreptimeTeam/greptimedb/pull/2884) [db#2874](https://github.com/GreptimeTeam/greptimedb/pull/2874) [db#2859](https://github.com/GreptimeTeam/greptimedb/pull/2859))

👏  Welcome contributor @[hygkui](https://github.com/hygkui)  @[LinuxSuRen](https://github.com/LinuxSuRen) to the community as new contributors, and congratulations on successfully merging their first PR, more PRs are waiting to be merged.

A big THANK YOU to all our members and contributors! It is people like you who are making GreptimeDB a great product. Let's build an even greater community together.

## Highlights of Recent PR
### [#2651](https://github.com/GreptimeTeam/greptimedb/pull/2651) Implemented the PromQL `histogram_quantile` function

### [#2839](https://github.com/GreptimeTeam/greptimedb/pull/2839) Introduced the PromQL `AND` and `UNLESS` operators

### [#2854](https://github.com/GreptimeTeam/greptimedb/pull/2854) Implemented `time()` and date-related functions

### [#2879](https://github.com/GreptimeTeam/greptimedb/pull/2879) Aligned PromQL `linear_regression` behavior
The above pull requests have increased the compatibility of PromQL to 82%. For more details, please refer to issue [#1042](https://github.com/GreptimeTeam/greptimedb/issues/1042)

### [#2852](https://github.com/GreptimeTeam/greptimedb/pull/2852) Introduced parallel scanning for SSTs and memtables
The default configuration employs threads equivalent to 1/4 of the CPU count for parallel scanning. In the TSBS Benchmark, the performance improvement of multi-threaded scanning compared to single-threaded scanning is significant, with some scenarios experiencing up to a 200% boost.

### [#2881](https://github.com/GreptimeTeam/greptimedb/pull/2881) Added support for the `date_add` and `date_sub` functions
This enhancement allows for adding or subtracting an `interval` value from timestamp, date, or datetime numeric values.

### [#2733](https://github.com/GreptimeTeam/greptimedb/pull/2733) Now supports specifying different object storage backends when creating tables
In previous versions, tables could only be stored in the same storage backend. This pull request enables the configuration of multiple distinct storage backends at startup, allowing the specification of the storage backend for storing table data during table creation.  For example, we can store one table locally and another table on S3.

### [#2842](https://github.com/GreptimeTeam/greptimedb/pull/2842) Introduced the `ALIGN TO` clause and `Interval` query support

#### `Interval` Support:
Interval expressions can now be used as optional duration strings after the `RANGE` and `ALIGN` keywords.

```rust
SELECT 
    rate(a) RANGE (INTERVAL '1 year 2 hours 3 minutes') 
FROM 
    t 
    ALIGN (INTERVAL '1 year 2 hours 3 minutes')
FILL NULL;
```

#### `ALIGN TO` Clause:
Supports the `ALIGN TO` clause, allowing users to align time to their desired points.

```rust
SELECT rate(a) RANGE '6m' FROM t ALIGN '1h' TO '2021-07-01 00:00:00' by (a, b) FILL NULL;
```

Available `ALIGN TO` options include:

- Calendar (default): Aligns to UTC timestamp 0.

- Now: Aligns to the current UTC timestamp.

- Timestamp: Aligns to the user-specified specific timestamp.

More details can be found in the range query documentation:
https://docs.greptime.com/reference/sql/range

### [#2809](https://github.com/GreptimeTeam/greptimedb/pull/2809) Added support for configuring the sampling rate parameter for distributed tracing
In previous versions, distributed tracing defaulted to collecting complete data. Configuring the sampling rate parameter enables data collection in proportion to the specified ratio.

More details can be found in configuration documentation: 
https://docs.greptime.com/user-guide/operations/configuration#logging-options

### [#2824](https://github.com/GreptimeTeam/greptimedb/pull/2824) Resolved a bug where Procedures couldn't continue execution after a system restart
 In earlier versions, incomplete Procedures were unable to resume execution after a system reboot. This pull request fixes this issue.

## Good first issue
[#2889](https://github.com/GreptimeTeam/greptimedb/issues/2889)
Fix the issue with the `redact_sql_secrets` function not handling special characters properly.

[#2877](https://github.com/GreptimeTeam/greptimedb/issues/2877)
Enhance HTTP SQL output to support pretty print.

[#2853](https://github.com/GreptimeTeam/greptimedb/issues/2853)
Standardize the code style of the Builder.

[#2637](https://github.com/GreptimeTeam/greptimedb/issues/2637)
Add more SQLness tests that include special cases.