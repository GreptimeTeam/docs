---
keywords: [time durations, time spans, time units]
description: Learn how GreptimeDB utilizes time durations to represent time spans in SQL queries, configuration files, and API requests with supported suffixes and examples.
---

# Time Durations

GreptimeDB utilizes time durations to represent time spans in various contexts,
including SQL queries, configuration files, and API requests.
For more information on using time durations, please refer to:

- The TTL options and the `time_window` parameter of the TWCS compaction strategy in the [ALTER](/reference/sql/alter.md) statement.
- The TTL options in the [CREATE](/reference/sql/create.md) statement.

A time duration is expressed as a string composed of concatenated time spans,
each represented by a sequence of decimal numbers followed by a unit suffix.
These suffixes are case-insensitive and support both singular and plural forms. For example, `1hour 12min 5s`.

Each time span consists of an integer and a suffix.
The supported suffixes are:

- `nsec`, `ns`: nanoseconds
- `usec`, `us`: microseconds
- `msec`, `ms`: milliseconds
- `seconds`, `second`, `sec`, `s`
- `minutes`, `minute`, `min`, `m`
- `hours`, `hour`, `hr`, `h`
- `days`, `day`, `d`
- `weeks`, `week`, `w`
- `months`, `month`, `M`: defined as 30.44 days
- `years`, `year`, `y`: defined as 365.25 days

Appending a decimal integer with one of the above units represents the equivalent number of seconds as a bare float literal.
Examples:

- `1s`: Equivalent to 1 second
- `2m`: Equivalent to 120 seconds
- `1ms`: Equivalent to 0.001 seconds
- `2h`: Equivalent to 7200 seconds

The following examples are invalid:

- `0xABm`: Hexadecimal numbers are not supported
- `1.5h`: Floating point numbers are not supported
- `+Infd`: `±Inf` or `NaN` values are not supported


The following are some valid time duration examples:

- `1h`: one hour
- `1h30m`, `1h 30m`: one hour and thirty minutes
- `1h30m10s`, `1h 30m 10s`: one hour, thirty minutes, and ten seconds
