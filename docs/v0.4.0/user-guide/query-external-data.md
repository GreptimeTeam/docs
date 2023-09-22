# Query External Data

## Query on a file

Currently, we support queries on `Parquet`, `CSV`, and `NDJson` format file(s).

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
+--------------+--------+------+------+---------+---------------+
| Column       | Type   | Key  | Null | Default | Semantic Type |
+--------------+--------+------+------+---------+---------------+
| LocationID   | Int64  |      | YES  |         | FIELD         |
| Borough      | String |      | YES  |         | FIELD         |
| Zone         | String |      | YES  |         | FIELD         |
| service_zone | String |      | YES  |         | FIELD         |
+--------------+--------+------+------+---------+---------------+
4 rows in set (0.00 sec)
```

Now you can query on the external table:
```sql
SELECT "Zone","Borough" FROM taxi_zone_lookup LIMIT 5;
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
+----------+--------------------------+--------------------------+-----------------+---------------+------------+--------------------+--------------+--------------+--------------+-------------+-------+---------+------------+--------------+-----------------------+--------------+----------------------+-------------+
| VendorID | tpep_pickup_datetime     | tpep_dropoff_datetime    | passenger_count | trip_distance | RatecodeID | store_and_fwd_flag | PULocationID | DOLocationID | payment_type | fare_amount | extra | mta_tax | tip_amount | tolls_amount | improvement_surcharge | total_amount | congestion_surcharge | airport_fee |
+----------+--------------------------+--------------------------+-----------------+---------------+------------+--------------------+--------------+--------------+--------------+-------------+-------+---------+------------+--------------+-----------------------+--------------+----------------------+-------------+
|        1 | 2022-01-01 09:35:40+0900 | 2022-01-01 09:53:29+0900 |               2 |           3.8 |          1 | N                  |          142 |          236 |            1 |        14.5 |     3 |     0.5 |       3.65 |            0 |                   0.3 |        21.95 |                  2.5 |           0 |
|        1 | 2022-01-01 09:33:43+0900 | 2022-01-01 09:42:07+0900 |               1 |           2.1 |          1 | N                  |          236 |           42 |            1 |           8 |   0.5 |     0.5 |          4 |            0 |                   0.3 |         13.3 |                    0 |           0 |
|        2 | 2022-01-01 09:53:21+0900 | 2022-01-01 10:02:19+0900 |               1 |          0.97 |          1 | N                  |          166 |          166 |            1 |         7.5 |   0.5 |     0.5 |       1.76 |            0 |                   0.3 |        10.56 |                    0 |           0 |
|        2 | 2022-01-01 09:25:21+0900 | 2022-01-01 09:35:23+0900 |               1 |          1.09 |          1 | N                  |          114 |           68 |            2 |           8 |   0.5 |     0.5 |          0 |            0 |                   0.3 |         11.8 |                  2.5 |           0 |
|        2 | 2022-01-01 09:36:48+0900 | 2022-01-01 10:14:20+0900 |               1 |           4.3 |          1 | N                  |           68 |          163 |            1 |        23.5 |   0.5 |     0.5 |          3 |            0 |                   0.3 |         30.3 |                  2.5 |           0 |
+----------+--------------------------+--------------------------+-----------------+---------------+------------+--------------------+--------------+--------------+--------------+-------------+-------+---------+------------+--------------+-----------------------+--------------+----------------------+-------------+
5 rows in set (0.11 sec)
```