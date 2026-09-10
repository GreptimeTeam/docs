---
keywords: [gRPC SDKs, data ingestion, high-performance, create SDK]
description: Overview of using gRPC SDKs for efficient and high-performance data ingestion in GreptimeDB.
---

# gRPC

GreptimeDB offers [gRPC SDKs](/user-guide/ingest-data/for-iot/grpc-sdks/overview.md) for efficient and high-performance data ingestion.

If there is no SDK available for your programming language, you have the option to [create your own SDK](/contributor-guide/how-to/how-to-write-sdk.md) by following the guidelines provided in the contributor guide.

## Skip WAL for inserts

To skip Write-Ahead Log (WAL) writes for an ordinary insert request, pass the
`insert_skip_wal=true` hint in the `x-greptime-hints` gRPC metadata. This
setting applies only to the current request and does not change the table
option. Skipped data that has not been flushed is lost if the process restarts.

Set the hint to `false`, or omit it, to write to the WAL.
