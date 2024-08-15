# Manage Pipelines

In GreptimeDB, each `pipeline` is a collection of data processing units used for parsing and transforming the ingested log content. This document provides guidance on creating and deleting pipelines to efficiently manage the processing flow of log data.


For specific pipeline configurations, please refer to the [Pipeline Configuration](pipeline-config.md) documentation.

## Create a Pipeline

GreptimeDB provides a dedicated HTTP interface for creating pipelines.
Assuming you have prepared a pipeline configuration file `pipeline.yaml`, use the following command to upload the configuration file, where `test` is the name you specify for the pipeline:

```shell
## Upload the pipeline file. 'test' is the name of the pipeline
curl -X "POST" "http://localhost:4000/v1/events/pipelines/test" -F "file=@pipeline.yaml"
```

## Delete a Pipeline

You can use the following HTTP interface to delete a pipeline:

```shell
## 'test' is the name of the pipeline
curl -X "DELETE" "http://localhost:4000/v1/events/pipelines/test?version=2024-06-27%2012%3A02%3A34.257312110Z"
```

In the above example, we deleted a pipeline named `test`. The `version` parameter is required to specify the version of the pipeline to be deleted.

## Query Pipelines

Currently, you can use SQL to query pipeline information.

```sql
SELECT * FROM greptime_private.pipelines;
```

Please note that if you are using the MySQL or PostgreSQL protocol to connect to GreptimeDB, the precision of the pipeline time information may vary, and nanosecond-level precision may be lost.

To address this issue, you can cast the `created_at` field to a timestamp to view the pipeline's creation time. For example, the following query displays `created_at` in `bigint` format:

```sql
SELECT name, pipeline, created_at::bigint FROM greptime_private.pipelines;
```

The query result is as follows:

```
 name |             pipeline              | greptime_private.pipelines.created_at
------+-----------------------------------+---------------------------------------
 test | processors:                      +|                   1719489754257312110
      |   - date:                        +|
      |       field: time                +|
      |       formats:                   +|
      |         - "%Y-%m-%d %H:%M:%S%.3f"+|
      |       ignore_missing: true       +|
      |                                  +|
      | transform:                       +|
      |   - fields:                      +|
      |       - id1                      +|
      |       - id2                      +|
      |     type: int32                  +|
      |   - fields:                      +|
      |       - type                     +|
      |       - logger                   +|
      |     type: string                 +|
      |     index: tag                   +|
      |   - fields:                      +|
      |       - log                      +|
      |     type: string                 +|
      |     index: fulltext              +|
      |   - field: time                  +|
      |     type: time                   +|
      |     index: timestamp             +|
      |                                   |
(1 row)
```

Then, you can use a program to convert the bigint type timestamp from the SQL result into a time string.

```shell
timestamp_ns="1719489754257312110"; readable_timestamp=$(TZ=UTC date -d @$((${timestamp_ns:0:10}+0)) +"%Y-%m-%d %H:%M:%S").${timestamp_ns:10}Z; echo "Readable timestamp (UTC): $readable_timestamp"
```

Output:

```shell
Readable timestamp (UTC): 2024-06-27 12:02:34.257312110Z
```

The output `Readable timestamp (UTC)` represents the creation time of the pipeline and also serves as the version number.