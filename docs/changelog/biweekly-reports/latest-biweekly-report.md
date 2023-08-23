# 2023.07.31 - 2023.08.13 – Greptime Javascript SDK Release!

August 16, 2023 · 5 min read

## Summary
Together with all our contributors worldwide, we are glad to see GreptimeDB making remarkable progress for the better. In the past two weeks, a total of **119 PRs** were merged for our program. Below are some highlights:
- Accept InfluxDB request without timestamp even if table doesn't exist
- Impl Interval type and conversation between gRPC and Interval
- Support Truncate Table in standalone mode
- Support RangeSelect Logical Plan rewrite

## Contributor list: (in alphabetical order)

For the past two weeks, our community has been super active with a total of **20 PRs** from 11 contributors merged successfully and lots pending to be merged. 
Congrats on becoming our most active contributors in the past 2 weeks:

- [@DevilExileSu](https://github.com/DevilExileSu) ([db#2084](https://github.com/GreptimeTeam/greptimedb/pull/2084) [db#2090](https://github.com/GreptimeTeam/greptimedb/pull/2090) [db#2097](https://github.com/GreptimeTeam/greptimedb/pull/2097))
- [@etolbakov](https://github.com/etolbakov) ([db#2078](https://github.com/GreptimeTeam/greptimedb/pull/2078))
- [@gongzhengyang](https://github.com/gongzhengyang) ([db#2055](https://github.com/GreptimeTeam/greptimedb/pull/2055) [db#2116](https://github.com/GreptimeTeam/greptimedb/pull/2116))
- [@niebayes](https://github.com/niebayes) ([docs#509](https://github.com/GreptimeTeam/docs/pull/509))
- [@NiwakaDev](https://github.com/NiwakaDev) ([db#2041](https://github.com/GreptimeTeam/greptimedb/pull/2041))
- [@parkma99](https://github.com/parkma99) ([db#2042](https://github.com/GreptimeTeam/greptimedb/pull/2042))
- [@quakewang](https://github.com/quakewang) ([docs#521](https://github.com/GreptimeTeam/docs/pull/521))
- [@QuenKar](https://github.com/QuenKar) ([db#1952](https://github.com/GreptimeTeam/greptimedb/pull/1952) [db#2043](https://github.com/GreptimeTeam/greptimedb/pull/2043) [db#2064](https://github.com/GreptimeTeam/greptimedb/pull/2064) [db#2117](https://github.com/GreptimeTeam/greptimedb/pull/2117) [db#2146](https://github.com/GreptimeTeam/greptimedb/pull/2146))
- [@sjcsjc123](https://github.com/sjcsjc123) ([gtctl#86](https://github.com/GreptimeTeam/gtctl/pull/86) [gtctl#119](https://github.com/GreptimeTeam/gtctl/pull/119))
- [@sunray-ley](https://github.com/sunray-ley) ([db#2044](https://github.com/GreptimeTeam/greptimedb/pull/2044))
- [@Taylor-lagrange](https://github.com/Taylor-lagrange) ([db#2058](https://github.com/GreptimeTeam/greptimedb/pull/2058))
- [@xie-zheng](https://github.com/xie-zheng) ([db#2143](https://github.com/GreptimeTeam/greptimedb/pull/2143))

👏 Let's welcome **@gongzhengyang** and **@quakewang** as the new contributors to join our community with their first PR merged. 

A big THANK YOU for the generous and brilliant contributions! It is people like you who are making GreptimeDB a great product. Let's build an even greater community together.

## Highlights of Recent PR 
### [Support accept InfluxDB request without timestamp even if table doesn't exist](https://github.com/GreptimeTeam/greptimedb/pull/2041)

Originally, we could execute the following command when the corresponding table existed, but we couldn't execute the command when the corresponding table didn't exist:

```rust
curl -i -XPOST "http://localhost:4000/v1/influxdb/write?db=public&precision=ms" \
--data-binary \
'monitor,host=127.0.0.1 cpu=0.1,memory=0.4'
```

We now support GreptimeDB accepting InfluxDB requests without timestamps if the corresponding table does not exist.

### [Impl interval type and conversation between gRPC and interval](https://github.com/GreptimeTeam/greptimedb/pull/2064)

In [#1952](https://github.com/GreptimeTeam/greptimedb/pull/1952), We

- impl `Interval` type in common time package.
- impl `DataType`, `Vector`, `Value` trait for IntervalMonthDayNano.

and fix bug in [#1886](https://github.com/GreptimeTeam/greptimedb/pull/1886). Now we implement the basic Interval type, and this pr is used to implement the conversation between gRPC and Interval.

### [Support Truncate Table in standalone mode](https://github.com/GreptimeTeam/greptimedb/pull/2090)
In this pr, we implement the Truncate Table procedure in standalone mode, reset version and Truncate region, which: 

- Acquires the `RegionWriter` lock.
- Create `RegionMetaAction::Truncate` to store `committed_sequence` and persist it for recovery from the manifest.
- Mark all data in WAL as `obsolete`.
- Mark all SSTs as deleted.
- Reset Version.

Also we support recover from `RegionMetaAction::Truncate`.

- Mark all SSTs as deleted.
- Reset the Version and set the `committed_sequence` from `RegionMetaAction::Truncate` as the Version's `flushed_sequence`.

### [Support RangeSelect Logical Plan rewrite](https://github.com/GreptimeTeam/greptimedb/pull/2058)

In order to provide the ability to easily aggregate over time at the SQL level (e.g., aggregation calculations in five-minute steps), GreptimeDB is in the process of implementing a new Range syntax, and this implementation of the RangeSelect logic is planned to be one step in that process. This is one of the steps in implementing the range select logic scheme, and the issue can be found [here](https://github.com/GreptimeTeam/greptimedb/issues/1662).

## New Things
We have released [greptime-js-sdk](https://github.com/GreptimeTeam/greptime-js-sdk), which is based on typescript and encapsulates common SQL table building, insertion and querying statements, as well as PromQL queries. We will continue to improve support for different protocols and syntaxes, as well as improve the documentation to further reduce the difficulty of getting started with GreptimeDB.