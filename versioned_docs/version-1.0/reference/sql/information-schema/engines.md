---
keywords: [storage engines, engine support, transactions, XA transactions, savepoints]
description: Provides information about storage engines, including their support level, comments, and whether they support transactions, XA transactions, and savepoints.
---

# ENGINES

The `ENGINES` table provides information about storage engines. This is particularly useful for checking whether a storage engine is supported, or to see what the default engine is.

The `ENGINES` table has the following columns:

* `engine`:  the storage engine name.
* `support`: the level of support for the storage engine:

| Value | Meaning |
| --- | --- |
| `YES` | The engine is supported and is active |
| `DEFAULT` | Like `YES`, plus this is the default engine |
| `NO` | The engine is not supported |
| `DISABLED` | The engine is supported but has been disabled |

* `comment`: A brief description of the storage engine.
* `transactions`: Whether the storage engine supports transactions.
* `xa`: Whether the storage engine supports XA transactions.
* `savepoints`: Whether the storage engine supports savepoints.

For example:

```sql
SELECT * from INFORMATION_SCHEMA.ENGINES\G
```

The output is as follows:

```sql
*************************** 1. row ***************************
      engine: mito
     support: DEFAULT
     comment: Storage engine for time-series data
transactions: NO
          xa: NO
  savepoints: NO
*************************** 2. row ***************************
      engine: metric
     support: YES
     comment: Storage engine for observability scenarios, which is adept at handling a large number of small tables, making it particularly suitable for cloud-native monitoring
transactions: NO
          xa: NO
  savepoints: NO
```
