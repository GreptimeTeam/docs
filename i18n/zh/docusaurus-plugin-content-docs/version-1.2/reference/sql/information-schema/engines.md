---
keywords: [存储引擎信息, ENGINES 表, 支持级别, 默认存储引擎, 事务支持]
description: ENGINES 表提供关于存储引擎的信息，检查 GreptimeDB 是否支持某个存储引擎或查看默认的存储引擎。
---

# ENGINES

`ENGINES`表提供了关于存储引擎的信息。当你需要检查 GreptimeDB 是否支持某个存储引擎或者查看默认的存储引擎时，该表非常有用。

`ENGINES`表包含以下列：

* `engine`：存储引擎名称。
* `support`：存储引擎的支持级别：

|值 | 含义|
| --- | --- |
| `YES` | 支持且在使用中 |
| `DEFAULT` | 支持且在使用中，且是默认的存储引擎 |
| `NO` | 不支持 |
| `DISABLED` | 支持但已被禁用 |


* `comment`：存储引擎的简要描述。
* `transactions`：存储引擎是否支持事务。
* `xa`：存储引擎是否支持 XA 事务。
* `savepoints`：存储引擎是否支持保存点。

例如：

```sql
SELECT * from INFORMATION_SCHEMA.ENGINES\G
```

结果如下：

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
