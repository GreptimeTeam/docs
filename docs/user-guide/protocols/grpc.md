---
keywords: [gRPC SDKs, data ingestion, high-performance, create SDK]
description: Overview of using gRPC SDKs for efficient and high-performance data ingestion in GreptimeDB.
---

# gRPC

GreptimeDB offers [gRPC SDKs](/user-guide/ingest-data/for-iot/grpc-sdks/overview.md) for efficient and high-performance data ingestion.

If there is no SDK available for your programming language, you have the option to [create your own SDK](/contributor-guide/how-to/how-to-write-sdk.md) by following the guidelines provided in the contributor guide.

## Disable WAL for a single write request

Set `insert_skip_wal=true` in the `x-greptime-hints` gRPC metadata to disable the Write-Ahead Log (WAL) for the current insert request.

This setting applies only to the current request and does not change the [table-level `skip_wal` option](/reference/sql/create.md#create-a-table-with-wal-disabled).
Setting `insert_skip_wal` to `false` or omitting the hint does not enable WAL if the table-level `skip_wal` option is `true`.

:::warning
When WAL is disabled, unflushed data is lost if the process restarts.
Use this option only when the data can be ingested again from its source.
:::
