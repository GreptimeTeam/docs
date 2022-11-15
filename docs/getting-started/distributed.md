# Distributed Getting Start

This article will show how to manually build a distributed GreptimeDB locally.

## Built From Source

1. Get source

    ```shell
    git clone https://github.com/GreptimeTeam/greptimedb.git
    ```

2. Start etcd. etcd is a default backend for Meta.

3. Start one Meta instance.

    ```shell
    cargo run -- metasrv start
    ```

    > If you are not using the default address of etcd (127.0.0.1:2379), you can set the address of etcd by option --store-addr.

4. Start three DataNode instances. In distributed mode, you need to specify node-id for startting DataNode. `node-id` needs to be globally unique.

    ```shell
    cargo run -- datanode start --rpc-addr=0.0.0.0:4100 --mysql-addr=0.0.0.0:4102 --metasrv-addr=0.0.0.0:3002 --node-id=1 
    cargo run -- datanode start --rpc-addr=0.0.0.0:4200 --mysql-addr=0.0.0.0:4202 --metasrv-addr=0.0.0.0:3002 --node-id=2
    cargo run -- datanode start --rpc-addr=0.0.0.0:4300 --mysql-addr=0.0.0.0:4302 --metasrv-addr=0.0.0.0:3002 --node-id=3
    ```

5. Start one Frontend instance. By default, protocols such as `MySQL` are exposed.

    ```shell
    cargo run -- frontend start --metasrv-addr=0.0.0.0:3002
    ```

## Distributed Read/Write

### SQL

You can follow the steps to use `SQL` to play with distributed insertions and queries:

1. Use `MySQL cli` to connect to Frontend.

    ```shell
    mysql -h 127.0.0.1 -P 4002
    ```

2. Create a table via `CREATE` statement.

    ```shell
    # create statement
    CREATE TABLE dist_table(
        ts TIMESTAMP DEFAULT current_timestamp(),
        n INT,
        row_id INT,
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
        -> )
        -> PARTITION BY RANGE COLUMNS (n) (
        ->     PARTITION r0 VALUES LESS THAN (5),
        ->     PARTITION r1 VALUES LESS THAN (9),
        ->     PARTITION r2 VALUES LESS THAN (MAXVALUE),
        -> )
        -> engine=mito;
    Query OK, 3 rows affected (0.09 sec)
    ```

3. Insert some data via `INSERT` statement.

    ```shell
    # insert statement
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

    ```shell
    mysql> SELECT * FROM dist_table ORDER BY n LIMIT 5;
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

    mysql> SELECT MAX(n) FROM dist_table;
    +-------------------+
    | MAX(dist_table.n) |
    +-------------------+
    |                12 |
    +-------------------+
    1 row in set (0.057 sec)

    mysql> SELECT MIN(n) FROM dist_table;
    +-------------------+
    | MIN(dist_table.n) |
    +-------------------+
    |                 1 |
    +-------------------+
    1 row in set (0.079 sec)

    mysql> SELECT * FROM dist_table WHERE n > 2 AND n < 10 ORDER BY row_id;
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

    mysql> SELECT * FROM dist_table WHERE row_id = 10;
    +---------------------+------+--------+
    | ts                  | n    | row_id |
    +---------------------+------+--------+
    | 2022-11-14 12:02:32 |   10 |     10 |
    +---------------------+------+--------+
    1 row in set (0.03 sec)
    ```

You can also use `MySQL cli` to directly connect to the Datanodes, to see how data is distributed. In this way, you can verify that the queries from Frontend are actually been executed distributed.
