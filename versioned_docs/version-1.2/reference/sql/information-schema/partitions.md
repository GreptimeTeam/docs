---
keywords: [partitions, partitioned tables, partition names, partition methods, partition expressions]
description: Provides information about partitioned tables, including partition names, methods, expressions, and other details.
---

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
| create_time                   | TimestampSecond |      | YES  |         | FIELD         |
| update_time                   | TimestampSecond |      | YES  |         | FIELD         |
| check_time                    | TimestampSecond |      | YES  |         | FIELD         |
| checksum                      | Int64    |      | YES  |         | FIELD         |
| partition_comment             | String   |      | YES  |         | FIELD         |
| nodegroup                     | String   |      | YES  |         | FIELD         |
| tablespace_name               | String   |      | YES  |         | FIELD         |
| greptime_partition_id         | UInt64   |      | YES  |         | FIELD         |
+-------------------------------+----------+------+------+---------+---------------+
26 rows in set (0.01 sec)
```

Main columns:
* `table_catalog`:  The name of the catalog to which the table belongs. This value is always `def`.
* `table_schema`: The name of the schema (database) to which the table belongs.
* `table_name`: The name of the table containing the partition(region).
* `partition_name`: The name of the partition(region).
* `partition_ordinal_position`: All partitions are indexed in the same order as they are defined, with 1 being the number assigned to the first partition. 
* `partition_method`: This value is always `RANGE`, GreptimeDB only supports range partitioning.
* `partition_expression`: The expression of this partition.
* `create_time`:  The time that the partition was created.
* `greptime_partition_id`: GreptimeDB extended field, it's the Region Id.

For example, create a partitioned table:

```sql
CREATE TABLE public.test_p (
  a INT PRIMARY KEY,
  b STRING,
  ts TIMESTAMP TIME INDEX,
)
PARTITION ON COLUMNS (a) (
  a < 10,
  a >= 10 AND a < 20,
  a >= 20
);

-- Query the partitions of the table
SELECT * FROM PARTITIONS WHERE table_schema='public' AND table_name='test_p'\G
```

Outputs:

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
