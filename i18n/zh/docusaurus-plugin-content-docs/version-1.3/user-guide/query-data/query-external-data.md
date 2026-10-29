---
keywords: [外部数据查询, 创建外部表, 查询目录数据, Parquet 文件, CSV 文件, ORC 文件, NDJson 文件]
description: 介绍如何查询外部数据文件，包括创建外部表和查询目录中的数据。
---

# 查询外部数据

## 对文件进行查询

目前，我们支持 `Parquet`、`CSV`、`ORC` 和 `NDJson` 格式文件的查询。

以 [Taxi Zone Lookup Table](https://d37ci6vzurychx.cloudfront.net/misc/taxi+_zone_lookup.csv) 数据为例。

```bash
mkdir -p greptimedb_data/copy
curl "https://d37ci6vzurychx.cloudfront.net/misc/taxi+_zone_lookup.csv" -o greptimedb_data/copy/taxi+_zone_lookup.csv
```

创建一个外部表：

```sql
CREATE EXTERNAL TABLE taxi_zone_lookup with (location='taxi+_zone_lookup.csv',format='csv');
```

:::tip NOTE
在单机部署模式下，引用本地文件的外部表 location 受限于 `storage.copy_root` 目录（默认为 `<data_home>/copy`），因此本示例将文件下载到 `greptimedb_data/copy` 目录，并使用相对于该目录的 location。在分布式部署模式下，不支持本地文件 location。详情请参阅[迁移本地 SQL 文件访问](/user-guide/deployments-administration/migrate-local-sql-file-access.md)。
:::

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
mkdir -p greptimedb_data/copy/external
curl "https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2022-01.parquet" -o greptimedb_data/copy/external/yellow_tripdata_2022-01.parquet
curl "https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2022-02.parquet" -o greptimedb_data/copy/external/yellow_tripdata_2022-02.parquet
```

验证下载情况：

```bash
ls -l greptimedb_data/copy/external
total 165368
-rw-r--r--  1 wenyxu  wheel  38139949 Apr 28 14:35 yellow_tripdata_2022-01.parquet
-rw-r--r--  1 wenyxu  wheel  45616512 Apr 28 14:36 yellow_tripdata_2022-02.parquet
```

创建外部表

```sql
CREATE EXTERNAL TABLE yellow_tripdata with(location='external/',format='parquet');
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

## 查询嵌套 JSON 字段

使用 `FORMAT = 'JSON'` 读取换行分隔的 JSON（NDJSON），每行包含一个 JSON 对象。在使用默认数据目录的单机部署中，将示例文件创建在 `greptimedb_data/copy` 下：

```bash
mkdir -p greptimedb_data/copy/logs
cat > greptimedb_data/copy/logs/requests.json <<'EOF'
{"host":"web-01","request":{"status":500,"path":"/api","client":{"ip":"10.0.0.1"}}}
{"host":"web-02","request":{"status":200,"path":"/health","client":{"ip":"10.0.0.2"}}}
EOF
```

省略列定义，让 GreptimeDB 从文件中推断表结构：

```sql
CREATE EXTERNAL TABLE logs
WITH (LOCATION = 'logs/', FORMAT = 'JSON');

DESC TABLE logs;
```

推断出的列类型如下：

```text
host                String
request             Struct<"client": Struct<"ip": String>, "path": String, "status": Int64>
greptime_timestamp  TimestampMillisecond
```

嵌套的 `request` 对象被推断为 `Struct` 列。自动添加的 `greptime_timestamp` 列作为时间索引，默认值为 `1970-01-01 00:00:00+0000`。

使用方括号访问嵌套字段，并根据字段值过滤：

```sql
SELECT
    host,
    request['status'] AS status,
    request['path'] AS path
FROM logs
WHERE request['status'] >= 500;
```

```text
+--------+--------+------+
| host   | status | path |
+--------+--------+------+
| web-01 | 500    | /api |
+--------+--------+------+
```

更深的嵌套字段可以连续使用方括号访问，也可以使用等价的 `get_field()` 函数：

```sql
SELECT host, request['client']['ip'] AS client_ip FROM logs;

SELECT host, get_field(request, 'status') AS status FROM logs;
```

`request['status']` 访问 `request` 结构体内部的字段，而 `"request.status"` 引用的是名称中包含点号的顶层列。自动推断会将嵌套对象保留为结构体，不会将它们展平为带点号的列名，也不会转换成 `JSON` 或 `JSON2` 列。
