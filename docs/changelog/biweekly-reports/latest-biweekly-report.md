# 2023.06.05 - 2023.06.18 – Welcome our first external committer!

June 21, 2023 · 6 min read

## Summary
Together with all our contributors worldwide, we are glad to see GreptimeDB making remarkable progress for the better. In the past two weeks, a total of 47 PRs were merged for our program. Below are some highlights:
- Support azblob storage
- Support `/api/v1/series` for Prometheus
- Add HTTP API for CPU profiling

## Contributor list: (in alphabetical order)
We would like to give a special thanks to Eugene Tolbakov [@etolbakov](https://github.com/etolbakov), who has continued to contribute to our project and has submitted **17** PRs, **16** of which have been successfully merged! He has also contributed more than **20** comments to our issues in the past month, and interacted with us in the Slack community, providing us with valuable advice. So he will be our first committer, thanks and congratulations again!

For the past two weeks, our community has been super active with a total of **4 PRs** from 4 contributors merged successfully and lots pending to be merged. 
Congrats on becoming our most active contributors in the past 2 weeks:

- [@etolbakov](https://github.com/etolbakov) ([db#1632](https://github.com/GreptimeTeam/greptimedb/pull/1632))
- [@NiwakaDev](https://github.com/NiwakaDev) ([db#1620](https://github.com/GreptimeTeam/greptimedb/pull/1620))
- [@QuenKar](https://github.com/QuenKar) ([db#1749](https://github.com/GreptimeTeam/greptimedb/pull/1749))
- [@WangTingZheng](https://github.com/WangTingZheng) ([db#1756](https://github.com/GreptimeTeam/greptimedb/pull/1756))

👏 Let's welcome **@WangTingZheng** as the new contributors to join our community with their first PR merged. 

A big THANK YOU for the generous and brilliant contributions! It is people like you who are making GreptimeDB a great product. Let's build an even greater community together.

## Highlights of Recent PR 
### [Support azblob storage](https://github.com/GreptimeTeam/greptimedb/pull/1659)
[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs/) is an object storage service provided by Azure. After this PR, GreptimeDB now supports Azure Blob Storage as well:
- add `ObjectStoreConfig::Azblob` for azblob object storage configurations.
- Create azblob instance in the datanode when configured.
- Add azblob storage tests in tests-integration.

### [Support `/api/v1/series` for Prometheus](https://github.com/GreptimeTeam/greptimedb/pull/1620)
We now support `/api/v1/series` for Prometheus. This interface can be used to implement query hints or completions, and is one of the meta-information-related interfaces provided by Prometheus

### [Add HTTP API for CPU profiling](https://github.com/GreptimeTeam/greptimedb/pull/1694)
This PR adds an HTTP API for CPU profiling. It also refactors the mem prof handler to make chaining handlers to the router easier.

Sample at 99 Hertz, for 5 seconds, output report in protobuf format.

```rust
curl -s '0:4000/v1/prof/cpu' > /tmp/pprof.out
```

Sample at 99 Hertz, for 60 seconds, output report in flamegraph format.

```rust
curl -s '0:4000/v1/prof/cpu?seconds=60&output=flamegraph' > /tmp/pprof.svg
```

Sample at 49 Hertz, for 10 seconds, output report in text format.

```rust
curl -s '0:4000/v1/prof/cpu?seconds=10&frequency=49&output=text' > /tmp/pprof.txt
```

This feature is disabled by default. To enable it, we need to build the binary with `pprof` feature

```rust
cargo build --features=pprof
```

Because the pprof API needs to sample for a specific duration, we must apply the timeout layer before it. This PR also closes the test region in TestBase, which should fix the test case `test_flush_and_reopen`.

### [Add timestamp types as arguments](https://github.com/GreptimeTeam/greptimedb/pull/1632)

We add more argument types for `to_unixtime` function

These are the updates of GreptimeDB and we are constantly making progress. We believe that the strength of our software shines in the strengths of each individual community member. Thanks for all your contributions.

## New Things
The Greptime team participated in Rust China Conf 2023 and World Of Tech 2023 last weekend, sharing technology and interacting with attendees in a positive way, which got a great success!