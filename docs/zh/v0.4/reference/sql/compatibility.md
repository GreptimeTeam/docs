# ANSI Compatibility

GreptimeDB 支持的 SQL 是 ANSI SQL 的子集，并且拥有一些特有的扩展。一些主要的不兼容和扩展描述如下：

1. 建表：
  * 支持特有的 `TIME INDEX` 约束，详细请参考[数据模型](/user-guide/concepts/data-model)和 [CREATE](./create.md) 建表语法一节。
  * 目前仅支持 `PRIMARY KEY` 约束，不支持其他类型的约束，也不支持外键。
  * GreptimeDB 是原生的分布式数据库，因此分布式表的建表语句支持分区规则，也请参考[CREATE](./create.md) 建表语法一节。
2. 插入新数据： 与 ANSI SQL 语法一致，但是强制要求提供 `TIME INDEX` 列值（或默认值）。
3. 更新：不支持 `UPDATE` 语法，但是在 `INSERT` 的时候，如果主键和 `TIME INDEX` 对应的列值一样，那么后续插入的行将覆盖以前写入的行，从而变相实现更新。
4. 查询：查询语法兼容 ANSI SQL，存在部分功能差异和缺失
  * 不支持视图
  * TQL 语法扩展：TQL 子命令支持在 SQL 中执行 PromQL，详细请参考 [TQL](./tql.md) 一节。
5. 删除：删除语法与 ANSI SQL 基本一致。
6. 他项：
  * 标识符，如表名，列名等，约束与 ANSI SQL 类似，大小写敏感，遇到特殊字符或者大写需要用双引号括起来。
  * GreptimeDB 做了个优化，针对不同方言，比如你用 MySQL 客户端或者 PostgreSQL 客户端连接上来， 允许使用特定 SQL 方言的标识符规则，比如 MySQL 可以用反引号 ```，而 PostgreSQL 还是标准的双引号 `"`。
