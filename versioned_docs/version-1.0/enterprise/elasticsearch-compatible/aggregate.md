---
keywords: [ES, Elasticsearch, GreptimeDB, QueryDSL]
description: QueryDSL syntax supported by GreptimeDB Enterprise Edition
---

# Aggregation Queries

## Metric Aggregations

In GreptimeDB, metric aggregations are used to perform statistical calculations on numeric fields, such as sum, average, maximum, minimum, etc.

| Aggregation | Status | Description                                                  |
| ----------- | ------ | ------------------------------------------------------------ |
| sum         |        | Aggregates to calculate the sum of numeric fields.           |
| avg         |        | Aggregates to calculate the average of numeric fields.       |
| max         |        | Aggregates to calculate the maximum value of numeric fields. |
| min         |        | Aggregates to calculate the minimum value of numeric fields. |
| count       | ✅     | Aggregates to calculate the number of documents.             |

## Bucket Aggregations

In GreptimeDB, bucket aggregations are used to group documents, such as bucketing by time, category, or other fields.

| Aggregation    | Status | Description                                |
| -------------- | ------ | ------------------------------------------ |
| date_histogram | ✅     | Aggregates to bucket by time fields.       |
| terms          |        | Aggregates to group by values of specified |
