---
keywords: [外部数据查询, 创建外部表, 查询目录数据, Parquet 文件, CSV 文件, ORC 文件, NDJson 文件]
description: 介绍如何查询外部数据文件，包括创建外部表和查询目录中的数据。
---

# 查询外部数据

## 对文件进行查询

目前，我们支持 `Parquet`、`CSV`、`ORC` 和 `NDJson` 格式文件的查询。

以 [Taxi Zone Lookup Table](https://d37ci6vzurychx.cloudfront.net/misc/taxi+_zone_lookup.csv) 数据为例。

```bash
curl "https://d37ci6vzurychx.cloudfront.net/misc/taxi+_zone_lookup.csv" -o /tmp/taxi+_zone_lookup.csv
```

创建一个外部表：

```sql
CREATE EXTERNAL TABLE taxi_zone_lookup with (location='/tmp/taxi+_zone_lookup.csv',format='csv');
```

检查外部表的组织和结构：

```sql
DESC TABLE taxi_zone_lookup;
```

```sql
+--------------------+----------------------+------+------+--------------------------+---------------+
| Column             | Type                 | Key  | Null | Default                  | Semantic Type |
+--------------------+----------------------+------+------+--------------------------+---------------+
| LocationID         | Int64                |      | YES  |                          | FIELD         |
| Borough            | String               |      | YES  |                          | FIELD         |
| Zone               | String               |      | YES  |                          | FIELD         |
| service_zone       | String               |      | YES  |                          | FIELD         |
| greptime_timestamp | TimestampMillisecond | PRI  | NO   | 1970-01-01 00:00:00+0000 | TIMESTAMP     |
+--------------------+----------------------+------+------+--------------------------+---------------+
4 rows in set (0.00 sec)
```

:::tip 注意
在这里，你可能会注意到出现了一个 `greptime_timestamp` 列，这个列作为表的时间索引列，在文件中并不存在。这是因为在创建外部表时，我们没有指定时间索引列，`greptime_timestamp` 列被自动添加作为时间索引列，并且默认值为 `1970-01-01 00:00:00+0000`。你可以在 [create](/reference/sql/create.md#create-external-table) 文档中查找更多详情。
:::

现在就可以查询外部表了：

```sql
SELECT `Zone`, `Borough` FROM taxi_zone_lookup LIMIT 5;
```

```sql
+-------------------------+---------------+
| Zone                    | Borough       |
+-------------------------+---------------+
| Newark Airport          | EWR           |
| Jamaica Bay             | Queens        |
| Allerton/Pelham Gardens | Bronx         |
| Alphabet City           | Manhattan     |
| Arden Heights           | Staten Island |
+-------------------------+---------------+
```

## 对目录进行查询

首先下载一些数据：

```bash
mkdir /tmp/external
curl "https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2022-01.parquet" -o /tmp/external/yellow_tripdata_2022-01.parquet
curl "https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2022-02.parquet" -o /tmp/external/yellow_tripdata_2022-02.parquet
```

验证下载情况：

```bash
ls -l /tmp/external
total 165368
-rw-r--r--  1 wenyxu  wheel  38139949 Apr 28 14:35 yellow_tripdata_2022-01.parquet
-rw-r--r--  1 wenyxu  wheel  45616512 Apr 28 14:36 yellow_tripdata_2022-02.parquet
```

创建外部表

```sql
CREATE EXTERNAL TABLE yellow_tripdata with(location='/tmp/external/',format='parquet');
```

执行查询：

```sql
SELECT count(*) FROM yellow_tripdata;
```

```sql
+-----------------+
| COUNT(UInt8(1)) |
+-----------------+
|         5443362 |
+-----------------+
1 row in set (0.48 sec)
```

```sql
SELECT * FROM yellow_tripdata LIMIT 5;
```

```sql
+----------+----------------------+-----------------------+-----------------+---------------+------------+--------------------+--------------+--------------+--------------+-------------+-------+---------+------------+--------------+-----------------------+--------------+----------------------+-------------+---------------------+
| VendorID | tpep_pickup_datetime | tpep_dropoff_datetime | passenger_count | trip_distance | RatecodeID | store_and_fwd_flag | PULocationID | DOLocationID | payment_type | fare_amount | extra | mta_tax | tip_amount | tolls_amount | improvement_surcharge | total_amount | congestion_surcharge | airport_fee | greptime_timestamp  |
+----------+----------------------+-----------------------+-----------------+---------------+------------+--------------------+--------------+--------------+--------------+-------------+-------+---------+------------+--------------+-----------------------+--------------+----------------------+-------------+---------------------+
|        1 | 2022-02-01 00:06:58  | 2022-02-01 00:19:24   |               1 |           5.4 |          1 | N                  |          138 |          252 |            1 |          17 |  1.75 |     0.5 |        3.9 |            0 |                   0.3 |        23.45 |                    0 |        1.25 | 1970-01-01 00:00:00 |
|        1 | 2022-02-01 00:38:22  | 2022-02-01 00:55:55   |               1 |           6.4 |          1 | N                  |          138 |           41 |            2 |          21 |  1.75 |     0.5 |          0 |         6.55 |                   0.3 |         30.1 |                    0 |        1.25 | 1970-01-01 00:00:00 |
|        1 | 2022-02-01 00:03:20  | 2022-02-01 00:26:59   |               1 |          12.5 |          1 | N                  |          138 |          200 |            2 |        35.5 |  1.75 |     0.5 |          0 |         6.55 |                   0.3 |         44.6 |                    0 |        1.25 | 1970-01-01 00:00:00 |
|        2 | 2022-02-01 00:08:00  | 2022-02-01 00:28:05   |               1 |          9.88 |          1 | N                  |          239 |          200 |            2 |          28 |   0.5 |     0.5 |          0 |            3 |                   0.3 |         34.8 |                  2.5 |           0 | 1970-01-01 00:00:00 |
|        2 | 2022-02-01 00:06:48  | 2022-02-01 00:33:07   |               1 |         12.16 |          1 | N                  |          138 |          125 |            1 |        35.5 |   0.5 |     0.5 |       8.11 |            0 |                   0.3 |        48.66 |                  2.5 |        1.25 | 1970-01-01 00:00:00 |
+----------+----------------------+-----------------------+-----------------+---------------+------------+--------------------+--------------+--------------+--------------+-------------+-------+---------+------------+--------------+-----------------------+--------------+----------------------+-------------+---------------------+
5 rows in set (0.11 sec)
```

:::tip 注意
查询结果中包含 `greptime_timestamp` 列的值，尽管它在原始文件中并不存在。这个列的所有值均为 `1970-01-01 00:00:00+0000`，这是因为我们在创建外部表时，自动添加列 `greptime_timestamp`，并且默认值为 `1970-01-01 00:00:00+0000`。你可以在 [create](/reference/sql/create.md#create-external-table) 文档中查找更多详情。
:::
