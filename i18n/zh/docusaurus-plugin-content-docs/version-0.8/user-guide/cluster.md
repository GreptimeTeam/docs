# 集群

## 创建一个集群

请参考 [Kubernetes](./operations/deploy-on-kubernetes/overview.md) 以获得关于创建 Kubernetes 集群的信息。

## 分布式读/写

### SQL

可以按照步骤使用 SQL 来进行分布式插入和查询：

1. 使用 MySQL cli 连接到 Frontend。

   ```shell
   mysql -h 127.0.0.1 -P 4002
   ```

2. 通过 `CREATE` 语句创建一个分布式表。

   ```SQL
   CREATE TABLE dist_table(
       ts TIMESTAMP DEFAULT current_timestamp(),
       n INT,
       row_id INT,
       PRIMARY KEY(n),
       TIME INDEX (ts)
   )
   PARTITION ON COLUMNS (n) (
      n < 5,
      n >= 5 AND n < 9,
      n >= 9
   )
   engine=mito;
   ```

   结果如下：

   ```shell
   mysql> CREATE TABLE dist_table(
       ->     ts TIMESTAMP DEFAULT current_timestamp(),
       ->     n INT,
       ->     row_id INT,
       ->     TIME INDEX (ts)
       ->     TIME INDEX (ts)
       -> )
       -> PARTITION ON COLUMNS (n) (
       ->    n < 5,
       ->    n >= 5 AND n < 9,
       ->    n >= 9
       -> )
       -> engine=mito;
   Query OK, 3 rows affected (0.09 sec)
   ```

   `dist_table` 被分布在 `Datanode` 中。你可以参考 ["Table Sharding"](/contributor-guide/frontend/table-sharding.md) 了解更多细节。

3. 通过 `INSERT` 语句输入一些数据。

   ```SQL
   INSERT INTO dist_table(n, row_id) VALUES (1, 1);
   INSERT INTO dist_table(n, row_id) VALUES (2, 2);
   INSERT INTO dist_table(n, row_id) VALUES (3, 3);
   INSERT INTO dist_table(n, row_id) VALUES (4, 4);
   INSERT INTO dist_table(n, row_id) VALUES (5, 5);
   INSERT INTO dist_table(n, row_id) VALUES (6, 6);
   INSERT INTO dist_table(n, row_id) VALUES (7, 7);
   INSERT INTO dist_table(n, row_id) VALUES (8, 8);
   INSERT INTO dist_table(n, row_id) VALUES (9, 9);
   INSERT INTO dist_table(n, row_id) VALUES (10, 10);
   INSERT INTO dist_table(n, row_id) VALUES (11, 11);
   INSERT INTO dist_table(n, row_id) VALUES (12, 12);
   ```

4. 通过 `SELECT` 语句执行查询：

   ```sql
   SELECT * FROM dist_table ORDER BY n LIMIT 5;
   ```

   ```sql
   +---------------------+------+--------+
   | ts                  | n    | row_id |
   +---------------------+------+--------+
   | 2022-11-14 12:02:32 |    1 |      1 |
   | 2022-11-14 12:02:32 |    2 |      2 |
   | 2022-11-14 12:02:32 |    3 |      3 |
   | 2022-11-14 12:02:32 |    4 |      4 |
   | 2022-11-14 12:02:32 |    5 |      5 |
   +---------------------+------+--------+
   5 rows in set (0.081 sec)
   ```

   ```sql
   SELECT MAX(n) FROM dist_table;
   ```

   ```sql
   +-------------------+
   | MAX(dist_table.n) |
   +-------------------+
   |                12 |
   +-------------------+
   1 row in set (0.057 sec)
   ```

   ```sql
   SELECT MIN(n) FROM dist_table;
   ```

   ```sql
   +-------------------+
   | MIN(dist_table.n) |
   +-------------------+
   |                 1 |
   +-------------------+
   1 row in set (0.079 sec)
   ```

   ```sql
   SELECT * FROM dist_table WHERE n > 2 AND n < 10 ORDER BY row_id;
   ```

   ```sql
   +---------------------+------+--------+
   | ts                  | n    | row_id |
   +---------------------+------+--------+
   | 2022-11-14 12:02:32 |    3 |      3 |
   | 2022-11-14 12:02:32 |    4 |      4 |
   | 2022-11-14 12:02:32 |    5 |      5 |
   | 2022-11-14 12:02:32 |    6 |      6 |
   | 2022-11-14 12:02:32 |    7 |      7 |
   | 2022-11-14 12:02:32 |    8 |      8 |
   | 2022-11-14 12:02:32 |    9 |      9 |
   +---------------------+------+--------+
   7 rows in set (0.02 sec)
   ```

   ```sql
   SELECT * FROM dist_table WHERE row_id = 10;
   ```

   ```sql
   +---------------------+------+--------+
   | ts                  | n    | row_id |
   +---------------------+------+--------+
   | 2022-11-14 12:02:32 |   10 |     10 |
   +---------------------+------+--------+
   1 row in set (0.03 sec)
   ```

