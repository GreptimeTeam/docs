# Biweekly Report (Oct.16 - Oct.28) – Seamless Upgrade to the new GreptimeDB v0.4 with Our Latest Tool
November 01, 2023
## Summary
Together with our global community of contributors, GreptimeDB continues to evolve and flourish as a growing open-source project. We are grateful to each and every one of you.

In the past two weeks, we have iterated through two minor versions, v0.4.1 and v0.4.2, following the official release of GreptimeDB v0.4. Below are some highlights:

- Implemented support for Prometheus Histograms.
- Optimized the OpenTSDB protocol.
- Added support for nested `range` expressions in queries, which is very useful.
- Resolved a bug related to inconsistent behavior in the `range` implementation when using different `KvBackend` implementations.
- Provided a built-in tool to assist users in upgrading from v0.3 to v0.4. For more information, please refer to the official documentation at https://docs.greptime.com/user-guide/upgrade.

## Contributors
For the past two weeks, our community has been super active with a total of 76 PRs merged. 8 PRs from 6 external contributors merged successfully and lots pending to be merged.

Congrats on becoming our most active contributors in the past 2 weeks:

- @[AbhineshJha](https://github.com/AbhineshJha) ([db#2656](https://github.com/GreptimeTeam/greptimedb/pull/2656))

- @[Lilit0x](https://github.com/Lilit0x) ([db#2623](https://github.com/GreptimeTeam/greptimedb/pull/2623))

- @[NiwakaDev](https://github.com/NiwakaDev) ([db#2621](https://github.com/GreptimeTeam/greptimedb/pull/2621))

- @[shoothzj](https://github.com/shoothzj) ([docs#651](https://github.com/GreptimeTeam/docs/pull/651)  [db#2606](https://github.com/GreptimeTeam/greptimedb/pull/2606))

- @[tisonkun](https://github.com/tisonkun) ([db#2653](https://github.com/GreptimeTeam/greptimedb/pull/2653))

- @[Yun Chen](https://github.com/masonyc) ([db#2609](https://github.com/GreptimeTeam/greptimedb/pull/2609) [docs#652](https://github.com/GreptimeTeam/docs/pull/652))

👏  Welcome contributors @AbhineshJha  @shoothzj and @tisonkun to the community as new contributors, and congratulations on successfully merging their first PR!

A big THANK YOU to all our members and contributors! It is people like you who are making GreptimeDB a great product. Let's build an even greater community together.

## Highlights of Recent PR
### [#2626](https://github.com/GreptimeTeam/greptimedb/pull/2626) [#2651](https://github.com/GreptimeTeam/greptimedb/pull/2651) Implemented the [histogram_quantile function](https://prometheus.io/docs/prometheus/latest/querying/functions/#histogram_quantile) for PromQL
This is one of the most commonly used calculation functions for the Histogram data type among the four data types in Prometheus, capable of computing the φ-quantile (0 ≤ φ ≤ 1). For example:
```
histogram_quantile(0.9, rate(http_request_duration_seconds_bucket[10m]))
```

### [#2623](https://github.com/GreptimeTeam/greptimedb/pull/2623) Optimized OpenTSDB writes with support for batch data parsing and insertion

### [#2557](https://github.com/GreptimeTeam/greptimedb/pull/2557) Support for nested Range expressions
`Range` expressions like `max(a+1) Range '5m' FILL NULL` are allowed to nest in any expression.

Valid SQL example:
```sql
select
    round(max(a+1) Range '5m' FILL NULL),
    sin((max(a) + 1) Range '5m' FILL NULL)，
from
    test
ALIGN '1h' by (b) FILL NULL;
```

This is semantically equivalent to SQL:
```sql
select round(x), sin(y + 1) from
    (
        select max(a+1) Range '5m' FILL NULL as x, max(a) Range '5m' FILL NULL as y
            from
        test
            ALIGN '1h' by (b) FILL NULL;
    )
;
```

Invalid example: Nested `range` expressions into another `range` expression are invalid (e.g. , `SELECT min(max(val) RANGE '20s') RANGE '20s' FROM host ALIGN '10s';`).

`Range` queries now support the following fill options, used to fill in occurrences of null values:

1. `NULL`: Keeps nulls as it is.
2. `PREV`: Fills nulls with the previous value.
3. `LINEAR`: Fills nulls with the average of the previous number and next number.
4. `x`: Fills nulls with a constant `x`.

Using `LINEAR` converts integers to floats.

For specific usage of `range` query, please refer to the documentation: https://docs.greptime.com/reference/sql/range