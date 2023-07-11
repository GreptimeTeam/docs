# 2023.06.19 - 2023.07.02 – GreptimeDB v0.3.2 release

July 5, 2023 · 6 min read

## Summary
Together with all our contributors worldwide, we are glad to see GreptimeDB making remarkable progress for the better. Below are some highlights:
- Support incremental database backup
- Support copy from ORC format
- Make `blob`(binary) type working 
- Push all possible filters down to the execution plan of Parquet
- Improve Influxdb v2 API compatibility

## Contributor list: (in alphabetical order)
For the past two weeks, our community has been super active with a total of **81** PRs merged. **7** PRs from **5** external contributors merged successfully and lots pending to be merged. 
Congrats on becoming our most active contributors in the past 2 weeks:

- [@DevilExileSu](https://github.com/DevilExileSu) ([db#1834](https://github.com/GreptimeTeam/greptimedb/pull/1834))
- [@etolbakov](https://github.com/etolbakov) ([db#1789](https://github.com/GreptimeTeam/greptimedb/pull/1789) [db#1826](https://github.com/GreptimeTeam/greptimedb/pull/1826) [dashboard#283](https://github.com/GreptimeTeam/dashboard/pull/283))
- [@NiwakaDev](https://github.com/NiwakaDev) ([docs#425](https://github.com/GreptimeTeam/docs/pull/425))
- [@sjcsjc123](https://github.com/sjcsjc123) ([gtctl#84](https://github.com/GreptimeTeam/gtctl/pull/84))
- [sjmiller609](https://github.com/sjmiller609) ([parser#67](https://github.com/GreptimeTeam/promql-parser/pull/67))

👏 Let's welcome **@sjcsjc123** and **@sjmiller609** as the new contributors to join our community with their first PRs merged. 

A big THANK YOU for the generous and brilliant contributions! It is people like you who are making GreptimeDB a great product. Let's build an even greater community together.

## Highlights of Recent PR 
### [Support incremental database backup](https://github.com/GreptimeTeam/greptimedb/pull/1240)
We support `COPY DATABASE` feature to allow incremental database backup.

You can use the following SQL to backup the whole database to a target directory:

```rust
COPY DATABASE greptime.public TO '<BACKUP_DIR>' WITH (FORMAT = 'parquet', start_time='2023-06-18 00:00:00', end_time='2023-06-19 00:00:00');
```

Please note that:
- the `<BACKUP_DIR>` must end with `/`. Each table will be exported to a single file with table name.
- `start_time` and `end_time` should be a valid timestamp string like `2023-06-20 00:00:00/2023-06-20 00:00:00.000`

Some future work:
- persist last backup time to manifest so that we don't have to specify the start time every time.
- use procedure framework to allow resumption after interruption (shutdown or crash).

### [Support copy from ORC format](https://github.com/GreptimeTeam/greptimedb/issues/1814)
We now support copy from ORC format. Supported types include Boolean, String, Integers (i16, i32, i64), Floats (f32, f64), Timestamp (Nanosecond) and Date. Compression includes ZLIB and [ZSTD](https://github.com/GreptimeTeam/greptimedb/pull/1847).

Notes: currently, it doesn't support the Run Length Encoding defined in [ORC spec v0](https://orc.apache.org/specification/ORCv0/), the writer should use Run Length Encoding V2 instead. See [orc-rust](https://github.com/wenyxu/orc-rs). 

We were planning to support the import of ORC format data based on orc-format crate, but we found a lot of bugs in the process of supplementing unit testing. Finally, we have completely rewritten the entire rlev2 algorithm, incorporating the [ORC format](https://crates.io/crates/orc-format) and adding support for decoding timestamp and date types. Additionally, we have implemented an asynchronous stream reader.


### [Support `blob`(binary) type](https://github.com/GreptimeTeam/greptimedb/pull/1818)
This pull request adds support for blob type in the database. It has passed all the necessary tests and is compatible with MySQL protocols and sqlness. It also includes a fix for issues encountered during the implementation process.

### [Push all possible filters down to the execution plan of Parquet](https://github.com/GreptimeTeam/greptimedb/pull/1839)
This PR pushes all possible filters down to the execution plan of Parquet to improve scan efficiency. It also coerces time range predicate data types to timestamp type in storage schemas to address [#992](https://github.com/GreptimeTeam/greptimedb/issues/992).

### [Improve Influxdb v2 API compatibility](https://github.com/GreptimeTeam/greptimedb/pull/1831)

This PR mainly improves Influxdb v2 API compatibility.

Write using the curl command as shown below: 

```rust
curl -i -XPOST "http://localhost:4000/v1/influxdb/api/v2/write?bucket=public&precision=ms" \
--data-binary \
'monitor,host=127.0.0.1 cpu=0.1,memory=0.4 1667446797450 monitor,host=127.0.0.2 cpu=0.2,memory=0.3 1667446798450 monitor,host=127.0.0.1 cpu=0.5,memory=0.2 1667446798450'
```

Write using Go SDK, an example [here](https://github.com/Fengys123/influxdb_write_example/blob/main/main.go).

These are the updates of GreptimeDB and we are constantly making progress. We believe that the strength of our software shines in the strengths of each individual community member. Thanks for all your contributions.

## New Things

The Tech Preview version of [GreptimeCloud](https://www.greptime.com/product/cloud) has been officially released recently. This new version is a hosted Prometheus solution based on the powerful Serverless DBaaS architecture. This update brings wider compatibility, Prometheus rules managed with GitOps principles, and enhanced visualization tools.  We sincerely invite you to explore [GreptimeCloud](https://www.greptime.com/product/cloud), and contact us to offer valuable suggestions via [Slack](https://www.greptime.com/slack), send an email to info@greptime.com or discuss anything related to Greptime on [GitHub discussions](https://github.com/GreptimeTeam/Community/discussions/categories/general).

We have released GreptimeDB v0.3.2, in this version we support TWCS compression strategy inspired by Cassandra, also support compilation for CentoOS 7 machines with only glibc 2.17, and row filter push down feature and so on. Stay tuned to our latest news and download to try [GreptimeDB v0.3.2](https://github.com/GreptimeTeam/greptimedb/releases/tag/v0.3.2)!

GreptimeDB has passed over 66.61% of Prometheus's compliance tests, which greatly improved PromQL compatibility! Track the latest progress in this [issue](https://github.com/GreptimeTeam/greptimedb/issues/1042).