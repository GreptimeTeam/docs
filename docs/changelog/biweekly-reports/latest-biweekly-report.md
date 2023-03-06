# 2023.02.06 - 2023.02.26 – Supports compaction function

March 03, 2023 · 6 min read

## Summary

Together with all our contributors worldwide, we are glad to see GreptimeDB making remarkable progress. Below are some highlights in the past three weeks:

- PromQL compatible (not 100% yet, but will be soon)
- Supports compaction function
- Data can be exported to files in Parquet format
- A simple REPL is provided for development debugging
- Caching is enabled by default when using object storage

Join us at [GitHub](https://github.com/GreptimeTeam/greptimedb).

## Contributor list: (in alphabetical order)

Our community has been super active during the past three weeks, with a total of **20 PRs from 9 contributors successfully being merged** and many more pending to be merged.
Congrats on becoming our most active contributors from Feb 6 to Feb 26:

- [@Brian Crant](https://github.com/bcrant) (#184)
- [@etolbakov](https://github.com/etolbakov) (#966, #973, #1002, #987)
- [@hezhizhen](https://github.com/hezhizhen) (#949, #1045)
- [@messense](https://github.com/messense) (#46)
- [@ShenJunkun](https://github.com/ShenJunkun) (#868, #177)
- [@WenyXu](https://github.com/WenyXu) (#980, #970, #1089, #1092)
- [@xl Huang](https://github.com/e1ijah1) (#928, #952)
- [@Xuanwo](https://github.com/Xuanwo) (#1067, #1057)
- [@Yun Chen](https://github.com/masonyc) (#957)
- [@Zheming Li](https://github.com/lizhemingi) (#995)

Let's welcome seven new contributors to join our community with their first PRs merged.

**greptimedb**
- [@etolbakov](https://github.com/etolbakov) made their first contribution in #966
- [@hezhizhen](https://github.com/hezhizhen) made their first contribution in #949
- [@WenyXu](https://github.com/WenyXu) made their first contribution in #980
- [@ShenJunkun](https://github.com/ShenJunkun) made their first contribution in #868

**promql-parser**

- [@messense](https://github.com/messense) made their first contribution in #46

**docs**

- [@Brian Crant](https://github.com/bcrant) made their first contribution in #184
- [@ShenJunkun](https://github.com/ShenJunkun) made their first contribution in #177

A big THANK YOU for your generous and brilliant contributions! It is people like you who are making GreptimeDB better everyday. Let's build an open, transparent and warm community together.



## What's cooking on DB's develop branch


- [Issue #1042](https://github.com/GreptimeTeam/greptimedb/issues/1042)

GreptimeDB NOW supports PromQL for basic use cases!

As the most commonly used query language in cloud-native Observability, PromQL is preliminarily supported in the latest version -- GreptimeDB v0.1, making it easier to integrate with the Prometheus ecosystem. We are constantly improving the compatibility of PromQL in GreptimeDB, and it is expected to reach 50% compatibility in v0.2 and 70% in v0.3.

- [Issue #930](https://github.com/GreptimeTeam/greptimedb/issues/930)

The table compaction function is enabled.

As a storage engine based on the LSM Tree architecture, compaction is essential. Currently, GreptimeDB performs compaction on SST files from various dimensions to improve storage and query efficiency.

- [PR #1000](https://github.com/GreptimeTeam/greptimedb/pull/1000)

Users can export data to files with Parquet format.

Parquet is a commonly used file format in columnar storage engines, known for its ability to efficiently and flexibly handle (store, compress, and query) large datasets. By offering this feature, GreptimeDB makes it handy for users to export the data to other columnar databases.

- [PR #1048](https://github.com/GreptimeTeam/greptimedb/pull/1048)

There's a simple REPL for development and debugging purposes.

Inspired by InfluxDB_IOx, GreptimeDB now offers an easy-to-use interactive interface (REPL) for developers to debug and troubleshoot any issues.

- [PR #928](https://github.com/GreptimeTeam/greptimedb/pull/928)

When using S3, OSS, or other object storage methods, caching is enabled by default in GreptimeDB, greatly improving query efficiency.


## New things

- We open-sourced [PromQL parser for Rust](https://github.com/GreptimeTeam/promql-parser) with high compatibility with [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)

- [GreptimeDB Go Client](https://github.com/GreptimeTeam/greptimedb-client-go) is a work-in-progress to build a GreptimeDB SDK in Go programming language.

- Our team participated in the 2023 Global AI Developer Conference and delivered an open-mic speech on product features, which helped us gain attention and recognition from the developer community and other start-ups.
