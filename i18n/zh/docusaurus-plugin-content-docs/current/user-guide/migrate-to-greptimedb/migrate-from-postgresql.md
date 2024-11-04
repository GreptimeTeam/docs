# 从 PostgreSQL 迁移

本文档将指引您完成从 PostgreSQL 迁移到 GreptimeDB。

## 在开始迁移之前

请注意，尽管 GreptimeDB 支持 PostgreSQL 的协议，并不意味着 GreptimeDB 实现了 PostgreSQL
的所有功能。你可以参考 "[ANSI 兼容性](/reference/sql/compatibility.md)" 查看在 GreptimeDB 中使用 SQL 的约束。

## 迁移步骤

### 在 GreptimeDB 中创建数据库和表

在从 PostgreSQL 迁移数据之前，你首先需要在 GreptimeDB 中创建相应的数据库和表。
由于 GreptimeDB 有自己的 SQL 语法用于创建表，因此你不能直接重用 PostgreSQL 生成的建表 SQL。

当你为 GreptimeDB 编写创建表的 SQL 时，首先请了解其“[数据模型](/user-guide/concepts/data-model.md)”。然后，在创建表的
SQL 中请考虑以下几点：

1. 由于 time index 列在表创建后无法更改，所以你需要仔细选择 time index
   列。时间索引最好设置为数据生成时的自然时间戳，因为它提供了查询数据的最直观方式，以及最佳的查询性能。例如，在 IOT
   场景中，你可以使用传感器采集数据时的时间作为 time index；或者在可观测场景中使用事件的发生时间。
2. 不建议在此迁移过程中另造一个时间戳用作时间索引，例如使用 `DEFAULT current_timestamp()` 创建的新列。也不建议使用具有随机时间戳的列。
3. 选择合适的 time index 精度也至关重要。和 time index 的选择一样，一旦表创建完毕，time index
   的精度就无法变更了。请根据你的数据集在[这里](/reference/sql/data-types#data-types-compatible-with-mysql-and-postgresql)找到最适合的时间戳类型。
4. 根据您的查询模式选择最适合的 tag 列。tag 列存储经常被查询的元数据，其中的值是数据源的标签，通常用于描述数据的特征。tag
   列具有索引，所以使用 tag 列的查询具备良好的性能。

请参考[CREATE](/reference/sql/create.md) SQL 文档，了解如何选择正确的数据类型以及“ttl”或“compaction”选项等。

### 双写 GreptimeDB 和 PostgreSQL

双写 GreptimeDB 和 PostgreSQL 是迁移过程中防止数据丢失的有效策略。通过使用 PostgreSQL 的客户端库（JDBC + 某个 PostgreSQL
驱动），你可以建立两个客户端实例 —— 一个用于 GreptimeDB，另一个用于 PostgreSQL。有关如何使用 SQL 将数据写入
GreptimeDB，请参考[写入数据](/user-guide/ingest-data/for-iot/sql.md)部分。

若无需保留所有历史数据，你可以双写一段时间以积累业务所需的最新数据，然后停止向 PostgreSQL 写入数据并仅使用
GreptimeDB。如果需要完整迁移所有历史数据，请按照接下来的步骤操作。

### 从 PostgreSQL 导出数据

[pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html) 是一个常用的、从 PostgreSQL 导出数据的工具。使用
pg_dump，我们可以从 PostgreSQL 中导出后续可直接导入到 GreptimeDB 的数据。例如，如果我们想要从 PostgreSQL 的 database
`postgres` 中导出以 `db` 开头的 schema，我们可以使用以下命令：

```bash
pg_dump -h127.0.0.1 -p5432 -Upostgres -ax --column-inserts -n 'db*' postgres | grep -v "^SE" > /path/to/output.sql
```

替换 `-h`、`-p` 和 `-U` 参数为 PostgreSQL 服务的正确值。`-n` 参数用于指定要导出的 schema。数据库 `postgres` 被放在了 `pg_dump` 命令的最后。注意这里我们将
pg_dump 的输出经过了一个特殊的 `grep` 命令以过滤掉不需要的 `SET` 和 `SELECT` 行。最终输出将写入 `/path/to/output.sql`
文件。

`/path/to/output.sql` 文件应该具有如下内容：

```plaintext
~ ❯ cat /path/to/output.sql

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg120+1)
-- Dumped by pg_dump version 16.4


--
-- Data for Name: foo; Type: TABLE DATA; Schema: db1; Owner: postgres
--

INSERT INTO db1.foo (ts, a) VALUES ('2024-10-31 00:00:00', 1);
INSERT INTO db1.foo (ts, a) VALUES ('2024-10-31 00:00:01', 2);
INSERT INTO db1.foo (ts, a) VALUES ('2024-10-31 00:00:01', 3);
INSERT INTO ...


--
-- Data for Name: foo; Type: TABLE DATA; Schema: db2; Owner: postgres
--

INSERT INTO db2.foo (ts, b) VALUES ('2024-10-31 00:00:00', '1');
INSERT INTO db2.foo (ts, b) VALUES ('2024-10-31 00:00:01', '2');
INSERT INTO db2.foo (ts, b) VALUES ('2024-10-31 00:00:01', '3');
INSERT INTO ...


--
-- PostgreSQL database dump complete
--
```

### 将数据导入 GreptimeDB

”[psql -- PostgreSQL interactive terminal](https://www.postgresql.org/docs/current/app-psql.html)“ 可用于将数据导入
GreptimeDB。继续上面的示例，假设数据导出到文件 `/path/to/output.sql`，那么我们可以使用以下命令将数据导入 GreptimeDB：

```bash
psql -h127.0.0.1 -p4003 -d public -f /path/to/output.sql
```

替换 `-h` 和 `-p` 参数为你的 GreptimeDB 服务的值。psql 命令中的 `-d` 参数用于指定数据库，该参数不能省略，`-d` 的值 `public` 是 GreptimeDB 默认使用的数据库。你还可以添加 `-a` 以查看详细的执行结果，或使用 `-s` 进入单步执行模式。

总结一下，数据迁移步骤如下图所示：

![migrate postgresql data steps](/migration-postgresql.jpg)

数据迁移完成后，你可以停止向 PostgreSQL 写入数据，并继续使用 GreptimeDB！
