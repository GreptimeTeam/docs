
# ANSI Compatibility

GreptimeDB supports a subset of ANSI SQL and has some unique extensions. Some major incompatibilities and extensions are described below:

1. Table creation:
   * Supports the unique `TIME INDEX` constraint. Please refer to the [Data Model](/user-guide/concepts/data-model) and the [CREATE](./create.md) table creation syntax for details.
   * Currently only supports `PRIMARY KEY` constraints and does not support other types of constraints or foreign keys.
   * GreptimeDB is a native distributed database, so the table creation syntax for distributed tables supports partitioning rules. Please also refer to the [CREATE](./create.md) table creation syntax.
2. Insertion: Consistent with ANSI SQL syntax, but requires the `TIME INDEX` column value (or default value) to be provided.
3. Update: Does not support `UPDATE` syntax, but if the primary key and `TIME INDEX` corresponding column values are the same during `INSERT`, subsequent inserted rows will overwrite previously written rows, effectively achieving an update.
4. Query: Query syntax is compatible with ANSI SQL, with some functional differences and omissions.
   * Does not support views.
   * TQL syntax extension: Supports executing PromQL in SQL via TQL subcommands. Please refer to the [TQL](./tql.md) section for details.
5. Deletion: Deletion syntax is basically consistent with ANSI SQL.
6. Others:
   * Identifiers such as table names and column names have constraints similar to ANSI SQL, are case sensitive, and require double quotes when encountering special characters or uppercase letters.
   * GreptimeDB has optimized identifier rules for different dialects. For example, when you connect with a MySQL or PostgreSQL client, you can use identifier rules specific to that SQL dialect, such as using backticks ``` for MySQL and standard double quotes `"` for PostgreSQL.