# 从 MySQL 迁移

本文档将指引您完成从 MySQL 迁移到 GreptimeDB。

## 在开始迁移之前

请注意，尽管 GreptimeDB 支持 MySQL 的协议，并不意味着 GreptimeDB 实现了 MySQL
的所有功能。你可以参考 "[ANSI 兼容性](/reference/sql/compatibility.md)" 查看在 GreptimeDB 中使用 SQL 的约束。

## 迁移步骤

### 在 GreptimeDB 中创建数据库和表

在从 MySQL 迁移数据之前，你首先需要在 GreptimeDB 中创建相应的数据库和表。
由于 GreptimeDB 有自己的 SQL 语法用于创建表，因此你不能直接重用 MySQL 生成的建表 SQL。

当你为 GreptimeDB 编写创建表的 SQL 时，首先请了解其“[数据模型](/user-guide/concepts/data-model.md)”。然后，在创建表的
SQL 中请考虑以下几点：

1. 由于 time index 列在表创建后无法更改，所以你需要仔细选择 time index
   列。时间索引最好设置为数据生成时的自然时间戳，因为它提供了查询数据的最直观方式，以及最佳的查询性能。例如，在 IOT
   场景中，你可以使用传感器采集数据时的时间作为 time index；或者在可观测场景中使用事件的发生时间。
2. 不建议在此迁移过程中另造一个时间戳用作时间索引，例如使用 `DEFAULT current_timestamp()` 创建的新列。也不建议使用具有随机时间戳的列。
3. 选择合适的 time index 精度也至关重要。和 time index 的选择一样，一旦表创建完毕，time index
   的精度就无法变更了。请根据你的数据集在[这里](/reference/sql/data-types#data-types-compatible-with-mysql-and-postgresql)
   找到最适合的时间戳类型。
4. 根据您的查询模式选择最适合的 tag 列。tag 列存储经常被查询的元数据，其中的值是数据源的标签，通常用于描述数据的特征。tag 列具有索引，所以使用 tag 列的查询具备良好的性能。

请参考[CREATE](/reference/sql/create.md) SQL 文档，了解如何选择正确的数据类型以及“ttl”或“compaction”选项等。

### 双写 GreptimeDB 和 MySQL

双写 GreptimeDB 和 MySQL 是迁移过程中防止数据丢失的有效策略。通过使用 MySQL 的客户端库（JDBC + 某个 MySQL
驱动），你可以建立两个客户端实例 —— 一个用于 GreptimeDB，另一个用于 MySQL。有关如何使用 SQL 将数据写入
GreptimeDB，请参考[写入数据](/user-guide/ingest-data/for-iot/sql.md)部分。

若无需保留所有历史数据，你可以双写一段时间以积累业务所需的最新数据，然后停止向 MySQL 写入数据并仅使用
GreptimeDB。如果需要完整迁移所有历史数据，请按照接下来的步骤操作。

### 从 MySQL 导出数据

[mysqldump](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html) 是一个常用的、从 MySQL 导出数据的工具。使用
mysqldump，我们可以从 MySQL 中导出后续可直接导入到 GreptimeDB 的数据。例如，如果我们想要从 MySQL 导出两个数据库 `db1` 和
`db2`，我们可以使用以下命令：

```bash
mysqldump -h127.0.0.1 -P3306 -umysql_user -p --compact -cnt --skip-extended-insert --databases db1 db2 > /path/to/output.sql
```

替换 `-h`、`-P` 和 `-u` 参数为 MySQL 服务的正确值。`--databases` 参数用于指定要导出的数据库。输出将写入
`/path/to/output.sql` 文件。

`/path/to/output.sql` 文件应该具有如下内容：

```plaintext
~ ❯ cat /path/to/output.sql

USE `db1`;
INSERT INTO `foo` (`ts`, `a`, `b`) VALUES (1,'hello',1);
INSERT INTO ...

USE `db2`;
INSERT INTO `foo` (`ts`, `a`, `b`) VALUES (2,'greptime',2);
INSERT INTO ...
```

### 将数据导入 GreptimeDB

[MySQL Command-Line Client](https://dev.mysql.com/doc/refman/8.4/en/mysql.html) 可用于将数据导入
GreptimeDB。继续上面的示例，假设数据导出到文件 `/path/to/output.sql`，那么我们可以使用以下命令将数据导入 GreptimeDB：

```bash
mysql -h127.0.0.1 -P4002 -ugreptime_user -p -e "source /path/to/output.sql"
```

替换 `-h`、`-P` 和 `-u` 参数为你的 GreptimeDB 服务的值。`source` 命令用于执行 `/path/to/output.sql` 文件中的 SQL
命令。若需要进行 debug，添加 `-vvv` 以查看详细的执行结果。

总结一下，数据迁移步骤如下图所示：

![migrate mysql data steps](/migration-mysql.jpg)

数据迁移完成后，你可以停止向 MySQL 写入数据，并继续使用 GreptimeDB！
