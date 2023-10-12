# Cluster

## Create a cluster

Please refer to [Kubernetes](./operations/kubernetes.md) to get the infomation about creating a Kubernetes cluster.

## Distributed Read/Write

### SQL

You can follow the steps to use SQL to play with distributed insertions and queries:

1. Use MySQL cli to connect to Frontend.

   ```shell
   mysql -h 127.0.0.1 -P 4002
   ```

2. Create a distributed table via `CREATE` statement.

   ```SQL
   CREATE TABLE dist_table(
       ts TIMESTAMP DEFAULT current_timestamp(),
       n INT,
       row_id INT,
       PRIMARY KEY(n),
       TIME INDEX (ts)
   )
   PARTITION BY RANGE COLUMNS (n) (
       PARTITION r0 VALUES LESS THAN (5),
       PARTITION r1 VALUES LESS THAN (9),
       PARTITION r2 VALUES LESS THAN (MAXVALUE),
   )
   engine=mito;
   ```

   The result looks like the following:

   ```shell
   mysql> CREATE TABLE dist_table(
       ->     ts TIMESTAMP DEFAULT current_timestamp(),
       ->     n INT,
       ->     row_id INT,
       ->     TIME INDEX (ts)
       ->     PRIMARY KEY(n),
       -> )
       -> PARTITION BY RANGE COLUMNS (n) (
       ->     PARTITION r0 VALUES LESS THAN (5),
       ->     PARTITION r1 VALUES LESS THAN (9),
       ->     PARTITION r2 VALUES LESS THAN (MAXVALUE),
       -> )
       -> engine=mito;
   Query OK, 3 rows affected (0.09 sec)
   ```

   The `dist_table` is distributed among the `Datanode`s. You can refer to ["Table Sharding"](https://docs.greptime.com/developer-guide/frontend/table-sharding) for more details.

3. Insert some data via `INSERT` statement.

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

4. Execute some queries via `SELECT` statement:

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

   You can also use SQL in [REPL](./operations/cli-repl.md) which can directly connect to the `Datanode`.
   In this way, you can verify that the queries from `Frontend` are actually been executed distributed. For more details about distributed querying, please see [this](/developer-guide/frontend/distributed-querying) document.
