# OpenTelemetry Protocol(OTLP)

[OpenTelemetry](https://opentelemetry.io/) is a vendor-neutral open-source observability framework for instrumenting, generating, collecting, and exporting telemetry data such as traces, metrics, logs. The OpenTelemetry Protocol (OTLP) defines the encoding, transport, and delivery mechanism of telemetry data between telemetry sources, intermediate processes such as collectors and telemetry backends.

## OTLP/HTTP

<!--@include: ../../db-cloud-shared/clients/otlp-integration.md-->

## Data Model

The OTLP metrics data model is mapped to the GreptimeDB data model according to the following rules:
- The name of the Metric will be used as the name of the GreptimeDB table, and the table will be automatically created if it does not exist.
- All attributes, including resource attributes, scope attributes, and data point attributes, will be used as tags field of the GreptimeDB table.
- The timestamp of the data point will be used as the timestamp index of GreptimeDB, and the column name is `greptime_timestamp`.
- The data of Gauge/Sum data types will be used as the field column of GreptimeDB, and the column name is `greptime_value`.
- Each quantile of the Summary data type will be used as a separated data column of GreptimeDB, and the column name is `greptime_pxx`, where xx is the quantile, such as 90/99, etc.
- Histogram and ExponentialHistogrrm are not supported yet, we may introduce the Histogram data type to natively support these two types in a later version.
