# PARTITIONS

The `PARTITIONS` table provides information about partitioned tables.

```sql
USE INFORMATION_SCHEMA;
DESC PARTITIONS;
```

The output is as follows:

```sql
+-------------------------------+----------+------+------+---------+---------------+
| Column                        | Type     | Key  | Null | Default | Semantic Type |
+-------------------------------+----------+------+------+---------+---------------+
| table_catalog                 | String   |      | NO   |         | FIELD         |
| table_schema                  | String   |      | NO   |         | FIELD         |
| table_name                    | String   |      | NO   |         | FIELD         |
| partition_name                | String   |      | NO   |         | FIELD         |
| subpartition_name             | String   |      | YES  |         | FIELD         |
| partition_ordinal_position    | Int64    |      | YES  |         | FIELD         |
| subpartition_ordinal_position | Int64    |      | YES  |         | FIELD         |
| partition_method              | String   |      | YES  |         | FIELD         |
| subpartition_method           | String   |      | YES  |         | FIELD         |
| partition_expression          | String   |      | YES  |         | FIELD         |
| subpartition_expression       | String   |      | YES  |         | FIELD         |
| partition_description         | String   |      | YES  |         | FIELD         |
| table_rows                    | Int64    |      | YES  |         | FIELD         |
| avg_row_length                | Int64    |      | YES  |         | FIELD         |
| data_length                   | Int64    |      | YES  |         | FIELD         |
| max_data_length               | Int64    |      | YES  |         | FIELD         |
| index_length                  | Int64    |      | YES  |         | FIELD         |
| data_free                     | Int64    |      | YES  |         | FIELD         |
| create_time                   | DateTime |      | YES  |         | FIELD         |
| update_time                   | DateTime |      | YES  |         | FIELD         |
| check_time                    | DateTime |      | YES  |         | FIELD         |
| checksum                      | Int64    |      | YES  |         | FIELD         |
| partition_comment             | String   |      | YES  |         | FIELD         |
| nodegroup                     | String   |      | YES  |         | FIELD         |
| tablespace_name               | String   |      | YES  |         | FIELD         |
| greptime_partition_id         | UInt64   |      | YES  |         | FIELD         |
+-------------------------------+----------+------+------+---------+---------------+
26 rows in set (0.01 sec)
```

```sql
CREATE TABLE public.test_p (
  a INT PRIMARY KEY,
  b STRING,
  ts TIMESTAMP TIME INDEX,
)
PARTITION ON COLUMNS (a) (
  a < 10,
  a > 10 AND a < 20,
  a >= 20
);
SELECT * FROM PARTITIONS WHERE table_schema='public' AND table_name='test_p'\G
```

```sql
*************************** 1. row ***************************
                table_catalog: greptime
                 table_schema: public
                   table_name: test_p
               partition_name: p0
            subpartition_name: NULL
   partition_ordinal_position: 1
subpartition_ordinal_position: NULL
             partition_method: RANGE
          subpartition_method: NULL
         partition_expression: (a) VALUES LESS THAN (PartitionExpr { lhs: Column("a"), op: Lt, rhs: Value(Int32(10)) })
      subpartition_expression: NULL
        partition_description: NULL
                   table_rows: NULL
               avg_row_length: NULL
                  data_length: NULL
              max_data_length: NULL
                 index_length: NULL
                    data_free: NULL
                  create_time: 2024-04-01 10:49:49.468000
                  update_time: NULL
                   check_time: NULL
                     checksum: NULL
            partition_comment: NULL
                    nodegroup: NULL
              tablespace_name: NULL
        greptime_partition_id: 4453881085952
*************************** 2. row ***************************
                table_catalog: greptime
                 table_schema: public
                   table_name: test_p
               partition_name: p1
            subpartition_name: NULL
   partition_ordinal_position: 2
subpartition_ordinal_position: NULL
             partition_method: RANGE
          subpartition_method: NULL
         partition_expression: (a) VALUES LESS THAN (PartitionExpr { lhs: Column("a"), op: GtEq, rhs: Value(Int32(20)) })
      subpartition_expression: NULL
        partition_description: NULL
                   table_rows: NULL
               avg_row_length: NULL
                  data_length: NULL
              max_data_length: NULL
                 index_length: NULL
                    data_free: NULL
                  create_time: 2024-04-01 10:49:49.468000
                  update_time: NULL
                   check_time: NULL
                     checksum: NULL
            partition_comment: NULL
                    nodegroup: NULL
              tablespace_name: NULL
        greptime_partition_id: 4453881085954
*************************** 3. row ***************************
                table_catalog: greptime
                 table_schema: public
                   table_name: test_p
               partition_name: p2
            subpartition_name: NULL
   partition_ordinal_position: 3
subpartition_ordinal_position: NULL
             partition_method: RANGE
          subpartition_method: NULL
         partition_expression: (a) VALUES LESS THAN (PartitionExpr { lhs: Expr(PartitionExpr { lhs: Column("a"), op: Gt, rhs: Value(Int32(10)) }), op: And, rhs: Expr(PartitionExpr { lhs: Column("a"), op: Lt, rhs: Value(Int32(20)) }) })
      subpartition_expression: NULL
        partition_description: NULL
                   table_rows: NULL
               avg_row_length: NULL
                  data_length: NULL
              max_data_length: NULL
                 index_length: NULL
                    data_free: NULL
                  create_time: 2024-04-01 10:49:49.468000
                  update_time: NULL
                   check_time: NULL
                     checksum: NULL
            partition_comment: NULL
                    nodegroup: NULL
              tablespace_name: NULL
        greptime_partition_id: 4453881085953
```
