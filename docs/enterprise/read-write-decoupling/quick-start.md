---
keywords: [read-write decoupling, quick start, GreptimeDB Enterprise]
description: Quick start guide for read-write decoupling in GreptimeDB Enterprise.
---

# Quick Start

GreptimeDB Enterprise offers a read-write decoupling solution that places read replicas and write replicas on different datanodes, effectively separating read and write operations.

:::warning

In the current version, data in read replicas may lag behind write replicas by several minutes (depending on write volume and flush frequency). Please consider your business requirements when deciding whether to enable read-write decoupling.

:::

## Configuring Read Nodes

First, you need to configure `excluded_datanode_ids` in the Metasrv configuration. In this example, we'll designate four Datanodes with IDs 0, 1, 2, and 3 as dedicated read replica nodes. All write replicas will be scheduled to nodes other than these four.

```toml
[[plugins]]
[plugins.node_excluder]
excluded_datanode_ids = [0, 1, 2, 3]
```

## Creating Write Replicas

Tables are created as write replicas by default.
```sql
CREATE TABLE IF NOT EXISTS monitoring (
    greptime_timestamp TIMESTAMP(3) NOT NULL,
    greptime_value DOUBLE NULL,
    `zone` STRING NULL INVERTED INDEX,
    PRIMARY KEY (`zone`),
    TIME INDEX (greptime_timestamp),
)
PARTITION ON COLUMNS (`zone`) (
    `zone` == 'zone-0',
    `zone` == 'zone-1',
    `zone` == 'zone-2',
    `zone` == 'zone-3',
    `zone` == 'zone-4',
)
engine = mito;
```

## Creating Read Replicas

Use the following SQL command to create read replicas for the `monitoring` table. The read replica shards will be distributed across three Datanodes with IDs 0, 1, and 2.

```sql
ADMIN add_table_follower('monitoring', '0,1,2');
```

## Reading Data from Read Replicas

We introduce the `read_preference` parameter for query sessions to specify how to read data from replicas.
The supported values are `follower`, `follower_preferred`, and `leader`, with `leader` being the default.

- When `read_preference` is set to `follower`, queries will read from read replicas only. If read replicas are unavailable, an error will be returned.
- When set to `follower_preferred`, queries will prioritize read replicas but fall back to write replicas if read replicas are unavailable.
- When set to `leader`, queries will read from write replicas.

### MySQL/PostgreSQL Client

First, set the session's `read_preference` to `follower` to read from read replicas:

```sql
ADMIN set read_preference('follower');
```

### Using HTTP Protocol
Add the `X-Greptime-Read-Preference: follower` header to your HTTP request to read from read replicas.

Example:
```bash
curl -X POST \
-H 'Content-Type: application/x-www-form-urlencoded' \
-H 'X-Greptime-Read-Preference: follower' \
-d 'sql=select * from monitoring' \
http://localhost:4000/v1/sql
```

### Removing Read Replicas

```sql
ADMIN remove_table_follower('monitoring', '0,1,2');
```

### Viewing Read Replicas

```sql
SHOW REGION from monitoring where Leader = 'No';
+-------------------------+---------------+------+--------+
| Table                   | Region        | Peer | Leader |
+-------------------------+---------------+------+--------+
| monitoring              | 4398046511104 |    1 | No     |
| monitoring              | 4398046511105 |    2 | No     |
| monitoring              | 4398046511106 |    3 | No     |
| monitoring              | 4398046511107 |    1 | No     |
+-------------------------+---------------+------+--------+
```