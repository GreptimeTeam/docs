# 2022.12.12 - 2022.12.23 – Open-sourcing dashboard for GreptimeDB

Jan 04, 2023 · 6 min read

## Summary

First, we would like to express our sincere wishes to you and your family, may this New Year brings love, happiness and joy to your life.
In our first blog of 2023, we would like to reflect on what we have achieved since we open-sourced at the end of 2022.
Some challenges we have overcome with great contributors from the community include:

1. The official version of Arrow/Parquet is ready for use, enabling us to keep pace with the latest updates from DataFusion;
2. Restructured APIs of gRPC, providing a much more friendly and smooth experience for developers;
3. Achieved LogStore compaction for the local file version and further optimized our storage engine;
4. Last but not least, GreptimeDB has a new skin! The dashboard is on GitHub, and check it out [here](https://github.com/GreptimeTeam/dashboard).

Join us at [GitHub](https://github.com/GreptimeTeam/greptimedb).

## Contributor list: (In alphabetical order)

[@masonyc](https://github.com/masonyc)(new contributor)

[@yfractal](https://github.com/yfractal)

A big THANK YOU for the generous and brilliant contributions! It is people like you who are making GreptimeDB a great product. Let's build an even greater community together in the new year.
And WELCOME [@masonyc](https://github.com/masonyc)!

## Good first issue

### Issue [#786](https://github.com/GreptimeTeam/greptimedb/issues/786) (Help wanted)

Issue description: **Support `LIMIT` in distributed table scan**

This issue is working on a query optimization problem: `limit` cannot pushdown to the [Datanode](https://docs.greptime.com/developer-guide/datanode/overview) level in GreptimeDB's distributed mode. This is because we haven't finished the serialization/deserialization of `limit` based on Substrait[1]. A quick walkthrough of Substrait's specification reveals that there's no one-to-one relationship between `limit` and Substrait's types. The chances are that we could resolve this problem by using Substrait's extensions.

[1]: [Substrait](https://substrait.io/): Cross-Language Serialization for Relational Algebra.

### Issue [#602](https://github.com/GreptimeTeam/greptimedb/issues/602) (Help wanted)

Issue description: **System tables for inner metrics**

This good first issue was published on Nov 21 last year and we are still calling for contributors to tackle. By working on it with our contributors, GreptimeDB can fill the gap and build Observability functions from 0 to 1. You can find more details [here](https://github.com/GreptimeTeam/greptimedb/issues/602) or from our last [biweekly post](https://greptime.com/blogs/2022-12-16-biweekly-report.html).

## Highlights of Recent PR

### What's cooking on DB's develop branch

[#753](https://github.com/GreptimeTeam/greptimedb/pull/753)

**GreptimeDB uses the official version of Arrow/Parquet now.** Since the maintenance of Datafusion's Arrow2 branch is suspended, we decided to switch to Arrow to keep up with the latest features. This was a big challenge, and we are happy to announce that the switch was a success.

[#490](https://github.com/GreptimeTeam/greptimedb/issues/490)

**The APIs of our gRPC need to be restructured**, for example:

- The names "object" and "expr" used during the implementation of gRPC were not clear;
- Conventions between gRPC objects and the results/requests of other protocols are tedious and cumbersome;
- Hard to debug using gRPC CLI tools;
- etc.

Heavy as the task is, we've broken it into several subtasks, and it is now approaching completion!

[#740](https://github.com/GreptimeTeam/greptimedb/issues/740)

`LogStore` is a component of GreptimeDB's WAL, and **this PR achieves compaction for the local file version**. In summary, `LogStore` starts a background task that periodically scans the log entries of the data that has been successfully flushed in all regions, and then reclaims the log entries to release disk space.

### New things

- The UI of our Dashboard is getting polished, and it's now available as a docker image, see [here](https://github.com/GreptimeTeam/dashboard/tree/main/docker). We set up CI processes to upload weekly build to [docker hub](https://hub.docker.com/repository/docker/greptime/greptimedb-dashboard).
- GreptimeDB weekly build is available on [AUR](https://aur.archlinux.org/packages/greptimedb-bin). ArchLinux users can install `greptimedb` as a `systemd` service. Please note that this build is experimental and we keep pushing for new changes every week.
