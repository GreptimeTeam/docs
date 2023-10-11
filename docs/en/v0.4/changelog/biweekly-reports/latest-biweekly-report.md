# Biweekly Report (Aug.28 - Sep.17) – Welcome GreptimeDB's First Contributor from Africa

September 20, 2023

## Summary
Together with all our contributors worldwide, we are glad to see GreptimeDB making remarkable progress for the better.

Over the past three weeks, we have been working intensively to prepare for the release of GreptimeDB v0.4, and we are thrilled for its official launch later this week.

**We will host an online Meetup at 19:00 PDT on October 10, 2023. During this event, we will unveil the latest details of the GreptimeDB v0.4 Benchmark and provide insights into the technical intricacies of the new engine.** Everyone is welcome to join the Meetup to stay updated on the latest developments of GreptimeDB v0.4.

Register now for the Zoom invite: https://m0k0y6ku50y.typeform.com/to/m5G87XDI

Below are some highlights for the past three weeks:

- Optimized SQL data types.
- Added support for adding primary key columns through `ALTER TABLE`.
- Refined the heartbeat protocol within the distributed architecture.
- Restricted the TIME INDEX type.

## Contributors
Over the last three weeks, our community has successfully merged a total of 189 PRs. Notably, 2 of these PRs came from 2 distinct external contributors, with several more awaiting approval.
A special shout-out to our standout contributors from the past three weeks:

- [@NiwakaDev](https://github.com/NiwakaDev0) ([db#2267](https://github.com/GreptimeTeam/greptimedb/pull/2267))
- [@Lilit0x](https://github.com/Lilit0x) ([db#2400](https://github.com/GreptimeTeam/greptimedb/pull/2400))

👏 Let's welcome [@Lilit0x](https://github.com/Lilit0x) as the new contributors to join our community with the first PR merged.

A big THANK YOU to all our members and contributors! It is people like you who are making GreptimeDB a great product. Let's build an even greater community together.

## Highlights of Recent PR
[**#2331 Optimized SQL data types**](https://github.com/GreptimeTeam/greptimedb/pull/2331)

Before this PR, the data types displayed in CREATE TABLE and DESC TABLE were different, which was confusing for users. For instance:

```sql
CREATE TABLE data_types (
  s string,
  tint tinyint,
  sint smallint,
  i int,
  bint bigint,
  v varchar,
  f float,
  d double,
  b boolean,
  vb varbinary,
  dt date,
  dtt datetime,
  ts0 timestamp(0),
  ts3 timestamp(3),
  ts6 timestamp(6),
  ts9 timestamp(9) DEFAULT CURRENT_TIMESTAMP TIME INDEX,
  PRIMARY KEY(s));
```

```bash
+--------+----------------------+------+------+---------------------+---------------+
| Column | Type                 | Key  | Null | Default             | Semantic Type |
+--------+----------------------+------+------+---------------------+---------------+
| s      | String               | PRI  | YES  |                     | TAG           |
| tint   | Int8                 |      | YES  |                     | FIELD         |
| sint   | Int16                |      | YES  |                     | FIELD         |
| i      | Int32                |      | YES  |                     | FIELD         |
| bint   | Int64                |      | YES  |                     | FIELD         |
| v      | String               |      | YES  |                     | FIELD         |
| f      | Float32              |      | YES  |                     | FIELD         |
| d      | Float64              |      | YES  |                     | FIELD         |
| b      | Boolean              |      | YES  |                     | FIELD         |
| vb     | Binary               |      | YES  |                     | FIELD         |
| dt     | Date                 |      | YES  |                     | FIELD         |
| dtt    | DateTime             |      | YES  |                     | FIELD         |
| ts0    | TimestampSecond      |      | YES  |                     | FIELD         |
| ts3    | TimestampMillisecond |      | YES  |                     | FIELD         |
| ts6    | TimestampMicrosecond |      | YES  |                     | FIELD         |
| ts9    | TimestampNanosecond  | PRI  | NO   | current_timestamp() | TIMESTAMP     |
+--------+----------------------+------+------+---------------------+---------------+
16 rows in set (0.00 sec)
```

This PR adds aliases for SQL data types, as shown below:
- TimestampSecond, Timestamp_s, Timestamp_sec for Timestamp(0).
- TimestampMillisecond, Timestamp_ms for Timestamp(3).
- TimestampMicrosecond, Timestamp_us for Timestamp(6).
- TimestampNanosecond, Timestamp_ns for Timestamp(9).
- INT8 for tinyint
- INT16 for smallint
- INT32 for int
- INT64 for bigint
- And UINT8, UINT16 etc. for UnsignedTinyint etc.

Now, you can also use GreptimeDB types to create tables in SQL:

```sql
 CREATE TABLE data_types (
  s String,
  tint Int8,
  sint Int16,
  i Int32,
  bint Int64,
  v String,
  f Float32,
  d Float64,
  b Boolean,
  vb Varbinary,
  dt Date,
  dtt DateTime,
  ts0 TimestampSecond,
  ts3 TimestampMillisecond,
  ts6 TimestampMicrosecond,
  ts9 TimestampNanosecond DEFAULT CURRENT_TIMESTAMP TIME INDEX,
  PRIMARY KEY(s));
```

[**#2310 Added support for adding primary key columns through ALTER TABLE**](https://github.com/GreptimeTeam/greptimedb/pull/2310)

In time-series data model, Label or Tag corresponds to the primary key in the Table model in GreptimeDB. Therefore, it's necessary to support adding primary key columns through the `ALTER TABLE` statement.

[**#96 Refined the heartbeat protocol within the distributed architecture**](https://github.com/GreptimeTeam/greptime-proto/pull/96)

In the upcoming 0.4 release, we went through an in-depth restructuring and upgrade of the database architecture. The first to undergo remodelling was the heartbeat protocol that serves as the foundation of distributed coordination communication. The intent behind this overhaul was to manage larger clusters and a higher number of regions more efficiently. To that end, we trimmed the size of the heartbeat package to alleviate the communication layer's load. For instance, we removed the unnecessary NodeStat, eliminated information such as CPU and Load, and only retained W/RCU as the sole reference for load balancing and scheduling. At the same time, we also removed unnecessary information like table names and database names.

[**#2281 Restricted the TIME INDEX type**](https://github.com/GreptimeTeam/greptimedb/pull/2281)

The TIME INDEX type is restricted, only allowing timestamp types to serve as TIME INDEX to prevent potential ambiguities.

## New Things
New Features in Dashboard
- The tables list on the left supports shortcut quick input, allowing for one-click insertion of preset SQL query statements.
https://github.com/GreptimeTeam/dashboard/pull/323

<p><img src="/biweekly-images/image1.png" alt="Shortcut Demonstration" style="width: 70%; margin: 0 auto;" /></p>

- The editor offers input suggestions. Both SQL and PromQL editors can automatically suggest potential table names and column names based on entered keywords.
https://github.com/GreptimeTeam/dashboard/pull/329
https://github.com/GreptimeTeam/dashboard/pull/330

<p><img src="/biweekly-images/image2.png" alt="Hint Demonstration" style="width: 70%; margin: 0 auto;" /></p>
