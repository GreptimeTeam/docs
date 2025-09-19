---
keywords: [enterprise, cluster, read replica, leader region, follower region]
description: Overview, key concepts, and step-by-step instructions for managing and querying read replicas in GreptimeDB Enterprise.
---

# Query Read Replicas

GreptimeDB allows you to read from **Region Replicas (follower regions)** to reduce load on Write Replicas (Leader regions) and improve query scalability. You can control the read preference through both **SQL** and **HTTP** protocols.

## Read Preference Options

The `READ_PREFERENCE` setting accepts the following values:

* **`leader`**
  Always read from write replicas.

* **`follower`**
  Read only from read replicas The query will fail if no read replicas exist.

* **`follower_preferred`**
  Prefer read replicas but fall back to write replicas if read replicas are unavailable.

## SQL Protocol

You can set the read preference in a SQL session:

```sql
SET READ_PREFERENCE = 'follower';
```

---

## HTTP Protocol

For HTTP requests, specify the `X-Greptime-Read-Preference` header.

Example:

```bash
curl -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "X-Greptime-Read-Preference: follower" \
  -d "sql=select * from monitoring" \
  http://localhost:4000/v1/sql
```

---

## Example: Reading from Follower Replicas

Before reading from Follower Replicas, you need to add Read Replicas to the table. See [Replica Management](/enterprise/read-replicas/replica-management.md) for more details.

Insert some data into a table:

```sql
INSERT INTO foo (ts, i, s)
VALUES
  (1, -1, 's1'),
  (2, 0, 's2'),
  (3, 1, 's3');
```

Set the read preference to read replicas:

```sql
SET READ_PREFERENCE = 'follower';
```

Query the data:

```sql
SELECT * FROM foo ORDER BY ts;

+----------------------------+------+------+
| ts                         | i    | s    |
+----------------------------+------+------+
| 1970-01-01 00:00:00.001000 |   -1 | s1   |
| 1970-01-01 00:00:00.002000 |    0 | s2   |
| 1970-01-01 00:00:00.003000 |    1 | s3   |
+----------------------------+------+------+
```

---

## Verifying Follower Reads

To confirm that queries are served by read replicas, use `EXPLAIN ANALYZE`:

```sql
EXPLAIN ANALYZE SELECT * FROM foo ORDER BY ts;
```

* A **non-zero `other_ranges`** value indicates read replicas were involved.
* With the `VERBOSE` option, you can see details like this:

```plaintext
extension_ranges: [LeaderMemtableRange{leader: Peer { id: 1, addr: "192.168.50.189:14101" }, num_rows: 2, time_range: (1::Millisecond, 2::Millisecond) ...
```

If the query runs only on leaders, this `extension_ranges` section will not appear.
