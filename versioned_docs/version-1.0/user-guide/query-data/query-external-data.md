---
keywords: [query external data, external tables, CSV, Parquet, ORC, NDJson, data files, SQL queries]
description: Instructions on querying external data files in GreptimeDB, including creating external tables and running queries on various file formats like CSV and Parquet.
---

# Query External Data

## Query on a file

Currently, we support queries on `Parquet`, `CSV`, `ORC`, and `NDJson` format file(s).

We use the [Taxi Zone Lookup Table](https://d37ci6vzurychx.cloudfront.net/misc/taxi+_zone_lookup.csv) data as an example.

```bash
curl "https://d37ci6vzurychx.cloudfront.net/misc/taxi+_zone_lookup.csv" -o /tmp/taxi+_zone_lookup.csv
```

Create an external table:

```sql
CREATE EXTERNAL TABLE taxi_zone_lookup with (location='/tmp/taxi+_zone_lookup.csv',format='csv');
```

You can check the schema of the external table like follows:

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

:::tip Note
Here, you may notice there is a `greptime_timestamp` column, which doesn't exist in the file. This is because when creating an external table, if we didn't specify a `TIME INDEX` column, the `greptime_timestamp` column is automatically added as the `TIME INDEX` column with a default value of `1970-01-01 00:00:00+0000`. You can find more details in the [create](/reference/sql/create.md#create-external-table) document.
:::

Now you can query on the external table:

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

## Query on a directory

Let's download some data:

```bash
mkdir /tmp/external
curl "https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2022-01.parquet" -o /tmp/external/yellow_tripdata_2022-01.parquet
curl "https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2022-02.parquet" -o /tmp/external/yellow_tripdata_2022-02.parquet
```

Verify the download:

```bash
ls -l /tmp/external
total 165368
-rw-r--r--  1 wenyxu  wheel  38139949 Apr 28 14:35 yellow_tripdata_2022-01.parquet
-rw-r--r--  1 wenyxu  wheel  45616512 Apr 28 14:36 yellow_tripdata_2022-02.parquet
```

Create the external table:

```sql
CREATE EXTERNAL TABLE yellow_tripdata with(location='/tmp/external/',format='parquet');
```

Run queries:

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

:::tip Note
The query result includes the value of the `greptime_timestamp` column, although it does not exist in the original file. All these column values are `1970-01-01 00:00:00+0000`, because when we create an external table, the `greptime_timestamp` column is automatically added with a default value of `1970-01-01 00:00:00+0000`. You can find more details in the [create](/reference/sql/create.md#create-external-table) document.
:::
