---
keywords: [data ingestion, automatic schema generation, observability, IoT, real-time monitoring]
description: Overview of data ingestion methods in GreptimeDB, including automatic schema generation and recommended methods for different scenarios.
---

# Ingest Data

GreptimeDB supports automatic schema generation and flexible data ingestion methods,
enabling you to easily write data tailored to your specific scenarios.

## Automatic Schema Generation

GreptimeDB supports schemaless writing, automatically creating tables and adding necessary columns as data is ingested.
This capability ensures that you do not need to manually define schemas beforehand, making it easier to manage and integrate diverse data sources seamlessly.
<!-- TODO: add links to protocols and integrations -->
This feature is supported for all protocols and integrations, except [SQL](./for-iot/sql.md).

## Recommended Data Ingestion Methods

GreptimeDB supports various data ingestion methods for specific scenarios, ensuring optimal performance and integration flexibility.

- [For Observability Scenarios](./for-observability/overview.md): Suitable for real-time monitoring and alerting.
- [For IoT Scenarios](./for-iot/overview.md): Suitable for real-time data and complex IoT infrastructures.

## Next Steps

- [Query Data](/user-guide/query-data/overview.md): Learn how to explore your data by querying your GreptimeDB database.
- [Manage Data](/user-guide/manage-data/overview.md): Learn how to update and delete data, etc., to ensure data integrity and efficient data management.

