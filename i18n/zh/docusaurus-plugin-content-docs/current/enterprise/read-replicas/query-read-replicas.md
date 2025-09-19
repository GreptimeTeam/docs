---
keywords: [企业版, 集群, 读副本, 查询, 读优先级]
description: 在 GreptimeDB 企业版中从读副本查询的用法、读优先策略与示例。
---

# 从读副本查询

GreptimeDB 允许从**读副本 (Follower Region)** 读取数据，从而降低写副本 (Leader Region) 的负载并提升查询伸缩性。你可以通过 **SQL** 与 **HTTP** 两种方式设置读优先策略。

## 读优先策略

`READ_PREFERENCE` 支持如下取值：

- `leader`：始终从写副本读取。
- `follower`：仅从读副本读取；若不存在读副本，则查询失败。
- `follower_preferred`：优先从读副本读取；若不可用则回退到写副本。

## SQL 协议

在 SQL 会话中设置读优先：

```sql
SET READ_PREFERENCE = 'follower';
```

---

## HTTP 协议

在 HTTP 请求中通过请求头指定 `X-Greptime-Read-Preference`：

```bash
curl -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "X-Greptime-Read-Preference: follower" \
  -d "sql=select * from monitoring" \
  http://localhost:4000/v1/sql
```

---

## 示例：从读副本读取

在从读副本读取之前，需要先为表添加读副本。参见[副本管理](/enterprise/read-replicas/manage-read-replicas.md)。

向示例表插入数据：

```sql
INSERT INTO foo (ts, i, s)
VALUES
  (1, -1, 's1'),
  (2, 0, 's2'),
  (3, 1, 's3');
```

设置从读副本读取：

```sql
SET READ_PREFERENCE = 'follower';
```

查询数据：

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

## 验证是否从读副本读取

可以使用 `EXPLAIN ANALYZE` 进行验证：

```sql
EXPLAIN ANALYZE SELECT * FROM foo ORDER BY ts;
```

- 当输出中的 `other_ranges` 大于 0 时，表示查询涉及了读副本。
- 若使用 `VERBOSE` 选项，将看到类似如下的详细信息：

```plaintext
extension_ranges: [LeaderMemtableRange{leader: Peer { id: 1, addr: "192.168.50.189:14101" }, num_rows: 2, time_range: (1::Millisecond, 2::Millisecond) ...
```

如果仅从写副本读取，上述 `extension_ranges` 段不会出现。


