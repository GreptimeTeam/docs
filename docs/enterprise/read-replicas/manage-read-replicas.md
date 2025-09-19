---
keywords: [enterprise, cluster, read replicas, leader region, follower region]
description: An overview, key concepts, and step-by-step guides for managing read replicas in GreptimeDB Enterprise.
---

# Manage Read Replicas

This guide explains how to manage **Read Replicas (follower regions)** in GreptimeDB Enterprise, including how to add and remove read replicas at both the table and region levels, inspect the current regions distribution with the `SHOW REGION`, and apply placement constraints and recommended best practices for performance.

## Adding Read Replicas to a Table

Adding a Read Replica is as simple as executing one SQL command:

```sql
ADMIN ADD_TABLE_FOLLOWER(<table_name>)
```

Read Replica peers for each region are allocated based on the workload types of the datanodes. **For optimal performance, it is strongly recommended to [configure Datanode groups](/enterprise/deployments-administration/deploy-on-kubernetes/configure-datanode-groups.md) to separate read and write workloads into different datanode groups.**

This is the function in GreptimeDB for adding read replicas to. The parameters are:

- `table_name`: The name of the table to add read replicas to.

Next is an example to illustrate steps to add read replicas to a table.

First start a GreptimeDB Enterprise Cluster with 3 Datanodes. Then create a table:

```sql
CREATE TABLE foo (
  ts TIMESTAMP TIME INDEX,
  i INT PRIMARY KEY,
  s STRING,
) PARTITION ON COLUMNS ('i') (
  i <= 0,
  i > 0,
);
```


Using the `SHOW REGION`, we can find the regions distribution information:

```sql
SHOW REGION FROM foo;

+-------+---------------+------+--------+
| Table | Region        | Peer | Leader |
+-------+---------------+------+--------+
| foo   | 4398046511104 |    0 | Yes    |
| foo   | 4398046511105 |    1 | Yes    |
+-------+---------------+------+--------+
```

This shows two write replicas (leader regions) on Datanodes `1` and `2`.

Then to add read replicas (Follower regions):

```sql
ADMIN ADD_TABLE_FOLLOWER('foo');
```

After the read replicas are added, find the regions distribution information:

```sql
SHOW REGION FROM foo;

+-------+---------------+------------+--------+
| Table | Region        | Peer       | Leader |
+-------+---------------+------------+--------+
| foo   | 4398046511104 |          0 | Yes    |
| foo   | 4398046511104 | 4294967296 | No     |
| foo   | 4398046511105 |          1 | Yes    |
| foo   | 4398046511105 | 4294967297 | No     |
+-------+---------------+------------+--------+
```

Now, read replicas can be found on Datanode `4294967296` and `4294967297`.

## Removing Read Replicas from a Table

Removing a Read Replica is as simple as executing one SQL command:

```sql
ADMIN REMOVE_TABLE_FOLLOWER(<table_name>)
```

This is the function in GreptimeDB for removing read replicas from a table. The parameters are:

- `table_name`: The name of the table to remove read replicas from.

This command removes **the most recently added read replica' peers from each region**.

For example, before running the command:

```sql
SHOW REGION FROM foo;
+-------+---------------+------------+--------+
| Table | Region        | Peer       | Leader |
+-------+---------------+------------+--------+
| foo   | 4398046511104 |          0 | Yes    |
| foo   | 4398046511104 | 4294967296 | No     |
| foo   | 4398046511104 | 4294967297 | No     |
| foo   | 4398046511105 |          1 | Yes    |
| foo   | 4398046511105 | 4294967296 | No     |
| foo   | 4398046511105 | 4294967297 | No     |
+-------+---------------+------------+--------+
```

Here, region `4398046511104` has two read replicas on peers (`4294967296`, `4294967297`), and region `4398046511105` also has two read replicas on peers (`4294967296`, `4294967297`).
After executing:

```sql
ADMIN REMOVE_TABLE_FOLLOWER('foo');
+------------------------------------+
| ADMIN REMOVE_TABLE_FOLLOWER('foo') |
+------------------------------------+
|                                  0 |
+------------------------------------+
```

The most recently added read replicas' peers of each region are removed:

* Region `4398046511104`: removed read replica on peer `4294967297`.
* Region `4398046511105`: removed read replica on peer `4294967296`.

Result:

```sql
SHOW REGION FROM foo;
+-------+---------------+------------+--------+
| Table | Region        | Peer       | Leader |
+-------+---------------+------------+--------+
| foo   | 4398046511104 |          0 | Yes    |
| foo   | 4398046511104 | 4294967296 | No     |
| foo   | 4398046511105 |          1 | Yes    |
| foo   | 4398046511105 | 4294967297 | No     |
+-------+---------------+------------+--------+
```

## Adding Read Replica to a Region
```sql
ADMIN ADD_REGION_FOLLOWER(<region_id>, <datanode_id>)
```

This is the function in GreptimeDB for adding read replicas to a region. The parameters are:

- `region_id`: The id of the region to add Read Replica to.
- `datanode_id`: The id of the datanode to add Read Replica to.

A read replica and a write replica cannot be placed on the same datanode. Additionally, each datanode can host only one read replica per region.

Example:

```sql
-- Add a read replica for region 4398046511104 on datanode 2
ADMIN ADD_REGION_FOLLOWER(4398046511104, 2);
```

If the specified datanode already hosts a read replica for that region, or is the write replica (leader) of that region, the command will be rejected.

## Removing Read Replica from a Region
```sql
ADMIN REMOVE_REGION_FOLLOWER(<region_id>, <datanode_id>)
```

This is the function in GreptimeDB for removing read replicas from a region. The parameters are:

- `region_id`: The id of the region to remove read replica from.
- `datanode_id`: The id of the datanode to remove read replica from.


Example:

```sql
-- Remove the read replica on datanode 2 for region 4398046511104
ADMIN REMOVE_REGION_FOLLOWER(4398046511104, 2);
```


## Next steps

* [Query Read Replicas](/enterprise/read-replicas/query-read-replicas.md)