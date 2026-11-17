---
keywords: [Kafka, Kafka Connect, sink connector, data ingestion]
description: Write Kafka records to GreptimeDB with the GreptimeDB sink connector for Kafka Connect.
---

# Kafka

The [GreptimeDB sink connector for Kafka Connect](https://github.com/GreptimeTeam/greptimedb-kafka-connect)
writes Kafka records to GreptimeDB over gRPC. The connector configuration selects
which record fields become the time index, tags, and fields, as defined in the
[data model](/user-guide/concepts/data-model.md). GreptimeDB creates tables and
columns automatically.

The connector requires Java 8 or later and is tested with Kafka Connect 3.9 and
GreptimeDB v1.3.

When messages need decoding or transformation before they are written, use
Vector instead. Examples are InfluxDB line protocol metrics, and logs reshaped
with VRL or parsed by a [pipeline](/user-guide/logs/use-custom-pipelines.md).
See [Ingest Data via Kafka](/user-guide/ingest-data/for-observability/kafka.md).

## Install the connector

1. Download the plugin archive and its SHA-512 checksum from
   [GitHub Releases](https://github.com/GreptimeTeam/greptimedb-kafka-connect/releases),
   and verify the archive:

   ```shell
   curl -LO https://github.com/GreptimeTeam/greptimedb-kafka-connect/releases/download/vVAR::kafkaConnectVersion/greptimedb-kafka-connect-VAR::kafkaConnectVersion.zip
   curl -LO https://github.com/GreptimeTeam/greptimedb-kafka-connect/releases/download/vVAR::kafkaConnectVersion/greptimedb-kafka-connect-VAR::kafkaConnectVersion.zip.sha512
   sha512sum -c greptimedb-kafka-connect-VAR::kafkaConnectVersion.zip.sha512
   ```

2. Extract the archive into a directory listed in the `plugin.path` setting of
   each Connect worker:

   ```shell
   unzip greptimedb-kafka-connect-VAR::kafkaConnectVersion.zip -d /opt/connectors
   ```

3. Restart the Connect workers. The connector is installed when
   `curl -s http://localhost:8083/connector-plugins` lists
   `io.greptime.kafka.connect.GreptimeDBSinkConnector`.

## Create a connector

The following request creates a connector named `greptimedb-sink` through the
Kafka Connect REST API. It writes schemaless JSON records from topic `sensor` to
table `kafka_sensor`:

```shell
curl -X PUT -H 'Content-Type: application/json' \
  http://localhost:8083/connectors/greptimedb-sink/config -d '{
  "connector.class": "io.greptime.kafka.connect.GreptimeDBSinkConnector",
  "topics": "sensor",
  "value.converter": "org.apache.kafka.connect.json.JsonConverter",
  "value.converter.schemas.enable": "false",
  "greptimedb.endpoints": "127.0.0.1:4001",
  "table.name.format": "kafka_${topic}",
  "timestamp.field": "ts",
  "tag.fields": "device"
}'
```

Set `greptimedb.endpoints` to a GreptimeDB gRPC address that the Connect workers
can reach. The default gRPC port is `4001`.

When the following record arrives on topic `sensor`, the connector creates table
`kafka_sensor` with `ts` as the time index, `device` as a tag, and `temperature`
as a `DOUBLE` field:

```json
{"ts": 1700000000000, "device": "d1", "temperature": 21.5}
```

The commonly used options are:

| Option | Default | Description |
| --- | --- | --- |
| `greptimedb.endpoints` | Required | Comma-separated gRPC endpoints, in `host:port` format. |
| `greptimedb.database` | `public` | Destination database. |
| `greptimedb.username`, `greptimedb.password` | Empty | Credentials. When the username is empty, the connector does not authenticate. |
| `table.name.format` | `${topic}` | Destination table. `${topic}` is replaced with the record topic. |
| `timestamp.field` | Empty | Top-level field used as the time index. When empty, the connector writes the Kafka record timestamp to a column named `greptime_timestamp`. |
| `timestamp.precision` | `ms` | Precision of the time index column: `s`, `ms`, `us`, or `ns`. Integer timestamps are read in this unit. |
| `tag.fields` | Empty | Top-level fields written as tag columns. |

For TLS, field selection, retries, Avro with Schema Registry, type mapping, and
performance tuning, see the
[connector README](https://github.com/GreptimeTeam/greptimedb-kafka-connect#configuration).
The repository also contains a Docker Compose
[quick start](https://github.com/GreptimeTeam/greptimedb-kafka-connect#quick-start)
that runs Kafka, a Connect worker, and GreptimeDB locally.

## Limitations

- The first write creates the table and fixes its tags and column types.
  Changing `tag.fields` later does not change an existing table.
- A value whose type differs from the column type is rejected. In schemaless
  JSON, `20` is an integer and `20.5` is a float, so write floating-point values
  with a decimal point, such as `20.0`.
- The time index must be an integer epoch value or a Connect `Timestamp`.
  Convert string timestamps with the `TimestampConverter` transform.
- Nested `STRUCT`, `MAP`, and `ARRAY` values are not supported. Exclude them with
  `field.exclude`, or flatten structs and maps with the `Flatten` transform.
- Records that cannot be written follow the Kafka Connect `errors.tolerance`
  setting. By default, such a record fails the task. With `errors.tolerance=all`,
  it goes to the dead letter queue, or is dropped when none is configured.
- When GreptimeDB is unreachable or busy, the connector retries the batch and
  does not drop it.
- Delivery is at-least-once. A replayed row overwrites the row with the same
  tags and time index, unless the table uses `append_mode = 'true'`.
